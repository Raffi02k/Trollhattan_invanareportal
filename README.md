# Invånareportal - Trollhättans Stad

En modern och säker plattform för invånare i Trollhättans Stad att hantera sina ärenden, se personlig information och kommunicera med kommunen. Portalen fungerar som en central knutpunkt ("Mina Sidor") för digitala tjänster.

![Trollhättan Logo](https://www.trollhattan.se/templates/trollhattan/assets/images/logo.svg)

## Syfte och Mål
Projektet syftar till att leverera en sammanhållen användarupplevelse för medborgare genom att aggregera data från flera kommunala system. Den är byggd med en **BFF-arkitektur (Backend-for-Frontend)** för att säkerställa hög prestanda och säkerhet.

## Huvudfunktioner
- **Mina Ärenden:** Integration med **Open ePlatform (OeP)** för att visa pågående och avslutade ärenden.
- **Profil och Personuppgifter:** Visning av folkbokföringsdata via integration med **Navet** och **Party API**.
- **Säker Inloggning:** Stöd för **BankID** via Microsoft Entra ID (OIDC) samt lokal behörighetshantering.
- **Unified Dashboard:** En översiktlig vy inspirerad av moderna e-tjänsteportaler.

## Teknisk Stack
### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** för modern och responsiv design.
- **MSAL** (`@azure/msal-browser`) för OIDC-autentisering.

### Backend (BFF)
- **FastAPI** (Python) för snabb och asynkron API-hantering.
- **SQLAlchemy** + **SQLite** för lokal datalagring.
- **Integrationer:** Moduler för OeP, Navet och Party API.

---

## Kom igång

### Backend (FastAPI)
1. Navigera till `backend/`-katalogen.
2. Skapa och aktivera en virtuell miljö:
   ```bash
cd backend
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Installera beroenden:
   ```bash
   pip install -r requirements.txt
   ```

Create a `.env` in `backend/`:
```env
SECRET_KEY=change_me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Required only if validating OIDC access tokens
OIDC_ISSUER=https://login.microsoftonline.com/<TENANT_ID>/v2.0,https://sts.windows.net/<TENANT_ID>/
OIDC_AUDIENCE=<API-CLIENT-ID-or-App-ID-URI>
OIDC_JWKS_URL=https://login.microsoftonline.com/<TENANT_ID>/discovery/v2.0/keys

# OIDC policy (minimal)
OIDC_REQUIRED_SCOPES=access_as_user
OIDC_JWKS_CACHE_TTL_SECONDS=3600

# Dev-only setup endpoint
ENABLE_DEV_SETUP=true

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.example.com
```

Start the API:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend (Vite + React)
1. Navigera till `frontend/`-katalogen.
2. Installera beroenden:
   ```bash
cd frontend
   npm install
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_ENTRA_CLIENT_ID=<SPA-CLIENT-ID>
VITE_ENTRA_TENANT_ID=<TENANT-ID>

# Optional, required only if calling backend with OIDC access tokens
VITE_ENTRA_API_SCOPE=api://<API-CLIENT-ID>/access_as_user
```

Start the UI:
   ```bash
   npm run dev
   ```

## Usage
### Local Auth (JWT)
Seed a default local admin:
```bash
curl -X POST http://localhost:8000/setup
```

Login with:
- username: `admin`
- password: `password123`

### OIDC Login (Frontend)
Use **Sign in with Microsoft**. MSAL handles login and user identity in the UI.

### OIDC Access Token to Backend (Optional)
If you want to protect API endpoints with Entra tokens:
1. Create an **API App Registration** and expose a scope (e.g. `access_as_user`).
2. Set `VITE_ENTRA_API_SCOPE` in the frontend.
3. Set `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_JWKS_URL` in the backend.

Then call protected endpoints with `Authorization: Bearer <access_token>`.

## Project Structure
```bash
/
├── backend/
│   ├── app/
│   │   ├── auth/            # Hybrid Auth orchestration
│   │   │   ├── __init__.py  # Hybrid auth logic
│   │   │   ├── local_jwt.py # Local JWT management
│   │   │   └── oidc.py      # OIDC/Entra ID validation
│   │   ├── routers/         # API Endpoints
│   │   │   ├── local_auth.py # /token, /me
│   │   │   ├── oidc_auth.py  # /me/oidc
│   │   │   └── api.py        # /users, /status
│   │   ├── db.py            # Database configuration
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── seed.py          # Database seeding
│   │   └── main.py          # FastAPI app entry
│   └── sql_app.db           # SQLite database
├── frontend/
│   ├── src/
│   │   ├── auth/            # MSAL config + claims helpers
│   │   ├── context/         # AuthContext (unified user)
│   │   ├── components/      # RoleGate, TokenInspector, UI blocks
│   │   ├── pages/           # LoginPage, HomePage
│   │   └── App.tsx          # Router + auth guards
└── README.md
```

## Security Notes
- Keep `SECRET_KEY` secret and rotate in production.
- Local JWTs are stored in `localStorage` (simple dev flow). For higher security, consider HttpOnly cookies.

## Production Checklist
- Set `CORS_ALLOWED_ORIGINS` to your real frontend domains.
- Require scopes via `OIDC_REQUIRED_SCOPES`.
- Use API scopes (`VITE_ENTRA_API_SCOPE`) and access tokens for backend protection.
- Disable dev setup endpoint (`ENABLE_DEV_SETUP=false`).
- Add database migration for `is_disabled` and manage account lockouts.

## Licens
MIT - Trollhättans Stad
