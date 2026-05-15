"""Detección de anomalías sobre mediciones usando Isolation Forest.

Identifica municipios con valores atípicos respecto a su clúster.
Genera alertas tipo `ANOMALIA` que se insertan en `sigel.alertas`.
"""
from __future__ import annotations

from datetime import datetime

import numpy as np
import pandas as pd
import structlog
from sklearn.ensemble import IsolationForest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger()


async def cargar_dataset(db: AsyncSession, indicador_id: int | None = None) -> pd.DataFrame:
    """Construye una matriz GAD × Indicador a partir de mediciones recientes."""
    sql = """
        SELECT
            m.gad_id,
            m.indicador_id,
            AVG(m.valor) AS valor
        FROM sigel.mediciones m
        WHERE m.fecha >= NOW() - INTERVAL '12 months'
    """
    params = {}
    if indicador_id is not None:
        sql += " AND m.indicador_id = :iid"
        params["iid"] = indicador_id
    sql += " GROUP BY m.gad_id, m.indicador_id"
    rows = (await db.execute(text(sql), params)).all()
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame(rows, columns=["gad_id", "indicador_id", "valor"])
    return df.pivot_table(index="gad_id", columns="indicador_id", values="valor", fill_value=0)


async def detectar(db: AsyncSession, contamination: float = 0.05) -> list[dict]:
    """Ejecuta Isolation Forest y genera alertas para los outliers."""
    matriz = await cargar_dataset(db)
    if matriz.empty or len(matriz) < 10:
        logger.warning("anomaly.dataset_insuficiente", rows=len(matriz))
        return []

    iso = IsolationForest(
        n_estimators=200, contamination=contamination, random_state=42, n_jobs=-1
    )
    scores = iso.fit_predict(matriz.values)
    anomaly_scores = iso.score_samples(matriz.values)
    out = []
    for gad_id, etiqueta, score in zip(matriz.index, scores, anomaly_scores, strict=False):
        if etiqueta == -1:
            out.append({
                "gad_id": int(gad_id),
                "score": float(score),
                "nivel": "ALTO" if score < -0.5 else "MEDIO",
            })
            await db.execute(
                text(
                    """
                    INSERT INTO sigel.alertas
                        (gad_id, tipo, nivel, titulo, descripcion,
                         valor_observado, detectado_por, metadata)
                    VALUES
                        (:gad_id, 'ANOMALIA', :nivel,
                         'Comportamiento atípico detectado',
                         'Isolation Forest detectó valores anómalos en mediciones del GAD.',
                         :score, 'ISOLATION_FOREST',
                         :metadata::jsonb)
                    """
                ),
                {
                    "gad_id": int(gad_id),
                    "nivel": "ALTO" if score < -0.5 else "MEDIO",
                    "score": float(score),
                    "metadata": '{"version_algoritmo": "1.0", "contamination": %f}' % contamination,
                },
            )
    await db.commit()
    logger.info("anomaly.detectadas", count=len(out), at=datetime.utcnow().isoformat())
    return out
