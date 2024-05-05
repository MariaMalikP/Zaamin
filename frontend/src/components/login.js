import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'crypto';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Import icons for eye option
import '../styles/login.css';
import { useAuth } from './Authprovider';
import { AlertTitle, Alert } from '@mui/material';

const Login = (prop) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setToken } = useAuth();
    const navigate = useNavigate();
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', function (event){
    window.history.pushState(null, document.title,  window.location.href);
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/login', { email, password });
            console.log('RESPONSE FROM SERVER', response.data.status);
            if (response.data.status === 'success') {
                setToken(response.data.token);
                if (response.data.userrole === 'employee') {
                    navigate(`/employeehome/${email}/${response.data.hashcheck.replace(/\//g, '')}`);
                } else if (response.data.userrole === 'manager') {
                    navigate(`/managerhome/${email}/${response.data.hashcheck.replace(/\//g, '')}`);
                } else if (response.data.userrole === 'admin') {
                    console.log("going to admin page")
                    navigate(`/adminhome/${email}/${response.data.hashcheck.replace(/\//g, '')}`);
                } else {
                    console.log('Login failed');
                    setError('Server error');
                }
            } else {
                console.log('Login failed');
                setError('Invalid email or password');
                setAlertOpen(true);
                setAlertSeverity('error');
                setAlertMessage('Invalid email or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError(error.message);
        }
    };

    return (
        <div className='login-page'>
            <div className="gradient-box">
                <img src="/images/Logo.png" alt="Logo" className="logoo" />
                <div className="login-title">Login</div>
                <form onSubmit={handleSubmit} className='loginForm'>
                    <label className="email">Email:</label>
                    <input className="user-inp"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label className="password">Password:</label>
                    <div className="password-input">
                        <input className="pass-inp"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {/* Eye icon to toggle password visibility */}
                        {showPassword ? (
                            <VisibilityOff className="eye-icon" onClick={() => setShowPassword(false)} />
                        ) : (
                            <Visibility className="eye-icon" onClick={() => setShowPassword(true)} />
                        )}
                    </div>
                    <button type="login-button">Login</button>
                </form>
                <Link to="/forgotpassword" className="forgot-password">Forgot Password?</Link>
            </div>
            <div className="signup-link">
                <p>Don’t have an account yet? <Link to="/signuplanding">Sign up</Link></p>
            </div>
            {alertOpen &&
                <Alert className="alert-container-signup" severity={alertSeverity} onClose={() => setAlertOpen(false)} open={alertOpen} sx={{ padding: '20px', fontSize: '20px', opacity: '1', borderRadius: '10px' }}>
                    <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    {alertMessage}
                </Alert>
            }
        </div>
    );
};

export default Login;