import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Port & Host for WhatsApp FastAPI service
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    
    # Meta WhatsApp Business Cloud API Settings
    WHATSAPP_TOKEN: str = os.getenv("WHATSAPP_ACCESS_TOKEN", os.getenv("WHATSAPP_TOKEN", "MOCK_WHATSAPP_ACCESS_TOKEN"))
    WHATSAPP_PHONE_NUMBER_ID: str = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "MOCK_PHONE_NUMBER_ID")
    WHATSAPP_VERIFY_TOKEN: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "KAVACH_VERIFY_TOKEN_2026")
    WHATSAPP_APP_SECRET: str = os.getenv("WHATSAPP_APP_SECRET", "MOCK_APP_SECRET")
    
    # Existing Backend Connection - Dynamic fallback to server port in production
    BACKEND_URL: str = os.getenv("BACKEND_URL", f"http://localhost:{os.getenv('PORT', '8000')}")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
