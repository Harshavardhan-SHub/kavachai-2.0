import re
from typing import Optional
from whatsapp.utils.constants import (
    INTENT_ANALYZE_SMS,
    INTENT_ANALYZE_SCREENSHOT,
    INTENT_ANALYZE_VOICE,
    INTENT_ANALYZE_DOCUMENT,
    INTENT_GUARDIAN,
    INTENT_HISTORY,
    INTENT_HELP,
    INTENT_SETTINGS,
    INTENT_ABOUT,
    INTENT_UNKNOWN
)

class IntentDetector:
    def detect_intent(self, text: str, media_type: Optional[str] = None) -> str:
        if not text:
            # If no text, route by media type
            if media_type == "image":
                return INTENT_ANALYZE_SCREENSHOT
            elif media_type in ["audio", "voice"]:
                return INTENT_ANALYZE_VOICE
            elif media_type == "document":
                return INTENT_ANALYZE_DOCUMENT
            return INTENT_UNKNOWN

        text_lower = text.strip().lower()

        # Handle Slash Commands
        if text_lower.startswith("/"):
            cmd = text_lower[1:]
            if cmd in ["start", "help"]:
                return INTENT_HELP
            elif cmd == "history":
                return INTENT_HISTORY
            elif cmd in ["settings", "language"]:
                return INTENT_SETTINGS
            elif cmd == "about":
                return INTENT_ABOUT
            elif cmd == "guardian":
                return INTENT_GUARDIAN

        # Handle Interactive Button IDs or exact match options
        if text_lower in ["analyze message", "analyze_message", "sms"]:
            return INTENT_ANALYZE_SMS
        if text_lower in ["analyze screenshot", "analyze_screenshot", "image"]:
            return INTENT_ANALYZE_SCREENSHOT
        if text_lower in ["analyze voice", "analyze_voice", "voice", "audio"]:
            return INTENT_ANALYZE_VOICE
        if text_lower in ["history", "view history", "logs"]:
            return INTENT_HISTORY
        if text_lower in ["help", "support", "menu"]:
            return INTENT_HELP
        if text_lower in ["settings", "profile"]:
            return INTENT_SETTINGS
        if text_lower in ["guardian", "family"]:
            return INTENT_GUARDIAN

        # Pattern Match Phrases
        # History Match
        if any(w in text_lower for w in ["history", "past scan", "logs", "previous scan", "old scan", "records"]):
            return INTENT_HISTORY
        
        # Guardian Match
        if any(w in text_lower for w in ["guardian", "parent", "family", "notifier", "alert number"]):
            return INTENT_GUARDIAN

        # Voice/Call Match
        if any(w in text_lower for w in ["call", "voice", "recording", "audio", "phone", "speach", "talk"]):
            return INTENT_ANALYZE_VOICE

        # Image/Screenshot Match
        if any(w in text_lower for w in ["screenshot", "image", "photo", "pic", "screen", "capture"]):
            return INTENT_ANALYZE_SCREENSHOT

        # Document Match
        if any(w in text_lower for w in ["document", "pdf", "doc", "file", "statement"]):
            return INTENT_ANALYZE_DOCUMENT

        # Settings Match
        if any(w in text_lower for w in ["settings", "language", "setup", "profile", "change"]):
            return INTENT_SETTINGS

        # About/Kavach info Match
        if any(w in text_lower for w in ["about", "kavach", "what is this", "who are you"]):
            return INTENT_ABOUT

        # Help Match
        if any(w in text_lower for w in ["help", "hi", "hello", "hey", "start", "menu"]):
            return INTENT_HELP

        # Default to SMS analysis for generic text query scanning
        # Since if they paste a text message directly without options (e.g. "You won a lottery!"), we should treat it as an SMS scan
        if len(text.split()) > 3 or "http" in text_lower or any(char.isdigit() for char in text_lower):
            return INTENT_ANALYZE_SMS

        return INTENT_UNKNOWN

intent_detector = IntentDetector()
