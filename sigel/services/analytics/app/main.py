"""SIGEL — Microservicio de Analítica y Scoring INGEL.

Responsable de:
- Cálculo del Índice Nacional de Gestión Local (INGEL).
- Recálculo del ranking nacional y por clúster.
- Modelos predictivos: Random Forest (riesgo institucional) e Isolation Forest (anomalías).
- Clustering territorial K-Means.
- Pipelines ETL hacia mediciones.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.v1 import api_router
from app.core.config import settings
from app.core.db import engine

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("sigel.analytics.startup", env=settings.env)
    yield
    await engine.dispose()
    logger.info("sigel.analytics.shutdown")


app = FastAPI(
    title="SIGEL Analytics",
    description=(
        "Microservicio analítico de SIGEL. Calcula el INGEL "
        "(Índice Nacional de Gestión Local), ejecuta modelos ML "
        "y produce rankings, alertas y clústeres territoriales."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "sigel-analytics"}
