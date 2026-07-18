import logging
from fastapi import APIRouter, Request, Query, HTTPException, Depends, status
from fastapi.responses import PlainTextResponse

from whatsapp.config import settings
from whatsapp.router import message_router
from whatsapp.middleware.auth import verify_webhook_signature
from whatsapp.middleware.validation import validate_webhook_payload

logger = logging.getLogger("whatsapp-webhook")

router = APIRouter()

@router.get("/webhook", response_class=PlainTextResponse)
def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    """
    GET /webhook
    Verification endpoint for Meta WhatsApp Cloud API webhooks.
    """
    logger.info("Received verification request from Meta WhatsApp API.")
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("Webhook verified successfully.")
        return hub_challenge
        
    logger.warning("Webhook verification token mismatch or invalid mode.")
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Verification token mismatch."
    )

@router.post("/webhook")
async def receive_webhook_payload(
    request: Request,
    payload: dict = Depends(validate_webhook_payload),
    _signature_check = Depends(verify_webhook_signature)
):
    """
    POST /webhook
    Receives incoming WhatsApp events, validates Meta signature, and processes messages.
    """
    logger.info("Received incoming message event from Meta WhatsApp API.")

    # Meta webhook payload contains an 'entry' list
    entries = payload.get("entry", [])
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            messages = value.get("messages", [])
            
            for msg in messages:
                try:
                    # Pass incoming message payload to message router
                    await message_router.route_incoming_message(msg)
                except Exception as e:
                    logger.error(f"Error processing message: {str(e)}", exc_info=True)

    return {"status": "event_received"}
