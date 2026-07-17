# Kavach-AI 2.0 - WhatsApp Conversational Interface Layer

This directory contains the production-quality WhatsApp integration service for **Kavach-AI**. It functions as a conversational frontend interface, wrapping around the existing Kavach-AI FastAPI backend engine.

---

## 🏗️ Architecture & Workflow

The service acts as a transparent black-box client of the main backend:

```
User (WhatsApp) 
      │
      ▼
Meta Cloud API
      │
      ▼
GET/POST /webhook (whatsapp/webhook.py)
      │
      ▼
Message Router (whatsapp/router.py)
      │ (Loads Session)
      ▼
Intent Detector (whatsapp/services/intent_detector.py)
      │
      ├──► [Help / Support] ──► commands.py / onboarding.py (Buttons)
      ├──► [SMS Text Check] ──► sms.py ──► backend (/api/translate-input & /api/analyze-threat)
      ├──► [Screenshot Scan] ─► image.py ──► Simulated OCR ──► backend (/api/analyze-threat)
      └──► [Voice Notes] ─────► audio.py ──► backend STT & translate ──► threat analysis
```

---

## 📁 Folder Structure

```
whatsapp/
├── app.py                  # FastAPI Application Initialization
├── webhook.py              # Webhook endpoints (GET/POST /webhook)
├── router.py               # Session-aware Message Router
├── config.py               # Settings and configuration management
├── README.md               # Integration & Deployment Guide
├── middleware/
│   ├── __init__.py
│   ├── auth.py             # Signature validation (HMAC SHA256)
│   ├── logging.py          # Request logging and duration metrics
│   └── validation.py       # JSON schema checks
├── handlers/
│   ├── __init__.py
│   ├── sms.py              # Suspect SMS scanner handler
│   ├── image.py            # Screenshot scanner handler
│   ├── audio.py            # Voice note transcription scanner
│   ├── document.py         # PDF scanner handler
│   ├── commands.py         # Secondary slash commands handler (/start, /help, etc)
│   └── onboarding.py       # Onboarding flow handler (Name, Guardian Number, Language)
├── services/
│   ├── __init__.py
│   ├── whatsapp.py         # Outgoing Meta Graph API sender
│   ├── backend_client.py   # Client helper to Backend FastAPI services
│   ├── formatter.py        # Translates JSON results to WhatsApp Markdown
│   ├── media.py            # Temp audio/screenshot downlaoder from Meta
│   ├── session.py          # State/session cache management
│   └── intent_detector.py  # Message/Interactive payload parser
├── models/
│   ├── __init__.py
│   ├── message.py          # Pydantic schemas for Meta Webhook payload
│   ├── session.py          # Session tracking structure
│   └── response.py         # Outgoing WhatsApp request structure
│
└── utils/
    ├── __init__.py
    ├── constants.py        # Constants (states, intents, languages)
    └── helpers.py          # Utility helper modules
```

---

## ⚙️ Environment Variables Required

Create or append these to a `.env` file under `whatsapp/` (or set globally):

```env
WHATSAPP_TOKEN=your_meta_system_user_access_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_VERIFY_TOKEN=KAVACH_VERIFY_TOKEN_2026
WHATSAPP_APP_SECRET=your_meta_app_client_secret
BACKEND_URL=http://localhost:8000
PORT=8001
HOST=0.0.0.0
```

---

## 💬 Conversation Flow Documentation

1. **First-time Onboarding**:
   - User types "Hi" or sends `/start`.
   - Kavach-AI responds: `"Welcome to Kavach AI 2.0! To begin setup, please reply with your Full Name:"`
   - User replies: `"Harsha"`.
   - Bot asks for Designated Guardian number.
   - User sends guardian phone.
   - Bot asks for preferred warning dialect (Hindi/English/Telugu) using Meta Interactive Buttons.
   - Profile completion logs are saved to the backend database.
2. **Main Dashboard**:
   - Menu presents button options: `[Scan Message]`, `[View History]`, `[Help]`.
3. **SMS Analysis**:
   - User pastes a text. Bot evaluates, formats a beautiful warning report, and triggers SMS alert to the guardian if threat score >= 70%.

---

## 📨 Sample Payloads

### 1. Sample Incoming Webhook (Text Message)
```json
{
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
              "phone_number_id": "1002991028301"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Harshavardhan"
                },
                "wa_id": "919346694088"
              }
            ],
            "messages": [
              {
                "from": "919346694088",
                "id": "wamid.HBgLOTE5MzQ2Njk0MDg4FQIAERgSQjE4QTlENjk5OTkyQzVFRDczAA==",
                "timestamp": "1782290123",
                "text": {
                  "body": "Is this message a scam? Bank block notice."
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### 2. Sample Outgoing WhatsApp Reply (Scam Evaluation)
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "919346694088",
  "type": "text",
  "text": {
    "body": "🚨 *HIGH THREAT DETECTED*\n\n📊 *Scam Probability:* 92%\n🛡️ *Status:* ⚠️ *CRITICAL SCAM ALERT*\n🔍 *Type:* Bank Scam / Identity Theft\n\n📝 *Reasoning Flags:*\n• Urgent timeline demand\n• Request for OTP verification link\n\n💡 *Recommendation:*\nDo NOT click on the link or verify any information. Report the sender."
  }
}
```

### 3. Sample Backend Request to `/api/analyze-threat`
```json
{
  "text": "Dear customer, your SBI Yono account has been blocked. Click here to verify http://sbi-verify.net",
  "input_type": "SMS",
  "guardian_enabled": true,
  "guardian_on_suspicious": false
}
```

---

## 🚀 Deployment Guide

### 1. Install Dependencies
Run the installation inside the project workspace:
```bash
pip install httpx pydantic-settings fastapi uvicorn
```

### 2. Start Services
Make sure your existing backend server is running:
```bash
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

Start the WhatsApp service:
```bash
python -m uvicorn whatsapp.app:app --reload --port 8001
```

The Webhook verification url will be: `http://<your-server-domain-or-ngrok>/webhook`
