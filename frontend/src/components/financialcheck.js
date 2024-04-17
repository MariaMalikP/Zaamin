import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import Modal from 'react-modal';
import '../styles/financial.css';
import Chart from 'chart.js/auto';

const FinancialCheck = () => {
  const { email, role, hashp} = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [financialDocument, setFinancialDocument] = useState();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [returnStatus, setReturnStatus] = useState('');
  const location = useLocation();
  const passedThat = location.state;


  useEffect(() => {
    const fetchProfilePic = async () => {
        try {
            const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
            }
        } catch (error) {
            alert('Error fetching Profile Information', error);
        }
    }
    fetchProfilePic();
}, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/get-financial-info', { email, role });
        if (response.data.status === "profile exists") {
          setUserProfile(response.data.profile_deets);
          barGraph(response.data.profile_deets);
        }
      } catch (error) {
        console.error('Error fetching Financial Information', error);
      }
    };
    fetchProfile();
  }, [email, role]);

  const barGraph = (info) => {
  // window.alert('info: ' + JSON.stringify(info));
  const graphData = {
    labels: ['Salary', 'Bonuses', 'Commissions', 'Expenses'],
    datasets: [
      {
        label: 'Financial Information',
        data: [info.salary, info.bonuses, info.commissions, info.expenses],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 4
      }
    ]
  };

  const ctx = document.getElementById('myChart').getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: graphData,
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
};

const handleGoBack = () => {
  if(passedThat === null || passedThat === undefined || passedThat.imfrom === null || passedThat.imfrom === undefined)
  {
    navigate(`/${role}home/${email}/${hashp}`);
  }
  else if(passedThat.imfrom === "employeehome" || passedThat.imfrom === "managerhome")
  {
    navigate(`/${role}home/${email}/${hashp}`);
  }
  else
  {
    navigate(`/profilehome/${email}/${role}/${hashp}`);
  }
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  const isnotBankInfoField = name in userProfile;
  if (isnotBankInfoField) {
    // Update main profile
    setEditedProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  } 
  else {
    // Update bank information
    setEditedProfile(prevProfile => ({
      ...prevProfile,
      bankInformation: {
        ...prevProfile.bankInformation,
        [name]: value,
      }
    }));
  }

};


  const updateProfile = async () => {
    if (editedProfile.bankInformation !== undefined) {
      if (editedProfile.bankInformation.bankName === undefined && editedProfile.bankInformation.ibanNum !== undefined) {
        editedProfile.bankInformation.bankName = userProfile.bankInformation.bankName;
      }
      else if (editedProfile.bankInformation.ibanNum === undefined && editedProfile.bankInformation.bankName !== undefined) {
        editedProfile.bankInformation.ibanNum = userProfile.bankInformation.ibanNum;
      }
    }
    try {
      // window.alert('editedProfile: ' + JSON.stringify(editedProfile));
      const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/update-financial-info', { email, editedProfile });
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  const closeModal = () => {
    setIsSuccessModalOpen(false);
  };


  return (
    <>
      <div className='financial_profile'>
      <Header email={email} userProfile={userProfilePic} hashp={hashp}/>
      
        <div className='financial_heading'>Financial Centre</div>
        <div className='financial_display'>
          {userProfile && (
            <>
              <div className='financial_title id'>ID:</div>
              <input
                type="text"
                name="id"
                value={userProfile.id}
                className='financial-output-box financial-output financial-output1'
              />
              <div className='financial_title salary'>Salary:</div>
              <input
                type="text"
                name="salary"
                value={userProfile.salary}
                className='financial-output-box financial-output financial-output2'
              />
              <div className='financial_title bonuses'>Bonuses:</div>
              <input
                type="text"
                name="bonuses"
                value={userProfile.bonuses}
                className='financial-output-box financial-output financial-output3'
              />
              <div className='financial_title commissions'>Commissions:</div>
              <input
                type="text"
                name="commissions"
                value={userProfile.commissions}
                className='financial-output-box financial-output financial-output4'
              />
              <div className='financial_title benefits'>Benefits:</div>
              <input
                type="text"
                name="benefits"
                value={userProfile.benefits }
                className='financial-output-box financial-output financial-output5'
              />
              <div className='financial_title expenses'>Expenses:</div>
              <input
                type="text"
                name="expenses"
                value={editedProfile.expenses !== undefined ? editedProfile.expenses : userProfile.expenses}
                onChange={handleInputChange}
                className='financial-output-box financial-output financial-output6'
              />
                 <div className='financial_title bankName'>Bank Name:</div>
                <input
                  type="text"
                  name="bankName"
                  value={editedProfile.bankInformation?.bankName !== undefined ? editedProfile.bankInformation.bankName : userProfile.bankInformation?.bankName}
                  onChange={handleInputChange}
                  className='financial-output-box financial-output financial-output7'
                /> 
                <div className='financial_title IBAN_Num'>IBAN No.</div>
                <input
                  type="text"
                  name="ibanNum"
                  value={editedProfile.bankInformation?.ibanNum !== undefined ? editedProfile.bankInformation.ibanNum : userProfile.bankInformation?.ibanNum}
                  onChange={handleInputChange}
                  className='financial-output-box financial-output financial-output8'
                />
                <div class="fin_container">
                <canvas id="myChart"></canvas>
                </div>
                <img src="/images/backarrow.png" className='fprofileback-arrow' alt="Back" onClick={handleGoBack}/>
            </>
          )}
        </div>
        <button className='financial-edit-profile' onClick={updateProfile}>Update Profile</button>
        {/* <button className='element medical-page' onClick={handleEditProfileClick}>Go Back</button> */}
        <Modal
          isOpen={isSuccessModalOpen}
          onRequestClose={closeModal}
          contentLabel="Success Modal"
          className="modal-content"
        >
          <div>
            <h2>Success!</h2>
            <h2>Your Financial Profile has been updated successfully.</h2>
            <button className="close-button" onClick={closeModal}>Close</button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default FinancialCheck;