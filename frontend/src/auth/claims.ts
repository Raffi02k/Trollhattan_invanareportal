import type { AccountInfo } from "@azure/msal-browser";

export const getPrimaryRole = (account: AccountInfo): string => {
    const roles = (account.idTokenClaims as any)?.roles || [];
    if (roles.includes("Admin")) return "Admin";
    if (roles.includes("Staff")) return "Staff";
    return "User";
};

export const getUserIdentity = (account: AccountInfo) => {
    return {
        name: account.name || "Unknown",
        username: account.username || "",
        oid: account.localAccountId,
    };
};
