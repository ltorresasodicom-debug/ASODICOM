"""Spider LOTAIP — Ley Orgánica de Transparencia y Acceso a Información Pública.

Recorre portales de transparencia de GADs municipales/provinciales detectando
los 21 literales obligatorios (a-v) que exige la LOTAIP, e infiere el
indicador IND_TR_LOTAIP (cumplimiento %).

Fuentes típicas:
- https://www.cuenca.gob.ec/transparencia
- https://www.pichinchacomunicaciones.com.ec/transparencia/
- ... etc.

Las URLs se cargan desde la tabla `sigel.gads.portal_transparencia`.
"""
import re
from urllib.parse import urlparse

import scrapy

from sigel_scraper.items import DocumentoItem, MedicionItem


LITERALES_LOTAIP = list("abcdefghijklmnopqrstuv")
TOTAL_LITERALES = len(LITERALES_LOTAIP)


class LotaipSpider(scrapy.Spider):
    name = "lotaip"
    custom_settings = {"DOWNLOAD_DELAY": 2.0}

    def start_requests(self):
        # En producción, leer URLs de la tabla `sigel.gads.portal_transparencia`.
        # Aquí se ilustra con cargas vía configuración.
        urls = getattr(self.settings, "LOTAIP_URLS", []) or [
            # Ejemplos públicos:
            "https://www.cuenca.gob.ec/transparencia",
        ]
        for url in urls:
            yield scrapy.Request(url, callback=self.parse, meta={"gad_codigo": self._gad_from_url(url)})

    def _gad_from_url(self, url: str) -> str:
        host = urlparse(url).netloc
        return host.replace("www.", "").split(".")[0]

    def parse(self, response):
        gad_codigo = response.meta.get("gad_codigo", "")
        texto_pagina = " ".join(response.css("body *::text").getall()).lower()
        detectados = sum(
            1 for lit in LITERALES_LOTAIP if re.search(rf"\b{lit}\)\s", texto_pagina)
        )
        cumplimiento_pct = (detectados / TOTAL_LITERALES) * 100.0

        yield MedicionItem(
            indicador_codigo="IND_TR_LOTAIP",
            gad_codigo=gad_codigo,
            valor=cumplimiento_pct,
            fuente=response.url,
            metodo_recoleccion="SCRAPING",
            confiabilidad=0.75,
        )

        # Documentos: recolectar PDFs visibles
        for pdf_url in response.css("a[href$='.pdf']::attr(href)").getall():
            yield response.follow(
                pdf_url,
                callback=self.parse_pdf,
                meta={"gad_codigo": gad_codigo, "tipo": "LOTAIP"},
            )

    def parse_pdf(self, response):
        yield DocumentoItem(
            gad_codigo=response.meta["gad_codigo"],
            tipo=response.meta["tipo"],
            titulo=response.url.rsplit("/", 1)[-1],
            url_original=response.url,
            formato="pdf",
        )
