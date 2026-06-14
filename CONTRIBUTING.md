# Contributing to Kavach-AI

Thank you for your interest in contributing to Kavach-AI! We welcome all contributions to help secure vulnerable users against financial fraud, phishing, and social engineering scams.

Please follow these guidelines to ensure a smooth collaboration process.

---

## 🚀 Local Setup

### 1. Prerequisites
Before getting started, make sure you have the following installed:
* **Node.js** (v18.x or higher) & **npm** (v9.x or higher)
* **Python** (v3.10.x or higher) & **pip**
* **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/Krishnasaivarmakalidindi/Kavach-AI.git
cd Kavach-AI
```

### 3. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   Copy `.env.example` (or create `.env`) and add your keys:
   ```env
   PORT=8000
   HOST=0.0.0.0
   GEMINI_API_KEY=your_gemini_api_key
   SARVAM_API_KEY=your_sarvam_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
   ```
5. Run the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### 4. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🌿 Branch Strategy

We use a lightweight branching model tailored for rapid iteration:

* **`main`**: Production-ready code. Never commit directly to `main`.
* **`dev`**: Integration branch for features and fixes.
* **Feature branches (`feature/name-of-feature`)**: Created off `dev` for active feature development.
* **Bugfix branches (`bugfix/issue-description`)**: Created off `dev` to patch immediate bugs.

### Branch Lifecycle Workflow:
1. Pull latest changes from `dev`: `git checkout dev && git pull`
2. Create a new branch: `git checkout -b feature/awesome-feature`
3. Commit and push your changes.
4. Open a Pull Request targeting the `dev` branch.

---

## 📝 Commit Conventions

We enforce **Conventional Commits** to keep the commit history clean and structured:

```
<type>(<scope>): <short summary>

[optional body]
```

### Allowed Types:
* **`feat`**: A new feature for the user
* **`fix`**: A bug fix for the user
* **`docs`**: Changes to the documentation
* **`style`**: Formatting, semi-colons, CSS styling (no functional code changes)
* **`refactor`**: Restructuring code without changing user-facing functionality
* **`test`**: Adding missing tests or correcting existing tests
* **`chore`**: Maintenance tasks, dependency updates, build config changes

### Example Commit Messages:
* `feat(auth): integrate Twilio Verify API for OTP logins`
* `fix(dashboard): prevent UI layout shift on threat detection pulse`
* `docs(readme): update installation instructions and environment variables`

---

## 🔀 Pull Request Process

1. **Verify Builds**: Before submitting a PR, make sure the Next.js frontend builds without errors (`npm run build` in `frontend/`) and the FastAPI backend starts up successfully.
2. **Open PR**: Push your branch and open a PR against the `dev` branch.
3. **Describe Changes**: Provide a clear explanation of what your changes accomplish, any testing you've done, and link relevant issues.
4. **Code Review**: At least one maintainer must review and approve the PR before it is merged.
5. **Merge**: Once approved, branch will be merged into `dev` using **Squash and Merge**.

---

## ⚖️ License
By contributing, you agree that your contributions will be licensed under the project's **MIT License**.
