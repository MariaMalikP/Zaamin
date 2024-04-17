import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import Modal from 'react-modal';
import '../styles/medical.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';


const MedicalCheck = () => {
  const { email, role, hashp } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [medicalHistoryFile, setMedicalHistoryFile] = useState();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [insurancePercentage, setInsurancePercentage] = useState(0);
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
        const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/get-medical-info', { email, role });
        if (response.data.status === "profile exists") {
          setUserProfile(response.data.profile_deets);
          // window.alert('response.data.profile_deets: ' + JSON.stringify(response.data.profile_deets));
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
 
  const uploadFile = (file) => {
    setMedicalHistoryFile(file);
    // updateMedicalHistory();
  };
  const handleUploadButtonClick = () => {
    if (medicalHistoryFile) {
      updateMedicalHistory(); // Call updateMedicalHistory only if a file is selected
    } else {
      alert('Please select a file before uploading.'); // Provide feedback to the user if no file is selected
    }
  };
  const getFileUrl = (relativePath) => {
    const baseUrl = window.location.origin; // Get the base URL of the frontend application
    const normalizedPath = relativePath.replace(/\\/g, '/'); // Replace backslashes with forward slashes
    const indexOfMedFiles = normalizedPath.indexOf('med_files');
    let fileRelativePath = normalizedPath.substring(indexOfMedFiles);
    return `${baseUrl}/${fileRelativePath}`;
  };
  
  const updateMedicalHistory = async () => {
    const formData = new FormData();
    formData.append('medicalHistory', medicalHistoryFile);
    try {
      const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/update-medical-history', formData);
      window.alert('Medical history updated successfully: ' + JSON.stringify(response.data));
      if (response.data.message === "Path Set") {
        editedProfile.medicalHistory = response.data.filePath;
        updateProfile();
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
      const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/update-medical-info', { email, role, editedProfile });
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  const closeModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleGoBack = () => {
    if(passedThat.imfrom === "managerhome")
    {
      navigate(`/managerhome/${email}/${hashp}`);
    }
    else if(passedThat.imfrom === "employeehome")
    {
      navigate(`/employeehome/${email}/${hashp}`);
    }
    else
    {
      navigate(`/profilehome/${email}/${role}/${hashp}`);
    }
  }

  return (
    <>
      
      <div className='med_profile'>
      <Header email={email} userProfile={userProfilePic} hashp={hashp}/>
      <img src="/images/backarrow.png" className="profileback-arrow" alt="Back" onClick={handleGoBack}/>
        <div className='med_heading'>Medical Centre</div>
        <div className='med_display'>
          {userProfile && (
            <>
              <div className='med_display'>
                  <>
                  <div className='med_title leave_app'>Leave Application Documents:</div>
                    <div className='med_ellipse-27'>
                      {medicalHistoryFile && medicalHistoryFile.name && (
                            <div className="file-name">
                              <p>Selected File: <span className='med_selected'>{medicalHistoryFile.name}</span></p>
                            </div>
                          )}
                        {userProfile.medicalHistory && (
                          <div className="file-name2">
                            <p>
                              Uploaded File: <a href={getFileUrl(userProfile.medicalHistory)}>{userProfile.medicalHistory}</a>
                            </p>
                          </div>
                        )}
                      <div className='buttons_file'>
                        <input id="file-upload" type="file" onChange={(e) => uploadFile(e.target.files[0])} />
                        <label htmlFor="file-upload" className="choose-file-btn">Choose File</label>
                        <button className="upload-btn" onClick={handleUploadButtonClick}>Upload</button>
                      </div>
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
              <div className='med_title insurance_percent'>Medical Insurance Covered:</div>
              <div className='insurance-bar'>
              <div className="circular-container-medical">
                {/* <h3 className='insurance-heading'>Insurance Percentage</h3> */}
                <CircularProgressbar
                  value={insurancePercentage}
                  text={`${insurancePercentage}%`}
                  styles={buildStyles({
                    textSize: '27px',
                    pathTransitionDuration: 0.5,
                    pathColor: '#F18550', // Adjust color as needed
                    textColor: '#13476F',
                  })}
                />
              </div>
            </div>

            </>
          )}
        </div>
        <button className='med-edit-profile' onClick={updateProfile}>Update Profile</button>
        <Modal
          isOpen={isSuccessModalOpen}
          onRequestClose={closeModal}
          contentLabel="Success Modal"
          className="modal-content"
    
        >
          <div>
            <h2>Success!</h2>
            <h2>Your Medical profile has been updated successfully.</h2>
            <button className="close-button" onClick={closeModal}>Close</button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default MedicalCheck;