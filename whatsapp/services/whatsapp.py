import logging
import httpx
from typing import List, Dict, Any, Optional
from whatsapp.config import settings

logger = logging.getLogger("whatsapp-service")

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

    async def send_document(self, to: str, document_url: str, filename: str) -> Dict[str, Any]:
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "document",
            "document": {
                "link": document_url,
                "filename": filename
            }
        }
        return await self._send_request(payload)

    async def send_image(self, to: str, image_url: str, caption: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "image",
            "image": {
                "link": image_url
            }
        }
        if caption:
            payload["image"]["caption"] = caption
        return await self._send_request(payload)

    async def mark_as_read(self, message_id: str) -> Dict[str, Any]:
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }
        return await self._send_request(payload)

    async def _send_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        recipient = payload.get("to", payload.get("message_id", "unknown"))

        # If we are using mock tokens, log the payload and return successfully
        if "MOCK" in self.token or not self.token:
            logger.warning(
                "[WhatsApp] MOCK mode active — message NOT sent to Meta API. "
                "Set WHATSAPP_TOKEN in whatsapp/.env to send real messages. "
                "Recipient: %s", recipient
            )
            print(f"[MOCK WHATSAPP OUTGOING PAYLOAD to {recipient}]:")
            print(payload)
            return {"status": "mock_sent", "payload": payload}

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        logger.info("[WhatsApp] Sending reply to %s via Meta Cloud API...", recipient)

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.base_url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                logger.info("[WhatsApp] Message sent successfully to %s — response: %s", recipient, result)
                return result
            except httpx.HTTPStatusError as e:
                logger.error(
                    "[WhatsApp] API error sending to %s — HTTP %s: %s",
                    recipient, e.response.status_code, e.response.text
                )
                return {"status": "error", "detail": e.response.text}
            except Exception as e:
                logger.error("[WhatsApp] Connection error sending to %s: %s", recipient, str(e))
                return {"status": "error", "detail": str(e)}

whatsapp_service = WhatsAppService()
