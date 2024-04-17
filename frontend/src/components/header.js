import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import '../styles/header.css';
import '../styles/sidebar.css'; // Import sidebar styles here

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
  const navigate = useNavigate(); // Use useNavigate hook

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = async () => {
    if(searchTerm !== '') {
    navigate(`/searchres/${email}/${searchTerm}/${hashp}`);
    }
  };
  // console.log(userProfile)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userResponse = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/findrole', { email });
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

  const handleLogout = () => {
    // Replace current entry in history with /login
    navigate("/login", { replace: true });
  };


  const renderRoleBasedLinks = (role, email, hashp) => {
    if 
    (role === 'employee' || role === 'manager') {
      return (
        <>
          <li><button onClick={() => navigate(`/financialcheck/${email}/${role}/${hashp}`)} className='sidebar-button'>View Financial Records</button></li>
          <li><button onClick={() => navigate(`/medicalcheck/${email}/${role}/${hashp}`)} className='sidebar-button'>View Medical Records</button></li>
          <li><button onClick={handleLogout} className='sidebar-button'>Log out</button></li>
        </>
      );
    } 
    else if (role === 'admin') {
      return (
        <>
          <li><button onClick={() => navigate(`/auditlogs/${email}/${role}/${hashp}`)} className='sidebar-button'> View Audit Logs</button></li>
          <li><button onClick={() => navigate(`/compliancerules/${email}/${role}/${hashp}`)} className='sidebar-button'>View Regulations</button></li>
          <li><button onClick={handleLogout} className='sidebar-button'>Log out</button></li>
        </>
      );
    }
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
          </li>
          <li>
          <img className = "search-icon" src="/search.png" alt="Search" onClick={handleSearch} />
          </li>
          <li>
            
            <button onClick={() => navigate(getHomePage(role, email))}>
              <img src="/images/home_icon.png" alt="Home" />
            </button>
          </li>
          <li><button onClick={toggleSidebar}><img src="/images/navigation-icon.png" alt="SideBar" /></button></li>
            <li>
              <button onClick={() => navigate(`/profilehome/${email}/${role}/${hashp}`)}>
              {userProfile && userProfile.Profile_Image && userProfile.Profile_Image!='default.png' ? (
                <img src={userProfile.Profile_Image} alt='Profile' className="profile-image"/>
              ) : (
                <img src='https://i.pinimg.com/originals/c0/c2/16/c0c216b3743c6cb9fd67ab7df6b2c330.jpg' alt='Profile' className="profile-image"/>
              )}
              </button>
            </li>               
        </ul>
      </nav>
      {/* Sidebar */}
      <div className={isSidebarOpen ? 'sidebar open' : 'sidebar'} style={{ backgroundColor: '#7fcfb8', opacity: '0.9', fontWeight: 'bold', fontSize: '1.2em' }}>
        <ul>
          <li>
            <button onClick={() => navigate(getHomePage(role, email))} className='sidebar-button'>
              Home
            </button>
          </li>
          <li><button onClick={() => navigate(`/profilehome/${email}/${role}/${hashp}`)} className='sidebar-button'>View Profile</button></li>
          <>{renderRoleBasedLinks(role, email, hashp)}</>
        </ul>
      </div>
      {/* End of Sidebar */}
      {showAlert && <CustomAlert message={alertMessage} onClose={handleCloseAlert} />}
    </div>
  );
};

export default Header;