# 🚀 Hybrid Auth Starter Template (Vite + FastAPI)

A production-ready starter template featuring a **Hybrid Authentication System** that supports both **Microsoft Entra ID (OIDC)** and **Local Username/Password** login. Built with a premium "Glassmorphism" UI and strictly typed architecture.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_18-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![Tailwind](https://img.shields.io/badge/style-Tailwind_CSS-38B2AC.svg)

## ✨ Features

- **🔐 Dual Authentication**: Seamlessly switch between Enterprise SSO (Microsoft OIDC) and Local Auth.
- **🛡️ Unified Identity**: A single `User` object and `AuthContext` normalizes data from both sources.
- **👮 Role-Based Access Control (RBAC)**: Protect routes and components with `<RoleGate allowedRoles={['Admin']} />`.
- **💎 Premium UI**: Modern Glassmorphism design system using Tailwind CSS.
- **🐛 Dev Tools**: Built-in `TokenInspector` to view raw ID tokens and claims in real-time.
- **⚡ High Performance**: Vite for instant HMR and FastAPI for high-throughput responses.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (v4 compatible via PostCSS)
- **Auth**: `@azure/msal-browser` & `@azure/msal-react`
- **Component Library**: Custom Glassmorphism Components
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Database**: SQLite (SQLAlchemy ORM)
- **Validation**: Pydantic v2
- **Auth**: OAuth2 with Password Flow (JWT) + Hashing (Bcrypt)

---

## 🚀 Getting Started

### 1. Backend Setup

Navigate to the `backend` directory and set up the Python environment.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt # Or manually install dependencies below
pip install fastapi uvicorn sqlalchemy pydantic "passlib[bcrypt]" "python-jose[cryptography]" python-multipart
```

Start the API server:

```bash
uvicorn app.main:app --reload
```
*The backend runs on `http://localhost:8000` (Swagger docs at `/docs`).*

> **First Run**: The app will automatically create a `sql_app.db` SQLite file in the directory.

---

### 2. Frontend Setup

Navigate to the `frontend` directory.

```bash
cd frontend
npm install
```

**Configuration**:
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and add your Microsoft Entra ID (Azure AD) details:
   ```env
   VITE_ENTRA_CLIENT_ID=your_client_id_here
   VITE_ENTRA_TENANT_ID=your_tenant_id_here
   ```

Start the development server:

```bash
npm run dev
```
*The frontend runs on `http://localhost:5173`.*

---

## 👩‍💻 Usage

### Default Admin User (Local Auth)
To test the local login without setting up a database manually, run this command to seed a default admin user:

```bash
curl -X POST http://localhost:8000/setup
```

Then log in with:
- **Username**: `admin`
- **Password**: `password`

### OIDC Login
Click the **"Sign in with Microsoft"** button on the login page. Ensure your Azure App Registration has `http://localhost:5173` added as a **Single Page Application (SPA)** Redirect URI.

---

## 📂 Project Structure

```bash
/
├── backend/
│   ├── app/
│   │   ├── auth.py          # 🔐 JWT & Password Hashing logic
│   │   ├── models.py        # 🗄️ Database Models (User)
│   │   ├── routes.py        # 🛣️ API Endpoints (/token, /me)
│   │   └── main.py          # 🚀 App Entry Point & CORS
│   └── sql_app.db           # 💾 Local Database (Auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── auth/            # ☁️ MSAL Config & Claims Parsing
│   │   ├── context/         # 🧠 AuthContext (The "Brain" of the auth)
│   │   ├── components/      # 🧩 UI Components (RoleGate, TokenInspector)
│   │   ├── pages/           # 📄 Route Pages (LoginPage)
│   │   └── App.tsx          # 🚦 Routing Logic
│   └── tailwind.config.js   # 🎨 Design System Config
└── README.md
```

## 🔒 Security Notes
- **JWT Secret**: The backend uses a hardcoded secret key in `auth.py`. **Change this before production!**
- **Token Storage**: Local tokens are stored in `localStorage` for simplicity. For high-security apps, consider HttpOnly cookies.

## 📄 License
MIT
