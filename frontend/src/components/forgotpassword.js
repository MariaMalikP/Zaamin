import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'crypto';
import { useAuth } from './Authprovider';
import '../styles/forgotpass.css';  

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const setToken = useAuth(); // Changed here
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/checkingemail', { email });
            console.log('RESPONSE FROM SERVER', response.data.status);
            if (response.data.status === 'success') {
                let hashedOTP = null;
                console.log("successfully checked there is a page")
                try {
                    const response = await axios.post('http://localhost:3000/sendotp', {email})
                    hashedOTP = response.data
                    console.log("Email sent successfully");
                  } catch (error) {
                    console.error("Failed to send email:", error);
                    // Handle error
                  }
                navigate(`/otppageforget`, { state: { email:email, hashedOTP:hashedOTP} });
            } else {
                console.log('user not authorized boo');
                setError('Server error');
            }
        } catch (error) {
            console.error('Error during checking email:', error);
            setError(error.message);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="gradient-box"></div>
                 {/* Display the logo */}
                 <img src="/images/Logo.png" alt="Logo" className="logoopass" />
                {/* Display the login title */}
                <div className="forgot-password-title">Forgot Password</div>
                    <form onSubmit={handleSubmit} className='loginForm'>
                    {/* Input field for email */}
                    <p className='para'>Enter the email address associated with your account and we will send you an OTP on that email</p>
                    <label className="emailforget">Email:</label>
                    <input className="user-inppass"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {/* Button to submit the login form */}
                    <button type="otp-button">Send OTP</button>
                </form>
                    {error && <p className="forgot-password-error">{error}</p>}
                    <p className="back-to-login">Remembered your password? <Link to="/login">Login</Link></p>
        </div>
    );
};

export default ForgotPassword;