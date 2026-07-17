from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

class UserSession(BaseModel):
    phone_number: str
    preferred_language: str = "hi-IN"
    current_intent: Optional[str] = None
    conversation_state: str = "WELCOME"
    guardian_enabled: bool = True
    guardian_number: Optional[str] = None
    protected_name: Optional[str] = None
    profile_completed: bool = False
    last_interaction: datetime = Field(default_factory=datetime.utcnow)
    recent_context: List[Dict[str, Any]] = Field(default_factory=list)
