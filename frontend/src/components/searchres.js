import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/SearchResults.css';

const CustomAlert = ({ message, onClose }) => (
  <div className="custom-alert">
    <p>{message}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const SearchRes = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const { email, searchTerm,hashp } = useParams();
  const [role, setRole] = useState("");

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
    const fetchSearchResults = async () => {
      try {
        const response = await axios.post('http://localhost:3000/searchres', { searchTerm });
        setSearchResults(response.data.profiles);
        setShowAlert(response.data.profiles.length === 0); 
      } catch (error) {
        console.error('Error searching profiles:', error);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  return (
    <div className="srb"> {/* Fix className */}
      <div>
        <div className="search-results-container">
          <div className="heading-container">
            <ul>
              <li><Link to={`/profilehome/${email}/${role}/${hashp}`}><img className="back-arrow" src="/images/backarrow.png" alt="Back" /></Link></li>
            </ul>
            <h2 className="search-results-heading">Search Results</h2>
          </div>
          {/* {showAlert && <h2>NO RESULTS FOUND</h2>} */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'fit-content', minWidth: '200px', opacity: 0.9, zIndex: 9999, fontSize: '20px', padding: '20px' }}>
          {showAlert && <h2>NO RESULTS FOUND</h2>}
          </div>
          {showAlert===false &&
          <table className="search-results-table">
            <thead>
              <tr>
                <th>Profile Pic</th>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map(profile => (
                <tr className="search-result" key={profile._id}>
                  <td><img src={profile.Profile_Image} alt="Profile Pic" className="profile-pic" /></td>
                  <td>{profile.Employee_ID}</td>
                  <td>{profile.First_Name} {profile.Last_Name}</td>
                  <td>{profile.Department}</td>
                  <td>{profile.Email}</td>
                </tr>
              ))}
            </tbody>
          </table>}

        </div>
      </div>
    </div>
  );
};

export default SearchRes;
