import logging
from typing import Dict, Any, Optional
from whatsapp.services.session import session_manager
from whatsapp.services.intent_detector import intent_detector
from whatsapp.services.whatsapp import whatsapp_service
from whatsapp.services.backend_client import backend_client

# Import handlers
from whatsapp.handlers.onboarding import onboarding_handler
from whatsapp.handlers.commands import commands_handler
from whatsapp.handlers.sms import sms_handler
from whatsapp.handlers.image import image_handler
from whatsapp.handlers.audio import audio_handler
from whatsapp.handlers.document import document_handler

from whatsapp.utils.constants import (
    STATE_ACTIVE,
    INTENT_ANALYZE_SMS,
    INTENT_ANALYZE_SCREENSHOT,
    INTENT_ANALYZE_VOICE,
    INTENT_ANALYZE_DOCUMENT,
    INTENT_HISTORY,
    INTENT_HELP,
    INTENT_SETTINGS,
    INTENT_GUARDIAN,
    INTENT_ABOUT
)

logger = logging.getLogger("whatsapp-router")

class MessageRouter:
    async def route_incoming_message(self, message_payload: Dict[str, Any]):
        """
        Extracts sender, text, media, and routes the message to the appropriate handler.
        """
        sender_phone = message_payload.get("from")
        message_id = message_payload.get("id")
        msg_type = message_payload.get("type")

        if not sender_phone:
            logger.warning("Message payload is missing sender phone ('from') parameter.")
            return

        # 1. Fetch or create User Session
        session = session_manager.get_session(sender_phone)
        
        # Check backend if session database has the profile completed already
        if not session.profile_completed:
            profile = await backend_client.get_profile(sender_phone)
            if profile and profile.get("profile_completed"):
                session.protected_name = profile.get("protected_name")
                session.guardian_number = profile.get("guardian_number")
                session.preferred_language = profile.get("preferred_language", "hi-IN")
                session.profile_completed = True
                session.conversation_state = STATE_ACTIVE

        # Extract text content if present
        text_content = ""
        if msg_type == "text" and message_payload.get("text"):
            text_content = message_payload["text"].get("body", "")
        elif msg_type == "interactive" and message_payload.get("interactive"):
            interactive = message_payload["interactive"]
            if interactive.get("type") == "button_reply":
                text_content = interactive["button_reply"].get("id", "")
        elif msg_type == "button" and message_payload.get("button"):
            text_content = message_payload["button"].get("payload", "")

        # 2. Onboarding Gate
        if not session.profile_completed:
            if text_content.strip().lower() == "/start":
                await onboarding_handler.start_onboarding(sender_phone, session)
            else:
                await onboarding_handler.handle_onboarding_step(sender_phone, text_content, session)
            return

        # 3. Detect Intent (Media or Text)
        intent = intent_detector.detect_intent(text_content, media_type=msg_type)
        session.current_intent = intent
        logger.info(f"Routed message {message_id} from {sender_phone} to intent '{intent}'")

        # 4. Route to designated Handlers
        if intent == INTENT_HELP:
            if text_content.startswith("/"):
                await commands_handler.handle_command(sender_phone, text_content, session)
            else:
                await onboarding_handler.send_dashboard(sender_phone)

        elif intent == INTENT_ANALYZE_SMS:
            # Handle interactive buttons or plain message pastes
            if text_content in ["menu_scan_sms", "analyze message", "analyze_message"]:
                await whatsapp_service.send_text(
                    sender_phone, 
                    "📩 Please paste the suspect SMS message text here and I will scan it for scam flags:"
                )
            else:
                await sms_handler.handle_sms_scan(sender_phone, text_content, session)

        elif intent == INTENT_ANALYZE_SCREENSHOT:
            if msg_type == "image":
                media_id = message_payload["image"].get("id")
                await image_handler.handle_image_scan(sender_phone, media_id, session)
            else:
                await whatsapp_service.send_text(
                    sender_phone, 
                    "🖼️ Please upload/send the suspect screenshot image directly."
                )

        elif intent == INTENT_ANALYZE_VOICE:
            if msg_type in ["audio", "voice"]:
                media_id = message_payload[msg_type].get("id")
                await audio_handler.handle_audio_scan(sender_phone, media_id, session)
            else:
                await whatsapp_service.send_text(
                    sender_phone, 
                    "🎤 Please upload or send the suspect voice note/call recording."
                )

        elif intent == INTENT_ANALYZE_DOCUMENT:
            if msg_type == "document":
                media_id = message_payload["document"].get("id")
                filename = message_payload["document"].get("filename", "document.pdf")
                await document_handler.handle_document_scan(sender_phone, media_id, filename, session)
            else:
                await whatsapp_service.send_text(
                    sender_phone, 
                    "📄 Please send the invoice or suspect document file directly."
                )

        elif intent in [INTENT_HISTORY, INTENT_SETTINGS, INTENT_GUARDIAN, INTENT_ABOUT]:
            # Convert button menu ids to matching command syntax if matching buttons
            cmd_map = {
                "menu_history": "/history",
                "menu_help": "/help"
            }
            mapped_cmd = cmd_map.get(text_content, text_content if text_content.startswith("/") else f"/{text_content.lower()}")
            await commands_handler.handle_command(sender_phone, mapped_cmd, session)

        else:
            # Catch-all/Unknown Intent
            # Treat generic message pastes as potential SMS scams
            if text_content:
                await sms_handler.handle_sms_scan(sender_phone, text_content, session)
            else:
                await whatsapp_service.send_text(
                    sender_phone, 
                    "🤷 Sorry, I did not recognize that input format. Please send a text, image screenshot, voice recording, or `/help`."
                )

message_router = MessageRouter()
