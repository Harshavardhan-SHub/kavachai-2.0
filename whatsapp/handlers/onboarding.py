from whatsapp.services.whatsapp import whatsapp_service
from whatsapp.services.backend_client import backend_client
from whatsapp.services.session import session_manager
from whatsapp.models.session import UserSession
from whatsapp.utils.constants import (
    STATE_WELCOME,
    STATE_AWAITING_NAME,
    STATE_AWAITING_GUARDIAN_NUMBER,
    STATE_AWAITING_LANGUAGE,
    STATE_ACTIVE,
    LANGUAGES
)

class OnboardingHandler:
    async def start_onboarding(self, to: str, session: UserSession):
        session.conversation_state = STATE_AWAITING_NAME
        welcome_msg = (
            "👋 *Welcome to Kavach AI 2.0!*\n\n"
            "I am your family-bound cybersecurity shield. I can protect you from:\n"
            "• Fake Lottery Scams\n"
            "• Urgent Bank Block Messages\n"
            "• Fraudulent Screenshots & QR Codes\n"
            "• Voice Cloning & Scam Voice Notes\n\n"
            "To begin setup, please reply with your *Full Name*:"
        )
        await whatsapp_service.send_text(to, welcome_msg)

    async def handle_onboarding_step(self, to: str, text: str, session: UserSession):
        state = session.conversation_state

        if state == STATE_AWAITING_NAME:
            if not text.strip():
                await whatsapp_service.send_text(to, "Please enter a valid name to proceed:")
                return
            
            session.protected_name = text.strip()
            session.conversation_state = STATE_AWAITING_GUARDIAN_NUMBER
            await whatsapp_service.send_text(
                to, 
                f"Thank you, *{session.protected_name}*.\n\n"
                "Next, please enter the mobile number of your *Designated Guardian* (e.g. family member, child) who should receive alert messages when a high-risk threat is detected (Include country code, e.g. +91XXXXXXXXXX):"
            )

        elif state == STATE_AWAITING_GUARDIAN_NUMBER:
            # Basic validation of phone number
            phone_num = text.strip()
            if not phone_num.startswith("+") or not phone_num[1:].isdigit() or len(phone_num) < 10:
                await whatsapp_service.send_text(
                    to, 
                    "⚠️ Invalid phone number format.\n"
                    "Please enter the number starting with '+' followed by country code (e.g. +919876543210):"
                )
                return
            
            session.guardian_number = phone_num
            session.conversation_state = STATE_AWAITING_LANGUAGE
            
            # Offer language buttons
            buttons = [
                {"id": "lang_hi", "title": "Hindi (हिंदी)"},
                {"id": "lang_en", "title": "English"},
                {"id": "lang_te", "title": "Telugu (తెలుగు)"}
            ]
            await whatsapp_service.send_interactive_buttons(
                to,
                "Select your preferred language for voice warnings:",
                buttons
            )

        elif state == STATE_AWAITING_LANGUAGE:
            lang_mapping = {
                "lang_hi": "hi-IN",
                "lang_en": "en-IN",
                "lang_te": "te-IN",
                "hi": "hi-IN",
                "english": "en-IN",
                "telugu": "te-IN"
            }
            clean_text = text.strip().lower()
            lang_code = lang_mapping.get(clean_text, "hi-IN")
            
            session.preferred_language = lang_code
            session.conversation_state = STATE_ACTIVE
            session.profile_completed = True

            # Save profile details back to the black box backend API
            profile_payload = {
                "phone_number": session.phone_number,
                "protected_name": session.protected_name,
                "guardian_number": session.guardian_number,
                "preferred_language": session.preferred_language,
                "notify_high": True,
                "notify_suspicious": False,
                "profile_completed": True
            }
            await backend_client.save_profile(profile_payload)

            await whatsapp_service.send_text(
                to,
                f"🎉 *Setup Complete!*\n\n"
                f"Your security shield is active. Any critical threat alert will be forwarded to your guardian at *{session.guardian_number}*.\n\n"
                "You can scan messages, voice recordings, screenshots, or documents at any time. Simply send them here."
            )
            
            # Send main action dashboard menu
            await self.send_dashboard(to)

    async def send_dashboard(self, to: str):
        buttons = [
            {"id": "menu_scan_sms", "title": "Scan Message"},
            {"id": "menu_history", "title": "View History"},
            {"id": "menu_help", "title": "Help / Support"}
        ]
        await whatsapp_service.send_interactive_buttons(
            to,
            "💡 *How would you like to proceed?* Choose an option below:",
            buttons
        )

onboarding_handler = OnboardingHandler()
