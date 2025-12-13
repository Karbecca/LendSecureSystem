import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || !user.role) {
        return <Navigate to="/login" replace />;
    }

    // Safety check for allowedRoles array
    if (!allowedRoles || !Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        console.error("RoleGuard: allowedRoles must be a non-empty array");
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user's actual role
        const redirectPath = user.role === "Admin"
            ? "/admin"
            : user.role === "Lender"
                ? "/lender"
                : "/dashboard";

        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
}
