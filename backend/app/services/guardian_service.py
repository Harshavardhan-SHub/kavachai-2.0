import logging
import httpx
from app.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, USE_MOCK_TWILIO

logger = logging.getLogger("guardian_service")

async def send_guardian_notification(phone_number: str, threat_type: str, threat_score: int, user_name: str = "User") -> dict:
    """
    Sends a real SMS alert to a trusted guardian using Twilio REST API.
    Falls back gracefully to simulation if credentials are not configured.
    """
    if not phone_number:
        return {
            "status": "error",
            "message": "No guardian phone number configured.",
            "sent": False
        }
        
    alert_message = (
        f"KAVACH-AI ALERT\n"
        f"Potential fraud detected on protected user device.\n"
        f"Protected User: {user_name}\n"
        f"Threat Type: {threat_type}\n"
        f"Risk Score: {threat_score}\n"
        f"Please contact the protected user immediately."
    )
    
    # 1. Fallback to Simulation if Mock mode or keys are missing
    if USE_MOCK_TWILIO or not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER:
        print("\n" + "="*80)
        print(f" [SMS SIMULATION] OUTBOUND ALERT TO GUARDIAN ({phone_number})")
        print(f" MESSAGE: {alert_message}")
        print("="*80 + "\n")
        logger.info(f"Simulated guardian notification sent to {phone_number}")
        return {
            "status": "success",
            "message": "Guardian notification simulated successfully.",
            "phone_number": phone_number,
            "alert_text": alert_message,
            "sent": True,
            "simulation": True,
            "provider": "Simulation"
        }
        
    # 2. Real Twilio SMS request
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
    auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    data = {
        "From": TWILIO_PHONE_NUMBER,
        "To": phone_number,
        "Body": alert_message
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, auth=auth, data=data)
            
            if response.status_code == 201:
                # Successfully sent
                resp_json = response.json()
                sid = resp_json.get("sid")
                logger.info(f"Twilio SMS sent to {phone_number}, SID: {sid}")
                return {
                    "status": "success",
                    "message": "Guardian alert sent via Twilio SMS.",
                    "phone_number": phone_number,
                    "alert_text": alert_message,
                    "sent": True,
                    "simulation": False,
                    "provider": "Twilio",
                    "twilio_sid": sid
                }
            else:
                # Twilio error
                try:
                    err_json = response.json()
                    err_msg = err_json.get("message", response.text)
                    err_code = err_json.get("code")
                except Exception:
                    err_msg = response.text
                    err_code = None
                    
                error_detail = f"Twilio API Error: {err_msg}" + (f" (Code: {err_code})" if err_code else "")
                print(f"[TWILIO ERROR] Status {response.status_code}: {error_detail}")
                return {
                    "status": "error",
                    "message": error_detail,
                    "phone_number": phone_number,
                    "sent": False,
                    "simulation": False,
                    "provider": "Twilio"
                }
                
    except Exception as e:
        error_detail = f"Network or Connection Error: {str(e)}"
        print(f"[TWILIO EXCEPTION] Failed to connect: {error_detail}")
        return {
            "status": "error",
            "message": error_detail,
            "phone_number": phone_number,
            "sent": False,
            "simulation": False,
            "provider": "Twilio"
        }
