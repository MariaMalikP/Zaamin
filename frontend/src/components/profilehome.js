 /* eslint-disable */
 
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from './header';
import '../styles/profile.css'; 
import {AlertTitle, Alert} from '@mui/material';

const ProfileHome = () => {
    const { email , role, hashp} = useParams();
    const navigate = useNavigate();
    const [userProfile, setProfile] = useState(null);
    const [returnStatus, setReturnStatus] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.post('https://zaaminbackend.vercel.app/viewprofile', { email, role });
                if (response.data.status === "profile exists") {
                    setReturnStatus(response.data.status);
                    setProfile(response.data.profile_deets);
                }
            } catch (error) {
                setAlertOpen(true);
                setAlertSeverity('error');
                setAlertMessage('Error fetching Profile Information');
            }
        }
        fetchProfile();
        authcheck();
    }, []);
    const requiredRole=role
    const authcheck =  async () =>{
      
      const validcheck = await axios.post('https://zaaminbackend.vercel.app/validcheck', { email, hashp, role,requiredRole });
      if(validcheck.data.message!= 'success')
      {
        // alert(validcheck.data)
        navigate("/errorpage")
      }
    }
    const handleEditProfileClick = async (e) => {
        // navigate(`/editprofile/${email}/${role}/${hashp}`);
        let hashedOTP = null;
        console.log("successfully checked there is a page")
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/sendotp', {email})
            hashedOTP = response.data
            console.log("Email sent successfully");
        } 
        catch (error) {
            console.error("Failed to send email:", error);
        }
        navigate(`/otppageedit`, { state: { email:email, hashedOTP:hashedOTP,role:role, hashp: hashp} });
    };
    const MedicalCheck = async (e) => {
        navigate(`/medicalcheck/${email}/${role}/${hashp}`,  {state:{imfrom: "profilehome"}})
    }
    const FinanceCheck = async (e) => {
        if(role === 'employee')
        {
            navigate(`/financialcheck/${email}/${role}/${hashp}`, {state:{imfrom: "profilehome"}});
        }
        else
        {
            navigate(`/searchingFinance/${email}/${role}/${hashp}`, {state:{imfrom: "profilehome"}});
        }
    }
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/checkingemail', { email });
            console.log('RESPONSE FROM SERVER', response.data.status);
            if (response.data.status === 'success') {
                let hashedOTP = null;
                console.log("successfully checked there is a page")
                try {
                    const response = await axios.post('https://zaaminbackend.vercel.app/sendotp', {email})
                    hashedOTP = response.data
                    console.log("Email sent successfully");
                  } catch (error) {
                    console.error("Failed to send email:", error);
                    // Handle error
                  }
                navigate(`/otppageforget`, { state: { email:email, hashedOTP:hashedOTP, role:role}});
            } else {
                console.log('user not authorized boo');
                setError('Server error');
            }
        } catch (error) {
            console.error('Error during checking email:', error);
            setError(error.message);
        }
    };
    const handleInfoClick = () => {
        setShowDescription(!showDescription);
    };

    const Backfunction = () => {
        navigate(`/${role}home/${email}/${hashp}`);
    };
    function convertToTitleCase(str) {
        if (!str) {
            return ""
        }
        return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
    }

    return (
        <div className='profile'>
            <Header email={email} userProfile={userProfile}  hashp={hashp} />
            <div className='heading'>Profile</div>
            <img src="/images/backarrow.png" className="profileback-arrow" alt="Back" onClick={Backfunction}/>
            <img src='/ppl.jpg' className='profile-circle'/>
            {returnStatus === "profile exists" && userProfile && (
                <>
                    <div className='ellipse-27'>
                        {userProfile?.Profile_Image && userProfile?.Profile_Image!='default.png' ? (
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
                    <div className='output-box output output6'>{convertToTitleCase(role)}</div>
                    <div className='title address'>Address:</div>
                    <div className='big-output leftoutput output7'>{userProfile.Address}</div>
                    <button className='edit-profile' onClick={handleEditProfileClick}>Edit Profile</button>
                    <div className='element current-page'>Manage Profile</div>
                    <button className='element medical-page' onClick={MedicalCheck}>View Medical Records</button>
                    <button className='element financial-page' onClick={FinanceCheck}>View Financial Records</button>
                    <button className='element password-change' onClick={handlePasswordChange}>Change Password</button>
                </>
            )}
             {/* Alert component */}
            {alertOpen &&
                    <Alert className="alert-container-signup"severity={alertSeverity} onClose={() => setAlertOpen(false)} open={alertOpen} sx= {{padding: '20px', fontSize: '20px',opacity:'1',borderRadius: '10px'}}>
                    <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    {alertMessage}
                </Alert>
            }
        </div>
    );
};

export default ProfileHome;