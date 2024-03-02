import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css'; // Import your CSS file

const Login = (prop) => {
    const history = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const home = () => {
        history(`/home`);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', { email, password });
        // Rest of your code...
            console.log('RESPOSNE FROM SERVER',response.data.status)
            if (response.data.status === 'success') {
                console.log('Login successful');
                navigate('/profilehome');
            } 
            else {
                console.log('Login failed');
                if (response.data.status === 'failed') {
                    console.error('Invalid email or password');
                    setError('Invalid email or password');
                } else {
                    setError('Server error');
                }
            }
        } catch (error) {
            console.log('erorororor2');
            console.error('Error during login:', error);
            setError(error.message);
        }
    };
    return (
        <div className='login-page'>
            <div className="gradient-box">
            <img src="/images/Logo.png" alt="Logo" className="logo" />                <div className="login-title">Login</div>
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
                    <input className="pass-inp"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="login-button">Login</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <Link to="/forgotpassword" className="forgot-password">Forgot Password?</Link>
            </div>
            <div className="signup-link">
                <p>Don’t have an account yet? <Link to="/signuplanding">Sign up</Link></p>
            </div>
            <button className="sub-button" type="button" onClick={home}>Home</button>
        </div>
    );
    
};

export default Login;

