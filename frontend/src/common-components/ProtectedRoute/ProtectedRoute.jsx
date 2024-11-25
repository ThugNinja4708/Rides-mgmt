import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ requiredRole }) => {
    const {user, isLoggedIn}  = useAuth();

    if (!(isLoggedIn && user.current)) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user.current?.role !== requiredRole) {
        // {navigate to authorized page}
        return <Navigate to="/notAuthorized" />;
    }
    return <Outlet />;
};

export default ProtectedRoute;