import React, { useState, useEffect } from 'react';
import { useNavigate, useParams,Link } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';
import {AlertTitle, Alert} from '@mui/material';

const EditProfile = () => {
    const { email, role, hashp } = useParams();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [editedProfile, setEditedProfile] = useState({});
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [image, setImage] = useState();
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const maxDate = new Date(); 
    const minDate = new Date("1924-01-01"); 

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.post('https://zaaminbackend.vercel.app/viewprofile', { email, role });
                if (response.data.status === "profile exists") {
                    setUserProfile(response.data.profile_deets);
                }
            } catch (error) {
                console.error('Error fetching Profile Information', error);
                setAlertOpen(true);
                setAlertSeverity('error');
                setAlertMessage('Error fetching Profile Information')
            }
        };
        fetchProfile();
        authcheck();
    }, [email, role]);
    const requiredRole=role;
    const authcheck =  async () =>{
      
      const validcheck = await axios.post('https://zaaminbackend.vercel.app/validcheck', { email, hashp, role,requiredRole });
      if(validcheck.data.message!= 'success')
      {
        // alert(validcheck.data)
        navigate("/errorpage")
      }
    }
    const handleEditProfileClick = () => {
        if(role === 'admin')
        {
            navigate(`/admprofilehome/${email}/${role}/${hashp}`);
        }
        else
        {
            navigate(`/profilehome/${email}/${role}/${hashp}`);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleDateChange = (date) => {
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            Date_of_Birth: date
        }));
    };

    const onImageChosen = async(file) => {
        const imageData = await readImageFileAsBase64(file);
        const stringified_imageData = JSON.stringify(imageData);
        const unstringify_imageData = JSON.parse(stringified_imageData);
        editedProfile.Profile_Image = unstringify_imageData;
        const fileSizeKB = imageData.length / 1024; // Convert bytes to kilobytes
        if (fileSizeKB <= 83) {
            editedProfile.Profile_Image = imageData;
            setImage(imageData);
        } else {
            setAlertOpen(true);
            setAlertSeverity('error');
        };};
    // Function to read image file as base64
    const readImageFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const UpdateProfile = async () => {
        try {
            // console.log()
            const response = await axios.post('https://zaaminbackend.vercel.app/edit_profile', { email, role, editedProfile });
            // setIsSuccessModalOpen(true);
            setAlertOpen(true);
            setAlertSeverity('success');
            setAlertMessage('Your profile has been updated successfully!');
        } catch (error) {
            console.error('Error editing Profile', error);
        }
    };

    const closeModal = () => {
        setIsSuccessModalOpen(false);
    };

    const handleInfoClick = () => {
        setShowDescription(!showDescription);
    };

    const Backfunction = () => {
        if(role === 'admin')
        {
            navigate(`/admprofilehome/${email}/${role}/${hashp}`);
        }
        else
        {
            navigate(`/profilehome/${email}/${role}/${hashp}`);
        }
    };
    function convertToTitleCase(str) {
        if (!str) {
            return ""
        }
        return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
    }

    return (
        <div className='profile'>
            <Header email={email} userProfile={userProfile} hashp={hashp}/>
            <img src="/images/backarrow.png" className="profileback-arrow" alt="Back" onClick={Backfunction}/>
            <div className='heading'>Edit Profile</div>
            {userProfile && (
                <>
                    <div className='ellipse-27'>
                        {image ? (
                            <img src={image} alt='Profile' className='profile-picture' />
                        ) : (
                            userProfile?.Profile_Image && userProfile?.Profile_Image!="default.png" ? (
                                <img src={userProfile.Profile_Image} alt='Profile' className='profile-picture' />
                            ) : (
                                <img src={'https://i.pinimg.com/originals/c0/c2/16/c0c216b3743c6cb9fd67ab7df6b2c330.jpg'} alt='Profile' className='profile-picture' />
                            )
                        )}
                        <div className="file-input-wrapper">
                            <img src='/img.png' alt="Upload Icon" />
                            <input type="file" onChange={(e)=>onImageChosen(e.target.files[0])} />
                        </div>
                    </div>
                    <div className='title firstname'>First Name:</div>
                    <input
                        type="text"
                        name="First_Name"
                        value={editedProfile.First_Name !== undefined ? editedProfile.First_Name : userProfile.First_Name}
                        onChange={handleInputChange}
                        className='output-box output output1'
                    />
                    <div className='title lastname'>Last Name:</div>
                    <input
                        type="text"
                        name="Last_Name"
                        value={editedProfile.Last_Name !== undefined ? editedProfile.Last_Name : userProfile.Last_Name}
                        onChange={handleInputChange}
                        className='output-box output output2'
                    />
                    <div className='title age'>Age:</div>
                    <input
                        type="text"
                        name="Age"
                        value={editedProfile.Age !== undefined ? editedProfile.Age : userProfile.Age}
                        onChange={handleInputChange}
                        className='mini-box output'
                    />
                    <div className='title dob'>Date of Birth:</div>
                    <div className='date-picker'>
                        <DatePicker
                            selected={userProfile.Date_of_Birth}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            maxDate={maxDate}
                            minDate={minDate}
                            showYearDropdown
                            scrollableYearDropdown
                            showMonthDropdown
                            scrollableMonthYearDropdown
                            dropdownMode="select"
                            required
                        />
                    </div>
                    <div className='title phoneno'>Phone:</div>
                    <input
                        type="text"
                        name="Phone_Number"
                        value={editedProfile.Phone_Number !== undefined ? editedProfile.Phone_Number : userProfile.Phone_Number}
                        onChange={handleInputChange}
                        className='output-box output output5'
                    />
                    <div className='title occupation'> Occupation:</div>
                    <div className='info-tooltip'>
                        <img src='/info.png' alt="Info" className='info' onClick={handleInfoClick} />
                        {showDescription && (
                            <div className='description-box'> Your role in the company. Employee/Manager/Admin </div>
                        )}
                    </div>
                    <div className='output-box output output6'>{convertToTitleCase(role)}</div>
                    <div className='title address'>Address:</div>
                    <textarea
                        name="Address"
                        value={editedProfile.Address !== undefined ? editedProfile.Address: userProfile.Address}
                        onChange={handleInputChange}
                        className='big-output leftoutput output7'
                />
                <button className='edit-profile' onClick={UpdateProfile}>Save Profile</button>
                <div className='element current-page'>Edit Profile</div>
                <button className='element medical-page' onClick={handleEditProfileClick}>Go Back</button>
                {/* <Modal
                    isOpen={isSuccessModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Success Modal"
                    className="modal-content"
                >
                    <div>
                        <h2>Success!</h2>
                        <h2>Your profile has been updated successfully.</h2>
                        <button className="close-button" onClick={closeModal}>Close</button>
                    </div>
                </Modal> */}
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

export default EditProfile;