import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header"
import "./Layout.css"
import useAuth from "hooks/useAuth";
import { Navigate } from "react-router-dom";
const Layout = () => {
    const {loading, isLoggedIn} = useAuth();
    return loading ? 
    console.log("fetching details") : isLoggedIn ? (
        <div className="page">
            <header>
                <Header/>
            </header>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    ) : <Navigate to="/login" />;
};

export default Layout;