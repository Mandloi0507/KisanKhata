"""
Application configuration via pydantic-settings.
All environment variables are loaded from .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    # === Database ===
    DATABASE_URL: str = "sqlite+aiosqlite:///./kisankhata.db"

    # === Security ===
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ENCRYPTION_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_HOURS: int = 8
    BCRYPT_ROUNDS: int = 12

    # === External APIs ===
    OPENWEATHER_API_KEY: str = ""
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/climatology/point"
    AGMARKNET_API_URL: str = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    AGMARKNET_API_KEY: str = ""

    # === App ===
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    INTERNAL_API_KEY: str = "internal-dev-key"

    # === SMS ===
    SMS_ENABLED: bool = False
    MSG91_AUTH_KEY: str = ""

    # === CORS ===
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:8080"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
