 /* eslint-disable */
 
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css'; // Import your CSS file
import Header from './header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';

const EditProfile = () => {
    const { email, role, hashp} = useParams();
    const navigate = useNavigate();
    const [userProfile, setProfile] = useState(null);
    const [returnStatus, setReturnStatus] = useState('');
    const [editedProfile, setEditedProfile] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [Image, setImage] = useState();

    // this function is called when the component is loaded and is used to fetch the user profile information 
    //based on the email and role(that defines schema) of the user
    //if the profile does exist in given role it sets the profile state to the profile details 
    //which is then used to print all the details in the input buttons beforehand so that the user can edit them
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.post('http://localhost:3000/viewprofile', { email, role });
                if (response.data.status === "profile exists") {
                    setReturnStatus(response.data.status);
                    setProfile(response.data.profile_deets);
                }
            } catch (error) {
                alert('Error fetching Profile Information');
            }
        }
        fetchProfile();
    }, []);

    //this function is called when the edit profile button is clicked and it navigates to the edit profile page
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

    //this function is called when the input fields are changed and it sets the editedProfile state to the new value
    // thus it only includes the changed user profile fields and not all the fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    //this function is called when the image is chosen and it sets the Image state to the chosen image
    const onImageChosen = (e) => {
        console.log(e.target.files[0])
        setImage(e.target.files[0])
    }

    //this function is called when the date is changed and it sets the editedProfile state to the new date 
    //and also sets the user profile state to the new date so that the change is immediately visible to the user
    const handleDateChange = (date) => {
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            Date_of_Birth: date
            }));
            setProfile(prevProfile => ({
            ...prevProfile,
            Date_of_Birth: date
            }));
    };

    //this function is called when the save profile button is clicked and it sends the editedProfile along with the email and role to the server
    //to update the user profile in the database for the given email and role to this edited profile
    const UpdateProfile = async () => {
    try {
        const response = await axios.post('http://localhost:3000/edit_profile', { email, role, editedProfile });
        setIsSuccessModalOpen(true);
    } catch (error) {
        console.error('Error editing Profile', error);
    }
    };

    //this function is called when the close button is clicked 
    //and it sets the isSuccessModalOpen state to false to close the modal to close the notification popup
    const closeModal = () => {
    setIsSuccessModalOpen(false);
    };

    // this function is called when the info icon is clicked and 
    //it sets the showDescription state to true(initialised to false) to display the description box
    const handleInfoClick = () => {
        setShowDescription(!showDescription);
    };

    return (
    <div className='profile'>
        <div><Header /></div>
        <div className='heading'>Edit Profile</div>
        <img src='/ppl.jpg' className='profile-circle'/>
         {/* showing user information if the profile exists.
            In case of Date of Birth, used DatePicker to highlight the date on the calender
             and in this case if a new date is clicked on, handleDateChange is called to add changed field to editedProfile*/}
        {returnStatus === "profile exists" && userProfile && (
            <>
                <div className='ellipse-27'>
                    <img src="https://i.pinimg.com/originals/c0/c2/16/c0c216b3743c6cb9fd67ab7df6b2c330.jpg" alt='Profile' className='profile-picture' />
                    <div className="file-input-wrapper">
                        <img src='/img.png'/>
                        <input type="file" accept="image/*" onChange={onImageChosen} id="fileInput"></input>
                    </div>
                </div>
                <div className='title firstname'>First Name:</div>
                <input
                    type="text"
                    name="First_Name"
                    //if the user has already edited the field, it shows the edited value else it shows the original value
                    //while also allowing the user to make changes to complete field
                    //this has been done for all the fields
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
                    />
                </div>
                <div className='title phoneno'>Phone:</div>
                <input
                    type="text"
                    name="Phone_Number"
                    value={editedProfile.Phone_Number !== undefined ? editedProfile.Phone_Number: userProfile.Phone_Number}
                    onChange={handleInputChange}
                    className='output-box output output5'
                />
                <div className='title occupation'> Occupation:</div>
                    <div className='info-tooltip'>
                        <img src='/info.png' className='info' onClick={handleInfoClick} />
                        {showDescription && (
                            <div className='description-box'> Your role in the company. Employee/Manager/Admin </div>
                        )}
                    </div>
                <div className='output-box output output6'>Employee</div>
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
                <Modal
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
                </Modal>
            </>
        )}
    </div>
    );
};

export default EditProfile;