import '../styles/signuplanding.css';
import { useNavigate,Link} from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

const Signuplanding= (prop)=>{
    const history=useNavigate();
    const employee = async () => {
        try {
            history(`/employeesignup`);
        }
        catch (error) {
            console.error('Error going to the page, sorry', error);
        }
    };

    return (        
        <div className='body'>
            <div className='gradient-box'>
                <div className = 'button-container'>
                    <button type="login-button" onClick = {employee}>Employee</button>
                    <button type="login-button">Manager</button>
                    <button type="login-button"onClick = {employee}>HR Admin</button>
                </div>
            </div>
        </div>
    )
}

export default Signuplanding