import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field, AliasChoices

# Resolve whatsapp/.env relative to this file so the path is correct
# regardless of the working directory uvicorn is launched from.
_ENV_FILE = str(Path(__file__).resolve().parent / ".env")


class Settings(BaseSettings):
    # Port & Host for WhatsApp FastAPI service
    PORT: int = 8001
    HOST: str = "0.0.0.0"

    # Meta WhatsApp Business Cloud API Settings
    # Accepts both WHATSAPP_TOKEN (used in whatsapp/.env) and
    # WHATSAPP_ACCESS_TOKEN (used in root .env / deployment envs)
    WHATSAPP_TOKEN: str = Field(
        "MOCK_WHATSAPP_ACCESS_TOKEN",
        validation_alias=AliasChoices("WHATSAPP_TOKEN", "WHATSAPP_ACCESS_TOKEN")
    )
    WHATSAPP_PHONE_NUMBER_ID: str = Field("MOCK_PHONE_NUMBER_ID", validation_alias="WHATSAPP_PHONE_NUMBER_ID")
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = Field("MOCK_BUSINESS_ACCOUNT_ID", validation_alias="WHATSAPP_BUSINESS_ACCOUNT_ID")
    WHATSAPP_VERIFY_TOKEN: str = Field("KAVACH_VERIFY_TOKEN_2026", validation_alias="WHATSAPP_VERIFY_TOKEN")
    WHATSAPP_APP_SECRET: str = Field("MOCK_APP_SECRET", validation_alias="WHATSAPP_APP_SECRET")

    # Existing Backend Connection
    BACKEND_URL: str = Field("http://localhost:8000", validation_alias="BACKEND_URL")

    class Config:
        env_file = _ENV_FILE
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

print("=" * 50)
print("WHATSAPP_TOKEN:", settings.WHATSAPP_TOKEN[:20] if settings.WHATSAPP_TOKEN else None)
print("PHONE_ID:", settings.WHATSAPP_PHONE_NUMBER_ID)
print("VERIFY:", settings.WHATSAPP_VERIFY_TOKEN)
print("BACKEND:", settings.BACKEND_URL)
print("=" * 50)