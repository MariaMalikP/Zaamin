 /* eslint-disable */
 
 import '../styles/signup.css';
 import { useNavigate,Link, useLocation} from 'react-router-dom';
 import axios from 'axios';
 import { useState } from 'react';
 import DatePicker from 'react-datepicker';
 import 'react-datepicker/dist/react-datepicker.css';
 import { enc } from 'crypto-js';

 const EmployeeSignup= (prop)=>{
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
 
     const location = useLocation();
     const employeeStatus = location.state?.employeeStatus;
     const home = () => {
         history(`/login`);
     };
     async function logincheck(e) {
         e.preventDefault();
         if(password!==confpassword)
         {
             setError("mismatched passwords");
         }
 
         else
         {
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
                 const response = await axios.post('http://localhost:3000/sendemail', {email})
                 if (response.status == 500)
                     alert('Failed to generate OTP. Please try again later')
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
                setError('Invalid email address. Please provide a valid email.');
                alert("Email entered is invalid, please enter a valid email");
             }
         } 
         catch (e) 
         {
             console.error('Error verifying email:', error);
             setError('Something went wrong while verifying the email. Please try again.');
             alert("Something went wrong while verifying the email. Please try again.")
         }
     }
     }
     return (
         //login page setup, containing all the inputs, and buttons needed. 
         <div className='sup'>
         <div className='signup-page'>
             <div className="sugradient-box">
                 <div>
                 <img src="/images/Logo.png" alt="Logo" width={235} height={54} className='signuplogo' /> 
                 </div>
                 <div className='signup-title'>Signup</div>
                     <div className="login-link">
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
                         <input className="signuppass-inp"
                             type="password"
                             placeholder="Password"
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             required
                         />
                         {(password.length<8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) &&
                         (<div className="strong-message">The password must be at least 8 characters long, and contain a mix of <br/> uppercase, lowercase and digits.</div>)}
                         <label className="confirm-password">Confirm Password:<span class="required-star"></span></label>
                         <input className="confpass-inp"
                             type="password"
                             placeholder="Confrim Password"
                             value={confpassword}
                             onChange={(e) => setConfrimPassword(e.target.value)}
                             required
                         />
                         {password !== confpassword && (<div className="error-message">Password and confirm password do not match</div>)} {/*displays error if there is a password mismatch*/}
                         {/* <label className="security-question">Security Question</label>
                         <input className="securityQ-inp"
                             type="text"
                             placeholder="Some Question"
                             value={securityQ}
                             onChange={(e) => setSecurityQ(e.target.value)}
                             required
                         /> */}
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
         </div>
     );
     
 }
 
 export default EmployeeSignup