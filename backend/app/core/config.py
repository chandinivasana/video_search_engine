from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Semantic Video Search Engine"
    API_V1_STR: str = "/api/v1"
    UPLOAD_DIR: str = "data/uploads"
    TRANSCRIPT_DIR: str = "data/transcripts"
    VECTOR_DB_DIR: str = "data/vector_db"
    
    # Model settings
    WHISPER_MODEL: str = "base"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.TRANSCRIPT_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_DB_DIR, exist_ok=True)
