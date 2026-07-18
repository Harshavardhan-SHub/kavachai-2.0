import httpx
from typing import List, Dict, Any, Optional
from whatsapp.config import settings

class WhatsAppService:
    def __init__(self, token: str = settings.WHATSAPP_TOKEN, phone_number_id: str = settings.WHATSAPP_PHONE_NUMBER_ID):
        self.token = token
        self.phone_number_id = phone_number_id
        self.base_url = f"https://graph.facebook.com/v20.0/{self.phone_number_id}/messages"

    async def send_text(self, to: str, text: str) -> Dict[str, Any]:
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {
                "body": text
            }
        }
        return await self._send_request(payload)

    async def send_interactive_buttons(self, to: str, text: str, buttons: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Sends an interactive button message. Max 3 buttons are supported by WhatsApp natively.
        buttons list format: [{"id": "btn_1", "title": "Button 1 Title"}]
        """
        formatted_buttons = []
        for btn in buttons[:3]:  # WhatsApp limits list-buttons to 3
            formatted_buttons.append({
                "type": "reply",
                "reply": {
                    "id": btn["id"],
                    "title": btn["title"]
                }
            })

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {
                    "text": text
                },
                "action": {
                    "buttons": formatted_buttons
                }
            }
        }
        return await self._send_request(payload)

    async def send_audio(self, to: str, audio_url: str) -> Dict[str, Any]:
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "audio",
            "audio": {
                "link": audio_url
            }
        }
        return await self._send_request(payload)

    async def _send_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        # If we are using mock tokens, we print the payload and return successfully
        if "MOCK" in self.token or not self.token:
            print(f"[MOCK WHATSAPP OUTGOING PAYLOAD to {payload.get('to')}]:")
            print(payload)
            return {"status": "mock_sent", "payload": payload}

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.base_url, json=payload, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                print(f"WhatsApp API Error status {e.response.status_code}: {e.response.text}")
                return {"status": "error", "detail": e.response.text}
            except Exception as e:
                print(f"WhatsApp API connection error: {e}")
                return {"status": "error", "detail": str(e)}

whatsapp_service = WhatsAppService()
