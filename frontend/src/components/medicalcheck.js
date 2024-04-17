import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import Modal from 'react-modal';
import '../styles/medical.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { AlertTitle, Alert } from '@mui/material';


const MedicalCheck = () => {
  const { email, role, hashp } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [medicalHistoryFile, setMedicalHistoryFile] = useState();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [insurancePercentage, setInsurancePercentage] = useState(0);
  const [returnStatus, setReturnStatus]= useState('');
  const location = useLocation();
  const passedThat = location.state;
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMessage, setAlertMessage] = useState('');


  useEffect(() => {
    const fetchProfilePic = async () => {
        try {
            const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
            }
        } catch (error) {
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error fetching Profile Information');
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
        setAlertOpen(true);
        setAlertSeverity('error');
        setAlertMessage('Error fetching Medical Information');
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
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertMessage('Please select a file before uploading');
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
      setAlertOpen(true);
      setAlertSeverity('success');
      setAlertMessage('Medical history updated successfully');
      if (response.data.message === "Path Set") {
        editedProfile.medicalHistory = response.data.filePath;
        updateProfile();
        setAlertOpen(true);
        setAlertSeverity('success');
        setAlertMessage('Medical history updated successfully');
      }
    } catch (error) {
      console.error('Error updating medical history', error);
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertMessage('Error updating medical history');
    }
  };
  

  const updateProfile = async () => {
    try {
      const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/update-medical-info', { email, role, editedProfile });
      setAlertOpen(true);
      setAlertSeverity('success');
      setAlertMessage('Invalid email or password');
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  // const closeModal = () => {
  //   setIsSuccessModalOpen(false);
  // };
  console.log("passedThat: ", passedThat);
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
        {alertOpen &&
                <Alert className="alert-container-signup" severity={alertSeverity} onClose={() => setAlertOpen(false)} open={alertOpen} sx={{ padding: '20px', fontSize: '20px', opacity: '1', borderRadius: '10px' }}>
                    <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    {alertMessage}
                </Alert>
            }
      </div>
    </>
  );
};

export default MedicalCheck;