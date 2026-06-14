import os
import json
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
DB_FILE = os.path.join(DB_DIR, "history.json")
PROFILES_FILE = os.path.join(DB_DIR, "profiles.json")

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
    if not os.path.exists(PROFILES_FILE):
        with open(PROFILES_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)

def get_profile(phone_number: str) -> dict:
    init_db()
    try:
        with open(PROFILES_FILE, "r", encoding="utf-8") as f:
            profiles = json.load(f)
            return profiles.get(phone_number, {})
    except Exception:
        return {}

def save_profile(phone_number: str, profile_data: dict) -> bool:
    init_db()
    try:
        with open(PROFILES_FILE, "r", encoding="utf-8") as f:
            profiles = json.load(f)
        profiles[phone_number] = profile_data
        with open(PROFILES_FILE, "w", encoding="utf-8") as f:
            json.dump(profiles, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving profile: {e}")
        return False

def get_history():
    init_db()
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def add_log(log_entry):
    init_db()
    history = get_history()
    
    # Add unique ID and timestamp
    log_entry["id"] = f"scam-{int(datetime.now().timestamp() * 1000)}"
    log_entry["timestamp"] = datetime.now().isoformat()
    
    history.insert(0, log_entry)  # Add new items to the top
    # Limit to 50 items for dashboard performance
    history = history[:50]
    
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving to history: {e}")
        
    return log_entry

def update_log(log_id: str, updates: dict) -> bool:
    init_db()
    history = get_history()
    updated = False
    for entry in history:
        if entry.get("id") == log_id:
            entry.update(updates)
            updated = True
            break
    if updated:
        try:
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(history, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error updating history log: {e}")
    return False
