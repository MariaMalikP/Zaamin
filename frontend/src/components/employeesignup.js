import '../styles/signup.css';
import { useNavigate,Link, useLocation} from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { enc } from 'crypto-js';
import {AlertTitle, Alert} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Import icons for eye option


const EmployeeSignup= (prop)=>{
     // React hooks to manage component states
    const history = useNavigate();
    const [email, setEmail] = useState('');
    const [firstname, setFirstName] = useState('');
    const [lastname, setLasttName] = useState('');
    const [password, setPassword] = useState('');
    const [confpassword, setConfrimPassword] = useState('');
    const [securityQ, setSecurityQ] = useState('');
    const [address, setAddress] = useState('');
    const [age, setAge] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDeparment] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [success, setSuccess] = useState('');
    const [encryption, setEncryption] = useState('AES');
    const [error, setError] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility


    const location = useLocation();
    const maxDate = new Date(); 
    const minDate = new Date("1924-01-01"); 
    
    const employeeStatus = location.state?.employeeStatus;

     // Function to redirect to login page
    const home = () => {
        history('/login');
    };
    async function logincheck(e) {
        e.preventDefault();
        try 
        {
            //verifying whether the email entered is a valid one, by using the hunter.io email verifier api
            // const hunterApiKey = '4d1a599ad61555710ae5c7ab241d9a220f905855';
            const hunterApiKey = '9cfcc14ef23fb7987e3db93e33e5054f0f9748be';
            const emailToVerify = email;
            const response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${emailToVerify}&api_key=${hunterApiKey}`);
            
            //if email is valid, proceed, else give an error
            if (response.data.data.result === 'deliverable') 
            {
                const response = await axios.post('https://zaaminbackend.vercel.app/sendemail', {email,password,confpassword})
                if (response.data=== "email exists") //checks if email already exists
                {
                    setAlertOpen(true);
                    setAlertSeverity('error');
                    setAlertMessage('This email is already in use, choose another email.');
                }
                else if (response.status == 500) { //gives error if OTP can't get generated
                    setAlertOpen(true);
                    setAlertSeverity('error');
                    setAlertMessage('Failed to generate OTP. Please try again later');
                }
                else if (response.data=== "pass problem") // gives error if password isn't strong enough
                {
                    setAlertOpen(true);
                    setAlertSeverity('error');
                    setAlertMessage(`Please enter a stronger password. The password must be at least 8 characters long, and contain a mix of uppercase, lowercase and digits. `);
                }
                else if (response.data=== "password mismatch") //gives error if password and confirm password don't match
                {
                    setAlertOpen(true);
                    setAlertSeverity('error');
                    setAlertMessage('Password and Confirm password do not match.');
                }
                //after submitting, all the information is passed to the OTP page, where the two factor authentication proceeds. Once
                //OTP is verified, signup is successful
                else {
                    const userData = {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate,department,employeeStatus,encryption}
                    const passThis = {
                       hashedOTP: response.data,
                       user: userData
                    }
                    history('/otp', {state:passThis})
                }

            }
            else
            {
                // Incorrect email address according to the hunter api.
               setError('Invalid email address. Please provide a valid email.');
               setAlertOpen(true);
               setAlertSeverity('error');
               setAlertMessage('Email entered is invalid, please enter a valid email');
            }
        } 
        catch (e) 
        {
           console.error('Error verifying email:', error);
           setAlertOpen(true);
           setAlertSeverity('error');
           setAlertMessage('Something went wrong while verifying the email. Please try again.');

        }
    
    }
    return (
        // login page setup, containing all the inputs, and buttons needed. An alert component has also been defined
        // to give alerts using the help of material ui
        <div className='sup'>
        <div className='signup-page'>
            <div className="sugradient-box">
                <div>
                <img src="/images/Logo.png" alt="Logo" width={235} height={54} className='signuplogo' /> 
                </div>
                <div className='signup-title'>Signup</div>
                    <div className="login-link-signup">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                    <div className="required-signup">
                    <p style={{top:'30%', left:'40%'}}>* Indicates required field</p>
                    </div>
                    <hr className="separator"></hr>
                    <form onSubmit={logincheck} className='loginForm'>
                        <label className="name">Name:<span className="required-star"></span></label>
                        <input className="first-name"
                            type="text"
                            placeholder="First Name"
                            value={firstname}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <input className="last-name"
                            type="text"
                            placeholder="Last Name"
                            value={lastname}
                            onChange={(e) => setLasttName(e.target.value)}
                            required
                        />
                        <label className="signupemail">Email:<span class="required-star"></span></label>
                        <input className="signupemail-inp"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
            <label className="signuppassword">Password:<span class="required-star"></span></label>
            <input
                className="signuppass-inp"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {/* Eye icon to toggle password visibility */}
            {showPassword ? (
                <VisibilityOff
                    className="aankh-icon"
                    onClick={() => setShowPassword(false)}
                />
            ) : (
                <Visibility
                    className="aankh-icon"
                    onClick={() => setShowPassword(true)}
                />
            )}
            {(password.length<8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) &&
            (<div className="strong-message">The password must be at least 8 characters long, and contain a mix of <br/> uppercase, lowercase and digits.</div>)}
            <label className="confirm-password">Confirm Password:<span class="required-star"></span></label>
            <input
                className="confpass-inp"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confpassword}
                onChange={(e) => setConfrimPassword(e.target.value)}
                required
            />
            {/* Eye icon to toggle confirm password visibility */}
            {showConfirmPassword ? (
                <VisibilityOff
                    className="confaankh-icon"
                    onClick={() => setShowConfirmPassword(false)}
                />
            ) : (
                <Visibility
                    className="confaankh-icon"
                    onClick={() => setShowConfirmPassword(true)}

                />
            )}
            {password !== confpassword && (<div className="error-message">Password and confirm password do not match</div>)}

                        {password !== confpassword && (<div className="error-message">Password and confirm password do not match</div>)}
                        <label className="signupaddress">Address:<span class="required-star"></span></label>
                        <input className="address-inp"
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                        <div className='signupdob'>Date of Birth:<span class="required-star"></span></div>
                        <div className='dob-picker'>
                        <DatePicker
                            className='dob-inp'
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            placeholderText="Select Date"
                            dateFormat="dd/MM/yyyy" 
                            maxDate={maxDate}
                            minDate={minDate}
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            required
                        />
                    </div>
                        <label className="signupage">Age<span class="required-star"></span></label>
                        <input className="age-inp"
                            type="text"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                        <label className="signupphone">Phone Number<span class="required-star"></span></label>
                        <input className="phone-inp"
                            type="text"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <label className="department">Department<span class="required-star"></span></label>
                        <input className="department-inp"
                            type="text"
                            placeholder="Department"
                            value={department}
                            onChange={(e) => setDeparment(e.target.value)}
                            required
                        />
                       <label className='encryption-signup'>Select encryption method<span class="required-star"></span></label>
                       <select class="dropdown-inp" required onChange={(e) => {console.log(e.target.value); 
                           setEncryption(e.target.value)}}>
                       <option value="AES">AES</option>
                       <option value="AES-CBC">AES-CBC</option>
                       <option value="AES-GCM">AES-GCM</option>
                       </select>
                       <button type="signup-button" > Signup </button>
                    </form>   
            </div>
        </div>
        {/* Alert component */}
       {alertOpen &&
            <Alert className="alert-container-signup"severity={alertSeverity} onClose={() => setAlertOpen(false)} open={alertOpen} sx= {{padding: '20px', fontSize: '20px',opacity:'1',borderRadius: '10px'}}>
               <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
               {alertMessage}
           </Alert>
       }
        </div>
    );
    
}

export default EmployeeSignup