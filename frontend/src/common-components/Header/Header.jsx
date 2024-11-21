import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { Menu } from 'primereact/menu';
import useAuth from "hooks/useAuth";

const Header = () => {
    const [userMenuVisible, setUserMenuVisible] = useState()
    const userMenuRef = useRef();
    const {user} = useAuth()

    const userMenuOptions = [
        {
        label: 'Profile',
            items: [
                {
                    label: 'Settings',
                    icon: 'pi pi-cog'
                },
                {
                    label: 'Logout',
                    icon: 'pi pi-sign-out'
                }
            ]
        }
        ]
        const handleMenuToggle = (event) => {
            setUserMenuVisible((prev) => !prev);
            userMenuRef.current.toggle(event);
        };
    return (
        <header className="header-container">
            <div className="header-left-container t18">Rides Management</div>
            <div className="header-right-container t14">
                <Link to="/rides" className="header-link">Avilable rides</Link>
                <Link to="/bookings" className="header-link">Bookings</Link>
                <Link to="/history" className="header-link">History</Link>
            <div id="header-usermenu-container" className="header-user-menu-container cyb-pt-16" onClick={handleMenuToggle}>
                <i className="pi pi-user" />
                <p className="t14">{user.current.username}</p>
                <i className={userMenuVisible ? "pi pi-angle-up" : "pi pi-angle-down"}/>
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