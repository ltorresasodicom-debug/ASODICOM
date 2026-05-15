"""Spider Ministerio de Finanzas — Ejecución presupuestaria."""
import scrapy

from sigel_scraper.items import DocumentoItem


class FinanzasSpider(scrapy.Spider):
    name = "finanzas"
    start_urls = ["https://www.finanzas.gob.ec/ejecucion-presupuestaria/"]

    def parse(self, response):
        for link in response.css("a[href*='.pdf']::attr(href)").getall():
            yield response.follow(
                link, callback=self.parse_pdf, meta={"tipo": "PRESUPUESTO"}
            )

    def parse_pdf(self, response):
        yield DocumentoItem(
            gad_codigo="nacional",
            tipo=response.meta["tipo"],
            titulo=response.url.rsplit("/", 1)[-1],
            url_original=response.url,
            formato="pdf",
        )
