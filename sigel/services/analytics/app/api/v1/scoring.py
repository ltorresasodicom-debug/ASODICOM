"""Endpoints REST de scoring."""
from __future__ import annotations

from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.services.scoring_engine import calcular_score_gad, recalcular_ranking_global

router = APIRouter()


@router.post("/calcular/{gad_id}", summary="Recalcula INGEL para un GAD")
async def calcular(gad_id: int, db: AsyncSession = Depends(get_db)):
    try:
        return await calcular_score_gad(db, gad_id)
    except Exception as e:
        raise HTTPException(500, str(e)) from e


@router.post("/calcular/batch", summary="Recálculo masivo para todos los GADs")
async def calcular_batch(bg: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(text("SELECT id FROM sigel.gads WHERE activo = TRUE"))).all()

    async def _work():
        for (gid,) in rows:
            try:
                await calcular_score_gad(db, gid)
            except Exception as exc:  # noqa: BLE001
                print(f"Error gad={gid}: {exc}")
        await recalcular_ranking_global(db)

    bg.add_task(_work)
    return {"queued": len(rows)}


@router.post("/recalcular-ranking", summary="Recalcula ranking nacional")
async def recalcular_ranking(fecha: date | None = None, db: AsyncSession = Depends(get_db)):
    afectados = await recalcular_ranking_global(db, fecha)
    return {"afectados": afectados, "fecha": (fecha or date.today()).isoformat()}


@router.get("/ranking", summary="Ranking nacional vigente")
async def ranking(limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_db)):
    rows = (
        await db.execute(
            text("SELECT * FROM sigel.vw_ranking_nacional LIMIT :l OFFSET :o"),
            {"l": limit, "o": offset},
        )
    ).all()
    return [dict(r._mapping) for r in rows]


@router.get("/estadisticas", summary="Estadísticas nacionales agregadas")
async def estadisticas(db: AsyncSession = Depends(get_db)):
    row = (await db.execute(text("SELECT * FROM sigel.vw_estadisticas_nacionales"))).first()
    return dict(row._mapping) if row else {}
