import hmac
import hashlib
import json
import httpx
import asyncio

# Testing target configuration
TARGET_URL = "http://localhost:8001/webhook"
APP_SECRET = "924f3a65bb7004e58155fc4b6d41f811"  # Set to match config for signature validation

def generate_signature(payload: bytes, secret: str) -> str:
    mac = hmac.new(key=secret.encode("utf-8"), msg=payload, digestmod=hashlib.sha256)
    return f"sha256={mac.hexdigest()}"

async def send_payload(payload_dict: dict):
    payload_bytes = json.dumps(payload_dict).encode("utf-8")
    signature = generate_signature(payload_bytes, APP_SECRET)
    
    headers = {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": signature
    }
    
    print(f"\nSending payload type: {payload_dict['entry'][0]['changes'][0]['value']['messages'][0]['type']}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(TARGET_URL, data=payload_bytes, headers=headers)
            print(f"Response Status: {response.status_code}")
            print(f"Response Body: {response.text}")
        except Exception as e:
            print(f"Request failed: {e}")

def create_base_payload(message_type: str, message_data: dict, phone: str = "919346694088") -> dict:
    msg = {
        "from": phone,
        "id": f"wamid.mock_{int(asyncio.get_event_loop().time() * 1000)}",
        "timestamp": "1782290123",
        "type": message_type
    }
    msg[message_type] = message_data
    
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "882199278182910",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "16505553333",
                                "phone_number_id": "1163121646893088"
                            },
                            "contacts": [
                                {
                                    "profile": {
                                        "name": "Test User"
                                    },
                                    "wa_id": phone
                                }
                            ],
                            "messages": [msg]
                        },
                        "field": "messages"
                    }
                ]
            }
        ]
    }

async def main():
    print("🚀 Kavach-AI 2.0 Webhook Simulation Test Suite")
    print("Ensure the WhatsApp service is running on http://localhost:8001 before starting.")
    
    # 1. Simulate Greeting / Start Command
    greeting_payload = create_base_payload("text", {"body": "/start"})
    await send_payload(greeting_payload)
    await asyncio.sleep(1)

    # 2. Onboarding: Send Name
    name_payload = create_base_payload("text", {"body": "Harsha"})
    await send_payload(name_payload)
    await asyncio.sleep(1)

    # 3. Onboarding: Send Guardian Number
    guardian_payload = create_base_payload("text", {"body": "+919346694088"})
    await send_payload(guardian_payload)
    await asyncio.sleep(1)

    # 4. Onboarding: Send Preferred Language (Button click simulation)
    lang_payload = create_base_payload("interactive", {
        "type": "button_reply",
        "button_reply": {
            "id": "lang_hi",
            "title": "Hindi"
        }
    })
    await send_payload(lang_payload)
    await asyncio.sleep(1.5)

    # 5. Send Scam SMS for verification
    scam_sms_payload = create_base_payload("text", {
        "body": "प्रिय ग्राहक, आपका SBI योनो खाता ब्लॉक हो गया है। कृपया अपडेट करें।"
    })
    await send_payload(scam_sms_payload)
    await asyncio.sleep(2)

    # 6. Send Screenshot image check
    screenshot_payload = create_base_payload("image", {
        "id": "media_screenshot_1234",
        "mime_type": "image/png"
    })
    await send_payload(screenshot_payload)
    await asyncio.sleep(2)

    # 7. Send Voice Call note check
    voice_payload = create_base_payload("voice", {
        "id": "media_voice_5678",
        "mime_type": "audio/ogg"
    })
    await send_payload(voice_payload)
    await asyncio.sleep(2)

    # 8. Send Document invoice check
    document_payload = create_base_payload("document", {
        "id": "media_doc_9012",
        "mime_type": "application/pdf",
        "filename": "suspicious_invoice.pdf"
    })
    await send_payload(document_payload)

if __name__ == "__main__":
    asyncio.run(main())
