import logging
from whatsapp.services.whatsapp import whatsapp_service
from whatsapp.services.backend_client import backend_client
from whatsapp.services.formatter import formatter
from whatsapp.models.session import UserSession

logger = logging.getLogger("whatsapp-sms-handler")

class SMSHandler:
    async def handle_sms_scan(self, to: str, raw_text: str, session: UserSession):
        logger.info("[AI] Processing message from %s — text_preview=%r", to, raw_text[:80])

        # Notify user analysis is commencing
        await whatsapp_service.send_text(to, "🔍 Analyzing message text for scams and security threats...")

        try:
            # Step 1: Translate and normalize input using existing backend service
            logger.info("[AI] Calling translate-input for %s", to)
            translation_result = await backend_client.translate_input(
                text=raw_text,
                language_code=session.preferred_language
            )
            normalized_text = translation_result.get("translated_text", raw_text)

            # Step 2: Analyze threat via cognitive evaluation
            logger.info("[AI] Calling analyze-threat for %s", to)
            analysis_result = await backend_client.analyze_threat(
                text=normalized_text,
                input_type="SMS",
                guardian_enabled=session.guardian_enabled,
                guardian_on_suspicious=False
            )

            analysis = analysis_result.get("analysis", {})
            risk_level = analysis.get("risk_level", "SAFE")
            threat_score = analysis.get("threat_score", 0)
            logger.info("[AI] Response generated — risk=%s score=%s for %s", risk_level, threat_score, to)

            # Step 3: Format the JSON response into WhatsApp readable message
            formatted_message = formatter.format_threat_response(analysis_result)
            logger.info("[WhatsApp] Sending reply to %s...", to)
            await whatsapp_service.send_text(to, formatted_message)
            logger.info("[WhatsApp] Message sent successfully to %s", to)

            # Step 4: If High Risk, notify guardian
            logged_id = analysis_result.get("logged_id")

            if risk_level == "HIGH":
                warning_text = analysis.get("recommended_action", "यह एक संभावित घोटाला है। कृपया सावधान रहें।")
                try:
                    await backend_client.generate_warning_audio(
                        text=warning_text,
                        language_code=session.preferred_language
                    )
                except Exception as e:
                    logger.warning("[AI] Voice warning generation failed: %s", str(e))

                if session.guardian_number:
                    try:
                        await backend_client.notify_guardian(
                            phone_number=session.guardian_number,
                            scam_type=analysis.get("threat_type", "Scam"),
                            threat_score=analysis.get("threat_score", 90),
                            user_name=session.protected_name or "Your Family Member",
                            logged_id=logged_id
                        )
                        await whatsapp_service.send_text(to, f"🔔 *Guardian Notified:* An alert has been sent to your guardian at {session.guardian_number}.")
                        logger.info("[AI] Guardian notified at %s for HIGH threat from %s", session.guardian_number, to)
                    except Exception as e:
                        logger.error("[AI] Failed to alert guardian: %s", str(e))

        except Exception as e:
            logger.error("[AI] Error in SMS Handler for %s: %s", to, str(e), exc_info=True)
            await whatsapp_service.send_text(to, "❌ Failed to complete analysis. Backend offline or invalid response.")

sms_handler = SMSHandler()
