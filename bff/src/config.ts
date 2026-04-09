import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: Number(process.env.PORT || 4000),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    sessionSecret: process.env.SESSION_SECRET || "super-secret-change-me",

    citizenApiUrl: process.env.CITIZEN_API_URL || "http://localhost:8080",
    contactSettingsApiUrl: process.env.CONTACT_SETTINGS_API_URL || "http://localhost:8081",
    municipalityId: process.env.MUNICIPALITY_ID || "1488",

    samlEntrySso: process.env.SAML_ENTRY_SSO || "",
    samlCallbackUrl:
        process.env.SAML_CALLBACK_URL ||
        "http://localhost:4000/api/auth/saml/callback",
    samlIssuer: process.env.SAML_ISSUER || "invanareportal-bff",

    samlIdpPublicCert: process.env.SAML_IDP_PUBLIC_CERT
        ? process.env.SAML_IDP_PUBLIC_CERT.replace(/\\n/g, "\n")
        : "",

    samlPrivateKey: process.env.SAML_PRIVATE_KEY
        ? process.env.SAML_PRIVATE_KEY.replace(/\\n/g, "\n")
        : "",

    samlLogoutUrl: process.env.SAML_LOGOUT_URL || "",
    samlLogoutCallbackUrl:
        process.env.SAML_LOGOUT_CALLBACK_URL ||
        "http://localhost:4000/api/auth/saml/logout/callback",
};