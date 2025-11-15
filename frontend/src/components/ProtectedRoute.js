import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ roles }) {
    const location = useLocation();
    const { isAuthenticated, user, isInitializing } = useAuth();

    if (isInitializing) {
        return null; // Loading UI handled at root App
    }

    // If not authenticated → send to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // If role requirement exists and user not permitted
    if (roles && Array.isArray(roles) && roles.length > 0 && !roles.includes(user.role)) {
        // Redirect to correct dashboard for their role
        const dashboardPath =
            user.role === "doctor"
                ? "/doctor-dashboard"
                : user.role === "admin"
                ? "/admin-dashboard"
                : "/patient-dashboard";

        return <Navigate to={dashboardPath} replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
