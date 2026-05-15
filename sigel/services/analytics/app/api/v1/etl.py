"""Pipelines ETL — entrada de mediciones validadas hacia la BD."""
from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db

router = APIRouter()


class MedicionIn(BaseModel):
    indicador_id: int
    gad_id: int
    valor: float
    fecha: date | None = None
    fuente: str | None = None
    metodo_recoleccion: str | None = "MANUAL"
    confiabilidad: float | None = 0.95


@router.post("/medicion", summary="Inserta una medición individual")
async def crear_medicion(m: MedicionIn, db: AsyncSession = Depends(get_db)):
    await db.execute(
        text(
            """INSERT INTO sigel.mediciones
               (indicador_id, gad_id, valor, fecha, fuente, metodo_recoleccion, confiabilidad)
               VALUES (:i, :g, :v, COALESCE(:f, CURRENT_DATE), :fu, :mr, :c)"""
        ),
        {
            "i": m.indicador_id, "g": m.gad_id, "v": m.valor, "f": m.fecha,
            "fu": m.fuente, "mr": m.metodo_recoleccion, "c": m.confiabilidad,
        },
    )
    await db.commit()
    return {"ok": True}


@router.post("/medicion/lote", summary="Inserta múltiples mediciones (batch)")
async def crear_lote(mediciones: list[MedicionIn], db: AsyncSession = Depends(get_db)):
    if len(mediciones) > 10_000:
        raise HTTPException(413, "Máximo 10,000 mediciones por lote")
    for m in mediciones:
        await db.execute(
            text(
                """INSERT INTO sigel.mediciones
                   (indicador_id, gad_id, valor, fecha, fuente, metodo_recoleccion, confiabilidad)
                   VALUES (:i, :g, :v, COALESCE(:f, CURRENT_DATE), :fu, :mr, :c)"""
            ),
            {
                "i": m.indicador_id, "g": m.gad_id, "v": m.valor, "f": m.fecha,
                "fu": m.fuente, "mr": m.metodo_recoleccion, "c": m.confiabilidad,
            },
        )
    await db.commit()
    return {"insertadas": len(mediciones)}
