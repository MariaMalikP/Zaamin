import React, { useState, useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import '../styles/header.css';
import Sidebar from './Sidebar';

const CustomAlert = ({ message, onClose }) => (
    <div className="custom-alert">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
    </div>
);

const Header = ({ email, userProfile }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    const [role, setRole] = useState("");


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSearch = async () => {
        navigate(`/searchres/${email}/${searchTerm}`);
      };
      useEffect(() => {
        const fetchRole = async () => {
          try {
            const userResponse = await axios.post('http://localhost:3000/findrole', { email });
            if (userResponse.data !== 'User profile not found') {
              setRole(userResponse.data); 
            //   window.alert(role);
            }
          } catch (error) {
            console.error('Error fetching role Information', error);
          }
        };
      
        fetchRole();
      }, [email]);

    useEffect(() => {
        console.log("found search results", searchResults);
    }, [searchResults]);

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    return (
        <div>
            <nav>
                <img src="/images/logo.png" alt="Logo" className="headerlogo" />
                <ul>
                    <li>
                        <input
                            type="text"
                            id="search-bar"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={handleSearch} className="custom-button">||</button>
                    </li>
                    <li>
                        {userProfile && role === "manager" ? (
                            <Link to={`/managerhome/${email}`}>
                                <img src="/images/home_icon.png" alt="Home" />
                            </Link>
                        ) : userProfile && role === "admin" ? (
                            <Link to={`/adminhome/${email}`}>
                                <img src="/images/home_icon.png" alt="Home" />
                            </Link>
                        ) : (
                            <Link to={`/employeehome/${email}`}>
                                <img src="/images/home_icon.png" alt="Home" />
                            </Link>
                        )}
                    </li>
                    <li><button onClick={toggleSidebar}><img src="/images/navigation-icon.png" alt="SideBar" /></button></li>
                    {userProfile && userProfile.Profile_Image && ( 
                        <li>
                            <Link to={`/profilehome/${email}/${role}`}>
                                <img src={userProfile.Profile_Image} alt='Profile' className="profile-image"/>
                            </Link>
                        </li>                    
                    )}
                </ul>
            </nav>
            <Sidebar isOpen={isSidebarOpen} />
            {showAlert && <CustomAlert message={alertMessage} onClose={handleCloseAlert} />}
        </div>
    );
};

export default Header;
