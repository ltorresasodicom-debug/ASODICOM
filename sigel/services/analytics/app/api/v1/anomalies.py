"""Endpoint de detección de anomalías."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.ml.anomaly import detectar

router = APIRouter()


@router.post("/detectar", summary="Ejecuta Isolation Forest sobre mediciones recientes")
async def detectar_endpoint(
    contamination: float = 0.05, db: AsyncSession = Depends(get_db)
):
    out = await detectar(db, contamination=contamination)
    return {"anomalias": out, "total": len(out)}
