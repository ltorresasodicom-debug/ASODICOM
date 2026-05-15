"""Spider SERCOP — Contratación Pública del Ecuador.

Consume la API de datos abiertos del SERCOP (no scraping HTML) para
generar mediciones del indicador IND_TR_CONTRAT (visibilidad de contratación).

Documentación: https://datosabiertos.compraspublicas.gob.ec/
"""
import scrapy
import json

from sigel_scraper.items import MedicionItem


class SercopSpider(scrapy.Spider):
    name = "sercop"
    custom_settings = {"DOWNLOAD_DELAY": 0.5}

    start_urls = [
        "https://datosabiertos.compraspublicas.gob.ec/PLATAFORMA/api/v1/ocds/contracts"
    ]

    def parse(self, response):
        try:
            data = json.loads(response.text)
        except Exception:
            return
        for record in data.get("results", []):
            buyer = (record.get("buyer") or {}).get("name", "")
            yield MedicionItem(
                indicador_codigo="IND_TR_CONTRAT",
                gad_codigo=buyer.lower().replace("gad municipal de ", "").strip(),
                valor=1.0,
                fuente="SERCOP",
                metodo_recoleccion="API",
                confiabilidad=0.95,
            )
