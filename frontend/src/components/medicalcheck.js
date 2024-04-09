
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import Modal from 'react-modal';
import '../styles/medical.css';

const MedicalCheck = () => {
  const { email, role } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [medicalHistoryFile, setMedicalHistoryFile] = useState();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [insurancePercentage, setInsurancePercentage] = useState(0);
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
}, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.post('http://localhost:3000/get-medical-info', { email, role });
        if (response.data.status === "profile exists") {
          setUserProfile(response.data.profile_deets);
          // Calculate insurance percentage based on role
          calculateInsurancePercentage(role);
        }
      } catch (error) {
        console.error('Error fetching Medical Information', error);
        alert('Error fetching Medical Information', error);
      }
    };
    fetchProfile();
  }, [email, role]);

  // Function to calculate insurance percentage based on role
  const calculateInsurancePercentage = (role) => {
    let percentage = 0;
    switch (role) {
      case 'admin':
        percentage = 75;
        break;
      case 'employee':
        percentage = 25;
        break;
      case 'manager':
        percentage = 50;
        break;
      default:
        percentage = 0;
    }
    setInsurancePercentage(percentage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setMedicalHistoryFile(file);
    updateMedicalHistory();
  };

  const uploadFile = (file) => {
    setMedicalHistoryFile(file);
    updateMedicalHistory();
  };
  const updateMedicalHistory = async () => {
    const formData = new FormData();
    formData.append('medicalHistory', medicalHistoryFile);
    try {
      const response = await axios.post('http://localhost:3000/update-medical-history', formData);
      window.alert('Medical history updated successfully: ' + JSON.stringify(response.data));
      if (response.data.message === "Path Set") {
        editedProfile.medicalHistory = response.data.filePath;
        window.alert('response.data.status.filePath: ' + JSON.stringify(response.data.filePath));
        window.alert('Medical history updated successfully 2');
      }
    } catch (error) {
      console.error('Error updating medical history', error);
      window.alert('Error updating medical history :'+error);
    }
  };
  

  const updateProfile = async () => {
    try {
      window.alert('editedProfile: ' + JSON.stringify(editedProfile));
      const response = await axios.post('http://localhost:3000/update-medical-info', { email, role, editedProfile });
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
      
      <div className='med_profile'>
        <Header email={email} userProfile={userProfilePic} />
        <div className='med_heading'>Medical Centre</div>
        <div className='med_display'>
          {userProfile && (
            <>
              <div className='med_display'>
                  <>
                    <div className='med_ellipse-27'>
                      <img src="/images/drag-and-drop.png" alt="Your Image" />
                      <div className='buttons_file'>
                          <img src="/images/file-upload.png" alt="File Upload" />
                          <input id="file-upload" type="file" onChange={(e) => uploadFile(e.target.files[0])} />
                      </div>
                          {medicalHistoryFile && medicalHistoryFile.name && (
                            <div className="file-name">
                              <p>Selected File: {medicalHistoryFile.name}</p>
                            </div>
                          )}
                          {userProfile.medicalHistory && (
                            <div className="file-name2">
                              <p>Uploaded File: {userProfile.medicalHistory}</p>
                            </div>
                          )}
                    </div>
                  </>
              </div>
              <div className='med_title id'>ID:</div>
              <input
                type="text"
                name="id"
                value={userProfile.id}
                className='med-output-box med-output med-output1'
              />
              <div className='med_title bloodtype'>Blood Type:</div>
              <select
                name="bloodType"
                value={editedProfile.bloodType !== undefined ? editedProfile.bloodType : userProfile.bloodType}
                onChange={handleInputChange}
                className='med-output-box med-output med-output2'
              >
                <option value={userProfile.bloodType}>{userProfile.bloodType}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
              <div className='med_title allergy'>Allergies:</div>
              <input
                type="text"
                name="allergies"
                value={editedProfile.allergies !== undefined ? editedProfile.allergies : userProfile.allergies}
                onChange={handleInputChange}
                className='med-output-box med-output med-output3'
              />
              <div className='med_title phone'>Emergency Contact:</div>
              <input
                type="text"
                name="emergencyContact"
                value={editedProfile.emergencyContact !== undefined ? editedProfile.emergencyContact : userProfile.emergencyContact}
                onChange={handleInputChange}
                className='med-output-box med-output med-output4'
              />
              <div className='med_title leave'>Leave Request:</div>
              <select
                name="leaveRequest"
                value={editedProfile.leaveRequest !== undefined ? editedProfile.leaveRequest : userProfile.leaveRequest}
                onChange={handleInputChange}
                className='med-output-box med-output med-output5'
              >
                <option value="No Leave Requested">No Leave Requested</option>
                <option value="Leave Requested">Leave Requested</option>
              </select>
              <div className='med_title leaveReqStat'>Leave Request Status:</div>
              <input
                type="text"
                name="leaveReqStat"
                value={editedProfile.currentLeaveStatus !== undefined ? editedProfile.currentLeaveStatus : userProfile.currentLeaveStatus}
                onChange={handleInputChange}
                className='med-output-box med-output med-output6'
              />
              <div className='insurance-bar'>
                <h3 className='insurance-heading'>Medical Insurance</h3>
                <svg className='pie-chart' viewBox="0 0 38 38" width='100'>
                  <circle cx="16" cy="16" r="15.91549430918954" fill="transparent" stroke="#ccc" strokeWidth="2"></circle>
                  <circle cx="16" cy="16" r="15.91549430918954" fill="transparent" stroke="#F18550" strokeWidth="2" strokeDasharray={`${insurancePercentage} 100`} transform="rotate(-90) translate(-32)" />
                </svg>
                <div className='insurance-progress-text'>{insurancePercentage}%</div>
              </div>
            </>
          )}
        </div>
        <button className='med-edit-profile' onClick={updateProfile}>Update Profile</button>
        <button className='element medical-page' onClick={handleEditProfileClick}>Go Back</button>
        <Modal
          isOpen={isSuccessModalOpen}
          onRequestClose={closeModal}
          contentLabel="Success Modal"
          className="med-modal-content"
        >
          <div>
            <h2>Success!</h2>
            <h2>Your Medical profile has been updated successfully.</h2>
            <button className="med-close-button" onClick={closeModal}>Close</button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default MedicalCheck;
