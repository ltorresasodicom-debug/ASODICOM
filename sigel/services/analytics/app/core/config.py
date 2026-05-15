"""Configuración global cargada desde variables de entorno."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    env: str = "development"
    port: int = 8000
    db_host: str = "postgres"
    db_port: int = 5432
    db_user: str = "sigel"
    db_password: str = "sigel"
    db_name: str = "sigel"
    db_schema: str = "sigel"

    redis_url: str = "redis://redis:6379/0"

    ai_url: str = "http://ai:8001"
    gateway_url: str = "http://gateway:3000"

    cors_origins: list[str] = ["*"]

    # Pesos canónicos de las 8 dimensiones del modelo SIGEL (suman 100%)
    weight_transparencia: float = 0.20
    weight_finanzas: float = 0.15
    weight_servicios: float = 0.20
    weight_desarrollo: float = 0.10
    weight_gestion_institucional: float = 0.10
    weight_participacion: float = 0.10
    weight_legitimidad: float = 0.10
    weight_innovacion: float = 0.05

    # Ponderación de componentes (objetivo / ciudadano / experto)
    weight_objetivo: float = 0.60
    weight_ciudadano: float = 0.25
    weight_experto: float = 0.15

    @property
    def db_dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
