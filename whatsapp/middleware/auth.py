import hmac
import hashlib
from fastapi import Request, HTTPException, status
from whatsapp.config import settings

def validate_signature(payload: bytes, signature_header: str) -> bool:
    """
    Validates the signature sent by Meta to ensure it matches our WhatsApp App Secret.
    """
    if "sha256=" not in signature_header:
        return False
    
    sha_signature = signature_header.split("sha256=")[1]
    
    # Calculate HMAC SHA256 signature
    mac = hmac.new(
        key=settings.WHATSAPP_APP_SECRET.encode("utf-8"),
        msg=payload,
        digestmod=hashlib.sha256
    )
    calculated_signature = mac.hexdigest()
    
    return hmac.compare_digest(calculated_signature, sha_signature)

async def verify_webhook_signature(request: Request):
    """
    FastAPI dependency to verify signature.
    """
    # If app secret is default/mock, bypass validation for developer convenience
    if "MOCK" in settings.WHATSAPP_APP_SECRET:
        return
        
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Meta Signature header."
        )
        
    body = await request.body()
    if not validate_signature(body, signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Signature validation failed. Request origin unverified."
        )
