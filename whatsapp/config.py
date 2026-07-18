import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Port & Host for WhatsApp FastAPI service
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    
    # Meta WhatsApp Business Cloud API Settings
    WHATSAPP_TOKEN: str = "MOCK_WHATSAPP_ACCESS_TOKEN"
    WHATSAPP_PHONE_NUMBER_ID: str = "MOCK_PHONE_NUMBER_ID"
    WHATSAPP_VERIFY_TOKEN: str = "KAVACH_VERIFY_TOKEN_2026"
    WHATSAPP_APP_SECRET: str = "MOCK_APP_SECRET"
    
    # Existing Backend Connection
    BACKEND_URL: str = "http://localhost:8000"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
