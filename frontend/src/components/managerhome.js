 /* eslint-disable */
 
import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/home.css'; 
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const ManagerHome = (prop) => {
    const history = useNavigate();
    const { email } = useParams();
    const [role, setRole] = useState("manager");
    const [returnStatus, setReturnStatus] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const getFullName = async () => {
        try {
            const response = await axios.post('http://localhost:3000/getname', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setFirstName(response.data.firstname);
                setLastName(response.data.lastname);
            } 
            else if (response.data.status === "profile not found") {
                history('/errorpage');
            }
        } catch (error) {
            alert('Error retrieving full name', error);
        }
    };

    useEffect(() => {
        getFullName(email);
    }, []);

    const profilecheck = async () => {    
        try {
            history(`/profilehome/${email}/${role}`);
        } catch (error) {
            alert('Error during login, try again', error);
        }
    };

    return (    
        <div className='home'>
            <div><Header /></div>
            <div className='mainheading'>Home</div>
            <div className='subheading'>Welcome back {firstName} {lastName}</div>
            <div className='subheading3'>What would you like to do?</div>
            <ul className="button-list">
                <li><button className="button-style" type="button" onClick={profilecheck}>1. Manage Profile</button></li>
                <li><button className="button-style" type="button" onClick={profilecheck}>2. Check out Medical Records</button></li>
                <li><button className="button-style" type="button" onClick={profilecheck}>3. Check out Financial Records</button></li>
            </ul>
        </div>
    );
}

export default ManagerHome;