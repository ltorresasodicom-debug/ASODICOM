"""Endpoint de clustering territorial."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.ml.clustering import recalcular_clusters

router = APIRouter()


@router.post("/recalcular", summary="Recalcula clústeres K-Means de cantones")
async def recalcular(k: int = 5, db: AsyncSession = Depends(get_db)):
    n = await recalcular_clusters(db, k=k)
    return {"cantones_actualizados": n, "k": k}
