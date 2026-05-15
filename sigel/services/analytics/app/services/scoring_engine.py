"""Motor de scoring SIGEL.

Orquesta el flujo:

  1. Cargar mediciones recientes del GAD.
  2. Normalizar (Min-Max) cada indicador según su tipo.
  3. Agregar por variable → dimensión (promedio ponderado).
  4. Combinar componentes (objetivo / ciudadano / experto).
  5. Aplicar fórmula INGEL.
  6. Calcular sub-índices derivados (IRI, ITD, ICDL).
  7. Persistir en la tabla `scoring`.
"""
from __future__ import annotations

import uuid
from dataclasses import asdict
from datetime import date

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ingel import (
    DimensionScores,
    calcular_ingel,
    calcular_iri,
    clasificar_nivel,
    combinar_componentes,
    semaforizar,
)
from app.services.normalizer import normalize_negative, normalize_positive

logger = structlog.get_logger()

ALGO_VERSION = "1.0.0"


async def _cargar_mediciones(db: AsyncSession, gad_id: int) -> list[dict]:
    """Trae las mediciones más recientes por indicador para un GAD."""
    query = text(
        """
        SELECT DISTINCT ON (m.indicador_id)
            m.indicador_id,
            i.codigo AS indicador_codigo,
            i.tipo,
            i.peso AS indicador_peso,
            i.valor_min,
            i.valor_max,
            v.dimension_id,
            v.peso AS variable_peso,
            d.codigo AS dimension_codigo,
            m.valor
        FROM sigel.mediciones m
        JOIN sigel.indicadores i ON i.id = m.indicador_id
        JOIN sigel.variables v ON v.id = i.variable_id
        JOIN sigel.dimensiones d ON d.id = v.dimension_id
        WHERE m.gad_id = :gad_id
        ORDER BY m.indicador_id, m.fecha DESC
        """
    )
    result = await db.execute(query, {"gad_id": gad_id})
    return [dict(row._mapping) for row in result.all()]


async def _promedio_percepcion(db: AsyncSession, gad_id: int) -> dict[str, float]:
    """Trae la percepción ciudadana agregada (Likert 1-5 normalizada a 0-100)."""
    query = text(
        """
        SELECT
            AVG(confianza)::numeric     AS confianza,
            AVG(transparencia)::numeric AS transparencia,
            AVG(satisfaccion)::numeric  AS satisfaccion,
            AVG(participacion)::numeric AS participacion,
            AVG(corrupcion)::numeric    AS corrupcion,
            AVG(servicios)::numeric     AS servicios
        FROM sigel.respuestas_ciudadanas
        WHERE gad_id = :gad_id
          AND fecha >= NOW() - INTERVAL '12 months'
        """
    )
    row = (await db.execute(query, {"gad_id": gad_id})).first()
    if not row:
        return {}
    # Likert 1-5 → escala 0-100 ((v-1) / 4 * 100)
    return {
        k: ((float(v) - 1) / 4 * 100) if v is not None else 0.0
        for k, v in row._mapping.items()
    }


async def calcular_score_gad(db: AsyncSession, gad_id: int) -> dict:
    """Calcula y persiste el scoring para un GAD."""
    mediciones = await _cargar_mediciones(db, gad_id)
    percepcion = await _promedio_percepcion(db, gad_id)

    # Acumulador: codigo_dimension -> [(valor_normalizado, peso)]
    acumulador: dict[str, list[tuple[float, float]]] = {}
    for m in mediciones:
        if m["tipo"] == "POSITIVO":
            n = normalize_positive(float(m["valor"]), float(m["valor_min"] or 0), float(m["valor_max"] or 100))
        elif m["tipo"] == "NEGATIVO":
            n = normalize_negative(float(m["valor"]), float(m["valor_min"] or 0), float(m["valor_max"] or 100))
        else:
            n = 0.0
        acumulador.setdefault(m["dimension_codigo"], []).append((n * 100, float(m["indicador_peso"])))

    # Promedio ponderado por dimensión
    def _wavg(entries):
        if not entries:
            return 0.0
        total = sum(v * w for v, w in entries)
        peso = sum(w for _, w in entries)
        return total / peso if peso else 0.0

    objetivo = DimensionScores(
        transparencia=_wavg(acumulador.get("TRANS", [])),
        finanzas=_wavg(acumulador.get("FIN", [])),
        servicios=_wavg(acumulador.get("SERV", [])),
        desarrollo=_wavg(acumulador.get("DESA", [])),
        gestion_institucional=_wavg(acumulador.get("GEST", [])),
        participacion=_wavg(acumulador.get("PART", [])),
        legitimidad=_wavg(acumulador.get("LEGIT", [])),
        innovacion=_wavg(acumulador.get("INNOV", [])),
    )

    # Componente ciudadano (a partir de encuestas Likert)
    ciudadano = DimensionScores(
        transparencia=percepcion.get("transparencia", objetivo.transparencia),
        finanzas=objetivo.finanzas,  # no se mide directamente en encuesta
        servicios=percepcion.get("servicios", objetivo.servicios),
        desarrollo=objetivo.desarrollo,
        gestion_institucional=objetivo.gestion_institucional,
        participacion=percepcion.get("participacion", objetivo.participacion),
        legitimidad=percepcion.get("confianza", objetivo.legitimidad),
        innovacion=objetivo.innovacion,
    )

    # Componente experto (placeholder: usa el objetivo + ajuste)
    experto = objetivo

    # Combinar 60% objetivo + 25% ciudadano + 15% experto
    final = DimensionScores(
        transparencia=combinar_componentes(objetivo.transparencia, ciudadano.transparencia, experto.transparencia),
        finanzas=combinar_componentes(objetivo.finanzas, ciudadano.finanzas, experto.finanzas),
        servicios=combinar_componentes(objetivo.servicios, ciudadano.servicios, experto.servicios),
        desarrollo=combinar_componentes(objetivo.desarrollo, ciudadano.desarrollo, experto.desarrollo),
        gestion_institucional=combinar_componentes(
            objetivo.gestion_institucional, ciudadano.gestion_institucional, experto.gestion_institucional
        ),
        participacion=combinar_componentes(objetivo.participacion, ciudadano.participacion, experto.participacion),
        legitimidad=combinar_componentes(objetivo.legitimidad, ciudadano.legitimidad, experto.legitimidad),
        innovacion=combinar_componentes(objetivo.innovacion, ciudadano.innovacion, experto.innovacion),
    )

    ingel = calcular_ingel(final)
    nivel = clasificar_nivel(ingel)
    sem = semaforizar(ingel)
    iri = calcular_iri(
        opacidad=final.transparencia,
        ejecucion=final.finanzas,
        endeudamiento=100 - final.finanzas,
        corrupcion=100 - final.legitimidad,
        participacion=final.participacion,
    )
    itd = (final.transparencia + final.innovacion) / 2
    icdl = (final.legitimidad + final.participacion + final.transparencia) / 3

    # Upsert: (gad_id, fecha_corte) UNIQUE
    hoy = date.today()
    await db.execute(
        text(
            """
            INSERT INTO sigel.scoring
                (uuid, gad_id, fecha_corte, ingel,
                 transparencia, finanzas, servicios, desarrollo,
                 gestion_institucional, participacion, legitimidad, innovacion,
                 iri, itd, icdl,
                 componente_objetivo, componente_ciudadano, componente_experto,
                 version_algoritmo)
            VALUES
                (:uuid, :gad_id, :fc, :ingel,
                 :t, :f, :s, :d, :g, :p, :l, :i, :iri, :itd, :icdl,
                 :objc, :ciud, :exp, :ver)
            ON CONFLICT (gad_id, fecha_corte) DO UPDATE SET
                ingel = EXCLUDED.ingel,
                transparencia = EXCLUDED.transparencia,
                finanzas = EXCLUDED.finanzas,
                servicios = EXCLUDED.servicios,
                desarrollo = EXCLUDED.desarrollo,
                gestion_institucional = EXCLUDED.gestion_institucional,
                participacion = EXCLUDED.participacion,
                legitimidad = EXCLUDED.legitimidad,
                innovacion = EXCLUDED.innovacion,
                iri = EXCLUDED.iri,
                itd = EXCLUDED.itd,
                icdl = EXCLUDED.icdl,
                componente_objetivo = EXCLUDED.componente_objetivo,
                componente_ciudadano = EXCLUDED.componente_ciudadano,
                componente_experto = EXCLUDED.componente_experto,
                version_algoritmo = EXCLUDED.version_algoritmo
            """
        ),
        {
            "uuid": str(uuid.uuid4()),
            "gad_id": gad_id, "fc": hoy, "ingel": ingel,
            "t": final.transparencia, "f": final.finanzas, "s": final.servicios,
            "d": final.desarrollo, "g": final.gestion_institucional,
            "p": final.participacion, "l": final.legitimidad, "i": final.innovacion,
            "iri": iri, "itd": itd, "icdl": icdl,
            "objc": calcular_ingel(objetivo),
            "ciud": calcular_ingel(ciudadano),
            "exp": calcular_ingel(experto),
            "ver": ALGO_VERSION,
        },
    )
    await db.commit()

    logger.info("sigel.scoring.calculado", gad_id=gad_id, ingel=ingel, nivel=nivel)

    return {
        "gad_id": gad_id,
        "fecha_corte": hoy.isoformat(),
        "ingel": ingel,
        "nivel": nivel,
        "semaforo": sem,
        "iri": iri,
        "itd": itd,
        "icdl": icdl,
        "dimensiones": asdict(final),
        "componentes": {
            "objetivo": calcular_ingel(objetivo),
            "ciudadano": calcular_ingel(ciudadano),
            "experto": calcular_ingel(experto),
        },
        "version_algoritmo": ALGO_VERSION,
    }


async def recalcular_ranking_global(db: AsyncSession, fecha: date | None = None) -> int:
    """Recalcula el ranking nacional para una fecha de corte."""
    fecha = fecha or date.today()
    result = await db.execute(
        text("SELECT sigel.recalcular_ranking_nacional(:fecha)"), {"fecha": fecha}
    )
    afectados = result.scalar() or 0
    await db.commit()
    return afectados
