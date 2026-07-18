import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve .env relative to this file so it works regardless of cwd.
# backend/app/config.py → two levels up → project root → .env
_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

# Twilio Config
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")
TWILIO_VERIFY_SERVICE_SID = os.getenv("TWILIO_VERIFY_SERVICE_SID", "")

# Server Config
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

# Toggle simulation mode if keys are missing
USE_MOCK_GEMINI = not bool(GEMINI_API_KEY)
USE_MOCK_SARVAM = not bool(SARVAM_API_KEY)
USE_MOCK_TWILIO = not (bool(TWILIO_ACCOUNT_SID) and bool(TWILIO_AUTH_TOKEN) and bool(TWILIO_PHONE_NUMBER))
USE_MOCK_VERIFY = not (bool(TWILIO_ACCOUNT_SID) and bool(TWILIO_AUTH_TOKEN) and bool(TWILIO_VERIFY_SERVICE_SID))
