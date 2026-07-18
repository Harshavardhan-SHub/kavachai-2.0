# 🚀 Kavach-AI 2.0 — Quick Startup Guide

## Prerequisites

- Python 3.8+
- Virtual environment activated (`.venv/`)
- All dependencies installed (`pip install -r requirements.txt`)

## One-Command Startup (From Project Root)

### Start Backend (Port 8000)
```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

### Start WhatsApp Service (Port 8001)
```bash
python -m uvicorn whatsapp.app:app --reload --port 8001
```

## Two-Terminal Setup

**Terminal 1 — Backend:**
```bash
cd C:/Projects/Kavach-ai-2.0
python -m uvicorn backend.app.main:app --reload --port 8000
```

**Terminal 2 — WhatsApp:**
```bash
cd C:/Projects/Kavach-ai-2.0
python -m uvicorn whatsapp.app:app --reload --port 8001
```

## Access Services

### Backend API Documentation
- **URL:** `http://localhost:8000/docs`
- **Endpoints:**
  - `POST /api/analyze-threat` — Analyze SMS/text for scams
  - `POST /api/translate-input` — Translate text to English
  - `POST /api/notify-guardian` — Send guardian alerts
  - `GET /health` — Service health check

### WhatsApp Service Documentation
- **URL:** `http://localhost:8001/docs`
- **Endpoints:**
  - `GET /webhook` — Meta Cloud API verification
  - `POST /webhook` — Incoming message handler
  - `GET /health` — Service health check

## Expected Output

### Backend Startup
```
INFO:     Uvicorn running on http://127.0.0.1:8000
2026-07-18 01:25:37,616 [INFO] backend-service: Backend service starting on 0.0.0.0:8000
INFO:     Application startup complete.
```

### WhatsApp Startup
```
INFO:     Uvicorn running on http://127.0.0.1:8001
2026-07-18 01:25:43,048 [INFO] whatsapp-service: WhatsApp service starting on 0.0.0.0:8001
INFO:     Application startup complete.
```

## Configuration Files

### Root `.env`
Contains backend service configuration:
```
PORT=8000
HOST=0.0.0.0
GEMINI_API_KEY=<your-api-key>
USE_MOCK_GEMINI=False
SARVAM_API_KEY=<your-api-key>
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
```

### WhatsApp `.env`
Contains WhatsApp service configuration:
```
PORT=8001
HOST=0.0.0.0
BACKEND_URL=http://localhost:8000
META_VERIFY_TOKEN=<your-verify-token>
META_API_VERSION=v18.0
```

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F
```

### Module Not Found Error
Ensure you're running from the **project root** with `python -m`:
```bash
# ✅ CORRECT
python -m uvicorn backend.app.main:app --reload --port 8000

# ❌ WRONG (won't work)
cd backend && uvicorn app.main:app --reload --port 8000
```

### Import Errors
Verify virtual environment is activated:
```bash
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

## Validation Script

Run the included import validation:
```bash
python import_validation.py
```

Expected output:
```
✅ PASS — Backend Imports
✅ PASS — WhatsApp Imports
✅ PASS — Broken Imports Scan
🎉 ALL IMPORT VALIDATION TESTS PASSED!
```

## Import Patterns (For Developers)

### Backend Code
```python
# Always use absolute imports
from backend.app.config import GEMINI_API_KEY
from backend.app.services.gemini_service import analyze_text_threat
from backend.app.database import local_db
```

### WhatsApp Code
```python
# Always use local imports
from whatsapp.config import settings
from whatsapp.services.backend_client import backend_client
from whatsapp.handlers.sms import sms_handler
```

## Performance Tips

- **Hot Reload:** Use `--reload` flag during development (watches file changes)
- **Production:** Remove `--reload` for better performance
- **Logging:** Check logs for bottlenecks in threat analysis

## Testing

### Health Check
```bash
# Backend
curl http://localhost:8000/health

# WhatsApp
curl http://localhost:8001/health
```

### Sample Threat Analysis
```bash
curl -X POST http://localhost:8000/api/analyze-threat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your electricity connection will be disconnected",
    "input_type": "SMS",
    "guardian_enabled": true
  }'
```

## Next Steps

1. ✅ Verify both services start cleanly
2. ✅ Test `/docs` endpoints in browser
3. ✅ Configure Meta Cloud API webhook
4. ✅ Test with sample WhatsApp messages
5. 📝 Deploy using Docker or cloud platform

---

For more details, see `IMPORT_REFACTOR_REPORT.md`
