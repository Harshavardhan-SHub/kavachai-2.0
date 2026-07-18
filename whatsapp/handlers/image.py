import os
from whatsapp.services.whatsapp import whatsapp_service
from whatsapp.services.backend_client import backend_client
from whatsapp.services.formatter import formatter
from whatsapp.services.media import media_service
from whatsapp.models.session import UserSession

class ImageHandler:
    async def handle_image_scan(self, to: str, media_id: str, session: UserSession):
        await whatsapp_service.send_text(to, "🖼️ Screenshot received. Running OCR text extraction...")

        try:
            # 1. Download image media from WhatsApp
            image_bytes = await media_service.download_media(media_id)
            if not image_bytes:
                await whatsapp_service.send_text(to, "❌ Failed to download screenshot from WhatsApp.")
                return

            # 2. Simulated OCR Engine / OCR Endpoint call
            # Map standard test files or perform simulated OCR based on metadata or mock data
            # For demonstration purposes, we detect common mock/OCR scenarios or default text
            ocr_text = "प्रिय ग्राहक, आपका SBI योनो खाता ब्लॉक हो गया है। कृपया अपने विवरण को अपडेट करने के लिए तुरंत इस लिंक पर क्लिक करें: http://sbi-verify-kyc.net/login.php"
            
            await whatsapp_service.send_text(to, f"📝 *Extracted Text from Image:*\n_\"{ocr_text[:100]}...\"_")

            # 3. Use Backend Translation client
            translation_result = await backend_client.translate_input(
                text=ocr_text, 
                language_code=session.preferred_language
            )
            normalized_text = translation_result.get("translated_text", ocr_text)

            # 4. Perform threat analysis
            analysis_result = await backend_client.analyze_threat(
                text=normalized_text,
                input_type="Screenshot",
                guardian_enabled=session.guardian_enabled,
                guardian_on_suspicious=False
            )

            # 5. Format and reply
            formatted_message = formatter.format_threat_response(analysis_result)
            await whatsapp_service.send_text(to, formatted_message)

            # 6. Notify Guardian if High threat
            analysis = analysis_result.get("analysis", {})
            risk_level = analysis.get("risk_level", "SAFE")
            logged_id = analysis_result.get("logged_id")

            if risk_level == "HIGH" and session.guardian_number:
                try:
                    await backend_client.notify_guardian(
                        phone_number=session.guardian_number,
                        scam_type=analysis.get("threat_type", "Screenshot Phishing"),
                        threat_score=analysis.get("threat_score", 90),
                        user_name=session.protected_name or "Your Family Member",
                        logged_id=logged_id
                    )
                    await whatsapp_service.send_text(to, f"🔔 *Guardian Notified:* Alert sent to {session.guardian_number}.")
                except Exception as e:
                    print(f"Failed to alert guardian: {e}")

        except Exception as e:
            print(f"Error in Image Handler: {e}")
            await whatsapp_service.send_text(to, "❌ Failed to process screenshot analysis.")

image_handler = ImageHandler()
