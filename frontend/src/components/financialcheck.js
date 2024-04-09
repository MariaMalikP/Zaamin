import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import Modal from 'react-modal';
import '../styles/financial.css';

const FinancialCheck = () => {
  const { email, role } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [financialDocument, setFinancialDocument] = useState();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [returnStatus, setReturnStatus] = useState('');

  useEffect(() => {
    const fetchProfilePic = async () => {
        try {
            const response = await axios.post('http://localhost:3000/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
                window.alert('response.data.profile_deets: ' + JSON.stringify(response.data.profile_deets));
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
        const response = await axios.post('http://localhost:3000/get-financial-info', { email, role });
        if (response.data.status === "profile exists") {
          setUserProfile(response.data.profile_deets);
        }
      } catch (error) {
        console.error('Error fetching Financial Information', error);
      }
    };
    fetchProfile();
  }, [email, role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  // const handleDragOver = (e) => {
  //   e.preventDefault();
  // };

  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   const file = e.dataTransfer.files[0];
  //   setFinancialDocument(file);
  //   updateFinancialDocument();
  // };

  // const uploadFile = (file) => {
  //   setFinancialDocument(file);
  //   updateFinancialDocument();
  // };

  // const updateFinancialDocument = async () => {
  //   const formData = new FormData();
  //   formData.append('financialDocument', financialDocument);
  //   try {
  //     const response = await axios.post('http://localhost:3000/update-medical-history', formData);
  //     window.alert('Financial document updated successfully: ' + JSON.stringify(response.data));
  //     if (response.data.message === "Path Set") {
  //       editedProfile.financialDocument = response.data.filePath;
  //       window.alert('response.data.status.filePath: ' + JSON.stringify(response.data.filePath));
  //       window.alert('Financial document updated successfully 2');
  //     }
  //   } catch (error) {
  //     console.error('Error updating financial document', error);
  //     window.alert('Error updating financial document');
  //   }
  // };

  const updateProfile = async () => {
    try {
      window.alert('editedProfile: ' + JSON.stringify(editedProfile));
      const response = await axios.post('http://localhost:3000/update-financial-info', { email, role, editedProfile });
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  const closeModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleEditProfileClick = () => {
    navigate(`/profilehome/${email}/${role}`);
  };

  return (
    <>
      <div className='financial_profile'>
        <Header email={email} userProfile={userProfilePic} />
        <div className='financial_heading'>Financial Centre</div>
        <div className='financial_display'>
          {userProfile && (
            <>
              {/* <div className='financial_display'>
                <div className='financial_ellipse-27'>
                  <img src="/images/drag-and-drop.png" alt="Your Image" />
                  <div className='buttons_file'>
                    <img src="/images/file-upload.png" alt="File Upload" />
                    <input id="file-upload" type="file" onChange={(e) => uploadFile(e.target.files[0])} />
                  </div>
                  {financialDocument && financialDocument.name && (
                    <div className="file-name">
                      <p>Selected File: {financialDocument.name}</p>
                    </div>
                  )}
                  {userProfile.financialDocument && (
                    <div className="file-name2">
                      <p>Uploaded File: {userProfile.financialDocument}</p>
                    </div>
                  )}
                </div>
              </div> */}
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
                value={editedProfile.salary !== undefined ? editedProfile.salary : userProfile.salary}
                onChange={handleInputChange}
                className='financial-output-box financial-output financial-output2'
              />
              <div className='financial_title bonuses'>Bonuses:</div>
              <input
                type="text"
                name="bonuses"
                value={editedProfile.bonuses !== undefined ? editedProfile.bonuses : userProfile.bonuses}
                onChange={handleInputChange}
                className='financial-output-box financial-output financial-output3'
              />
              <div className='financial_title commissions'>Commissions:</div>
              <input
                type="text"
                name="commissions"
                value={editedProfile.commissions !== undefined ? editedProfile.commissions : userProfile.commissions}
                onChange={handleInputChange}
                className='financial-output-box financial-output financial-output4'
              />
              <div className='financial_title benefits'>Benefits:</div>
              <input
                type="text"
                name="benefits"
                value={editedProfile.benefits !== undefined ? editedProfile.benefits : userProfile.benefits}
                onChange={handleInputChange}
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
                <div className='financial_title taxInformation'>Tax Information:</div>
                {/* Withholding Allowances */}
                <input
                  type="number"
                  name="withholdingAllowances"
                  value={editedProfile.taxInformation?.withholdingAllowances !== undefined ? editedProfile.taxInformation.withholdingAllowances : userProfile.taxInformation?.withholdingAllowances}
                  onChange={(e) => handleInputChange('withholdingAllowances', e.target.value)}
                  className='financial-output-box financial-output financial-output7'
                />

                {/* Filing Status */}
                <input
                  type="text"
                  name="filingStatus"
                  value={editedProfile.taxInformation?.filingStatus !== undefined ? editedProfile.taxInformation.filingStatus : userProfile.taxInformation?.filingStatus}
                  onChange={(e) => handleInputChange('filingStatus', e.target.value)}
                  className='financial-output-box financial-output financial-output8'
                />

                {/* Deductions */}
                <input
                  type="number"
                  name="deductions"
                  value={editedProfile.taxInformation?.deductions !== undefined ? editedProfile.taxInformation.deductions : userProfile.taxInformation?.deductions}
                  onChange={(e) => handleInputChange('deductions', e.target.value)}
                  className='financial-output-box financial-output financial-output7'
                />
            </>
          )}
        </div>
        <button className='financial-edit-profile' onClick={updateProfile}>Update Profile</button>
        <button className='element medical-page' onClick={handleEditProfileClick}>Go Back</button>
        <Modal
          isOpen={isSuccessModalOpen}
          onRequestClose={closeModal}
          contentLabel="Success Modal"
          className="financial-modal-content"
        >
          <div>
            <h2>Success!</h2>
            <h2>Your Financial profile has been updated successfully.</h2>
            <button className="financial-close-button" onClick={closeModal}>Close</button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default FinancialCheck;
