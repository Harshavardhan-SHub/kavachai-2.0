import json
import os
from typing import Dict, Optional
from datetime import datetime
from whatsapp.models.session import UserSession
from whatsapp.utils.constants import STATE_ACTIVE

class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, UserSession] = {}

    def get_session(self, phone_number: str) -> UserSession:
        if phone_number not in self._sessions:
            # Create a default session for new conversation flow
            self._sessions[phone_number] = UserSession(phone_number=phone_number)
        
        # Update last interaction timestamp
        self._sessions[phone_number].last_interaction = datetime.utcnow()
        return self._sessions[phone_number]

    def update_session(self, phone_number: str, **kwargs) -> UserSession:
        session = self.get_session(phone_number)
        for key, value in kwargs.items():
            if hasattr(session, key):
                setattr(session, key, value)
        return session

    def clear_session(self, phone_number: str):
        if phone_number in self._sessions:
            del self._sessions[phone_number]

session_manager = SessionManager()
