"""Items canónicos para los spiders SIGEL."""
import scrapy


class DocumentoItem(scrapy.Item):
    gad_codigo = scrapy.Field()
    tipo = scrapy.Field()          # LOTAIP, PRESUPUESTO, CONTRATACION, PDOT, ...
    titulo = scrapy.Field()
    url_original = scrapy.Field()
    formato = scrapy.Field()
    fecha_documento = scrapy.Field()
    hash_contenido = scrapy.Field()
    texto_extraido = scrapy.Field()


class MedicionItem(scrapy.Item):
    indicador_codigo = scrapy.Field()
    gad_codigo = scrapy.Field()
    valor = scrapy.Field()
    fecha = scrapy.Field()
    fuente = scrapy.Field()
    metodo_recoleccion = scrapy.Field()
    confiabilidad = scrapy.Field()
