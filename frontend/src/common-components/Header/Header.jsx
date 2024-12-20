import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { Menu } from "primereact/menu";
import useAuth from "hooks/useAuth";
import { axios } from "lib/axios";
import useError from "hooks/useError";

const Header = () => {
    const navigate = useNavigate();
    const [userMenuVisible, setUserMenuVisible] = useState();
    const userMenuRef = useRef();
    const { setErrorRef } = useError();
    const { user, setIsLoggedIn, setUser } = useAuth();

    const handleLogout = async () => {
        try {
            await axios.post("/auth/logout");
            setIsLoggedIn(false);
            setUser(null);
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            navigate("/login");
        } catch (error) {
            setErrorRef.current(error);
        }
    };

    const userMenuOptions = [
        {
            items: [
                {
                    label: "Profile",
                    icon: "pi pi-user",
                    command: () => {
                        navigate("/profile");
                    }
                },
                {
                    label: "Logout",
                    icon: "pi pi-sign-out",
                    command: () => {
                        handleLogout();
                    }
                }
            ]
        }
    ];
    const handleMenuToggle = (event) => {
        setUserMenuVisible((prev) => !prev);
        userMenuRef.current.toggle(event);
    };
    return (
        <header className="header-container">
            <div className="header-left-container h18">Rides Management</div>
            <div className="header-right-container h14">
                {user.role === "driver" && user.status === "pending" ?
                    <span className="header-status">Status: Pending</span> : null}
                <Link to="/" className="header-link">
                    Home
                </Link>
                {user?.role === "rider" ?
                    <Link to="/history" className="header-link">
                        History
                    </Link> : null}
                {user?.role === "admin" ?
                    <Link to="/requests" className="header-link">
                        Requests
                    </Link> : null}
                <div
                    id="header-usermenu-container"
                    className="header-user-menu-container cyb-pt-16"
                    onClick={handleMenuToggle}
                >
                    <i className="pi pi-user" />
                    <p className="t14">{user?.username}</p>
                    <i className={userMenuVisible ? "pi pi-angle-up" : "pi pi-angle-down"} />
                </div>
                <Menu
                    id="header-usermenu"
                    className="header-user-menu"
                    onHide={() => setUserMenuVisible(false)}
                    model={userMenuOptions}
                    popup
                    ref={userMenuRef}
                />
            </div>
        </header>
    );
};

export default Header;
