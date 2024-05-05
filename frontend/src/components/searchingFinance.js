import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const history = useNavigate();
  const { email, role, hashp } = useParams();
  const [financialProfiles, setFinancialProfiles] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [returnStatus, setReturnStatus] = useState('');

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const response = await axios.post('https://zaaminbackend.vercel.app/viewprofile', { email, role });
        if (response.data.status === "profile exists") {
          setReturnStatus(response.data.status);
          setUserProfilePic(response.data.profile_deets);
        }
      } catch (error) {
        console.error('Error fetching Profile Information:', error);
      }
    };
    fetchProfilePic();
  }, [email]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === 'manager') {
          const financialResponse = await axios.post('https://zaaminbackend.vercel.app/financialprofiles');
          setFinancialProfiles(financialResponse.data.profiles);
          CustomAlert("You don't have access to this");
        } else {
          history.push("/errorpage");
        }  
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [email, role, history]);

  const navigateToHome = () => {
    const passedThat = null; // Replace with the appropriate value or logic to determine the condition
    if (!passedThat || !passedThat.imfrom || passedThat.imfrom === "managerhome") {
      history.push(`/${role}home/${email}/${hashp}`);
    } else {
      history.push(`/profilehome/${email}/${role}/${hashp}`);
    }
  };

  return (
    <div className="srb">
      {/* <Header email={email} userProfile={userProfilePic} hashp={hashp}/> */}
      <div>
        <div className="search-results-container">
          <div className="heading-container">
            <ul>
              <li><Link to={`/profilehome/${email}/${"manager"}/${hashp}`}><img className="back-arrow" src="/images/backarrow.png" alt="Back" /></Link></li>
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
              {role === 'manager' && financialProfiles.map(profile => (
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
      <button onClick={navigateToHome}>Go Home</button>
    </div>
  );
};

export default SearchFinance;