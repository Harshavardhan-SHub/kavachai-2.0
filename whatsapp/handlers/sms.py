from whatsapp.services.whatsapp import whatsapp_service
from whatsapp.services.backend_client import backend_client
from whatsapp.services.formatter import formatter
from whatsapp.models.session import UserSession

class SMSHandler:
    async def handle_sms_scan(self, to: str, raw_text: str, session: UserSession):
        # Notify user analysis is commencing
        await whatsapp_service.send_text(to, "🔍 Analyzing message text for scams and security threats...")

        try:
            # Step 1: Translate and normalize input using existing backend service
            translation_result = await backend_client.translate_input(
                text=raw_text, 
                language_code=session.preferred_language
            )
            normalized_text = translation_result.get("translated_text", raw_text)

            # Step 2: Analyze threat via cognitive evaluation
            analysis_result = await backend_client.analyze_threat(
                text=normalized_text,
                input_type="SMS",
                guardian_enabled=session.guardian_enabled,
                guardian_on_suspicious=False
            )

            # Step 3: Format the JSON response into WhatsApp readable message
            formatted_message = formatter.format_threat_response(analysis_result)
            await whatsapp_service.send_text(to, formatted_message)

            # Step 4: If High Risk, play spoken audio warning (TTS) if requested
            analysis = analysis_result.get("analysis", {})
            risk_level = analysis.get("risk_level", "SAFE")
            logged_id = analysis_result.get("logged_id")

            if risk_level == "HIGH":
                # Call generate-warning-audio endpoint
                # Get the synthesized text from the Gemini warning recommendation
                warning_text = analysis.get("recommended_action", "यह एक संभावित घोटाला है। कृपया सावधान रहें।")
                try:
                    speech_result = await backend_client.generate_warning_audio(
                        text=warning_text, 
                        language_code=session.preferred_language
                    )
                    # Play the base64 or link-based warning if generated
                    # Note: Since the backend returns base64 string or file path, for WhatsApp we can send
                    # the text warning back or stream it if hosted. Let's send a notification of guardian alert.
                    pass
                except Exception as e:
                    print(f"Failed generating voice warning: {e}")

                # Notify guardian through backend API if registered
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
                    except Exception as e:
                        print(f"Failed to alert guardian: {e}")

        except Exception as e:
            print(f"Error in SMS Handler analysis: {e}")
            await whatsapp_service.send_text(to, "❌ Failed to complete analysis. Backend offline or invalid response.")

sms_handler = SMSHandler()
