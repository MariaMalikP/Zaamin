
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/header.css';
import '../styles/sidebar.css'; // Import sidebar styles here
import { useNavigate } from 'react-router-dom';

const CustomAlert = ({ message, onClose }) => (
  <div className="custom-alert">
    <p>{message}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const Header = ({ email, userProfile, hashp }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

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

  const getHomePage = (role, email) => {
    switch (role) {
      case "manager":
        return `/managerhome/${email}/${hashp}`;
      case "admin":
        return `/adminhome/${email}/${hashp}`;
      default:
        return `/employeehome/${email}/${hashp}`;
    }
  };
  if (!role) {
    return null; // If role is not set, don't render anything
  }

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
            <Link to={getHomePage(role, email)}>
              <img src="/images/home_icon.png" alt="Home" />
            </Link>
          </li>
          <li><button onClick={toggleSidebar}><img src="/images/navigation-icon.png" alt="SideBar" /></button></li>
          {userProfile && userProfile.Profile_Image && ( 
            <li>
              <Link to={`/profilehome/${email}/${role}/${hashp}`}>
                <img src={userProfile.Profile_Image} alt='Profile' className="profile-image"/>
              </Link>
            </li>                    
          )}
        </ul>
      </nav>
      {/* Sidebar */}
      <div className={isSidebarOpen ? 'sidebar open' : 'sidebar'}>
        <ul>
          <li>
            <Link to={getHomePage(role, email)}>
            {/* <img src="/images/home_icon.png" alt="Home" /> */}
            Home
            </Link>
            </li>
          <li><Link to={`/profilehome/${email}/${role}/${hashp}`}>View Profile</Link></li>
          <li><Link to={`/financialcheck/${email}/${role}/${hashp}`}>View/Edit Financial Records</Link></li>
          <li><Link to={`/medicalcheck/${email}/${role}/${hashp}`}>View/Edit Medical Records</Link></li>
        </ul>
      </div>
      {/* End of Sidebar */}
      {showAlert && <CustomAlert message={alertMessage} onClose={handleCloseAlert} />}
    </div>
  );
};

export default Header;
