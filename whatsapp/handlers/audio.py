import os
from whatsapp.services.whatsapp import whatsapp_service
from whatsapp.services.backend_client import backend_client
from whatsapp.services.formatter import formatter
from whatsapp.services.media import media_service
from whatsapp.models.session import UserSession

class AudioHandler:
    async def handle_audio_scan(self, to: str, media_id: str, session: UserSession):
        await whatsapp_service.send_text(to, "🎤 Audio voice note received. Transcribing regional audio...")

        # 1. Download voice note to temporary local file
        temp_file = await media_service.download_media_temp(media_id, suffix=".ogg")
        if not temp_file:
            await whatsapp_service.send_text(to, "❌ Failed to download audio from WhatsApp.")
            return

        try:
            # 2. Read file contents and forward to backend translate-input
            with open(temp_file, "rb") as f:
                audio_bytes = f.read()

            filename = f"voice_input_{media_id}.ogg"
            translation_result = await backend_client.translate_input(
                file_content=audio_bytes,
                filename=filename,
                language_code=session.preferred_language
            )

            transcription = translation_result.get("original_text", "[Voice Note]")
            normalized_text = translation_result.get("translated_text", "")

            await whatsapp_service.send_text(
                to, 
                f"📝 *Transcribed translation (English):*\n_\"{normalized_text}\"_"
            )

            # 3. Perform Threat Analysis
            analysis_result = await backend_client.analyze_threat(
                text=normalized_text,
                input_type="Voice Note",
                guardian_enabled=session.guardian_enabled,
                guardian_on_suspicious=False
            )

            # 4. Formatter and reply
            formatted_message = formatter.format_threat_response(analysis_result)
            await whatsapp_service.send_text(to, formatted_message)

            # 5. Notify Guardian if High threat
            analysis = analysis_result.get("analysis", {})
            risk_level = analysis.get("risk_level", "SAFE")
            logged_id = analysis_result.get("logged_id")

            if risk_level == "HIGH" and session.guardian_number:
                try:
                    await backend_client.notify_guardian(
                        phone_number=session.guardian_number,
                        scam_type=analysis.get("threat_type", "Voice Phishing (Vishing)"),
                        threat_score=analysis.get("threat_score", 90),
                        user_name=session.protected_name or "Your Family Member",
                        logged_id=logged_id
                    )
                    await whatsapp_service.send_text(to, f"🔔 *Guardian Notified:* Alert sent to {session.guardian_number}.")
                except Exception as e:
                    print(f"Failed to alert guardian: {e}")

        except Exception as e:
            print(f"Error in Audio Handler: {e}")
            await whatsapp_service.send_text(to, "❌ Failed to process voice note translation.")
        finally:
            # 6. Delete temporary file after processing
            media_service.delete_temp_file(temp_file)

audio_handler = AudioHandler()
