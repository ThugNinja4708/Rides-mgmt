import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header>
            <div className="t16">Rides Management</div>
            <nav>
                <ul>
                    <li><Link to="/">Dashboard</Link></li>
                    <li><Link to="/createRide">Create Ride</Link></li>
                    <li><Link to="/bookRide">Book Ride</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/updateRide">Update Ride</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;