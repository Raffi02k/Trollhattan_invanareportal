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

Stoppa backend (om den hänger):

```bash
pgrep -f "uvicorn app.main:app"
kill -9 <PID> (36215)
```

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

## 📘 OIDC + Entra ID: Hur det fungerar

Detta projekt använder **OpenID Connect (OIDC)** via **Microsoft Entra ID**. OIDC bygger ovanpå OAuth 2.0 och levererar en **ID-token** som innehåller användarens identitet (claims), medan **access tokens** används för att anropa API:er.

> **Teknisk not (SPA):** MSAL använder normalt **Authorization Code Flow med PKCE**, vilket är standard för moderna Single Page Applications.

### 🔐 Tokens (snabbt)
- **ID token**: används för inloggning/identitet i frontend (t.ex. namn, e-post, roller/claims).
- **Access token**: används när du vill anropa API:er (t.ex. Microsoft Graph eller ditt eget backend-API).

### 🌐 Överblick av flödet (SPA)
- Frontend startar en inloggning via **MSAL** (Microsofts klientbibliotek).
- Entra ID autentiserar användaren (SSO) och returnerar tokens till frontend.
- Frontend tolkar claims och skapar en gemensam `User`-modell i `AuthContext`.
- Backend används för **lokal** inloggning (username/password).

> **Obs (denna template):** OIDC-inloggningen sker i frontend och backend skyddas inte av Entra-tokens i den här startern.  
> I en production-variant brukar man låta backend **validera access tokens (JWT)** för att skydda API-endpoints.

### ✅ Vad du behöver från Entra
- **Tenant ID (Directory ID)**: din organisations Entra-tenant.
- **Client ID (Application ID)**: ID för din app-registrering.
- **Redirect URI (SPA)**: `http://localhost:5173` (lokal dev).

### 👮 RBAC / Roller (valfritt men vanligt)
Om du vill använda roller i appen:
- Skapa **App Roles** i Entra App Registration och tilldela dem till användare/grupper.
- Roller kan sedan dyka upp i token som en `roles`-claim (beroende på konfiguration).
- Frontend kan mappa claims → app-roller och skydda UI med t.ex. `<RoleGate />`.

---

## 🔑 Så skaffar du Entra ID, Tenant ID och Client ID

1. Gå till **https://entra.microsoft.com** och logga in.
2. Öppna **Entra ID** (tidigare Azure AD).
3. **Tenant ID** hittar du under **Overview** → **Directory (tenant) ID**.
4. Gå till **App registrations** → **New registration**.
5. Ange namn, välj kontotyper och lägg till Redirect URI:
   - Platform: **Single-page application (SPA)**
   - URI: `http://localhost:5173`
6. Skapa appen. Nu ser du:
   - **Application (client) ID** = `VITE_ENTRA_CLIENT_ID`
   - **Directory (tenant) ID** = `VITE_ENTRA_TENANT_ID`

### 🔧 Koppla i projektet
Fyll i `.env` i `frontend`:

```env
VITE_ENTRA_CLIENT_ID=din_client_id
VITE_ENTRA_TENANT_ID=din_tenant_id


## ♻️ Att anvanda i andra projekt

- Skapa ny App Registration i Entra for varje projekt eller miljo.
- Uppdatera Redirect URI och klient-id i `.env`.
- Valj scopes/permissions om du ska anropa Microsoft Graph eller egna API:er.
- Behall samma flode: MSAL i frontend for OIDC, backend for lokal auth om behovs.

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
