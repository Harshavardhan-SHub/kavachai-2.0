from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class OutgoingMessage(BaseModel):
    messaging_product: str = "whatsapp"
    recipient_type: str = "individual"
    to: str
    type: str
    text: Optional[Dict[str, str]] = None
    interactive: Optional[Dict[str, Any]] = None
    audio: Optional[Dict[str, str]] = None
