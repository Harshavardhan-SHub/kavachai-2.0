import os
import tempfile
import httpx
from typing import Optional
from whatsapp.config import settings

class MediaService:
    def __init__(self, token: str = settings.WHATSAPP_TOKEN):
        self.token = token

    async def download_media(self, media_id: str) -> Optional[bytes]:
        """
        Retrieves the media URL using the media ID, then downloads the file content.
        """
        # If mock credentials are used, return simulated files or empty mock content
        if "MOCK" in self.token or not self.token:
            print(f"[MOCK MEDIA DOWNLOAD] Mocking download for media ID: {media_id}")
            return b"MOCK_MEDIA_CONTENT_BYTES"

        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        async with httpx.AsyncClient() as client:
            try:
                # Step 1: Get download URL
                meta_url = f"https://graph.facebook.com/v20.0/{media_id}"
                response = await client.get(meta_url, headers=headers)
                response.raise_for_status()
                media_info = response.json()
                download_url = media_info.get("url")

                if not download_url:
                    return None

                # Step 2: Download actual bytes
                file_response = await client.get(download_url, headers=headers)
                file_response.raise_for_status()
                return file_response.content
            except Exception as e:
                print(f"Error downloading media from WhatsApp: {e}")
                return None

    async def download_media_temp(self, media_id: str, suffix: str = ".tmp") -> Optional[str]:
        """
        Downloads media bytes and stores them in a temporary local file.
        Returns the absolute file path on success, or None on failure.
        """
        data = await self.download_media(media_id)
        if not data:
            return None
        
        try:
            # Create a temporary file
            fd, temp_path = tempfile.mkstemp(suffix=suffix, prefix=f"kavach_media_{media_id}_")
            with os.fdopen(fd, 'wb') as f:
                f.write(data)
            print(f"[MEDIA SERVICE] Temporarily saved media {media_id} to {temp_path}")
            return temp_path
        except Exception as e:
            print(f"Error saving media to temp file: {e}")
            return None

    def delete_temp_file(self, file_path: str):
        """
        Deletes the temporary file after processing.
        """
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"[MEDIA SERVICE] Cleaned up temporary file: {file_path}")
            except Exception as e:
                print(f"Failed to delete temp file {file_path}: {e}")

media_service = MediaService()
