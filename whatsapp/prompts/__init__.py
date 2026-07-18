"""
Kavach-AI 2.0 — Phase 3 Intelligence Enhancement: Prompt Engineering Module.

This package contains the system prompt, threat taxonomy, educational tips,
and response templates that the WhatsApp layer uses to enrich communication
with the Gemini backend. The backend itself is treated as a BLACK BOX — we
never modify it. Instead, this module provides contextual intelligence that
the WhatsApp service layer can inject before/after backend calls.

Modules:
    system_prompt      – Core identity & analysis-framework prompt for Kavach AI.
    threat_taxonomy    – Comprehensive threat classification data structures.
    educational_tips   – Contextual safety tips mapped to threat categories.
    response_templates – WhatsApp-formatted response strings for every scenario.
"""

from whatsapp.prompts.system_prompt import KAVACH_SYSTEM_PROMPT
from whatsapp.prompts.threat_taxonomy import THREAT_TAXONOMY
from whatsapp.prompts.educational_tips import get_educational_tip, get_random_safety_tip
from whatsapp.prompts.response_templates import (
    THREAT_REPORT_TEMPLATE,
    SAFE_REPORT_TEMPLATE,
    SUSPICIOUS_REPORT_TEMPLATE,
    LOW_CONFIDENCE_TEMPLATE,
    VOICE_SUMMARY_TEMPLATE,
    WELCOME_MESSAGE,
    HELP_MESSAGE,
    ABOUT_MESSAGE,
)

__all__ = [
    "KAVACH_SYSTEM_PROMPT",
    "THREAT_TAXONOMY",
    "get_educational_tip",
    "get_random_safety_tip",
    "THREAT_REPORT_TEMPLATE",
    "SAFE_REPORT_TEMPLATE",
    "SUSPICIOUS_REPORT_TEMPLATE",
    "LOW_CONFIDENCE_TEMPLATE",
    "VOICE_SUMMARY_TEMPLATE",
    "WELCOME_MESSAGE",
    "HELP_MESSAGE",
    "ABOUT_MESSAGE",
]
