from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class WhatsAppMetadata(BaseModel):
    display_phone_number: str
    phone_number_id: str

class Profile(BaseModel):
    name: str

class TextContent(BaseModel):
    body: str

class MediaContent(BaseModel):
    id: str
    mime_type: str
    sha256: Optional[str] = None
    filename: Optional[str] = None

class InteractiveButtonReply(BaseModel):
    id: str
    title: str

class InteractiveContent(BaseModel):
    type: str
    button_reply: Optional[InteractiveButtonReply] = None

class ButtonContent(BaseModel):
    payload: str
    text: str

class Message(BaseModel):
    from_: str
    id: str
    timestamp: str
    type: str
    text: Optional[TextContent] = None
    image: Optional[MediaContent] = None
    audio: Optional[MediaContent] = None
    voice: Optional[MediaContent] = None
    document: Optional[MediaContent] = None
    interactive: Optional[InteractiveContent] = None
    button: Optional[ButtonContent] = None

    class Config:
        fields = {
            'from_': 'from'
        }

class Contact(BaseModel):
    profile: Profile
    wa_id: str

class ChangeValue(BaseModel):
    messaging_product: str
    metadata: WhatsAppMetadata
    contacts: Optional[List[Contact]] = None
    messages: Optional[List[Message]] = None

class Change(BaseModel):
    value: ChangeValue
    field: str

class Entry(BaseModel):
    id: str
    changes: List[Change]

class WebhookPayload(BaseModel):
    object: str
    entry: List[Entry]
