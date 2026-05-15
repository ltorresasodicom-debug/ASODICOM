"""Pipelines: validación, normalización y persistencia en PostgreSQL."""
import hashlib
import structlog
import psycopg
from scrapy.exceptions import DropItem

from sigel_scraper.items import DocumentoItem, MedicionItem

logger = structlog.get_logger()


class ValidationPipeline:
    """Descarta items sin campos obligatorios."""

    def process_item(self, item, spider):
        if isinstance(item, DocumentoItem):
            if not item.get("url_original") or not item.get("tipo"):
                raise DropItem(f"Documento incompleto: {item}")
        elif isinstance(item, MedicionItem):
            if not item.get("indicador_codigo") or item.get("valor") is None:
                raise DropItem(f"Medición incompleta: {item}")
        return item


class NormalizationPipeline:
    """Normaliza valores numéricos y genera hash de contenido."""

    def process_item(self, item, spider):
        if isinstance(item, DocumentoItem):
            content = (item.get("texto_extraido") or item.get("url_original") or "").encode("utf-8")
            item["hash_contenido"] = hashlib.sha256(content).hexdigest()
        elif isinstance(item, MedicionItem):
            try:
                item["valor"] = float(item["valor"])
            except (TypeError, ValueError):
                raise DropItem(f"Valor no numérico: {item['valor']}")
        return item


class PostgresPipeline:
    """Persiste items en PostgreSQL."""

    def __init__(self, settings):
        self.dsn = (
            f"host={settings.get('DB_HOST')} port={settings.get('DB_PORT')} "
            f"user={settings.get('DB_USER')} password={settings.get('DB_PASSWORD')} "
            f"dbname={settings.get('DB_NAME')}"
        )
        self.conn = None

    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)

    def open_spider(self, spider):
        self.conn = psycopg.connect(self.dsn, autocommit=False)

    def close_spider(self, spider):
        if self.conn:
            self.conn.commit()
            self.conn.close()

    def process_item(self, item, spider):
        cur = self.conn.cursor()
        try:
            if isinstance(item, DocumentoItem):
                cur.execute(
                    """
                    INSERT INTO sigel.documentos
                        (gad_id, tipo, titulo, url_original, formato, fecha_documento,
                         hash_contenido, texto_extraido)
                    VALUES (
                        (SELECT id FROM sigel.gads WHERE nombre ILIKE %s LIMIT 1),
                        %s, %s, %s, %s, %s, %s, %s
                    )
                    ON CONFLICT DO NOTHING
                    """,
                    (
                        f"%{item.get('gad_codigo','')}%",
                        item["tipo"],
                        item.get("titulo"),
                        item["url_original"],
                        item.get("formato"),
                        item.get("fecha_documento"),
                        item["hash_contenido"],
                        item.get("texto_extraido"),
                    ),
                )
            elif isinstance(item, MedicionItem):
                cur.execute(
                    """
                    INSERT INTO sigel.mediciones
                        (indicador_id, gad_id, valor, fecha, fuente,
                         metodo_recoleccion, confiabilidad)
                    VALUES (
                        (SELECT id FROM sigel.indicadores WHERE codigo = %s),
                        (SELECT id FROM sigel.gads WHERE nombre ILIKE %s LIMIT 1),
                        %s, COALESCE(%s, CURRENT_DATE), %s, %s, %s
                    )
                    """,
                    (
                        item["indicador_codigo"],
                        f"%{item.get('gad_codigo','')}%",
                        item["valor"],
                        item.get("fecha"),
                        item.get("fuente"),
                        item.get("metodo_recoleccion", "SCRAPING"),
                        item.get("confiabilidad", 0.85),
                    ),
                )
            self.conn.commit()
        except Exception as exc:
            self.conn.rollback()
            logger.error("postgres.pipeline.error", error=str(exc), item=dict(item))
            raise DropItem(str(exc))
        return item
