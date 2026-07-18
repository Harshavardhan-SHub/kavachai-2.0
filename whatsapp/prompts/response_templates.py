"""
Kavach-AI 2.0 — Response Templates (Phase 3 Intelligence Enhancement).
Defines templates for formatted WhatsApp replies and TTS summaries.
"""

THREAT_REPORT_TEMPLATE = """🛡️ *Kavach AI Security Report*

🔴 *Threat Level: HIGH RISK*

📊 *Threat Score:* {threat_score}%
🏷️ *Category:* {threat_category}
🎯 *Target:* {target_audience}

🧠 *Manipulation Tactics Detected:*
{manipulation_bullets}

📝 *Evidence:*
{evidence_bullets}

❌ *Recommended Actions:*
{action_bullets}

💡 *Did You Know?*
{educational_tip}

🔒 *Confidence:* {confidence_label}

_🛡️ Kavach AI 2.0 — Protecting Indian Families_"""

SAFE_REPORT_TEMPLATE = """🛡️ *Kavach AI Security Report*

🟢 *Verdict: SAFE*

📊 *Threat Score:* {threat_score}%
🏷️ *Category:* Legitimate Communication

✅ No scam indicators detected in this message.

💡 *General Tip:*
{random_safety_tip}

_🛡️ Kavach AI 2.0 — Stay Safe, Stay Aware_"""

SUSPICIOUS_REPORT_TEMPLATE = """🛡️ *Kavach AI Security Report*

🟡 *Threat Level: SUSPICIOUS*

📊 *Threat Score:* {threat_score}%
🏷️ *Category:* {threat_category}

📝 *Why this is suspicious:*
{evidence_bullets}

⚠️ *Recommended Actions:*
{action_bullets}

💡 *Safety Tip:*
{educational_tip}

🔒 *Confidence:* {confidence_label}

_🛡️ Kavach AI 2.0 — Protecting Indian Families_"""

LOW_CONFIDENCE_TEMPLATE = """🛡️ *Kavach AI Security Report*

🟠 *Status: INCONCLUSIVE*

📊 *Threat Score:* {threat_score}%

This message contains some suspicious indicators, but there isn't enough evidence to confidently classify it as a scam.

📝 *Observations:*
{evidence_bullets}

⚠️ *Recommendation:*
Please verify directly with the official organization before taking any action. Do not click links or share OTPs.

🔒 *Confidence:* Low

_🛡️ Kavach AI 2.0 — When in doubt, verify_"""

VOICE_SUMMARY_TEMPLATE = "Kavach AI Report. This message has a {threat_score} percent scam probability. Category: {threat_category}. {short_recommendation}. {educational_tip_plain}."

WELCOME_MESSAGE = """👋 *Welcome to Kavach AI 2.0!*

I am your family-bound cybersecurity shield. I can protect you from:
• Fake Lottery Scams
• Urgent Bank Block Messages
• Fraudulent Screenshots & QR Codes
• Voice Cloning & Scam Voice Notes

Choose an option below or send any suspect message directly."""

HELP_MESSAGE = """🛡️ *Kavach-AI Helper Options*

You can interact with me conversationally or use these commands:
• `/history` - View past scam scans
• `/settings` - Show profile configuration
• `/guardian` - View designated family contact
• `/about` - Technical details of Kavach-AI

Or simply send a suspect text, screenshot photo, or recorded voice note directly."""

ABOUT_MESSAGE = """ℹ️ *About Kavach-AI 2.0*

Kavach-AI uses advanced AI and natural language processing to protect families from social engineering fraud:
1. *Translation*: Standardizes regional Indian dialects into English.
2. *Cognitive Threat Modeling*: Scores threat vectors using Gemini APIs.
3. *Alert Dispatches*: Twilio integration warns designated guardians instantly.
4. *Voice Alarms*: Regional voice messages warning user locally."""
