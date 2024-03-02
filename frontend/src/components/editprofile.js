import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css'; // Import your CSS file
import Header from './header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditProfile = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const [userProfile, setProfile] = useState(null);
    const [role, setRole] = useState("employee");
    const [returnStatus, setReturnStatus] = useState('');
    const [editedProfile, setEditedProfile] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false); // Define showDatePicker state

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
        navigate(`/profilehome/${email}`);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleDatePicker = () => {
        setShowDatePicker(!showDatePicker); 
    };

    const handleDateChange = (date) => {
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            DateOfBirth: date
        }));
        setShowDatePicker(false); // Close the date picker after selecting a date
    };

    const UpdateProfile = async () => {
        try {
            alert(editedProfile);
            const response = await axios.post('http://localhost:3000/edit_profile', { email, role, editedProfile });
            alert("Success")
        } catch (error) {
            console.error('Error editing Profile', error);
        }
    };

    return (
        <div className='profile'>
            <div><Header /></div>
            <div className='heading'>Edit Profile</div>
            <img src='/ppl.jpg' className='profile-circle'/>
            {returnStatus === "profile exists" && userProfile && (
                <>
                    <div className='ellipse-27'>
                        <img src={userProfile.Profile_Image} alt='Profile' className='profile-picture' />
                        <img src='/img.png' className='img-icon'/>
                    </div>
                    <div className='title firstname'>First Name:</div>
                    <input
                        type="text"
                        name="First_Name"
                        value={editedProfile?.First_Name || userProfile.First_Name}
                        onChange={handleInputChange}
                        className='output-box output output1'
                    />
                    <div className='title lastname'>Last Name:</div>
                    <input
                        type="text"
                        name="Last_Name"
                        value={editedProfile?.Last_Name || userProfile.Last_Name}
                        onChange={handleInputChange}
                        className='output-box output output2'
                    />
                    <div className='title age'>Age:</div>
                    <input
                        type="text"
                        name="Age"
                        value={editedProfile?.Age || userProfile.Age}
                        onChange={handleInputChange}
                        className='mini-box output'
                    />
                    <div className='title dob'>Date of Birth</div>
                    <img src='/calender.png' alt='calendar' className='icon' onClick={handleDatePicker} />
                    {showDatePicker && (
                        <DatePicker
                            selected={editedProfile.DateOfBirth}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                        />
                    )}
                    <div className='title phoneno'>Phone:</div>
                    <input
                        type="text"
                        name="Phone_Number"
                        value={editedProfile?.Phone_Number || userProfile.Phone_Number}
                        onChange={handleInputChange}
                        className='output-box output output5'
                    />
                    <div className='title occupation'>Occupation:</div>
                    <img src='/info.png' className='info'/>
                    <div className='output-box output output6'>Employee</div>
                    <div className='title address'>Address:</div>
                    <textarea
                        name="Address"
                        value={editedProfile?.Address || userProfile.Address}
                        onChange={handleInputChange}
                        className='big-output leftoutput output7'
                    />
                    <button className='edit-profile' onClick={UpdateProfile}>Save Profile</button>
                    <div className='element current-page'>Edit Profile</div>
                    <button className='element medical-page' onClick={handleEditProfileClick}>Go Back</button>
                </>
            )}
        </div>
    );
};

export default EditProfile;

