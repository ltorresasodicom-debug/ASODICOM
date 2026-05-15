"""Middlewares Scrapy — rotación de user-agents."""
import random


class RotatingUAMiddleware:
    UAS = [
        "SIGEL-Bot/1.0 (+https://sigel.gob.ec/scraper-policy)",
        "Mozilla/5.0 (compatible; SIGEL/1.0; +https://sigel.gob.ec)",
        "SIGEL-Crawler/1.0 (transparencia@sigel.gob.ec)",
    ]

    def process_request(self, request, spider):
        request.headers["User-Agent"] = random.choice(self.UAS)
        return None
