"""Extracción de texto de PDFs (LOTAIP, presupuestos, actas).

Estrategia:
1. Intentar `pdfplumber` para PDFs con texto embebido.
2. Si el texto extraído es insuficiente, hacer OCR por página
   con Pillow + un motor OCR (Tesseract opcional, PaddleOCR en producción).
"""
from __future__ import annotations

import io

import pdfplumber


def extraer_texto_pdf(data: bytes) -> str:
    out: list[str] = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            out.append(text)
    full = "\n\n".join(out).strip()
    if len(full) < 100:
        # En producción, llamar a OCR (Tesseract/PaddleOCR) sobre las imágenes de página
        return full + "\n[NOTA: PDF parece escaneado — se requiere OCR completo]"
    return full
