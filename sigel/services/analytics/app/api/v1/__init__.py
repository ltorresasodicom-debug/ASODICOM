"""Router agregador de la versión v1 de la API analítica."""
from fastapi import APIRouter

from app.api.v1.scoring import router as scoring_router
from app.api.v1.predict import router as predict_router
from app.api.v1.anomalies import router as anomalies_router
from app.api.v1.clustering import router as clustering_router
from app.api.v1.etl import router as etl_router

api_router = APIRouter()
api_router.include_router(scoring_router, prefix="/scoring", tags=["scoring"])
api_router.include_router(predict_router, prefix="/predict", tags=["predict"])
api_router.include_router(anomalies_router, prefix="/anomalias", tags=["anomalias"])
api_router.include_router(clustering_router, prefix="/clustering", tags=["clustering"])
api_router.include_router(etl_router, prefix="/etl", tags=["etl"])
