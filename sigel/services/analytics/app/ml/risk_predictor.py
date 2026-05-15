"""Random Forest para predecir riesgo institucional.

Entrenado sobre históricos de IRI; predice probabilidad de:
- deterioro institucional,
- pérdida de legitimidad,
- riesgo político.

El modelo se persiste localmente (joblib) y se reentrena via cron-job.
"""
from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import structlog
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger()
MODEL_PATH = Path("/data/models/risk_rf.joblib")


def _label_from_iri(iri: float) -> str:
    if iri >= 70: return "ALTO"
    if iri >= 50: return "MEDIO"
    return "BAJO"


async def entrenar(db: AsyncSession) -> dict:
    """Entrena Random Forest sobre la tabla scoring."""
    rows = (
        await db.execute(
            text(
                """SELECT transparencia, finanzas, servicios, desarrollo,
                          gestion_institucional, participacion, legitimidad,
                          innovacion, iri
                   FROM sigel.scoring
                   WHERE iri IS NOT NULL"""
            )
        )
    ).all()
    if len(rows) < 30:
        logger.warning("risk.dataset_insuficiente", rows=len(rows))
        return {"ok": False, "rows": len(rows)}

    df = pd.DataFrame(rows, columns=[
        "transparencia", "finanzas", "servicios", "desarrollo",
        "gestion_institucional", "participacion", "legitimidad",
        "innovacion", "iri",
    ]).astype(float)
    df["label"] = df["iri"].apply(_label_from_iri)

    X = df.drop(columns=["iri", "label"]).values
    y = df["label"].values
    Xs = StandardScaler().fit_transform(X)
    X_train, X_test, y_train, y_test = train_test_split(Xs, y, test_size=0.2, random_state=42, stratify=y)

    rf = RandomForestClassifier(n_estimators=300, max_depth=12, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    pred = rf.predict(X_test)
    report = classification_report(y_test, pred, output_dict=True)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": rf, "feature_order": df.drop(columns=["iri","label"]).columns.tolist()}, MODEL_PATH)
    logger.info("risk.modelo_entrenado", samples=len(df))
    return {"ok": True, "samples": len(df), "report": report}


def predecir(features: dict[str, float]) -> dict:
    if not MODEL_PATH.exists():
        return {"error": "Modelo no entrenado. Llamar /api/v1/predict/entrenar primero."}
    bundle = joblib.load(MODEL_PATH)
    rf: RandomForestClassifier = bundle["model"]
    order = bundle["feature_order"]
    x = np.array([[features.get(k, 0.0) for k in order]])
    pred = rf.predict(x)[0]
    proba = rf.predict_proba(x)[0]
    return {
        "riesgo": str(pred),
        "probabilidades": dict(zip(rf.classes_.tolist(), proba.tolist(), strict=False)),
        "feature_order": order,
    }
