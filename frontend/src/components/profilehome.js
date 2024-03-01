import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css'; // Import your CSS file
import Header from './header';

const ProfileHome = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [userProfile, setProfile] = useState(null);
  const [role, setRole] = useState("employee");
  const [returnStatus, setReturnStatus] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.post('http://localhost:3000/viewprofile', { email, role });
        if (response.data.status === "profile exists") {
          setReturnStatus(response.data.status);
          setProfile(response.data.profile_deets);
        }
      } catch (error) {
        console.error('Error fetching Profile Information', error);
      }
    }
    fetchProfile();
  }, []);

  const handleEditProfileClick = () => {
    navigate(`/editprofile`);
  };

  return (
    <div className='profile'>
      <div><Header /></div>
      <div className='heading'>Profile</div>
      {returnStatus === "profile exists" && userProfile && (
        <>
         <div className='ellipse-27'>
          <img src={userProfile.Profile_Image} alt='Profile' className='profile-picture'/>
        </div>
          <div className='title firstname'>First Name:</div>
          <div className='output-box output output1'>{userProfile.First_Name}</div>
          <div className='title lastname'>Last Name:</div>
          <div className='output-box output output2'>{userProfile.Last_Name}</div>
          <div className='title age'>Age:</div>
          <div className='mini-box output'>{userProfile.Age}</div>
          <div className='title dob'>Date of Birth</div>
          <div className='title phoneno'>Phone:</div>
          <div className='output-box output output5'>{userProfile.Phone_Number}</div>
          <div className='title occupation'>Occupation:</div>
          <div className='output-box output output6'>Employee</div>
          <div className='title address'>Address:</div>
          <div className='big-output leftoutput output7'>{userProfile.Address}</div>
          <button className='edit-profile' onClick={handleEditProfileClick}>Edit Profile</button>
          <div className='element current-page'>Manage Profile</div>
          <button className='element medical-page' onClick={handleEditProfileClick}>View Medical Records</button>
          <button className='element financial-page' onClick={handleEditProfileClick}>View Financial Records</button>
          <button className='element password-change' onClick={handleEditProfileClick}>Change Password</button>
        </>
      )}
    </div>
  );
};

export default ProfileHome;
