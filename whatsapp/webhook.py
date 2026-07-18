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
    logger.info("[Webhook] Verification request received — mode=%s", hub_mode)
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("[Webhook] Verification successful — challenge returned.")
        return hub_challenge

    logger.warning("[Webhook] Verification FAILED — token mismatch or wrong mode.")
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
    logger.info("[Webhook] Incoming request from Meta Cloud API.")

    # Meta webhook payload contains an 'entry' list
    entries = payload.get("entry", [])
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})

            # Skip status update events (delivery receipts, read receipts)
            # These have no 'messages' key — processing them would be a no-op
            # but logging them helps confirm the webhook is receiving traffic.
            if "statuses" in value and "messages" not in value:
                statuses = value.get("statuses", [])
                for s in statuses:
                    logger.info(
                        "[Webhook] Status update — message_id=%s status=%s",
                        s.get("id"), s.get("status")
                    )
                continue

            messages = value.get("messages", [])
            for msg in messages:
                sender = msg.get("from", "unknown")
                msg_type = msg.get("type", "unknown")
                msg_id = msg.get("id", "unknown")

                # Extract preview of text for logging
                text_preview = ""
                if msg_type == "text":
                    text_preview = msg.get("text", {}).get("body", "")[:80]

                logger.info(
                    "[Webhook] User message — from=%s type=%s id=%s text_preview=%r",
                    sender, msg_type, msg_id, text_preview
                )

                try:
                    await message_router.route_incoming_message(msg)
                except Exception as e:
                    logger.error(
                        "[Webhook] Error processing message id=%s: %s",
                        msg_id, str(e), exc_info=True
                    )

    return {"status": "event_received"}
