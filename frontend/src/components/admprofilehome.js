import React, { useState, useEffect } from 'react';
 import { useNavigate, useParams } from 'react-router-dom';
 import axios from 'axios';
 import DatePicker from 'react-datepicker';
 import 'react-datepicker/dist/react-datepicker.css';
 import Header from './header';
 import '../styles/profile.css'; 
 
 const AprofileHome = () => {
     const { email , role, hashp} = useParams();
     const navigate = useNavigate();
     const [userProfile, setProfile] = useState(null);
     const [returnStatus, setReturnStatus] = useState('');
     const [showDescription, setShowDescription] = useState(false);
     
 
     useEffect(() => {
         const fetchProfile = async () => {
             try {
                 const response = await axios.post('http://localhost:3000/viewprofile', { email, role });
                 if (response.data.status === "profile exists") {
                     setReturnStatus(response.data.status);
                     setProfile(response.data.profile_deets);
                 }
             } catch (error) {
                 alert('Error fetching Profile Information', error);
             }
         }
         fetchProfile();
     }, []);
 
     const handleEditProfileClick = () => {
         navigate(`/editprofile/${email}/${role}/${hashp}`);
     };

     const handleViewAudit = () => {
        navigate(`/auditlogs/${email}/${role}/${hashp}`);
     }
     const handleInfoClick = () => {
         setShowDescription(!showDescription);
     };
     const navMedicalCheck = async () => {    
        navigate(`/medicalcheck/${email}/${role}`);
    };
    const navFinancialCheck = async () => {
        navigate(`/financialcheck/${email}/${role}`);
    };
 
     return (
         <div className='profile'>
             <Header email={email} userProfile={userProfile} />
             <div className='heading'>Profile</div>
             <img src='/ppl.jpg' className='profile-circle'/>
             {returnStatus === "profile exists" && userProfile && (
                 <>
                     <div className='ellipse-27'>
                        {userProfile?.Profile_Image ? (
                            <img src={userProfile.Profile_Image} alt='Profile' className='profile-picture' />
                        ) : (
                            <img src={'https://i.pinimg.com/originals/c0/c2/16/c0c216b3743c6cb9fd67ab7df6b2c330.jpg'} alt='Profile' className='profile-picture' />
                        )}
                    </div>
                     <div className='title firstname'>First Name:</div>
                     <div className='output-box output output1'>{userProfile.First_Name}</div>
                     <div className='title lastname'>Last Name:</div>
                     <div className='output-box output output2'>{userProfile.Last_Name}</div>
                     <div className='title age'>Age:</div>
                     <div className='mini-box output'>{userProfile.Age}</div>
                     <div className='title dob'>Date of Birth:</div>
                     <div className='date-picker'>
                     <DatePicker
                         selected={userProfile.Date_of_Birth}
                         dateFormat="dd/MM/yyyy"
                     />
                     </div>
                     <div className='title phoneno'>Phone Number:</div>
                     <div className='output-box output output5'>{userProfile.Phone_Number}</div>
                     <div className='title occupation'> Occupation:</div>
                     <div className='info-tooltip'>
                         <img src='/info.png' className='info' onClick={handleInfoClick} />
                         {showDescription && (
                             <div className='description-box'> Your role in the company. Employee/Manager/Admin </div>
                         )}
                     </div>
                     <div className='output-box output output6'>Employee</div>
                     <div className='title address'>Address:</div>
                     <div className='big-output leftoutput output7'>{userProfile.Address}</div>
                     <button className='edit-profile' onClick={handleEditProfileClick}>Edit Profile</button>
                     <div className='element current-page'>Manage Profile</div>
                     <button className='element medical-page' onClick={handleViewAudit}>View Audit Logs</button>
                     <button className='element financial-page' onClick={handleEditProfileClick}>View Regulations</button>
                     <button className='element password-change' onClick={handleEditProfileClick}>Change Password</button>
                 </>
             )}
         </div>
     );
 };
 
 export default AprofileHome;