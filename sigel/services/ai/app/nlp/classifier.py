"""Clasificación temática de denuncias y análisis de sentimiento.

Para denuncias usa una pipeline heurística + reglas con keywords,
respaldada por embeddings (`sentence-transformers`) cuando el modelo
está cargado. Para sentimiento se apoya en un pipeline de Transformers
en español.
"""
from __future__ import annotations

import re
from functools import lru_cache

# Lexicones por categoría (alineados al enum 'tipo' de denuncias)
LEXICON = {
    "CORRUPCION": [
        "soborno", "coima", "diezmo", "comision indebida", "tráfico de influencias",
        "sobreprecio", "contratacion direccionada", "favoritismo", "peculado",
    ],
    "OPACIDAD": [
        "no publica", "ocultan", "información no disponible", "rendición no",
        "página caída", "no actualizan", "sin transparencia",
    ],
    "MAL_SERVICIO": [
        "agua no llega", "basura no recogen", "vía dañada", "no recolectan",
        "alcantarillado", "atención pésima", "ventanilla cerrada",
    ],
    "ABUSO": [
        "amenaza", "agresion", "intimidacion", "abuso de poder", "discriminacion",
        "violencia institucional",
    ],
    "NEGLIGENCIA": [
        "no responde", "abandono", "olvidan", "no atienden", "desidia",
    ],
    "OBRA_INCONCLUSA": [
        "obra parada", "obra inconclusa", "abandonada", "sin terminar",
        "estancada", "obra fantasma",
    ],
}


def _puntaje_categoria(texto: str, palabras: list[str]) -> int:
    t = texto.lower()
    return sum(1 for w in palabras if w in t)


def clasificar_denuncia(texto: str) -> dict:
    """Devuelve la mejor categoría detectada con score."""
    scores = {cat: _puntaje_categoria(texto, kws) for cat, kws in LEXICON.items()}
    mejor = max(scores, key=scores.get)
    score = scores[mejor]
    if score == 0:
        mejor = "OTRO"
        score = 0
    return {
        "categoria": mejor,
        "score": score,
        "scores": scores,
        "metodo": "lexicon-v1",
    }


@lru_cache(maxsize=1)
def _pipeline_sentimiento():
    """Carga perezosa del pipeline de Transformers."""
    try:
        from transformers import pipeline
        return pipeline(
            "sentiment-analysis",
            model="finiteautomata/beto-sentiment-analysis",
            top_k=None,
        )
    except Exception:
        return None


def analizar_sentimiento(texto: str) -> dict:
    pipe = _pipeline_sentimiento()
    if pipe is None:
        # Fallback heurístico
        negativos = ["malo", "pésimo", "terrible", "corrupto", "horrible"]
        positivos = ["bueno", "excelente", "gracias", "mejora", "felicitaciones"]
        t = texto.lower()
        n = sum(t.count(w) for w in negativos)
        p = sum(t.count(w) for w in positivos)
        if n > p:
            label, score = "NEG", n / max(1, n + p)
        elif p > n:
            label, score = "POS", p / max(1, n + p)
        else:
            label, score = "NEU", 1.0
        return {"label": label, "score": round(score, 3), "metodo": "fallback-heuristico"}

    out = pipe(texto[:1000])[0]
    return {"label": out[0]["label"], "score": float(out[0]["score"]), "metodo": "beto-sentiment-analysis"}
