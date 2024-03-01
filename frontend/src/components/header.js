import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios'; // Import axios for making HTTP requests
import '../styles/header.css';
import Sidebar from './Sidebar';


export const Header = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        // Fetch profile image data from the database
        axios.get('your_backend_endpoint_to_fetch_profile_image')
            .then(response => {
                // If the request is successful, set the profile image data
                setProfileImage(response.data.profileImageUrl);
            })
            .catch(error => {
                console.error('Error fetching profile image:', error);
            });
    }, []); // Empty dependency array ensures the effect runs only once on component mount

    return (
        <div>
        <nav>
            <img src="/images/logo.jpg" alt="Logo" className="logo" />
            <ul>
                <li>
                    <input type="text" id="search-bar" placeholder="Search..." />
                </li>
                <li><Link to="/home"><img src="/images/home_icon.png" alt="Home" /></Link></li>
                <li><button onClick={toggleSidebar}><img src="/images/navigation-icon.png" alt="SideBar" /></button></li>
                <li><Link to="/profilehome"><img src="/images/profile.png" alt="Profile" className="profile-image" /></Link></li>
                {/* Check if profileImage is available, then display the profile image */}
                {profileImage && <li><Link to="/profilehome"><img src={profileImage} alt="Profile" className="profile-image" /></Link></li>}
            </ul>
        </nav>
                    <Sidebar isOpen={isSidebarOpen} />
       </div>
    );
};

export default Header;