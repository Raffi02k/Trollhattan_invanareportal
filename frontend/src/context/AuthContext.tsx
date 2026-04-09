import React, { createContext, useContext, useEffect, useState } from "react";
import { InteractionStatus, PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { loginRequest, msalConfig, apiTokenRequest } from "../auth/msalConfig";
import axios from "axios";

// Initialize MSAL outside to pass to provider
export const msalInstance = new PublicClientApplication(msalConfig);

export interface UnifiedUser {
    id: string; // OID for OIDC, Database ID for Local
    name: string;
    username: string;
    role: string;
    authMethod: "oidc" | "local" | "saml";
    rawClaims?: any; // For debugging
    token?: string; // JWT for local, AccessToken for OIDC (if needed)
}

interface AuthContextType {
    user: UnifiedUser | null;
    isAuthenticated: boolean;
    loginLocal: (username: string, password: string) => Promise<void>;
    loginOidc: () => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Internal component to use MSAL hooks
const AuthProviderContent = ({ children }: { children: React.ReactNode }) => {
    const { instance, accounts, inProgress } = useMsal();
    const [user, setUser] = useState<UnifiedUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // [CRITICAL] Hybrid Auth Check:
    // 1. First, we check if an OIDC user is already logged in via MSAL (accounts.length > 0).
    // 2. If not, we check for a Local Auth JWT token in localStorage.
    // This ensures that the user session persists across reloads for both methods.
    const buildOidcUserFromAccount = async (account: (typeof accounts)[number]) => {
        let token: string | undefined = undefined;
        try {
            const tokenResponse = await instance.acquireTokenSilent({
                ...apiTokenRequest,
                account: account
            });
            token = tokenResponse.accessToken;
        } catch (e) {
            console.error("Failed to acquire silent token for OIDC user", e);
        }

        setUser({
            id: account.localAccountId,
            name: account.name || "",
            username: account.username,
            role: account.idTokenClaims ? String(account.idTokenClaims["roles"] ?? account.idTokenClaims["role"] ?? "User") : "User",
            authMethod: "oidc",
            rawClaims: account.idTokenClaims,
            token: token,
        });
    };

    useEffect(() => {
        // [CRITICAL FIX] MSAL 3.x starts with inProgress = "startup". We must let it finish "startup" before proceeding,
        // but we MUST NOT block on "none".
        if (inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.HandleRedirect) {
            return;
        }

        const checkSamlAuth = async (): Promise<boolean> => {
            try {
                const res = await axios.get("http://localhost:4000/api/auth/me", {
                    withCredentials: true,
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
                });
                console.log("[AUTH DEBUG] /api/auth/me response:", res.data);
                if (res.data && res.data.partyId) {
                    setUser({
                        id: res.data.partyId,
                        name: res.data.name,
                        username: res.data.personNumber,
                        role: res.data.role || "User",
                        authMethod: "saml",
                    });
                    return true; // Successfully authenticated via SAML
                }
            } catch (e) {
                // Not authenticated via SAML
            }
            return false;
        };

        const checkLocalAuth = async () => {
             // Local auth is now expected to be handled by the BFF if needed, 
             // or we can remove it if only SAML is favored.
             setIsLoading(false);
        };

        const checkOidcAuth = async () => {
            try {
                const account = accounts[0];
                instance.setActiveAccount(account);
                await buildOidcUserFromAccount(account);
            } catch (e) {
                console.error("OIDC session found but setup failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        if (accounts.length > 0) {
            setIsLoading(true);
            checkOidcAuth();
        } else {
            // First check SAML from BFF via cookies
            checkSamlAuth().then((hasSaml) => {
                if (!hasSaml) {
                    // Try local auth token
                    checkLocalAuth();
                } else {
                    setIsLoading(false);
                }
            });
        }
    }, [instance, accounts, inProgress]);

    const loginLocal = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            await axios.post("http://localhost:4000/api/auth/login", formData, { withCredentials: true });
            // ... handle response from BFF if we implement local login there
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
        setIsLoading(false);
    };

    const loginOidc = async () => {
        try {
            await instance.loginRedirect(loginRequest);
        } catch (error) {
            console.error(error);
        }
    };

    const logout = async () => {
        if (user?.authMethod === "oidc") {
            instance.logoutRedirect();
        } else {
            // For SAML (BFF) or Local
            try {
                // Always try to clear BFF session if it exists
                console.log("[AUTH DEBUG] Calling BFF logout...");
                await axios.post("http://localhost:4000/api/auth/logout", {}, { withCredentials: true });
                console.log("[AUTH DEBUG] BFF logout call finished.");
            } catch (e) {
                console.error("[AUTH DEBUG] Failed to logout from BFF", e);
            }
            
            localStorage.removeItem("local_token");
            setUser(null);
            window.location.href = "/login";
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginLocal, loginOidc, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <MsalProvider instance={msalInstance}>
            <AuthProviderContent>{children}</AuthProviderContent>
        </MsalProvider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
