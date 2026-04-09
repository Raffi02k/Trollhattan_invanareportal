# BFF - Invånarportalen Trollhättan

`bff/` ar portalens Backend-for-Frontend. Den hanterar session, SAML-inloggning och aggregerar data fran bakomliggande tjanster sa att frontend slipper prata direkt med flera integrationer.

## Ansvar

- SAML-login och logout
- sessionshantering
- anrop mot `citizen-api-trollhattan`
- anrop mot `contactsettings-api-trollhattan`
- samlade `/api/*`-endpoints till frontend

## Miljovariabler

Skapa en lokal `.env` utifran `.env.example`.

Viktigast:

- `PORT`
- `FRONTEND_URL`
- `SESSION_SECRET`
- `CITIZEN_API_URL`
- `CONTACT_SETTINGS_API_URL`
- `MUNICIPALITY_ID`
- `SAML_*`

## Starta lokalt

```bash
npm install
npm run dev
```

## Kommentar

Tjansten innehaller fortfarande mockad OeP-data for demo. Det ar medvetet i PoC:n och bor bytas mot riktig integration i nasta steg.
