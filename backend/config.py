from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "AIRA Core"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    GEMINI_API_KEY: str = ""
    TAVILY_API_KEY: str = ""

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5174,http://localhost:5176,http://localhost:5173"

    UPLOAD_DIR: str = "./uploads"
    OUTPUT_DIR: str = "./outputs"
    CHROMA_DB_PATH: str = "./chroma_db"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
