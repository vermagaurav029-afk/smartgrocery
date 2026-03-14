"""
Core configuration using Pydantic BaseSettings.
Values are loaded from environment variables or .env file.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SmartGrocery"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/smartgrocery"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://smartgrocery.vercel.app"]

    # Email (optional, for alerts)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""

    # AI Planner (OpenAI optional)
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
