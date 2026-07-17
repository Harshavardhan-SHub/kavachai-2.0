from whatsapp.services.whatsapp import whatsapp_service
from whatsapp.services.backend_client import backend_client
from whatsapp.services.formatter import formatter
from whatsapp.models.session import UserSession
from whatsapp.utils.constants import STATE_ACTIVE

class CommandsHandler:
    async def handle_command(self, to: str, command: str, session: UserSession):
        cmd = command.strip().lower()

        if cmd in ["/start", "/help", "help"]:
            help_text = (
                "🛡️ *Kavach-AI Helper Options*\n\n"
                "You can interact with me conversationally or use these commands:\n"
                "• `/history` - View past scam scans\n"
                "• `/settings` - Show profile configuration\n"
                "• `/guardian` - View designated family contact\n"
                "• `/about` - Technical details of Kavach-AI\n\n"
                "Or simply send a suspect text, screenshot photo, or recorded voice note directly."
            )
            await whatsapp_service.send_text(to, help_text)

        elif cmd == "/history":
            history_logs = await backend_client.get_history()
            formatted = formatter.format_history_response(history_logs)
            await whatsapp_service.send_text(to, formatted)

        elif cmd in ["/settings", "/language"]:
            profile = await backend_client.get_profile(session.phone_number)
            formatted = formatter.format_profile_settings(profile or {})
            await whatsapp_service.send_text(to, formatted)

        elif cmd == "/guardian":
            profile = await backend_client.get_profile(session.phone_number)
            if profile:
                guardian_num = profile.get("guardian_number", "Not Registered")
                await whatsapp_service.send_text(to, f"📞 *Designated Guardian Contact:*\n{guardian_num}\n\nAll critical threats (score >= 70%) trigger SMS warnings to this number.")
            else:
                await whatsapp_service.send_text(to, "Guardian not registered. Run profile setup.")

        elif cmd == "/about":
            about_text = (
                "ℹ️ *About Kavach-AI 2.0*\n\n"
                "Kavach-AI uses advanced AI and natural language processing to protect families from social engineering fraud:\n"
                "1. *Translation*: Standardizes regional Indian dialects into English.\n"
                "2. *Cognitive Threat Modeling*: Scores threat vectors using Gemini APIs.\n"
                "3. *Alert Dispatches*: Twilio integration warns designated guardians instantly.\n"
                "4. *Voice Alarms*: Regional voice messages warning user locally."
            )
            await whatsapp_service.send_text(to, about_text)
            
        else:
            await whatsapp_service.send_text(to, "Unknown command. Send `/help` for options.")

commands_handler = CommandsHandler()
