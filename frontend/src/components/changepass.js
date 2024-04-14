import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/changepass.css';
const ChangePass = () => {
    const { email } = useParams(); // Accessing the email parameter
    console.log("email", email);

    const [password, setPassword] = useState('');
    const [confpassword, setConfrimPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Check if password and confirm password match
        if (password !== confpassword) {
            setError('Password and confirm password do not match');
            return;
        }
        try {
            const response = await axios.post('http://localhost:3000/changepassword', { email, newPassword: password });
            console.log('RESPONSE FROM SERVER', response.data.message);
            if (response.data.message === 'success') {
                console.log("password changed successfully")
                navigate(`/login`);
            } else {
                console.log("error changing password")
                setError('Server error');
            }
        } catch (error) {
            console.error('Error during changing password:', error);
            setError('Server error');
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="gradientboxyy"></div>
             {/* Display the logo */}
             <img src="/images/Logo.png" alt="Logo" className="logoochange" />
                {/* Display the login title */}
                <div className="change-password-title">Change Password</div>
                <form onSubmit={handleSubmit} className='loginForm'>
                    <label className="signuppassword">New Password:<span className="required-star">*</span></label>
                    <input className="signuppass-inp" type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {(password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) &&
                        (<div className="strong-messagepass">The password must be at least 8 characters long, and contain a mix of <br /> uppercase, lowercase and digits.</div>)}
                    <label className="confirm-password">Confirm New Password:<span className="required-star">*</span></label>
                    <input className="confpass-inp" type="password" placeholder="Confirm New Password" value={confpassword} onChange={(e) => setConfrimPassword(e.target.value)} required />
                    {password !== confpassword && (<div className="error-message">Password and confirm password do not match</div>)}
                    <button type="changepass">Change Password</button>
                </form>
            {error && <div className="error-messagepass">{error}</div>}
        </div>
    );
}

export default ChangePass;
