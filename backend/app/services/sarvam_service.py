import base64
import httpx
from fastapi import HTTPException
from app.config import SARVAM_API_KEY, USE_MOCK_SARVAM

# Pre-defined translations for common Indic demo inputs
INDIC_TRANSLATIONS = {
    "बेटा मैं घर पहुँच गया हूँ।": "Hi son I reached home.",
    "बेटा मैं घर पहुँच गया हूँ": "Hi son I reached home.",
    "hi son I reached home": "Hi son I reached home.",
    
    "कृपया अपने एसबीआई खाते को तुरंत सत्यापित करें।": "Please verify your SBI account urgently.",
    "कृपया अपने एसबीआई खाते को तुरंत सत्यापित करें": "Please verify your SBI account urgently.",
    
    "आपका बिजली कनेक्शन काट दिया जाएगा। तुरंत 2000 रुपये ट्रांसफर करें।": "Your electricity connection will be disconnected. Transfer 2000 rupees immediately.",
    "आपका बिजली कनेक्शन काट दिया जाएगा। तुरंत 2000 रुपये भेजें।": "Your electricity connection will be disconnected. Transfer 2000 rupees immediately.",
    
    "beta main ghar pahunch gaya hoon": "Hi son I reached home.",
    "please call me, main ghar pahunch gaya": "Hi son I reached home.",
    "please verify your sbi account urgently": "Please verify your SBI account urgently.",
    "apna bank account verify karo bank block ho jayega": "Verify your bank account urgently, otherwise your bank will be blocked.",
    "bill pay karo varna light cut jayegi 2000 do": "Pay the bill otherwise the electricity will be cut. Send 2000 rupees.",
    "your electricity connection will be disconnected. transfer 2000 rupees immediately": "Your electricity connection will be disconnected. Transfer 2000 rupees immediately."
}

def translate_fallback(text: str) -> dict:
    """
    Translates Indic text to English using offline rules for common hackathon inputs.
    """
    text_stripped = text.strip()
    
    if text_stripped in INDIC_TRANSLATIONS:
        return {
            "translated_text": INDIC_TRANSLATIONS[text_stripped],
            "detected_language": "hi-IN" if any(ord(c) > 127 for c in text_stripped) else "en-IN",
            "source": "Mock Translator (Rule Match)"
        }
        
    text_lower = text_stripped.lower()
    for key, value in INDIC_TRANSLATIONS.items():
        if key.lower() in text_lower or text_lower in key.lower():
            return {
                "translated_text": value,
                "detected_language": "hi-IN" if any(ord(c) > 127 for c in text_stripped) else "en-IN",
                "source": "Mock Translator (Partial Match)"
            }
            
    return {
        "translated_text": text_stripped,
        "detected_language": "en-IN",
        "source": "Mock Translator (Identity)"
    }

async def translate_text(text: str, source_lang: str = "auto") -> dict:
    """
    Translates input text into English using the Sarvam translation API.
    Retries up to 3 times, stops immediately on 400.
    """
    if USE_MOCK_SARVAM or not SARVAM_API_KEY:
        print("[MOCK SERVICE] Using local translation fallback.")
        return translate_fallback(text)
        
    url = "https://api.sarvam.ai/translate"
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "input": text,
        "source_language_code": source_lang,
        "target_language_code": "en-IN",
        "model": "mayura:v1"
    }
    
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "translated_text": data.get("translated_text", text),
                        "detected_language": data.get("source_language_code", "hi-IN"),
                        "source": "Sarvam Translate API"
                    }
                elif response.status_code == 400:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Sarvam Translate API returned 400: {response.text}"
                    )
                else:
                    print(f"[API ERROR] Sarvam Translate status {response.status_code} (attempt {attempt+1}): {response.text}")
                    if attempt == 2:
                        return translate_fallback(text)
        except HTTPException:
            raise
        except Exception as e:
            print(f"[SERVICE EXCEPTION] Sarvam Translate failed with exception (attempt {attempt+1}): {e}")
            if attempt == 2:
                return translate_fallback(text)
                
    return translate_fallback(text)

def get_stt_fallback_data(filename: str, language_code: str) -> dict:
    """
    Local signature mock mapping for speech-to-text fallback.
    """
    name_lower = filename.lower()
    if "safe" in name_lower or "case1" in name_lower:
        return {
            "transcript": "Hi son I reached home.",
            "detected_language": "hi-IN",
            "source": "Mock STT (Case 1 Signature)"
        }
    elif "suspicious" in name_lower or "case2" in name_lower or "verify" in name_lower:
        return {
            "transcript": "Please verify your SBI account urgently.",
            "detected_language": "hi-IN",
            "source": "Mock STT (Case 2 Signature)"
        }
    elif "electricity" in name_lower or "disconnect" in name_lower or "case3" in name_lower or "danger" in name_lower:
        return {
            "transcript": "Your electricity connection will be disconnected. Transfer 2000 rupees immediately.",
            "detected_language": "hi-IN",
            "source": "Mock STT (Case 3 Signature)"
        }
    else:
        return {
            "transcript": "Your electricity connection will be disconnected. Transfer 2000 rupees immediately.",
            "detected_language": "hi-IN",
            "source": "Mock STT (Default Case 3 Mock)"
        }

async def speech_to_text(file_content: bytes, filename: str, language_code: str = "hi-IN") -> dict:
    """
    Converts audio speech to English text using Sarvam Speech-to-Text API.
    Retries up to 3 times, stops immediately on 400.
    """
    if USE_MOCK_SARVAM or not SARVAM_API_KEY:
        print(f"[MOCK SERVICE] STT fallback reading file signature: {filename}")
        return get_stt_fallback_data(filename, language_code)

    url = "https://api.sarvam.ai/speech-to-text"
    headers = {
        "api-subscription-key": SARVAM_API_KEY
    }
    
    files = {
        "file": (filename, file_content, "audio/wav")
    }
    
    data = {
        "model": "saaras:v3",
        "language_code": language_code,
        "mode": "translate"
    }
    
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, headers=headers, files=files, data=data)
                if response.status_code == 200:
                    resp_json = response.json()
                    return {
                        "transcript": resp_json.get("transcript", ""),
                        "detected_language": language_code,
                        "source": "Sarvam STT Translate API"
                    }
                elif response.status_code == 400:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Sarvam STT API returned 400: {response.text}"
                    )
                else:
                    print(f"[API ERROR] Sarvam STT status {response.status_code} (attempt {attempt+1}): {response.text}")
                    if attempt == 2:
                        return get_stt_fallback_data(filename, language_code)
        except HTTPException:
            raise
        except Exception as e:
            print(f"[SERVICE EXCEPTION] Sarvam STT failed (attempt {attempt+1}): {e}")
            if attempt == 2:
                return get_stt_fallback_data(filename, language_code)
                
    return get_stt_fallback_data(filename, language_code)

SILENT_WAV_BASE64 = (
    "UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="
)

async def generate_warning_speech(text: str, language_code: str = "hi-IN") -> dict:
    """
    Generates warning speech using Sarvam TTS API.
    Retries up to 3 times, stops immediately on 400.
    """
    if USE_MOCK_SARVAM or not SARVAM_API_KEY:
        print("[MOCK SERVICE] Requesting local client-side Web Speech TTS fallback.")
        return {
            "status": "success",
            "audio_base64": SILENT_WAV_BASE64,
            "fallback_web_speech": True,
            "text_to_speak": text,
            "language_code": language_code
        }
        
    url = "https://api.sarvam.ai/text-to-speech"
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    
    speaker = "shreya" if language_code in ["hi-IN", "te-IN"] else "shubh"
    
    payload = {
        "text": text,
        "speaker": speaker,
        "target_language_code": language_code,
        "pace": 1.0,
        "model": "bulbul:v3"
    }
    
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    audios = data.get("audios", [])
                    if audios:
                        return {
                            "status": "success",
                            "audio_base64": audios[0],
                            "fallback_web_speech": False
                        }
                    else:
                        return {
                            "status": "success",
                            "audio_base64": SILENT_WAV_BASE64,
                            "fallback_web_speech": True,
                            "text_to_speak": text,
                            "language_code": language_code
                        }
                elif response.status_code == 400:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Sarvam TTS API returned 400: {response.text}"
                    )
                else:
                    print(f"[API ERROR] Sarvam TTS status {response.status_code} (attempt {attempt+1}): {response.text}")
                    if attempt == 2:
                        return {
                            "status": "success",
                            "audio_base64": SILENT_WAV_BASE64,
                            "fallback_web_speech": True,
                            "text_to_speak": text,
                            "language_code": language_code
                        }
        except HTTPException:
            raise
        except Exception as e:
            print(f"[SERVICE EXCEPTION] Sarvam TTS failed with exception (attempt {attempt+1}): {e}")
            if attempt == 2:
                return {
                    "status": "success",
                    "audio_base64": SILENT_WAV_BASE64,
                    "fallback_web_speech": True,
                    "text_to_speak": text,
                    "language_code": language_code
                }
                
    return {
        "status": "success",
        "audio_base64": SILENT_WAV_BASE64,
        "fallback_web_speech": True,
        "text_to_speak": text,
        "language_code": language_code
    }
