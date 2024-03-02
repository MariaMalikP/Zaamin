import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import '../styles/header.css';
import Sidebar from './Sidebar';

export const Header = ({ email, userProfile }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div>
            <nav>
                <img src="/images/logo.png" alt="Logo" className="logo" />
                <ul>
                    <li>
                        <input type="text" id="search-bar" placeholder="Search..." />
                    </li>
                    <li><Link to="/home"><img src="/images/home_icon.png" alt="Home" /></Link></li>
                    <li><button onClick={toggleSidebar}><img src="/images/navigation-icon.png" alt="SideBar" /></button></li>
                    {/* checks if userprofile and image link existst */}
                    {userProfile && userProfile.Profile_Image && ( 
                        <li><Link to={`/profilehome/${email}`}><img src={userProfile.Profile_Image} alt='Profile' className="profile-image"/></Link></li>
                    )}
                </ul>
            </nav>
            <Sidebar isOpen={isSidebarOpen} />
        </div>
    );
};

export default Header;