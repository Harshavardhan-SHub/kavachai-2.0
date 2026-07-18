import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from whatsapp.config import settings
from whatsapp.webhook import router as webhook_router
from whatsapp.middleware.logging import LoggingMiddleware

app = FastAPI(
    title="Kavach-AI WhatsApp Conversational Layer", 
    version="2.0.0",
    description="Conversational interface layer connecting Meta Cloud API to Kavach-AI protection backend."
)

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

@app.get("/")
def home():
    return {
        "service": "Kavach-AI WhatsApp Interface API",
        "status": "Online",
        "port": settings.PORT
    }

if __name__ == "__main__":
    uvicorn.run("whatsapp.app:app", host=settings.HOST, port=settings.PORT, reload=True)
