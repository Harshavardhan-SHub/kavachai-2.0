"""
Kavach-AI 2.0 — Enhanced Intent Detector Service (Phase 3).

Determines what the user *wants* from their WhatsApp message so the
router can dispatch to the correct handler.  This module replaces the
original keyword-only detector with a multi-layered heuristic that adds:

  • Multi-language keyword awareness (English + Hindi transliteration)
  • URL detection (any message with http/https links → SMS analysis)
  • Phone number and UPI ID pattern detection
  • Financial / urgency keyword scoring for ambiguous long messages
  • Graceful handling of unsupported media (stickers, video, location)

Intent constants are imported from ``whatsapp.utils.constants`` to keep
a single source of truth.

Public API:
    intent_detector.detect_intent(text, media_type) → intent string
"""

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
    INTENT_UNKNOWN,
    INTENT_UNSUPPORTED,
)


# ═══════════════════════════════════════════════════════════════════════════
# Compiled regex patterns (compiled once at module load)
# ═══════════════════════════════════════════════════════════════════════════

# Matches http:// or https:// URLs
_URL_PATTERN = re.compile(
    r"https?://[^\s]+",
    re.IGNORECASE,
)

# Indian mobile numbers: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, or
# plain 10-digit starting with 6-9
_PHONE_PATTERN = re.compile(
    r"(?:\+?91[\s\-]?)?[6-9]\d{9}\b"
)

# UPI IDs: <username>@<handle>  e.g. name@upi, name@ybl, name@paytm
_UPI_PATTERN = re.compile(
    r"[a-zA-Z0-9._\-]+@[a-zA-Z]{2,}",
    re.IGNORECASE,
)


# ═══════════════════════════════════════════════════════════════════════════
# Multi-language keyword sets
# ═══════════════════════════════════════════════════════════════════════════
# Each set is used for substring matching against the lowercased input.
# Hindi keywords are transliterated (Romanised Hindi / Hinglish).
# ═══════════════════════════════════════════════════════════════════════════

# Keywords that suggest the user wants to analyse a potentially
# fraudulent / scam message (English + Hindi transliteration)
_FINANCIAL_URGENCY_KEYWORDS = frozenset({
    # ── English ────────────────────────────────────────────────────────
    "scam", "fraud", "fake", "phishing", "hack", "virus",
    "lottery", "prize", "won", "winner", "reward", "cashback",
    "urgent", "immediately", "hurry", "deadline", "expire",
    "bank", "otp", "upi", "pin", "cvv", "password", "credential",
    "account", "transfer", "payment", "pay now", "send money",
    "loan", "emi", "interest", "investment", "bitcoin", "crypto",
    "block", "suspend", "arrest", "police", "legal", "penalty",
    "disconnection", "electricity", "bill", "due",
    "kyc", "aadhaar", "pan card", "verify",
    "click here", "act now", "limited time", "offer",
    "job", "work from home", "earning", "income",
    "customs", "delivery", "package", "courier",
    # ── Hindi (transliterated / Hinglish) ──────────────────────────────
    "dhokha", "dhoka", "thagee", "thagi", "loot", "lut",
    "paisa", "paise", "rupaya", "rupaye", "rupee",
    "jaldi", "turant", "abhi", "fauran",
    "khata", "khate", "bank khata",
    "naukri", "nokri", "kaam", "kamai",
    "bijli", "bill", "katega", "band",
    "sarkari", "police", "vakeel", "kanoon",
    "link", "otp batao", "pin batao", "password batao",
    "whatsapp", "message", "sms",
    "inaam", "inam", "lottery", "jeet", "jeeta",
    "chori", "nakli", "asli nahi",
    "giraftaar", "giraftari", "arrest",
    "madad", "help", "sahayata", "bachao",
})

# Greeting / help keywords (both languages)
_GREETING_KEYWORDS = frozenset({
    "hi", "hello", "hey", "hola", "start", "menu",
    "help", "madad", "sahayata",
    "namaste", "namaskar", "pranam",
})

# History / logs keywords
_HISTORY_KEYWORDS = frozenset({
    "history", "past scan", "logs", "previous scan", "old scan",
    "records", "report", "purana", "pichla", "itihas",
})

# Guardian / family keywords
_GUARDIAN_KEYWORDS = frozenset({
    "guardian", "parent", "family", "notifier", "alert number",
    "abhhibhavak", "parivar", "mata", "pita",
})

# Voice / audio keywords
_VOICE_KEYWORDS = frozenset({
    "call", "voice", "recording", "audio", "phone call",
    "speach", "talk", "awaaz", "aawaz",
})

# Image / screenshot keywords
_IMAGE_KEYWORDS = frozenset({
    "screenshot", "image", "photo", "pic", "screen", "capture",
    "tasveer", "photo bhejo",
})

# Document keywords
_DOCUMENT_KEYWORDS = frozenset({
    "document", "pdf", "doc", "file", "statement",
    "dastavez", "kagaz",
})

# Settings keywords
_SETTINGS_KEYWORDS = frozenset({
    "settings", "language", "setup", "profile", "change",
    "bhasha", "setting",
})

# About keywords
_ABOUT_KEYWORDS = frozenset({
    "about", "kavach", "what is this", "who are you",
    "kya hai", "kaun ho", "jaankari",
})

# Unsupported media types the WhatsApp webhook may report
_UNSUPPORTED_MEDIA_TYPES = frozenset({
    "sticker", "video", "location", "contact", "contacts",
    "live_location", "ephemeral",
})


class IntentDetector:
    """
    Multi-layered intent classifier for incoming WhatsApp messages.

    Detection priority (highest → lowest):
      1. Unsupported media short-circuit
      2. Media-only messages (no text) → route by media type
      3. Slash commands (``/help``, ``/history``, etc.)
      4. Interactive button IDs and exact keyword matches
      5. URL detection → SMS analysis
      6. Phone number / UPI ID detection → SMS analysis
      7. Multi-language keyword category scanning
      8. Long-text + financial/urgency heuristic → SMS analysis
      9. Fallback → UNKNOWN
    """

    # ───────────────────────────────────────────────────────────────────
    # Public API
    # ───────────────────────────────────────────────────────────────────

    def detect_intent(
        self, text: str, media_type: Optional[str] = None
    ) -> str:
        """
        Determine the user's intent from message text and/or media type.

        Args:
            text: The message body (may be empty for media-only messages).
            media_type: Optional media type string reported by the
                        WhatsApp webhook (e.g. ``"image"``, ``"sticker"``,
                        ``"video"``, ``"location"``).

        Returns:
            An intent constant string from ``whatsapp.utils.constants``.
        """
        # ── Layer 1: Unsupported media short-circuit ───────────────────
        if media_type and media_type.lower() in _UNSUPPORTED_MEDIA_TYPES:
            return INTENT_UNSUPPORTED

        # ── Layer 2: Media-only (no text) routing ──────────────────────
        if not text:
            return self._route_by_media(media_type)

        text_lower = text.strip().lower()

        # ── Layer 3: Slash commands ────────────────────────────────────
        slash_intent = self._match_slash_command(text_lower)
        if slash_intent:
            return slash_intent

        # ── Layer 4: Exact / button-ID matches ────────────────────────
        exact_intent = self._match_exact(text_lower)
        if exact_intent:
            return exact_intent

        # ── Layer 5: URL detection → SMS analysis ─────────────────────
        if _URL_PATTERN.search(text):
            return INTENT_ANALYZE_SMS

        # ── Layer 6: Phone number / UPI ID detection ──────────────────
        if _UPI_PATTERN.search(text) or _PHONE_PATTERN.search(text):
            return INTENT_ANALYZE_SMS

        # ── Layer 7: Category keyword scanning ────────────────────────
        keyword_intent = self._match_keywords(text_lower)
        if keyword_intent:
            return keyword_intent

        # ── Layer 8: Long-text heuristic ──────────────────────────────
        # If the message has > 3 words and contains any financial/urgency
        # keywords, treat it as a forwarded scam message to analyse.
        word_count = len(text.split())
        if word_count > 3:
            if self._has_financial_urgency_signals(text_lower):
                return INTENT_ANALYZE_SMS

        # ── Layer 9: Fallback ─────────────────────────────────────────
        return INTENT_UNKNOWN

    # ═══════════════════════════════════════════════════════════════════
    # Private helpers
    # ═══════════════════════════════════════════════════════════════════

    @staticmethod
    def _route_by_media(media_type: Optional[str]) -> str:
        """Route a media-only message (no text) by its media type."""
        if not media_type:
            return INTENT_UNKNOWN
        mt = media_type.lower()
        if mt == "image":
            return INTENT_ANALYZE_SCREENSHOT
        if mt in ("audio", "voice"):
            return INTENT_ANALYZE_VOICE
        if mt == "document":
            return INTENT_ANALYZE_DOCUMENT
        # Any remaining unknown media → unsupported
        return INTENT_UNSUPPORTED

    @staticmethod
    def _match_slash_command(text_lower: str) -> Optional[str]:
        """Match ``/command`` style inputs."""
        if not text_lower.startswith("/"):
            return None

        cmd = text_lower[1:].split()[0] if len(text_lower) > 1 else ""
        _SLASH_MAP = {
            "start": INTENT_HELP,
            "help": INTENT_HELP,
            "history": INTENT_HISTORY,
            "settings": INTENT_SETTINGS,
            "language": INTENT_SETTINGS,
            "about": INTENT_ABOUT,
            "guardian": INTENT_GUARDIAN,
            "scan": INTENT_ANALYZE_SMS,
            "analyze": INTENT_ANALYZE_SMS,
            "analyse": INTENT_ANALYZE_SMS,
        }
        return _SLASH_MAP.get(cmd)

    @staticmethod
    def _match_exact(text_lower: str) -> Optional[str]:
        """
        Match interactive button IDs or short exact-text commands that
        users might type or that come from WhatsApp list/button replies.
        """
        _EXACT_MAP = {
            # Button / list reply IDs
            "analyze message": INTENT_ANALYZE_SMS,
            "analyze_message": INTENT_ANALYZE_SMS,
            "sms": INTENT_ANALYZE_SMS,
            "analyze screenshot": INTENT_ANALYZE_SCREENSHOT,
            "analyze_screenshot": INTENT_ANALYZE_SCREENSHOT,
            "image": INTENT_ANALYZE_SCREENSHOT,
            "analyze voice": INTENT_ANALYZE_VOICE,
            "analyze_voice": INTENT_ANALYZE_VOICE,
            "voice": INTENT_ANALYZE_VOICE,
            "audio": INTENT_ANALYZE_VOICE,
            "analyze document": INTENT_ANALYZE_DOCUMENT,
            "analyze_document": INTENT_ANALYZE_DOCUMENT,
            # Navigation
            "history": INTENT_HISTORY,
            "view history": INTENT_HISTORY,
            "logs": INTENT_HISTORY,
            "help": INTENT_HELP,
            "support": INTENT_HELP,
            "menu": INTENT_HELP,
            "settings": INTENT_SETTINGS,
            "profile": INTENT_SETTINGS,
            "guardian": INTENT_GUARDIAN,
            "family": INTENT_GUARDIAN,
            "about": INTENT_ABOUT,
        }
        return _EXACT_MAP.get(text_lower)

    @staticmethod
    def _match_keywords(text_lower: str) -> Optional[str]:
        """
        Scan message text for category-specific keywords.  The order of
        checks determines priority when multiple categories match.
        """
        # Priority ordering: history, guardian, voice, image, document,
        # settings, about, greeting/help.
        # Financial/urgency keywords are handled separately in Layer 8.

        if any(kw in text_lower for kw in _HISTORY_KEYWORDS):
            return INTENT_HISTORY
        if any(kw in text_lower for kw in _GUARDIAN_KEYWORDS):
            return INTENT_GUARDIAN
        if any(kw in text_lower for kw in _VOICE_KEYWORDS):
            return INTENT_ANALYZE_VOICE
        if any(kw in text_lower for kw in _IMAGE_KEYWORDS):
            return INTENT_ANALYZE_SCREENSHOT
        if any(kw in text_lower for kw in _DOCUMENT_KEYWORDS):
            return INTENT_ANALYZE_DOCUMENT
        if any(kw in text_lower for kw in _SETTINGS_KEYWORDS):
            return INTENT_SETTINGS
        if any(kw in text_lower for kw in _ABOUT_KEYWORDS):
            return INTENT_ABOUT
        if any(kw in text_lower for kw in _GREETING_KEYWORDS):
            return INTENT_HELP

        return None

    @staticmethod
    def _has_financial_urgency_signals(text_lower: str) -> bool:
        """
        Check whether the message contains financial or urgency keywords
        that suggest it is a forwarded scam message the user wants
        analysed.

        Returns ``True`` if at least one keyword is found.
        """
        return any(kw in text_lower for kw in _FINANCIAL_URGENCY_KEYWORDS)


# Module-level singleton (matches existing import pattern in handlers)
intent_detector = IntentDetector()
