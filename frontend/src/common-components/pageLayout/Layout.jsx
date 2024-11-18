import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header"

const Layout = () => {
    return (
        <div>
            <header>
                <Header/>

                {/* Add navigation links here */}
            </header>
            <main>
                <Outlet />
            </main>
            <footer>
                <p>App Footer</p>
            </footer>
        </div>
    );
};

export default Layout;