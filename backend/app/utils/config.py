from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./codexa.db"

    # Firebase
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_SERVICE_ACCOUNT_KEY_PATH: str = ""

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # Redis (optional)
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS — wrap in quotes in .env if using JSON list
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Environment
    APP_ENV: str = "development"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "changeme"

    # Code execution limits
    MAX_EXECUTION_TIME: int = 10    # seconds
    MAX_MEMORY_MB: int = 256        # megabytes

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
