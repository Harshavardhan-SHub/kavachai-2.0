# Architecture Specifications - Kavach-AI

This document details the engineering architecture, data pipelines, API integrations, and internal threat assessment logic powering **Kavach-AI**.

---

## 🏗️ System Architecture Overview

Kavach-AI is built on a client-server architecture. The frontend handles authentication, onboarding, audio recording, and visual status dashboards. The backend acts as the fraud intelligence engine, orchestrating interactions with external AI models and communication endpoints.

```mermaid
graph TD
    subgraph Frontend [Next.js Client App]
        A[Auth Splash Portal] --> B[OTP Verification]
        B --> C[Profile Onboarding]
        C --> D[Unified Dashboard]
        D -->|Text Input| E[SMS Analysis View]
        D -->|Audio Recording| F[Voice Call Analysis View]
        D -->|User Preferences| G[Settings & Logs]
    end

    subgraph Backend [FastAPI Intelligence Server]
        H[Authentication Service]
        I[Profile Service]
        J[Translation & STT Service]
        K[Threat Evaluation Engine]
        L[Warning Generation Service]
        M[Guardian Notification Service]
        N[(Local Database - JSON DB)]
    end

    subgraph ExternalServices [Third-Party AI & APIs]
        O[Twilio Verify API]
        P[Twilio SMS API]
        Q[Sarvam AI API]
        R[Google Gemini API]
    end

    %% Client-Server Connections
    B <-->|SMS OTP Validation| H
    C <-->|Read / Write Profiles| I
    E & F <-->|Submit Raw Input| J
    J <-->|Analyze / Score| K
    K <-->|Speech Warning| L
    K <-->|Notify Alerts| M
    
    %% Local DB bindings
    I <-->|Store Profiles| N
    K <-->|Write Incident Logs| N
    
    %% Backend-External service binds
    H <-->|Request Verification| O
    M <-->|Send SMS| P
    J <-->|STT & Translate| Q
    L <-->|Generate TTS warning| Q
    K <-->|Scam Assessment| R
```

---

## 🧠 AI Pipeline & Threat Detection Workflow

The core pipeline processes raw inputs, normalizes them, assesses threats, and executes mitigation steps:

```mermaid
sequenceDiagram
    autonumber
    actor User as Protected User
    participant App as Next.js Client
    participant API as FastAPI Backend
    participant Sarvam as Sarvam AI
    participant Gemini as Gemini Flash
    participant Twilio as Twilio API
    actor Guardian as Registered Guardian

    User->>App: Input SMS Text or Voice Recording
    alt Input is Voice Audio
        App->>API: POST /api/translate-input (audio file)
        API->>Sarvam: Speech-to-Text Transcription (Sarvam STT)
        Sarvam-->>API: Transcribed Text
        API->>Sarvam: Translation to English (Sarvam Translate)
        Sarvam-->>API: Normalized English Text
    else Input is SMS Text
        App->>API: POST /api/translate-input (raw text)
        API->>Sarvam: Translation to English (Sarvam Translate)
        Sarvam-->>API: Normalized English Text
    end
    API-->>App: Return Translated English Text
    
    App->>API: POST /api/analyze-threat (normalized text)
    API->>Gemini: Threat Assessment (Prompt detailing Scam taxonomies)
    Gemini-->>API: Structured JSON (Score, Risk Level, Threat Type, Reason, Warning)
    
    alt Verdict is HIGH THREAT
        API->>Sarvam: POST /api/generate-warning-audio (Hindi TTS Warning)
        Sarvam-->>API: Base64 Audio warning stream
        API->>Twilio: Send SMS Alert (Twilio SMS)
        Twilio-->>Guardian: Deliver SMS: "KAVACH-AI ALERT: Phishing detected on Harsha's device..."
        API->>API: Log incident to history.json (sms_status = Sent)
    else Verdict is SUSPICIOUS or SAFE
        API->>API: Log incident to history.json (sms_status = Not Sent)
    end
    
    API-->>App: Return Analysis Verdict & Incident Log ID
    App->>User: Play warning audio (if HIGH) and display alert report
```

---

## 📡 API Flow & Data Contracts

### 1. Verification & Authentication Flow

#### Send OTP
* **Endpoint**: `POST /api/auth/send-otp`
* **Request Payload**:
  ```json
  {
    "phone_number": "+916301929637"
  }
  ```
* **Response**:
  ```json
  {
    "otp_sent": true
  }
  ```

#### Verify OTP
* **Endpoint**: `POST /api/auth/verify-otp`
* **Request Payload**:
  ```json
  {
    "phone_number": "+916301929637",
    "otp_code": "123456"
  }
  ```
* **Response**:
  ```json
  {
    "verified": true
  }
  ```

---

### 2. Profile Management Flow

#### Save/Update Profile
* **Endpoint**: `POST /api/profile`
* **Request Payload**:
  ```json
  {
    "phone_number": "+916301929637",
    "protected_name": "Harsha",
    "guardian_number": "+919346694088",
    "preferred_language": "te-IN",
    "notify_high": true,
    "notify_suspicious": true,
    "profile_completed": true
  }
  ```
* **Response**:
  ```json
  {
    "status": "success",
    "message": "Profile saved successfully."
  }
  ```

#### Fetch Profile
* **Endpoint**: `GET /api/profile?phone_number=+916301929637`
* **Response**:
  ```json
  {
    "phone_number": "+916301929637",
    "protected_name": "Harsha",
    "guardian_number": "+919346694088",
    "preferred_language": "te-IN",
    "notify_high": true,
    "notify_suspicious": true,
    "profile_completed": true
  }
  ```

---

### 3. Incident Scan & Analysis Flow

#### Step 1: Input Normalization (Translation / STT)
* **Endpoint**: `POST /api/translate-input`
* **Payload**: Form-data with optional `text` or `file` (audio WAV/MP3) and `language_code` (e.g. `hi-IN`).
* **Response**:
  ```json
  {
    "input_type": "text",
    "original_text": "प्रिय ग्राहक, आपका SBI योनो खाता ब्लॉक हो गया है...",
    "translated_text": "Dear customer, your SBI Yono account has been blocked...",
    "detected_language": "hi-IN",
    "source": "Sarvam Translate"
  }
  ```

#### Step 2: Threat Evaluation
* **Endpoint**: `POST /api/analyze-threat`
* **Request Payload**:
  ```json
  {
    "text": "Dear customer, your SBI Yono account has been blocked...",
    "input_type": "SMS",
    "guardian_enabled": true,
    "guardian_on_suspicious": false
  }
  ```
* **Response**:
  ```json
  {
    "analysis": {
      "threat_score": 95,
      "confidence_score": 98,
      "risk_level": "HIGH THREAT",
      "threat_type": "Phishing / Impersonation",
      "reason_flags": [
        "Urgent action required",
        "Impersonating financial institution",
        "Suspicious link included"
      ],
      "recommended_action": "Do not click the link. Block this contact immediately.",
      "warning_speech_text": "कृपया ध्यान दें, यह संदेश एक बैंक धोखाधड़ी का प्रयास हो सकता है। लिंक पर क्लिक न करें।"
    },
    "logged_id": "scam-1781414337234",
    "timestamp": "2026-06-14T10:52:17.234123"
  }
  ```

---

## 🛡️ Decision Engine Threat Scoring Thresholds

Gemini generates a numerical threat score from `0` to `100`. The backend and frontend categorize risk levels according to the following thresholds:

| Threat Score | Risk Level | Actions Executed |
| :---: | :--- | :--- |
| **0 - 39** | `SAFE` | Render green UI; log as legitimate transaction; no alarms. |
| **40 - 69** | `SUSPICIOUS` | Render amber UI; warn the user visually on dashboard; log history. Trigger Guardian SMS only if `notify_suspicious` is enabled. |
| **70 - 100** | `HIGH THREAT` | Render red UI with pulse animations; generate and play localized voice warnings via Sarvam TTS; dispatch Twilio Guardian alert SMS. |

---

## 📢 Guardian Alert Notification Format

When a `HIGH THREAT` incident triggers an alert, the backend sends a Twilio SMS alert containing the protected user's name and details of the scam:

```
KAVACH-AI ALERT
Potential fraud detected on protected user device.
Protected User: {user_name}
Threat Type: {scam_type}
Risk Score: {threat_score}
Please contact the protected user immediately.
```
This alert provides the guardian with context so they can contact the vulnerable user immediately and prevent financial loss.
