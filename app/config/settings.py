"""Configuration settings for Flask application."""

import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""

    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-secret-key-change-me")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET", "website")

    CORS_ORIGINS_RAW: str = os.getenv("CORS_ORIGINS", "*")

    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins string into a list."""
        if not self.CORS_ORIGINS_RAW or self.CORS_ORIGINS_RAW == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]


class DevelopmentConfig(Config):
    """Development environment configuration."""

    DEBUG: bool = True
    TESTING: bool = False


class ProductionConfig(Config):
    """Production environment configuration."""

    DEBUG: bool = False
    TESTING: bool = False


class TestingConfig(Config):
    """Testing environment configuration."""

    DEBUG: bool = True
    TESTING: bool = True
    SUPABASE_URL: str = "https://mock-supabase-url.supabase.co"
    SUPABASE_ANON_KEY: str = "mock-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "mock-service-role-key"


def get_config():
    """Retrieve configuration based on FLASK_ENV."""
    env = os.getenv("FLASK_ENV", "development").lower()
    if env == "production":
        return ProductionConfig()
    elif env == "testing":
        return TestingConfig()
    return DevelopmentConfig()
