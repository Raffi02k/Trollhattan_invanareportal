# Invånarportalen - Trollhättan

Detta projekt ar portalens anvandargranssnitt och BFF-lager i Trollhattans PoC for invanarportal. Losningen ar inspirerad av Sundsvalls struktur men ar ombyggd for den lokala miljo som finns i det har testprojektet.

## Delar

- `frontend/` ar React-applikationen som invanaren anvander.
- `bff/` ar en Node/Express-baserad Backend-for-Frontend som skoter session, auth och integrationer.

## Teknik

- Frontend: React, TypeScript, Vite
- BFF: Node.js, Express, Passport, SAML
- Integrationer: `citizen-api-trollhattan`, `contactsettings-api-trollhattan`, mockad OeP

## Flode

1. Frontend skickar anvandaren till BFF for inloggning.
2. BFF skapar eller laser session.
3. BFF hamtar `partyId` via Citizen API.
4. BFF hamtar kontaktuppgifter via Contact Settings API.
5. Frontend renderar dashboard och profilinformation via BFF:ens `/api/*`-endpoints.

## Starta lokalt

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Anvand `frontend/.env.example` som mall for lokal `.env`.

### BFF

```bash
cd bff
npm install
npm run dev
```

Anvand `bff/.env.example` som mall for lokal `.env`.

## Beroenden

For att portalen ska fungera i stort behovs normalt:

- `citizen-api-trollhattan` pa `http://localhost:8080`
- `contactsettings-api-trollhattan` pa `http://localhost:8081`
- frontend pa `http://localhost:5173`
- bff pa `http://localhost:4000`

## Kommentar om PoC-status

Detta ar fortfarande en proof of concept. Vissa delar ar demo-orienterade, framfor allt den mockade OeP-tjansten och dev-login-flodet i BFF:en.
