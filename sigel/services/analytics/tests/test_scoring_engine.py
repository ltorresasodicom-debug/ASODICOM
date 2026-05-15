"""Tests unitarios del motor de scoring SIGEL — fórmula INGEL.

Verifica:
- Normalización Min-Max (positiva y negativa).
- Cálculo del INGEL con las ponderaciones canónicas SIGEL (8 dimensiones).
- Combinación de componentes objetivo/ciudadano/experto (60/25/15).
- Clasificación por nivel de desempeño (EXCELENTE/ALTO/MEDIO/BAJO/CRITICO).
- Semaforización (VERDE/AMARILLO/ROJO).
- Cálculo del Índice de Riesgo Institucional (IRI).
- Z-Score para detección estadística de anomalías.

Estos tests se ejecutan sin base de datos — son puros sobre la lógica
matemática del modelo metodológico SIGEL.
"""
from __future__ import annotations

import math

import pytest

from app.services.ingel import (
    DimensionScores,
    calcular_ingel,
    calcular_iri,
    clasificar_nivel,
    combinar_componentes,
    semaforizar,
)
from app.services.normalizer import normalize_negative, normalize_positive, zscore


# ============================================================================
# Normalización Min-Max
# ============================================================================
class TestNormalizacion:
    def test_positivo_dentro_de_rango(self):
        # Cobertura agua del 75% sobre rango 0-100
        assert normalize_positive(75, 0, 100) == 0.75

    def test_positivo_en_minimo(self):
        assert normalize_positive(0, 0, 100) == 0.0

    def test_positivo_en_maximo(self):
        assert normalize_positive(100, 0, 100) == 1.0

    def test_positivo_clamp_superior(self):
        # Valor por encima del máximo se clampa a 1.0
        assert normalize_positive(150, 0, 100) == 1.0

    def test_positivo_clamp_inferior(self):
        assert normalize_positive(-10, 0, 100) == 0.0

    def test_positivo_rango_no_estandar(self):
        # Likert 1-5: respuesta 4 → 0.75
        assert normalize_positive(4, 1, 5) == 0.75

    def test_negativo_invertido(self):
        # Endeudamiento del 30% (rango 0-100): menos endeudamiento = mejor
        # (100 - 30) / (100 - 0) = 0.7
        assert normalize_negative(30, 0, 100) == 0.7

    def test_negativo_en_maximo_es_peor(self):
        # 100% endeudamiento = pésimo desempeño = 0.0
        assert normalize_negative(100, 0, 100) == 0.0

    def test_negativo_en_minimo_es_mejor(self):
        # 0% endeudamiento = óptimo = 1.0
        assert normalize_negative(0, 0, 100) == 1.0

    def test_rango_invalido_devuelve_cero(self):
        # min == max: rango colapsado, no se puede normalizar
        assert normalize_positive(50, 50, 50) == 0.0
        assert normalize_negative(50, 50, 50) == 0.0

    def test_valores_nulos(self):
        assert normalize_positive(None, 0, 100) == 0.0
        assert normalize_negative(None, 0, 100) == 0.0


# ============================================================================
# Fórmula INGEL — Σ(Dimensión × Ponderación)
# ============================================================================
class TestFormulaIngel:
    def test_todas_cien_da_cien(self):
        """Si todas las dimensiones marcan 100, el INGEL debe ser 100."""
        d = DimensionScores(
            transparencia=100, finanzas=100, servicios=100, desarrollo=100,
            gestion_institucional=100, participacion=100, legitimidad=100,
            innovacion=100,
        )
        assert calcular_ingel(d) == 100.0

    def test_todas_cero_da_cero(self):
        d = DimensionScores()  # default 0
        assert calcular_ingel(d) == 0.0

    def test_solo_transparencia_perfecta(self):
        """Transparencia=100, resto=0 → 20% del INGEL."""
        d = DimensionScores(transparencia=100)
        assert calcular_ingel(d) == 20.0  # ponderación transparencia

    def test_ponderaciones_canonicas_suman_uno(self):
        """Verifica que los pesos del modelo SIGEL sumen 100%."""
        from app.core.config import settings
        suma = (
            settings.weight_transparencia
            + settings.weight_finanzas
            + settings.weight_servicios
            + settings.weight_desarrollo
            + settings.weight_gestion_institucional
            + settings.weight_participacion
            + settings.weight_legitimidad
            + settings.weight_innovacion
        )
        assert math.isclose(suma, 1.0, abs_tol=0.001)

    def test_caso_realista_cuenca(self):
        """Cuenca-like: alto en todo, INGEL ~92."""
        d = DimensionScores(
            transparencia=92, finanzas=88, servicios=94, desarrollo=87,
            gestion_institucional=90, participacion=85, legitimidad=95,
            innovacion=98,
        )
        # 92*0.20 + 88*0.15 + 94*0.20 + 87*0.10 + 90*0.10 + 85*0.10 + 95*0.10 + 98*0.05
        # = 18.4 + 13.2 + 18.8 + 8.7 + 9.0 + 8.5 + 9.5 + 4.9 = 91.0
        assert calcular_ingel(d) == 91.0

    def test_caso_realista_critico(self):
        """GAD crítico: bajo en transparencia y participación."""
        d = DimensionScores(
            transparencia=20, finanzas=45, servicios=35, desarrollo=40,
            gestion_institucional=30, participacion=15, legitimidad=25,
            innovacion=10,
        )
        # 20*0.20 + 45*0.15 + 35*0.20 + 40*0.10 + 30*0.10 + 15*0.10 + 25*0.10 + 10*0.05
        # = 4.0 + 6.75 + 7.0 + 4.0 + 3.0 + 1.5 + 2.5 + 0.5 = 29.25
        assert calcular_ingel(d) == 29.25


# ============================================================================
# Componentes (objetivo / ciudadano / experto)
# ============================================================================
class TestCombinacionComponentes:
    def test_componentes_iguales(self):
        """Si los tres componentes son iguales, el resultado es el mismo."""
        assert combinar_componentes(80, 80, 80) == 80.0

    def test_ponderaciones_canonicas(self):
        """60% objetivo + 25% ciudadano + 15% experto."""
        # 100*0.60 + 50*0.25 + 80*0.15 = 60 + 12.5 + 12 = 84.5
        assert combinar_componentes(100, 50, 80) == 84.5

    def test_objetivo_domina(self):
        """El componente objetivo tiene el mayor peso (60%)."""
        # Objetivo=100, resto=0 → debería ser 60
        assert combinar_componentes(100, 0, 0) == 60.0

    def test_experto_minoritario(self):
        """Experto pesa sólo 15%."""
        assert combinar_componentes(0, 0, 100) == 15.0


# ============================================================================
# Clasificación de nivel
# ============================================================================
class TestClasificacionNivel:
    @pytest.mark.parametrize("puntaje,esperado", [
        (95, "EXCELENTE"),
        (90, "EXCELENTE"),
        (89.9, "ALTO"),
        (80, "ALTO"),
        (75, "ALTO"),
        (74.9, "MEDIO"),
        (60, "MEDIO"),
        (59.9, "BAJO"),
        (40, "BAJO"),
        (39.9, "CRITICO"),
        (0, "CRITICO"),
    ])
    def test_umbrales(self, puntaje, esperado):
        assert clasificar_nivel(puntaje) == esperado


# ============================================================================
# Semaforización
# ============================================================================
class TestSemaforizacion:
    @pytest.mark.parametrize("puntaje,esperado", [
        (85, "VERDE"),
        (70, "VERDE"),
        (69.9, "AMARILLO"),
        (50, "AMARILLO"),
        (49.9, "ROJO"),
        (0, "ROJO"),
    ])
    def test_umbrales(self, puntaje, esperado):
        assert semaforizar(puntaje) == esperado


# ============================================================================
# Índice de Riesgo Institucional (IRI)
# ============================================================================
class TestRiesgoInstitucional:
    def test_iri_optimo(self):
        """Transparencia 100, ejecución 100, sin deuda ni corrupción, alta participación → bajo riesgo."""
        # opacidad=transparencia, ejecucion, endeudamiento, corrupcion, participacion
        # (100-100)*.25 + (100-100)*.20 + 0*.20 + 0*.20 + (100-100)*.15 = 0
        assert calcular_iri(100, 100, 0, 0, 100) == 0.0

    def test_iri_pesimo(self):
        """Sin transparencia, sin ejecución, máximo endeudamiento, corrupción alta, sin participación."""
        # (100-0)*.25 + (100-0)*.20 + 100*.20 + 100*.20 + (100-0)*.15
        # = 25 + 20 + 20 + 20 + 15 = 100
        assert calcular_iri(0, 0, 100, 100, 0) == 100.0

    def test_iri_intermedio(self):
        """Escenario realista: mediana transparencia y participación, alguna deuda."""
        # transparencia=60, ejecucion=70, endeudamiento=50, corrupcion=30, participacion=40
        # (100-60)*.25 + (100-70)*.20 + 50*.20 + 30*.20 + (100-40)*.15
        # = 10 + 6 + 10 + 6 + 9 = 41.0
        assert calcular_iri(60, 70, 50, 30, 40) == 41.0


# ============================================================================
# Z-Score para detección de anomalías
# ============================================================================
class TestZScore:
    def test_zscore_valor_en_media(self):
        # Si el valor coincide con la media, z = 0
        z = zscore(50, [40, 50, 60])
        assert z == 0.0

    def test_zscore_valor_atipico_positivo(self):
        # Series con media=50, valor=80 → z positivo grande
        z = zscore(80, [40, 50, 60])
        assert z > 2  # outlier estadístico

    def test_zscore_valor_atipico_negativo(self):
        z = zscore(10, [40, 50, 60])
        assert z < -2

    def test_zscore_serie_vacia(self):
        assert zscore(50, []) is None

    def test_zscore_serie_constante(self):
        # Desviación 0 → no se puede calcular
        assert zscore(50, [50, 50, 50]) is None


# ============================================================================
# Escenarios end-to-end del scoring
# ============================================================================
class TestEscenariosCompletos:
    def test_cuenca_excelente(self):
        """Caso real-like: Cuenca con alto desempeño en todas las dimensiones."""
        objetivo = DimensionScores(
            transparencia=92, finanzas=88, servicios=94, desarrollo=87,
            gestion_institucional=90, participacion=85, legitimidad=95,
            innovacion=98,
        )
        ciudadano = DimensionScores(
            transparencia=85, finanzas=80, servicios=88, desarrollo=82,
            gestion_institucional=82, participacion=80, legitimidad=88,
            innovacion=90,
        )
        experto = objetivo

        ingel_obj = calcular_ingel(objetivo)
        ingel_ciud = calcular_ingel(ciudadano)
        ingel_exp = calcular_ingel(experto)

        ingel_final = combinar_componentes(ingel_obj, ingel_ciud, ingel_exp)

        assert ingel_obj > 85, f"INGEL objetivo Cuenca debe ser >85, fue {ingel_obj}"
        assert clasificar_nivel(ingel_final) in ("EXCELENTE", "ALTO")
        assert semaforizar(ingel_final) == "VERDE"

    def test_canton_critico(self):
        """GAD pequeño con baja transparencia y servicios deficientes."""
        objetivo = DimensionScores(
            transparencia=20, finanzas=45, servicios=35, desarrollo=40,
            gestion_institucional=30, participacion=15, legitimidad=25,
            innovacion=10,
        )
        ciudadano = DimensionScores(
            transparencia=15, finanzas=40, servicios=25, desarrollo=35,
            gestion_institucional=30, participacion=10, legitimidad=20,
            innovacion=5,
        )
        experto = objetivo

        ingel = combinar_componentes(
            calcular_ingel(objetivo),
            calcular_ingel(ciudadano),
            calcular_ingel(experto),
        )

        assert clasificar_nivel(ingel) == "CRITICO"
        assert semaforizar(ingel) == "ROJO"

        # Alto riesgo institucional
        iri = calcular_iri(
            opacidad=objetivo.transparencia,
            ejecucion=objetivo.finanzas,
            endeudamiento=100 - objetivo.finanzas,
            corrupcion=100 - objetivo.legitimidad,
            participacion=objetivo.participacion,
        )
        assert iri > 60, f"IRI debe ser alto (>60), fue {iri}"

    def test_consistencia_ranking(self):
        """Si dimension A > B en todas las componentes, ingel(A) > ingel(B)."""
        a = DimensionScores(
            transparencia=80, finanzas=80, servicios=80, desarrollo=80,
            gestion_institucional=80, participacion=80, legitimidad=80,
            innovacion=80,
        )
        b = DimensionScores(
            transparencia=60, finanzas=60, servicios=60, desarrollo=60,
            gestion_institucional=60, participacion=60, legitimidad=60,
            innovacion=60,
        )
        assert calcular_ingel(a) > calcular_ingel(b)
