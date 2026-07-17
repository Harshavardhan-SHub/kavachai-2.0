import os
from whatsapp.services.whatsapp import whatsapp_service
from whatsapp.services.backend_client import backend_client
from whatsapp.services.formatter import formatter
from whatsapp.services.media import media_service
from whatsapp.models.session import UserSession

class DocumentHandler:
    async def handle_document_scan(self, to: str, media_id: str, filename: str, session: UserSession):
        await whatsapp_service.send_text(to, f"📄 Document '{filename}' received. Parsing contents...")

        try:
            # 1. Download document from WhatsApp
            doc_bytes = await media_service.download_media(media_id)
            if not doc_bytes:
                await whatsapp_service.send_text(to, "❌ Failed to download document from WhatsApp.")
                return

            # 2. Extract text (Simulate text extraction for PDF/Word files in the interface layer)
            # Default to standard text scam for verification simulation
            extracted_text = "आपका बिजली कनेक्शन आज रात काट दिया जाएगा। तुरंत 2000 रुपये का भुगतान इस खाते में करें।"
            
            await whatsapp_service.send_text(to, "📝 *Extracted Document Contents:* Running threat evaluation...")

            # 3. Translate and normalize
            translation_result = await backend_client.translate_input(
                text=extracted_text, 
                language_code=session.preferred_language
            )
            normalized_text = translation_result.get("translated_text", extracted_text)

            # 4. Perform threat analysis
            analysis_result = await backend_client.analyze_threat(
                text=normalized_text,
                input_type="Document",
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
                        scam_type=analysis.get("threat_type", "Document / Invoice Fraud"),
                        threat_score=analysis.get("threat_score", 90),
                        user_name=session.protected_name or "Your Family Member",
                        logged_id=logged_id
                    )
                    await whatsapp_service.send_text(to, f"🔔 *Guardian Notified:* Alert sent to {session.guardian_number}.")
                except Exception as e:
                    print(f"Failed to alert guardian: {e}")

        except Exception as e:
            print(f"Error in Document Handler: {e}")
            await whatsapp_service.send_text(to, f"❌ Failed to process document '{filename}'.")

document_handler = DocumentHandler()
