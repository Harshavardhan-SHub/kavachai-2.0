import logging
import os
import time
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.config import PORT, HOST
from backend.app.services.sarvam_service import speech_to_text, translate_text, generate_warning_speech
from backend.app.services.gemini_service import analyze_text_threat
from backend.app.services.guardian_service import send_guardian_notification
from backend.app.services.auth_service import send_verification_otp, check_verification_otp
from backend.app.database import local_db

app = FastAPI(title="Kavach-AI Fraud Intelligence Engine API", version="1.0.0")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend-service")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        logger.info(f"Incoming Request: {request.method} {request.url.path}")

        try:
            response = await call_next(request)
            duration = (time.time() - start_time) * 1000
            logger.info(f"Completed Request: {response.status_code} in {duration:.2f}ms")
            return response
        except Exception as exc:
            duration = (time.time() - start_time) * 1000
            logger.error(f"Failed Request: {exc} in {duration:.2f}ms", exc_info=True)
            raise

# Enable CORS for Next.js development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo convenience, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)

# Initialize local JSON database
local_db.init_db()


@app.on_event("startup")
def log_startup() -> None:
    logger.info(f"Backend service starting on {HOST}:{PORT}")


class SendOtpRequest(BaseModel):
    phone_number: str


class VerifyOtpRequest(BaseModel):
    phone_number: str
    otp_code: str


class UserProfileRequest(BaseModel):
    phone_number: str
    protected_name: str
    guardian_number: str
    preferred_language: str
    notify_high: bool = True
    notify_suspicious: bool = False
    profile_completed: bool = False


class ThreatAnalysisRequest(BaseModel):
    text: str
    input_type: str = "SMS"
    guardian_enabled: bool = True
    guardian_on_suspicious: bool = False


class WarningAudioRequest(BaseModel):
    text: str
    language_code: str = "hi-IN"


class GuardianNotificationRequest(BaseModel):
    phone_number: str
    scam_type: str
    threat_score: int
    user_name: Optional[str] = "User"
    logged_id: Optional[str] = None


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/health")
def legacy_health_check():
    return {"status": "healthy", "service": "kavach-ai-backend"}


@app.post("/api/translate-input")
async def translate_input(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    language_code: str = Form("hi-IN")
):
    """
    Translates/normalizes input to English.
    Accepts text input or an audio file upload.
    """
    # 1. Handle Audio file input
    if file is not None:
        try:
            content = await file.read()
            if not content:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded audio file is empty."
                )
            
            result = await speech_to_text(content, file.filename, language_code)
            return {
                "input_type": "audio",
                "original_text": "[Audio Transcription]",
                "translated_text": result.get("transcript", ""),
                "detected_language": result.get("detected_language", language_code),
                "source": result.get("source", "Sarvam STT")
            }
        except Exception as e:
            print(f"Error in audio processing: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Speech to text failed: {str(e)}"
            )

    # 2. Handle Text SMS input
    if text is not None:
        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text input is empty."
            )
        
        try:
            result = await translate_text(text)
            return {
                "input_type": "text",
                "original_text": text,
                "translated_text": result.get("translated_text", text),
                "detected_language": result.get("detected_language", "hi-IN"),
                "source": result.get("source", "Sarvam Translate")
            }
        except Exception as e:
            print(f"Error in text translation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Text translation failed: {str(e)}"
            )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Either 'text' or 'file' must be provided."
    )


@app.post("/api/analyze-threat")
async def analyze_threat(payload: ThreatAnalysisRequest):
    """
    Sends normalized English text to Gemini for structured threat evaluation,
    then logs the results in the local history database.
    """
    if not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text payload cannot be empty."
        )
        
    try:
        # Run threat scoring via Gemini API or local rules fallback
        analysis = await analyze_text_threat(payload.text)
        
        # Determine initial warning audio and SMS status
        risk = analysis.get("risk_level", "SAFE")
        audio_played = "Played" if risk in ["SUSPICIOUS", "HIGH"] else "None"
        
        if risk == "SAFE":
            sms_status = "Not Sent"
        elif risk == "SUSPICIOUS":
            sms_status = "Pending" if (payload.guardian_enabled and payload.guardian_on_suspicious) else "Disabled"
        else: # HIGH
            sms_status = "Pending" if payload.guardian_enabled else "Disabled"

        # Log to local history DB
        logged_entry = local_db.add_log({
            "original_text": payload.text,
            "input_type": payload.input_type,
            "threat_score": analysis.get("threat_score", 0),
            "confidence_score": analysis.get("confidence_score", 0),
            "risk_level": risk,
            "threat_type": analysis.get("threat_type", "Legitimate"),
            "reason_flags": analysis.get("reason_flags", []),
            "recommended_action": analysis.get("recommended_action", ""),
            "audio_warning_played": audio_played,
            "sms_status": sms_status,
            "sms_error": None
        })
        
        return {
            "analysis": analysis,
            "logged_id": logged_entry.get("id"),
            "timestamp": logged_entry.get("timestamp")
        }
    except Exception as e:
        print(f"Error in threat analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Threat analysis failed: {str(e)}"
        )


@app.post("/api/generate-warning-audio")
async def generate_warning_audio(payload: WarningAudioRequest):
    """
    Generates spoken local language audio warnings for HIGH threat cases.
    """
    if not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Warning text cannot be empty."
        )
        
    try:
        result = await generate_warning_speech(payload.text, payload.language_code)
        return result
    except Exception as e:
        print(f"Error generating speech: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech generation failed: {str(e)}"
        )


@app.post("/api/notify-guardian")
async def notify_guardian(payload: GuardianNotificationRequest):
    """
    Sends an alert notification to a trusted guardian using Twilio or fallback simulation.
    """
    try:
        result = await send_guardian_notification(
            phone_number=payload.phone_number,
            threat_type=payload.scam_type,
            threat_score=payload.threat_score,
            user_name=payload.user_name or "User"
        )
        
        # Update database history log if logged_id is provided
        if payload.logged_id:
            sms_status = "Sent" if result.get("sent") else "Failed"
            sms_error = result.get("message") if not result.get("sent") else None
            local_db.update_log(payload.logged_id, {
                "sms_status": sms_status,
                "sms_error": sms_error
            })
            
        return result
    except Exception as e:
        print(f"Error in guardian notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Guardian notification failed: {str(e)}"
        )


@app.get("/api/history")
def get_incident_history():
    """
    Retrieves incident logs.
    """
    return local_db.get_history()

@app.get("/")
def home():
    return {
        "project": "Kavach-AI",
        "status": "Backend Live",
        "team": "HackPrix Season 3"
    }


@app.delete("/api/history")
def clear_incident_history():
    """
    Clears all incident logs from history.
    """
    try:
        with open(local_db.DB_FILE, "w", encoding="utf-8") as f:
            local_db.json.dump([], f)
        return {"status": "success", "message": "Incident history cleared."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )


# --- AUTHENTICATION & TWILIO VERIFY ENDPOINTS ---

@app.post("/auth/send-otp")
@app.post("/api/auth/send-otp")
async def api_send_otp(payload: SendOtpRequest):
    result = await send_verification_otp(payload.phone_number)
    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )
    return {"otp_sent": result.get("sent", False)}


@app.post("/auth/verify-otp")
@app.post("/api/auth/verify-otp")
async def api_verify_otp(payload: VerifyOtpRequest):
    result = await check_verification_otp(payload.phone_number, payload.otp_code)
    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )
    return {"verified": result.get("verified", False)}


# --- USER PROFILE ENDPOINTS ---

@app.post("/api/profile")
def save_user_profile(payload: UserProfileRequest):
    success = local_db.save_profile(payload.phone_number, payload.dict())
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save user profile."
        )
    return {"status": "success", "message": "Profile saved successfully."}


@app.get("/api/profile")
def get_user_profile(phone_number: str):
    profile = local_db.get_profile(phone_number)
    return profile


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=HOST, port=PORT, reload=True)
