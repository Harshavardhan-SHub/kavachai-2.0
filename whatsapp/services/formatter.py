"""
Kavach-AI 2.0 — Response Formatter Service (Phase 3 Intelligence Enhancement).

Transforms raw JSON responses from the backend threat-analysis API into
rich, professional WhatsApp security reports. The backend is treated as a
BLACK BOX — this module only *reads* its output and decorates it with:

  • Colour-coded threat-level headers
  • Threat category classification via the prompt taxonomy
  • Psychological manipulation tactic detection
  • Target audience inference
  • Contextual educational tips
  • Voice-friendly (TTS) summaries
  • Branded Kavach AI formatting

Public API (consumed by handlers):
    formatter.format_threat_response(analysis_result)  → full WhatsApp report
    formatter.format_voice_summary(analysis_result)    → TTS-safe short text
    formatter.format_history_response(logs)             → scan history list
    formatter.format_profile_settings(profile)          → settings overview

Dependencies (whatsapp-layer only):
    whatsapp.prompts.educational_tips   — contextual safety tips
    whatsapp.prompts.threat_taxonomy    — category mapping & metadata
"""

from typing import Dict, Any, List, Optional

from whatsapp.prompts.educational_tips import get_educational_tip
from whatsapp.prompts.threat_taxonomy import (
    classify_threat_type,
    get_threat_category,
)


# ═══════════════════════════════════════════════════════════════════════════
# Psychological-manipulation tactic mapping
# ═══════════════════════════════════════════════════════════════════════════
# Maps substrings found in backend ``reason_flags`` to human-readable
# psychological tactic labels.  The formatter scans each flag against these
# patterns and de-duplicates the results.
# ═══════════════════════════════════════════════════════════════════════════

_MANIPULATION_TACTIC_MAP: Dict[str, str] = {
    # ── Fear & Threat ──────────────────────────────────────────────────
    "threat": "😨 Fear / Intimidation",
    "disconnection": "😨 Fear / Intimidation",
    "arrest": "😨 Fear / Intimidation",
    "legal action": "😨 Fear / Intimidation",
    "suspend": "😨 Fear / Intimidation",
    "block": "😨 Fear / Intimidation",
    "terminate": "😨 Fear / Intimidation",
    "penalty": "😨 Fear / Intimidation",
    "fine": "😨 Fear / Intimidation",
    "blackmail": "😨 Fear / Intimidation",
    "consequence": "😨 Fear / Intimidation",

    # ── Urgency ────────────────────────────────────────────────────────
    "urgency": "⏰ Urgency / Time Pressure",
    "immediate": "⏰ Urgency / Time Pressure",
    "within 24": "⏰ Urgency / Time Pressure",
    "act now": "⏰ Urgency / Time Pressure",
    "expir": "⏰ Urgency / Time Pressure",
    "hurry": "⏰ Urgency / Time Pressure",
    "last chance": "⏰ Urgency / Time Pressure",
    "deadline": "⏰ Urgency / Time Pressure",
    "limited time": "⏰ Urgency / Time Pressure",
    "right away": "⏰ Urgency / Time Pressure",

    # ── Authority ──────────────────────────────────────────────────────
    "authority": "👔 Authority Impersonation",
    "official": "👔 Authority Impersonation",
    "government": "👔 Authority Impersonation",
    "police": "👔 Authority Impersonation",
    "bank": "👔 Authority Impersonation",
    "rbi": "👔 Authority Impersonation",
    "impersonat": "👔 Authority Impersonation",

    # ── Greed / Reward ─────────────────────────────────────────────────
    "reward": "🤑 Greed / Reward Lure",
    "prize": "🤑 Greed / Reward Lure",
    "won": "🤑 Greed / Reward Lure",
    "lottery": "🤑 Greed / Reward Lure",
    "cashback": "🤑 Greed / Reward Lure",
    "bonus": "🤑 Greed / Reward Lure",
    "free": "🤑 Greed / Reward Lure",
    "guaranteed return": "🤑 Greed / Reward Lure",
    "profit": "🤑 Greed / Reward Lure",

    # ── Financial Pressure ─────────────────────────────────────────────
    "financial request": "💸 Financial Pressure",
    "payment": "💸 Financial Pressure",
    "transfer": "💸 Financial Pressure",
    "send money": "💸 Financial Pressure",
    "upi": "💸 Financial Pressure",
    "pay now": "💸 Financial Pressure",
    "deposit": "💸 Financial Pressure",

    # ── Data Harvesting ────────────────────────────────────────────────
    "credential": "🔓 Data / Credential Harvesting",
    "password": "🔓 Data / Credential Harvesting",
    "otp": "🔓 Data / Credential Harvesting",
    "personal info": "🔓 Data / Credential Harvesting",
    "aadhaar": "🔓 Data / Credential Harvesting",
    "pan": "🔓 Data / Credential Harvesting",
    "kyc": "🔓 Data / Credential Harvesting",
    "verify your": "🔓 Data / Credential Harvesting",

    # ── Emotional Manipulation ─────────────────────────────────────────
    "emotional": "💔 Emotional Manipulation",
    "sympathy": "💔 Emotional Manipulation",
    "help me": "💔 Emotional Manipulation",
    "dying": "💔 Emotional Manipulation",
    "sick": "💔 Emotional Manipulation",
    "love": "💔 Emotional Manipulation",

    # ── Social Proof / Trust ───────────────────────────────────────────
    "testimonial": "🗣️ Social Proof / Trust Exploit",
    "others have": "🗣️ Social Proof / Trust Exploit",
    "thousands": "🗣️ Social Proof / Trust Exploit",
    "trusted": "🗣️ Social Proof / Trust Exploit",

    # ── Scarcity ───────────────────────────────────────────────────────
    "limited": "⌛ Scarcity Tactics",
    "only .* left": "⌛ Scarcity Tactics",
    "exclusive": "⌛ Scarcity Tactics",
    "few spots": "⌛ Scarcity Tactics",
}


# ═══════════════════════════════════════════════════════════════════════════
# Target-audience display labels
# ═══════════════════════════════════════════════════════════════════════════

_AUDIENCE_DISPLAY: Dict[str, str] = {
    "senior_citizens": "👴 Senior Citizens",
    "students": "🎓 Students & Young Adults",
    "young_professionals": "💼 Young Professionals",
    "homeowners": "🏠 Homeowners",
    "rural_users": "🌾 Rural Users",
    "low_income": "💵 Low-Income Groups",
    "retirees": "🏖️ Retirees",
    "online_shoppers": "🛒 Online Shoppers",
    "non_tech_savvy": "📵 Non-Tech-Savvy Users",
    "lonely_individuals": "🧍 Individuals Seeking Companionship",
    "unemployed": "📋 Job Seekers",
    "general": "👥 General Public",
}


# ═══════════════════════════════════════════════════════════════════════════
# Attack-vector inference from reason flags
# ═══════════════════════════════════════════════════════════════════════════

_ATTACK_VECTOR_HINTS: Dict[str, str] = {
    "link": "🔗 Malicious Link",
    "url": "🔗 Malicious Link",
    "http": "🔗 Malicious Link",
    "click": "🔗 Malicious Link",
    "download": "📥 Malicious Download / Attachment",
    "apk": "📥 Malicious Download / Attachment",
    "attachment": "📥 Malicious Download / Attachment",
    "call": "📞 Voice Call / Vishing",
    "phone": "📞 Voice Call / Vishing",
    "recording": "📞 Voice Call / Vishing",
    "sms": "📱 SMS / Text Message",
    "text": "📱 SMS / Text Message",
    "whatsapp": "💬 WhatsApp Message",
    "message": "💬 WhatsApp Message",
    "email": "📧 Email / Spear-Phishing",
    "payment": "💳 Payment Platform Abuse",
    "upi": "💳 Payment Platform Abuse",
    "financial request": "💳 Payment Platform Abuse",
    "credential": "🔐 Credential Phishing",
    "otp": "🔐 Credential Phishing",
    "password": "🔐 Credential Phishing",
    "disconnection": "⚡ Service Disruption Threat",
    "utility": "⚡ Service Disruption Threat",
    "service": "⚡ Service Disruption Threat",
}


class ResponseFormatter:
    """
    Transforms backend analysis JSON into rich WhatsApp messages.

    This class is stateless — all formatting decisions are derived purely
    from the data passed to each method.  Intelligence enrichments (taxonomy
    classification, manipulation detection, educational tips) are sourced
    from the ``whatsapp.prompts`` package.
    """

    # ───────────────────────────────────────────────────────────────────
    # Primary threat report
    # ───────────────────────────────────────────────────────────────────

    def format_threat_response(self, analysis_result: Dict[str, Any]) -> str:
        """
        Build a comprehensive WhatsApp security report from the backend
        threat-analysis response.

        The report includes threat level, score, category, attack vector,
        target audience, manipulation tactics, evidence bullets,
        recommended actions, an educational tip, and branding.

        Args:
            analysis_result: The full JSON dict returned by the backend
                             ``/api/analyze-threat`` endpoint.

        Returns:
            A WhatsApp-formatted string ready to send via the messaging API.
        """
        analysis = analysis_result.get("analysis", {})
        risk_level = analysis.get("risk_level", "UNKNOWN").upper()
        threat_score = analysis.get("threat_score", 0)
        confidence = analysis.get("confidence_score", 0)
        raw_threat_type = analysis.get("threat_type", "N/A")
        reason_flags = analysis.get("reason_flags", [])
        recommended_action = analysis.get(
            "recommended_action", "No recommendation provided."
        )
        logged_id = analysis_result.get("logged_id", "N/A")

        # -- Derived intelligence ----------------------------------------
        taxonomy_key = classify_threat_type(raw_threat_type)
        category = get_threat_category(raw_threat_type)
        manipulation_tactics = self._detect_manipulation_tactics(reason_flags)
        target_audiences = self._infer_target_audience(raw_threat_type)
        attack_vector = self._infer_attack_vector(reason_flags)
        confidence_label = self._get_confidence_label(confidence)
        educational_tip = get_educational_tip(taxonomy_key)

        # -- Header ------------------------------------------------------
        risk_header, risk_emoji = self._get_risk_header(risk_level)

        # -- Evidence bullets --------------------------------------------
        evidence_lines = (
            "\n".join(f"  → {flag}" for flag in reason_flags)
            if reason_flags
            else "  → No specific indicators identified"
        )

        # -- Manipulation tactics section --------------------------------
        if manipulation_tactics:
            tactics_lines = "\n".join(
                f"  • {tactic}" for tactic in manipulation_tactics
            )
        else:
            tactics_lines = "  • None detected"

        # -- Target audience section -------------------------------------
        if target_audiences:
            audience_lines = "\n".join(
                f"  • {aud}" for aud in target_audiences
            )
        else:
            audience_lines = "  • General Public"

        # -- Recommended actions (split do / don't) ----------------------
        action_lines = self._format_recommended_actions(recommended_action)

        # -- Assemble the full report ------------------------------------
        report = (
            f"{risk_header}\n"
            f"{'━' * 32}\n\n"
            f"📊 *Threat Score:* {threat_score}%\n"
            f"🎯 *Confidence:* {confidence}% ({confidence_label})\n"
            f"🏷️ *Category:* {category['icon']} {category['display_name']}\n"
            f"🔗 *Attack Vector:* {attack_vector}\n\n"
            f"{'━' * 32}\n"
            f"🧠 *Psychological Tactics Detected:*\n"
            f"{tactics_lines}\n\n"
            f"🎯 *Likely Target Audience:*\n"
            f"{audience_lines}\n\n"
            f"{'━' * 32}\n"
            f"🔍 *Evidence & Red Flags:*\n"
            f"{evidence_lines}\n\n"
            f"{'━' * 32}\n"
            f"🛡️ *Recommended Actions:*\n"
            f"{action_lines}\n\n"
            f"{'━' * 32}\n"
            f"📚 *Safety Tip:*\n"
            f"_{educational_tip}_\n\n"
            f"{'━' * 32}\n"
            f"🆔 Report ID: {logged_id}\n"
            f"_🛡️ Kavach AI 2.0 — Real-time Scam Intelligence_\n"
            f"_Protecting Indian families from digital fraud_"
        )
        return report

    # ───────────────────────────────────────────────────────────────────
    # Voice / TTS summary
    # ───────────────────────────────────────────────────────────────────

    def format_voice_summary(self, analysis_result: Dict[str, Any]) -> str:
        """
        Generate a short, plain-text summary suitable for Text-to-Speech.

        The output contains no emojis, no markdown, and is limited to
        2–3 natural-language sentences.

        Args:
            analysis_result: The full JSON dict from ``/api/analyze-threat``.

        Returns:
            A plain-text string optimised for TTS engines.
        """
        analysis = analysis_result.get("analysis", {})
        risk_level = analysis.get("risk_level", "UNKNOWN").upper()
        threat_score = analysis.get("threat_score", 0)
        raw_threat_type = analysis.get("threat_type", "Unknown threat")
        recommended_action = analysis.get(
            "recommended_action",
            "Please exercise caution and do not share personal information.",
        )

        # Map risk level to a spoken descriptor
        spoken_risk = {
            "HIGH": "high",
            "SUSPICIOUS": "suspicious",
            "SAFE": "safe",
        }.get(risk_level, "unknown")

        # Build the voice summary — max 3 sentences
        summary = (
            f"Kavach AI has analysed this message and determined it is "
            f"{spoken_risk} with a threat score of {threat_score} percent. "
            f"The detected threat type is {raw_threat_type}. "
            f"{recommended_action}"
        )
        return summary

    # ───────────────────────────────────────────────────────────────────
    # Scan history
    # ───────────────────────────────────────────────────────────────────

    def format_history_response(self, logs: List[Dict[str, Any]]) -> str:
        """
        Format the user's recent scan history into a readable WhatsApp
        message with numbered entries and risk indicators.

        Args:
            logs: A list of log dicts, each containing at minimum
                  ``risk_level``, ``threat_score``, ``threat_type``, and
                  ``original_text``.

        Returns:
            A formatted WhatsApp message string.
        """
        if not logs:
            return (
                "📋 *Kavach AI — Scan History*\n\n"
                "No scans recorded yet.\n\n"
                "Send your first text, screenshot, or voice note to start "
                "protecting your family! 🛡️"
            )

        header = (
            "📋 *Kavach AI — Recent Scans (Latest 5)*\n"
            f"{'━' * 32}\n\n"
        )

        entries: List[str] = []
        for i, entry in enumerate(logs[:5], 1):
            risk = entry.get("risk_level", "SAFE").upper()
            score = entry.get("threat_score", 0)
            threat_type = entry.get("threat_type", "Unknown")
            timestamp = entry.get("timestamp", "")

            # Risk indicator
            emoji = {"HIGH": "🔴", "SUSPICIOUS": "🟡"}.get(risk, "🟢")

            # Truncate original text for readability
            orig_text = entry.get("original_text", "")
            if len(orig_text) > 45:
                orig_text = orig_text[:42] + "..."

            entry_str = (
                f"{i}. {emoji} *{risk}* — {threat_type}\n"
                f"   📊 Score: {score}% | 🕐 {timestamp}\n"
                f"   _\"{orig_text}\"_"
            )
            entries.append(entry_str)

        footer = (
            f"\n{'━' * 32}\n"
            "_🛡️ Kavach AI 2.0 — Your Digital Safety Shield_"
        )

        return header + "\n\n".join(entries) + footer

    # ───────────────────────────────────────────────────────────────────
    # Profile / Settings
    # ───────────────────────────────────────────────────────────────────

    def format_profile_settings(self, profile: Dict[str, Any]) -> str:
        """
        Format the user's profile and notification settings into a
        WhatsApp-friendly overview.

        Args:
            profile: A dict with keys like ``preferred_language``,
                     ``protected_name``, ``guardian_number``,
                     ``notify_high``, ``notify_suspicious``.

        Returns:
            A formatted WhatsApp message string.
        """
        if not profile:
            return (
                "⚙️ *Kavach AI — Profile Settings*\n\n"
                "Your profile is not set up yet.\n"
                "Let's complete the setup so we can protect your family! 🛡️"
            )

        lang = profile.get("preferred_language", "hi-IN")
        name = profile.get("protected_name", "Not Set")
        guardian = profile.get("guardian_number", "Not Set")
        notify_high = (
            "✅ Enabled" if profile.get("notify_high", True) else "❌ Disabled"
        )
        notify_susp = (
            "✅ Enabled"
            if profile.get("notify_suspicious", False)
            else "❌ Disabled"
        )

        return (
            f"⚙️ *Kavach AI — Settings*\n"
            f"{'━' * 32}\n\n"
            f"👤 *Protected User:* {name}\n"
            f"📞 *Guardian Number:* {guardian}\n"
            f"🗣️ *Warning Language:* {lang}\n"
            f"🔴 *Alerts (High Risk):* {notify_high}\n"
            f"🟡 *Alerts (Suspicious):* {notify_susp}\n\n"
            f"{'━' * 32}\n"
            "To modify any option, select from the settings menu."
        )

    # ═══════════════════════════════════════════════════════════════════
    # Private helpers
    # ═══════════════════════════════════════════════════════════════════

    def _detect_manipulation_tactics(
        self, reason_flags: List[str]
    ) -> List[str]:
        """
        Scan reason flags for psychological manipulation indicators and
        return a de-duplicated list of human-readable tactic labels.

        The matching is case-insensitive substring containment against
        ``_MANIPULATION_TACTIC_MAP``.

        Args:
            reason_flags: The ``reason_flags`` list from the backend.

        Returns:
            A list of unique tactic label strings, e.g.
            ``["😨 Fear / Intimidation", "⏰ Urgency / Time Pressure"]``.
        """
        detected: dict = {}  # tactic_label -> True  (ordered dedup)
        combined = " ".join(reason_flags).lower()

        for keyword, label in _MANIPULATION_TACTIC_MAP.items():
            if keyword in combined and label not in detected:
                detected[label] = True

        return list(detected.keys())

    def _infer_target_audience(self, threat_type: str) -> List[str]:
        """
        Infer the likely target audience from the threat type by looking
        up the taxonomy entry's ``target_audiences`` field.

        Args:
            threat_type: The raw ``threat_type`` string from the backend.

        Returns:
            A list of human-readable audience labels with emojis, e.g.
            ``["👴 Senior Citizens", "🏠 Homeowners"]``.
        """
        category = get_threat_category(threat_type)
        raw_audiences = category.get("target_audiences", ["general"])
        return [
            _AUDIENCE_DISPLAY.get(aud, f"👥 {aud.replace('_', ' ').title()}")
            for aud in raw_audiences
        ]

    def _infer_attack_vector(self, reason_flags: List[str]) -> str:
        """
        Infer the primary attack vector from reason flags.

        Scans the combined flags text for keywords and returns the first
        matching vector label.  Falls back to a generic label.

        Args:
            reason_flags: The ``reason_flags`` list from the backend.

        Returns:
            A single attack-vector label string.
        """
        combined = " ".join(reason_flags).lower()
        for keyword, vector in _ATTACK_VECTOR_HINTS.items():
            if keyword in combined:
                return vector
        return "💬 Direct Message / Social Engineering"

    @staticmethod
    def _get_confidence_label(confidence_score: int) -> str:
        """
        Map a numeric confidence score to a human-readable label.

        Thresholds:
            >= 90  → Very High
            >= 75  → High
            >= 50  → Medium
            <  50  → Low

        Args:
            confidence_score: An integer 0–100.

        Returns:
            One of ``"Very High"``, ``"High"``, ``"Medium"``, ``"Low"``.
        """
        if confidence_score >= 90:
            return "Very High"
        if confidence_score >= 75:
            return "High"
        if confidence_score >= 50:
            return "Medium"
        return "Low"

    @staticmethod
    def _get_risk_header(risk_level: str) -> tuple:
        """
        Return a colour-coded header line and emoji for the given risk level.

        Args:
            risk_level: One of ``"HIGH"``, ``"SUSPICIOUS"``, ``"SAFE"``,
                        or any other string (treated as unknown).

        Returns:
            A tuple of ``(header_string, emoji_string)``.
        """
        if risk_level == "HIGH":
            return "🔴🚨 *KAVACH AI — HIGH THREAT DETECTED* 🚨🔴", "🔴"
        if risk_level == "SUSPICIOUS":
            return "🟡⚠️ *KAVACH AI — SUSPICIOUS CONTENT* ⚠️🟡", "🟡"
        if risk_level == "SAFE":
            return "🟢✅ *KAVACH AI — SAFE CONTENT* ✅🟢", "🟢"
        return "❓ *KAVACH AI — ANALYSIS COMPLETE*", "❓"

    @staticmethod
    def _format_recommended_actions(action_text: str) -> str:
        """
        Split a backend recommended-action string into DO and DON'T
        bullets with ❌ / ✅ formatting.

        Heuristic: sentences containing negative phrases ("do not",
        "never", "don't", "disconnect", "block", "ignore", "avoid",
        "stop") are rendered as ❌ DON'T items.  All others become
        ✅ DO items.

        Args:
            action_text: The ``recommended_action`` value from the backend.

        Returns:
            A multi-line formatted string.
        """
        if not action_text:
            return "  ✅ Stay vigilant and report suspicious activity."

        # Split on sentence boundaries
        sentences = [
            s.strip()
            for s in action_text.replace(". ", ".\n").split("\n")
            if s.strip()
        ]

        negative_keywords = {
            "do not", "don't", "never", "disconnect", "block",
            "ignore", "avoid", "stop", "refrain", "cease",
        }

        lines: List[str] = []
        for sentence in sentences:
            lower = sentence.lower()
            if any(kw in lower for kw in negative_keywords):
                lines.append(f"  ❌ {sentence}")
            else:
                lines.append(f"  ✅ {sentence}")

        return "\n".join(lines)


# Module-level singleton (matches existing import pattern in handlers)
formatter = ResponseFormatter()
