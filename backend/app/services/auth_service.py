import logging
import httpx
from app.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID, USE_MOCK_VERIFY

logger = logging.getLogger("auth_service")

async def send_verification_otp(phone_number: str) -> dict:
    """
    Triggers an OTP SMS via Twilio Verify API.
    Falls back to simulation mode if keys are missing or invalid.
    """
    if not phone_number:
        return {"status": "error", "message": "Phone number is required", "sent": False}
        
    # Intercept demo number
    clean_phone = phone_number.replace(" ", "").replace("-", "")
    if clean_phone == "+919876543210":
        logger.info(f"Demo OTP requested for {phone_number}")
        return {
            "status": "success",
            "message": "Demo OTP verification simulated successfully.",
            "phone_number": phone_number,
            "sent": True,
            "simulation": True
        }
        
    if USE_MOCK_VERIFY or not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_VERIFY_SERVICE_SID:
        # Mock mode OTP send
        print("\n" + "="*80)
        print(f" [OTP SIMULATION] Twilio Verify OTP sent to {phone_number}")
        print(" SIMULATED OTP CODE: '123456' (Any 6-digit code will pass in simulation mode)")
        print("="*80 + "\n")
        logger.info(f"Simulated OTP verification sent to {phone_number}")
        return {
            "status": "success",
            "message": "OTP verification simulated successfully.",
            "phone_number": phone_number,
            "sent": True,
            "simulation": True
        }
        
    # Real Twilio Verify API call
    url = f"https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SERVICE_SID}/Verifications"
    auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    data = {
        "To": phone_number,
        "Channel": "sms"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, auth=auth, data=data)
            
            if response.status_code in [200, 201]:
                resp_json = response.json()
                logger.info(f"Twilio Verify OTP sent to {phone_number}, status: {resp_json.get('status')}")
                return {
                    "status": "success",
                    "message": "OTP verification code sent.",
                    "phone_number": phone_number,
                    "sent": True,
                    "simulation": False
                }
            else:
                try:
                    err_json = response.json()
                    err_msg = err_json.get("message", response.text)
                except Exception:
                    err_msg = response.text
                error_detail = f"Twilio API Error: {err_msg}"
                print(f"[TWILIO VERIFY ERROR] status {response.status_code}: {error_detail}")
                return {
                    "status": "error",
                    "message": error_detail,
                    "phone_number": phone_number,
                    "sent": False,
                    "simulation": False
                }
    except Exception as e:
        error_detail = f"Verify Send Exception: {str(e)}"
        print(f"[TWILIO VERIFY EXCEPTION]: {error_detail}")
        return {
            "status": "error",
            "message": error_detail,
            "phone_number": phone_number,
            "sent": False,
            "simulation": False
        }

async def check_verification_otp(phone_number: str, code: str) -> dict:
    """
    Checks an OTP code via Twilio Verify API.
    """
    if not phone_number or not code:
        return {"status": "error", "message": "Phone number and code are required", "verified": False}
        
    # Intercept demo number
    clean_phone = phone_number.replace(" ", "").replace("-", "")
    if clean_phone == "+919876543210":
        if code == "131426":
            logger.info(f"Demo OTP verified successfully for {phone_number}")
            return {
                "status": "success",
                "message": "Demo OTP verified successfully.",
                "verified": True,
                "simulation": True
            }
        else:
            return {
                "status": "error",
                "message": "Invalid Demo OTP code. Use 131426.",
                "verified": False,
                "simulation": True
            }
            
    if USE_MOCK_VERIFY or not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_VERIFY_SERVICE_SID:
        # Mock mode OTP verify: accept any 6-digit code
        is_valid = len(code) == 6 and code.isdigit()
        if is_valid:
            logger.info(f"Simulated OTP verified for {phone_number}")
            return {
                "status": "success",
                "message": "OTP verified successfully (Simulation).",
                "verified": True,
                "simulation": True
            }
        else:
            return {
                "status": "error",
                "message": "Invalid OTP code. Must be 6 digits.",
                "verified": False,
                "simulation": True
            }
            
    # Real Twilio Verify Check API call
    url = f"https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SERVICE_SID}/VerificationCheck"
    auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    data = {
        "To": phone_number,
        "Code": code
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, auth=auth, data=data)
            
            if response.status_code == 200:
                resp_json = response.json()
                is_approved = resp_json.get("status") == "approved"
                if is_approved:
                    logger.info(f"Twilio Verify OTP approved for {phone_number}")
                    return {
                        "status": "success",
                        "message": "OTP verified successfully.",
                        "verified": True,
                        "simulation": False
                    }
                else:
                    logger.warning(f"Twilio Verify OTP check failed for {phone_number}, status: {resp_json.get('status')}")
                    return {
                        "status": "success",
                        "message": "Invalid code provided.",
                        "verified": False,
                        "simulation": False
                    }
            else:
                try:
                    err_json = response.json()
                    err_msg = err_json.get("message", response.text)
                except Exception:
                    err_msg = response.text
                error_detail = f"Twilio API Error: {err_msg}"
                print(f"[TWILIO VERIFY CHECK ERROR] status {response.status_code}: {error_detail}")
                return {
                    "status": "error",
                    "message": error_detail,
                    "verified": False,
                    "simulation": False
                }
    except Exception as e:
        error_detail = f"Verify Check Exception: {str(e)}"
        print(f"[TWILIO VERIFY CHECK EXCEPTION]: {error_detail}")
        return {
            "status": "error",
            "verified": False,
            "simulation": False
        }
