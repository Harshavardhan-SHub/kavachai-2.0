from typing import Dict, Any, List

class ResponseFormatter:
    def format_threat_response(self, analysis_result: Dict[str, Any]) -> str:
        analysis = analysis_result.get("analysis", {})
        risk_level = analysis.get("risk_level", "UNKNOWN").upper()
        threat_score = analysis.get("threat_score", 0)
        confidence = analysis.get("confidence_score", 0)
        threat_type = analysis.get("threat_type", "N/A")
        reasons = analysis.get("reason_flags", [])
        action = analysis.get("recommended_action", "No recommendation provided.")

        # Determine risk emoji and header
        if risk_level == "HIGH":
            risk_header = "🚨 *HIGH THREAT DETECTED*"
            risk_status = "⚠️ *CRITICAL SCAM ALERT*"
        elif risk_level == "SUSPICIOUS":
            risk_header = "⚠️ *SUSPICIOUS CONTENT*"
            risk_status = "🟡 *POTENTIAL SCAM*"
        else:
            risk_header = "✅ *SAFE CONTENT*"
            risk_status = "🟢 *LEGITIMATE / SAFE*"

        reasons_bullet = "\n".join([f"• {r}" for r in reasons]) if reasons else "• None identified"

        msg = (
            f"{risk_header}\n\n"
            f"📊 *Scam Probability:* {threat_score}%\n"
            f"🛡️ *Status:* {risk_status}\n"
            f"🔍 *Type:* {threat_type}\n\n"
            f"📝 *Reasoning Flags:*\n{reasons_bullet}\n\n"
            f"💡 *Recommendation:*\n{action}\n\n"
            f"_Powered by Kavach AI 2.0 Real-time Protection_"
        )
        return msg

    def format_history_response(self, logs: List[Dict[str, Any]]) -> str:
        if not logs:
            return "📋 *Incident History*\n\nNo scans recorded yet. Send your first text, screenshot, or audio to start protecting your family!"

        msg = "📋 *Recent Incident Scans (Top 5)*\n\n"
        for i, entry in enumerate(logs[:5], 1):
            risk = entry.get("risk_level", "SAFE").upper()
            score = entry.get("threat_score", 0)
            threat_type = entry.get("threat_type", "Unknown")
            
            emoji = "🚨" if risk == "HIGH" else ("⚠️" if risk == "SUSPICIOUS" else "✅")
            
            # Truncate text for readability
            orig_text = entry.get("original_text", "")
            if len(orig_text) > 40:
                orig_text = orig_text[:37] + "..."

            msg += f"{i}. {emoji} *{risk}* (Score: {score}%) - {threat_type}\n   _\"{orig_text}\"_\n\n"
        
        return msg

    def format_profile_settings(self, profile: Dict[str, Any]) -> str:
        if not profile:
            return "⚙️ *Profile Settings*\n\nYour profile is not completed yet. Let's finish the setup so we can protect your family!"
        
        lang = profile.get("preferred_language", "hi-IN")
        name = profile.get("protected_name", "Not Set")
        guardian = profile.get("guardian_number", "Not Set")
        notify_high = "Enabled" if profile.get("notify_high", True) else "Disabled"
        notify_susp = "Enabled" if profile.get("notify_suspicious", False) else "Disabled"

        msg = (
            "⚙️ *Kavach-AI Settings*\n\n"
            f"👤 *Protected User Name:* {name}\n"
            f"📞 *Guardian Alert Number:* {guardian}\n"
            f"🗣️ *Warning Language:* {lang}\n"
            f"🚨 *Guardian Alerts (High):* {notify_high}\n"
            f"⚠️ *Guardian Alerts (Suspicious):* {notify_susp}\n\n"
            "To modify any option, select from settings menu."
        )
        return msg

formatter = ResponseFormatter()
