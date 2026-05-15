"""Configuración Scrapy."""
import os

BOT_NAME = "sigel"
SPIDER_MODULES = ["sigel_scraper.spiders"]
NEWSPIDER_MODULE = "sigel_scraper.spiders"

USER_AGENT = "SIGEL-Bot/1.0 (+https://sigel.gob.ec/scraper-policy)"
ROBOTSTXT_OBEY = True
CONCURRENT_REQUESTS = 8
DOWNLOAD_DELAY = 1.0
RANDOMIZE_DOWNLOAD_DELAY = True
COOKIES_ENABLED = False
TELNETCONSOLE_ENABLED = False

# Pipelines: validación → enriquecimiento → persistencia
ITEM_PIPELINES = {
    "sigel_scraper.pipelines.ValidationPipeline": 100,
    "sigel_scraper.pipelines.NormalizationPipeline": 200,
    "sigel_scraper.pipelines.PostgresPipeline": 300,
}

DOWNLOADER_MIDDLEWARES = {
    "sigel_scraper.middlewares.RotatingUAMiddleware": 400,
}

# Retries
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 429]

# AutoThrottle (cortesía con servidores GAD)
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 4
AUTOTHROTTLE_DEBUG = False

# Logs
LOG_LEVEL = "INFO"
LOG_FORMAT = '{"time":"%(asctime)s","level":"%(levelname)s","name":"%(name)s","msg":"%(message)s"}'

# DB
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_USER = os.getenv("DB_USER", "sigel")
DB_PASSWORD = os.getenv("DB_PASSWORD", "sigel")
DB_NAME = os.getenv("DB_NAME", "sigel")

# Reactor
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"

REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
