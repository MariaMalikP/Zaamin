import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from './header';
import '../styles/profile.css'; // Import your CSS file

const ViewProfile = () => {
    const { email, visitingEmail } = useParams();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [visitorProfile, setVisitorProfile] = useState(null);
    const [returnStatus, setReturnStatus] = useState('');
    const [role, setRole] = useState("");


    useEffect(() => {
        // window.alert(`Email: ${email}, Visiting Email: ${visitingEmail}`);
        const fetchProfiles = async () => {
            try {
                const userResponse = await axios.post('http://localhost:3000/viewsearchprofile', { email });
                if (userResponse.data.status === "profile exists") {
                    setUserProfile(userResponse.data.profile_deets);
                    setRole(userResponse.data.role); 
                }
                const visitorResponse = await axios.post('http://localhost:3000/viewsearchprofile', { email: visitingEmail });
                if (visitorResponse.data.status === "profile exists") {
                    setReturnStatus(visitorResponse.data.status);
                    setVisitorProfile(visitorResponse.data.profile_deets);
                }
            } catch (error) {
                console.error('Error fetching Profile Information', error);
            }
        };
        fetchProfiles();
    }, [email, visitingEmail]);

    return (
        <div className='profile'>
            <Header email={email} userProfile={userProfile}/>
            <div className='heading'>Profile</div>
            <img src='/ppl.jpg' className='profile-circle' alt='Profile Circle' />
            {returnStatus === "profile exists" && visitorProfile && (
                <>
                    <div className='ellipse-27'>
                        <img src={visitorProfile.Profile_Image} alt='Profile' className='profile-picture' />
                    </div>
                    <div className='title firstname'>First Name:</div>
                    <div className='output-box output output1'>{visitorProfile.First_Name}</div>
                    <div className='title lastname'>Last Name:</div>
                    <div className='output-box output output2'>{visitorProfile.Last_Name}</div>
                    <div className='title age'>Age:</div>
                    <div className='mini-box output'>{visitorProfile.Age}</div>
                    <div className='title dob'>Date of Birth:</div>
                    <div className='date-picker'>
                        <DatePicker
                            selected={new Date(visitorProfile.Date_of_Birth)}
                            dateFormat="dd/MM/yyyy"
                            readOnly // Set the readOnly prop to true
                        />
                    </div>
                    <div className='title phoneno'>Phone Number:</div>
                    <div className='output-box output output5'>{visitorProfile.Phone_Number}</div>
                    <div className='title occupation'> Occupation:</div>
                    <div className='info-tooltip'>
                        <img src='/info.png' className='info' alt='Info' />
                        {/* Description */}
                    </div>
                    <div className='output-box output output6'>Employee</div>
                    <div className='title address'>Address:</div>
                    <div className='big-output leftoutput output7'>{visitorProfile.Address}</div>
                </>
            )}
        </div>
    );
};

export default ViewProfile;