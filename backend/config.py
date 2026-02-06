from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:password@localhost:5432/system_monitor"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')


settings = Settings()
