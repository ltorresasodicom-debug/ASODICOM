"""Endpoints de predicción ML."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.ml.risk_predictor import entrenar, predecir

router = APIRouter()


class FeaturesIn(BaseModel):
    transparencia: float
    finanzas: float
    servicios: float
    desarrollo: float
    gestion_institucional: float
    participacion: float
    legitimidad: float
    innovacion: float


@router.post("/entrenar", summary="Entrena Random Forest sobre histórico de scoring")
async def train_endpoint(db: AsyncSession = Depends(get_db)):
    return await entrenar(db)


@router.post("/riesgo", summary="Predice nivel de riesgo institucional")
async def riesgo(features: FeaturesIn):
    result = predecir(features.model_dump())
    if "error" in result:
        raise HTTPException(409, result["error"])
    return result
