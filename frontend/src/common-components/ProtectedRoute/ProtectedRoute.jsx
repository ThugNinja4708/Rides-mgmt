import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ requiredRole }) => {
    const { user } = useAuth();
    
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/notAuthorized" replace/>;
    }

    return <Outlet />;
};

export default ProtectedRoute;