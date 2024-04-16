
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/SearchResults.css';
import Header from './header';
 

const CustomAlert = ({ message, onClose }) => (
  <div className="custom-alert">
    <p>{message}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const SearchFinance = () => {
const { email,role, hashp } = useParams();
  const [financialProfiles, setFinancialProfiles] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [returnStatus, setReturnStatus] = useState('');

  useEffect(() => {
    const fetchProfilePic = async () => {
        try {
            const response = await axios.post('http://localhost:3000/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
            }
        } catch (error) {
            alert('Error fetching Profile Information', error);
        }
    }
    fetchProfilePic();
}, [email]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === 'admin') {
          const financialResponse = await axios.post('http://localhost:3000/financialprofiles');
          setFinancialProfiles(financialResponse.data.profiles);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [email, role]);

  return (
    <div className="srb">
      {/* <Header email={email} userProfile={userProfilePic} hashp={hashp}/> */}
      <div>
        <div className="search-results-container">
          <div className="heading-container">
            <ul>
              <li><Link to={`/profilehome/${email}/${"admin"}/${hashp}`}><img className="back-arrow" src="/images/backarrow.png" alt="Back" /></Link></li>
            </ul>
            <h2 className="search-results-heading"> Financial Profiles</h2>
          </div>
          {showAlert && <CustomAlert message="No results found." onClose={() => setShowAlert(false)} />}
          <table className="search-results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {/* Render financial profiles if role is admin */}
              {role === 'admin' && financialProfiles.map(profile => (
                <tr className="search-result" key={profile._id}>
                  <td>{profile.id}</td>
                  <td>{profile.email}</td>
                  <td>
                    <Link to={`/editfinance/${profile.email}/${email}/${role}/${hashp}`}>View Financial Profile</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SearchFinance;
