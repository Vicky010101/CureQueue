import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ roles }) {
	const location = useLocation();
	const { isAuthenticated, user, isInitializing } = useAuth();

	// Don't render anything while checking authentication status
	if (isInitializing) {
		return null; // The loading state is handled at the App level
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated || !user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	// Check role-based permissions
	if (roles && Array.isArray(roles) && roles.length > 0) {
		if (!user.role || !roles.includes(user.role)) {
			return <Navigate to="/login" replace />;
		}
	}

	return <Outlet />;
}

export default ProtectedRoute;


