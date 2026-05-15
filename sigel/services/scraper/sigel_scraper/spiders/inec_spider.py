"""Spider INEC — datos demográficos y socioeconómicos.

INEC distribuye datasets en CSV/XLSX. Esta spider descarga índices conocidos
y publica documentos en `sigel.documentos` para procesamiento posterior por ETL.
"""
import scrapy

from sigel_scraper.items import DocumentoItem


class InecSpider(scrapy.Spider):
    name = "inec"
    start_urls = [
        "https://www.ecuadorencifras.gob.ec/estadisticas-economicas/",
    ]

    def parse(self, response):
        for link in response.css("a[href$='.xlsx'], a[href$='.csv']::attr(href)").getall():
            yield response.follow(link, callback=self.parse_file)

    def parse_file(self, response):
        yield DocumentoItem(
            gad_codigo="nacional",
            tipo="OTRO",
            titulo=response.url.rsplit("/", 1)[-1],
            url_original=response.url,
            formato=response.url.rsplit(".", 1)[-1],
        )
