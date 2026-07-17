import httpx
from typing import Dict, Any, Optional, List
from whatsapp.config import settings

class BackendClient:
    def __init__(self, base_url: str = settings.BACKEND_URL):
        self.base_url = base_url

    async def health(self) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/api/health")
                return response.json()
            except Exception as e:
                return {"status": "unhealthy", "error": str(e)}

    async def get_profile(self, phone_number: str) -> Optional[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/api/profile", params={"phone_number": phone_number})
                if response.status_code == 200:
                    return response.json()
                return None
            except Exception:
                return None

    async def save_profile(self, profile_data: Dict[str, Any]) -> bool:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{self.base_url}/api/profile", json=profile_data)
                return response.status_code == 200
            except Exception:
                return False

    async def translate_input(self, text: Optional[str] = None, file_content: Optional[bytes] = None, filename: Optional[str] = None, language_code: str = "hi-IN") -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            data = {"language_code": language_code}
            files = None
            if file_content is not None and filename is not None:
                files = {"file": (filename, file_content, "audio/wav")}
            elif text is not None:
                data["text"] = text
            
            response = await client.post(f"{self.base_url}/api/translate-input", data=data, files=files)
            response.raise_for_status()
            return response.json()

    async def analyze_threat(self, text: str, input_type: str = "SMS", guardian_enabled: bool = True, guardian_on_suspicious: bool = False) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "text": text,
                "input_type": input_type,
                "guardian_enabled": guardian_enabled,
                "guardian_on_suspicious": guardian_on_suspicious
            }
            response = await client.post(f"{self.base_url}/api/analyze-threat", json=payload)
            response.raise_for_status()
            return response.json()

    async def generate_warning_audio(self, text: str, language_code: str = "hi-IN") -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "text": text,
                "language_code": language_code
            }
            response = await client.post(f"{self.base_url}/api/generate-warning-audio", json=payload)
            response.raise_for_status()
            return response.json()

    async def notify_guardian(self, phone_number: str, scam_type: str, threat_score: int, user_name: str = "User", logged_id: Optional[str] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "phone_number": phone_number,
                "scam_type": scam_type,
                "threat_score": threat_score,
                "user_name": user_name,
                "logged_id": logged_id
            }
            response = await client.post(f"{self.base_url}/api/notify-guardian", json=payload)
            response.raise_for_status()
            return response.json()

    async def get_history(self) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/api/history")
                if response.status_code == 200:
                    return response.json()
                return []
            except Exception:
                return []

backend_client = BackendClient()
