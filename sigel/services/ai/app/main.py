"""SIGEL — Servicio de IA.

Capacidades:
- NLP: clasificación temática de denuncias y resúmenes de documentos públicos.
- Sentimiento: análisis de comentarios ciudadanos.
- OCR: extracción de texto desde PDFs LOTAIP.
- Embeddings: búsqueda semántica sobre documentos.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.nlp.classifier import clasificar_denuncia, analizar_sentimiento
from app.ocr.pdf import extraer_texto_pdf

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("sigel.ai.startup")
    yield
    logger.info("sigel.ai.shutdown")


app = FastAPI(
    title="SIGEL AI Service",
    description="NLP + OCR + clasificación de denuncias para la plataforma SIGEL.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "sigel-ai"}


class TextoIn(BaseModel):
    texto: str


@app.post("/nlp/clasificar-denuncia", tags=["nlp"])
async def clasificar(req: TextoIn):
    return clasificar_denuncia(req.texto)


@app.post("/nlp/sentimiento", tags=["nlp"])
async def sentimiento(req: TextoIn):
    return analizar_sentimiento(req.texto)


@app.post("/ocr/pdf", tags=["ocr"])
async def ocr_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(415, "Sólo PDF")
    data = await file.read()
    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(413, "Archivo > 25 MB")
    texto = extraer_texto_pdf(data)
    return {"texto": texto, "longitud": len(texto)}
