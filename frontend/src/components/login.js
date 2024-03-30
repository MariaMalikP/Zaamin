 /* eslint-disable */
 
// Import necessary dependencies from React and other libraries
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Import the CSS file for styling
import '../styles/login.css';

// Define the Login component as a functional component
const Login = (prop) => {
    // Define state variables to store email, password, and error messages
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Access the navigate function from the useNavigate hook
    const navigate = useNavigate();

    // Define a function to handle form submission
    // this function is handling the form submission. 
    // once the form is submitted, it will send a POST request to the server with the email and password.
    // once the request is sent to the server, the server checks for the email and corresponding ID and password. 
    // it decrypts the password and compares it with the password submitted on login.
    // if the password matches, it will return a success status and the user role  which is determined by the prefix of the ID
    // if the password does not match, it will return a failed status.
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        try {
            // Send a POST request to the login endpoint with email and password
            const response = await axios.post('http://localhost:3000/login', { email, password });
            
            // Log the response from the server
            console.log('RESPONSE FROM SERVER', response.data.status);
            
            // Check the status of the response
            if (response.data.status === 'success') {
                // If login is successful, determine user role and navigate accordingly
                if (response.data.userrole === 'employee') {
                    // Navigate to employee home page
                    navigate(`/employeehome/${email}`);
                }
                else if (response.data.userrole === 'manager'){
                    // Navigate to manager home page
                    navigate(`/managerhome/${email}`);
                }
                else if (response.data.userrole === 'admin'){
                    // Navigate to admin home page
                    navigate(`/adminhome/${email}`);
                }
                else {
                    // If user role is not recognized, set error
                    console.log('Login failed');
                    setError('Server error');
                }
            } 
            else {
                // If login fails, display appropriate error messages
                console.log('Login failed');
                setError('Invalid email or password');
                alert('Invalid email or password');
            }
        } catch (error) {
            // Handle any errors that occur during login
            console.error('Error during login:', error);
            setError(error.message);
        }
    };
    
    // Render the login form and error messages
    return (
        <div className='login-page'>
            <div className="gradient-box">
                {/* Display the logo */}
                <img src="/images/Logo.png" alt="Logo" className="logoo" />
                {/* Display the login title */}
                <div className="login-title">Login</div>
                {/* Render the login form */}
                <form onSubmit={handleSubmit} className='loginForm'>
                    {/* Input field for email */}
                    <label className="email">Email:</label>
                    <input className="user-inp"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {/* Input field for password */}
                    <label className="password">Password:</label>
                    <input className="pass-inp"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {/* Button to submit the login form */}
                    <button type="login-button">Login</button>
                </form>
                {/* Display error messages if any */}
                {error && <p className="error-message">{error}</p>}
                {/* Link to the forgot password page */}
                <Link to="/forgotpassword" className="forgot-password">Forgot Password?</Link>
            </div>
            {/* Link to the sign up page */}
            <div className="signup-link">
                <p>Don’t have an account yet? <Link to="/signuplanding">Sign up</Link></p>
            </div>
            {/* Uncomment below if there's a button to navigate to home */}
            {/* <button className="sub-button" type="button" onClick={home}>Home</button> */}
        </div>
    );
};

// Export the Login component as default
export default Login;