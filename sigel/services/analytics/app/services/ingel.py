"""Cálculo del Índice Nacional de Gestión Local (INGEL).

Fórmula (Sección 9 de la metodología SIGEL):

    INGEL = Σ(Dimensión_i × Ponderación_i)

con ponderaciones:
    Transparencia          0.20
    Finanzas               0.15
    Servicios Públicos     0.20
    Desarrollo Territorial 0.10
    Gestión Institucional  0.10
    Participación          0.10
    Legitimidad            0.10
    Innovación Digital     0.05

Cada dimensión, a su vez, se calcula como el promedio ponderado de
sus variables normalizadas (Min-Max), y combina tres componentes
(objetivo 60% + ciudadano 25% + experto 15%) cuando aplica.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.core.config import settings


@dataclass(frozen=True)
class DimensionScores:
    transparencia: float = 0.0
    finanzas: float = 0.0
    servicios: float = 0.0
    desarrollo: float = 0.0
    gestion_institucional: float = 0.0
    participacion: float = 0.0
    legitimidad: float = 0.0
    innovacion: float = 0.0


def calcular_ingel(d: DimensionScores) -> float:
    """Aplica la fórmula INGEL devolviendo un valor en [0, 100]."""
    score = (
        d.transparencia * settings.weight_transparencia
        + d.finanzas * settings.weight_finanzas
        + d.servicios * settings.weight_servicios
        + d.desarrollo * settings.weight_desarrollo
        + d.gestion_institucional * settings.weight_gestion_institucional
        + d.participacion * settings.weight_participacion
        + d.legitimidad * settings.weight_legitimidad
        + d.innovacion * settings.weight_innovacion
    )
    return round(score, 3)


def combinar_componentes(objetivo: float, ciudadano: float, experto: float) -> float:
    """Combina los tres componentes con los pesos SIGEL (60/25/15)."""
    return round(
        objetivo * settings.weight_objetivo
        + ciudadano * settings.weight_ciudadano
        + experto * settings.weight_experto,
        3,
    )


def clasificar_nivel(puntaje: float) -> str:
    if puntaje >= 90: return "EXCELENTE"
    if puntaje >= 75: return "ALTO"
    if puntaje >= 60: return "MEDIO"
    if puntaje >= 40: return "BAJO"
    return "CRITICO"


def semaforizar(puntaje: float) -> str:
    if puntaje >= 70: return "VERDE"
    if puntaje >= 50: return "AMARILLO"
    return "ROJO"


def calcular_iri(opacidad: float, ejecucion: float, endeudamiento: float,
                 corrupcion: float, participacion: float) -> float:
    """Índice de Riesgo Institucional (§1.13 metodología).

    Mayor valor → mayor riesgo. Combina opacidad, baja ejecución,
    sobre-endeudamiento, corrupción percibida y baja participación.
    """
    risk = (
        (100 - opacidad) * 0.25
        + (100 - ejecucion) * 0.20
        + min(endeudamiento, 100) * 0.20
        + corrupcion * 0.20
        + (100 - participacion) * 0.15
    )
    return round(min(100.0, max(0.0, risk)), 3)
