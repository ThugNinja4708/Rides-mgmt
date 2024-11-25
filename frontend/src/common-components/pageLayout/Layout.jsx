import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header"
import "./Layout.css"

const Layout = () => {
    return (
        <div className="page">
            <header>
                <Header/>
            </header>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;