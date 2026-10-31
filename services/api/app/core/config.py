import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "KINTRAL"
    TAGLINE: str = "See the signal. Make the move."
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "kintral-super-secret-key-change-in-production")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_1wSAZhODE9WF@ep-ancient-frog-b4lk4pw1-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
    )
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY", None)
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEMO_MODE: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
