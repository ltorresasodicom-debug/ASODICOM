"""Normalización Min-Max para indicadores SIGEL.

Transforma valores heterogéneos a una escala 0–1, distinguiendo indicadores
positivos (mayor=mejor, p.ej. cobertura agua) y negativos (mayor=peor,
p.ej. endeudamiento), tal y como define la metodología SIGEL §1.4.
"""
from __future__ import annotations

import numpy as np


def normalize_positive(value: float, vmin: float, vmax: float) -> float:
    if value is None or vmin is None or vmax is None or vmax == vmin:
        return 0.0
    n = (value - vmin) / (vmax - vmin)
    return float(max(0.0, min(1.0, n)))


def normalize_negative(value: float, vmin: float, vmax: float) -> float:
    if value is None or vmin is None or vmax is None or vmax == vmin:
        return 0.0
    n = (vmax - value) / (vmax - vmin)
    return float(max(0.0, min(1.0, n)))


def zscore(value: float, series: list[float]) -> float | None:
    """Z-Score de un valor respecto a la serie histórica."""
    if not series:
        return None
    arr = np.asarray(series, dtype=float)
    std = arr.std(ddof=0)
    if std == 0:
        return None
    return float((value - arr.mean()) / std)
