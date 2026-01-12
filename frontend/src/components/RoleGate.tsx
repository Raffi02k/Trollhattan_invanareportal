import React from "react";
import { useAuth } from "../context/AuthContext";

interface RoleGateProps {
    allowedRoles: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ allowedRoles, children, fallback }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    if (!user || !allowedRoles.includes(user.role)) {
        return <>{fallback || <div className="p-4 text-red-400">Access Denied: You do not have the required role ({allowedRoles.join(", ")}).</div>}</>;
    }

    return <>{children}</>;
};
