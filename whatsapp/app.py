import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from whatsapp.config import settings
from whatsapp.services.backend_client import backend_client
from whatsapp.webhook import router as webhook_router
from whatsapp.middleware.logging import LoggingMiddleware

app = FastAPI(
    title="Kavach-AI WhatsApp Conversational Layer", 
    version="2.0.0",
    description="Conversational interface layer connecting Meta Cloud API to Kavach-AI protection backend."
)

logger = logging.getLogger("whatsapp-service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom logging middleware
app.add_middleware(LoggingMiddleware)

# Include Webhook Router
app.include_router(webhook_router)


@app.on_event("startup")
async def log_startup() -> None:
    logger.info(f"WhatsApp service starting on {settings.HOST}:{settings.PORT}")

@app.get("/")
def home():
    return {
        "service": "Kavach-AI WhatsApp Interface API",
        "status": "Online",
        "port": settings.PORT
    }


@app.get("/health")
async def health_check():
    backend_status = await backend_client.health()
    backend_connected = backend_status.get("status") == "healthy"

    meta_configured = all([
        settings.WHATSAPP_TOKEN,
        settings.WHATSAPP_PHONE_NUMBER_ID,
        settings.WHATSAPP_VERIFY_TOKEN,
        settings.WHATSAPP_APP_SECRET,
    ])

    return {
        "status": "healthy",
        "backend": "connected" if backend_connected else "disconnected",
        "meta": "configured" if meta_configured else "not configured",
        "backend_url": settings.BACKEND_URL,
        "phone_number_id": settings.WHATSAPP_PHONE_NUMBER_ID,
    }
if __name__ == "__main__":
    uvicorn.run("whatsapp.app:app", host=settings.HOST, port=settings.PORT, reload=True)
