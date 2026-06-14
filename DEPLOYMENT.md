# Deployment Guide - Kavach-AI

This guide provides instructions for deploying the **Kavach-AI** system to production. The frontend is built using Next.js and optimized for **Vercel**, and the backend is built using FastAPI and optimized for **Render**.

---

## 🎨 Frontend Deployment (Vercel)

Vercel is the recommended hosting platform for the Next.js frontend.

### Steps:
1. Sign in to your [Vercel Account](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import the `Kavach-AI` GitHub repository.
4. Set the **Root Directory** option to `frontend`.
5. Under **Build & Development Settings**, keep the default values:
   * **Build Command**: `next build` (or `npm run build`)
   * **Output Directory**: `.next`
   * **Install Command**: `npm install`
6. Add the following **Environment Variables**:
   * `NEXT_PUBLIC_BACKEND_URL`: The production URL of your deployed backend (e.g., `https://kavach-backend.onrender.com`). *Do not include a trailing slash.*
7. Click **Deploy**. Vercel will build and provision your SSL certificate automatically.

---

## ⚙️ Backend Deployment (Render)

Render is a modern cloud hosting platform suitable for running Python FastAPI applications.

### Steps:
1. Sign in to your [Render Account](https://render.com).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   * **Name**: `kavach-backend`
   * **Environment**: `Python3`
   * **Root Directory**: `backend`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Advanced** and add your **Environment Variables** (see list below).
6. Click **Create Web Service**. Render will build and deploy the backend.

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`):
| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `PORT` | No | Server port (default: `8000`) |
| `HOST` | No | Server host (default: `0.0.0.0`) |
| `GEMINI_API_KEY` | Yes | Google Gemini Flash API Key for threat analysis |
| `SARVAM_API_KEY` | Yes | Sarvam AI API Key for speech-to-text, translation, and TTS |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio Account SID for sending guardian SMS alerts |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio Auth Token for sending guardian SMS alerts |
| `TWILIO_PHONE_NUMBER` | Yes | Verified Twilio phone number sending the alerts |
| `TWILIO_VERIFY_SERVICE_SID` | Yes | Twilio Verify Service SID for SMS OTP authentication |

### Frontend (`frontend/.env`):
| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | The base URL of the deployed FastAPI backend |

---

## 🛠️ Troubleshooting & Common Errors

### 1. CORS Errors on Frontend
* **Symptom**: The frontend console shows `Access-Control-Allow-Origin` errors when calling authentication or profile APIs.
* **Resolution**: In `backend/app/main.py`, verify that the `CORSMiddleware` configuration allows the frontend URL:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"], # Update in production to specific frontend domain
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

### 2. Twilio Authentication or Send Failure
* **Symptom**: OTP requests or guardian notifications fail with a `500 Server Error`.
* **Resolution**:
  * Double check that the phone numbers are formatted with country codes (e.g. `+919876543210`).
  * Check backend logs on Render to see if the Twilio API returned an invalid credentials exception.
  * Ensure your Twilio balance is sufficient and your phone numbers are verified.

### 3. Server Startup Timeout on Render
* **Symptom**: Render deployment fails with a `Service health check failed` or timeout error.
* **Resolution**: Render automatically assigns a port through the `$PORT` environment variable. Ensure the start command uses `--host 0.0.0.0 --port $PORT` to bind correctly.
