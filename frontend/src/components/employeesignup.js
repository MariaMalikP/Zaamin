import '../styles/signup.css';
import { useNavigate,Link, useLocation} from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
            const hunterApiKey = '4d1a599ad61555710ae5c7ab241d9a220f905855';
            const emailToVerify = email;
            const response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${emailToVerify}&api_key=${hunterApiKey}`);
            
            //if email is valid, proceed, else give an error
            if (response.data.data.result === 'deliverable') 
            {
            await axios
                .post('http://localhost:3000/empsignup', {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate,department,employeeStatus})
                .then((res) => {
                    if (res.data === "yay") 
                    {
                        setSuccess('Successfully signed up');
                        history(`/login`)
                    } 
                    else if (res.data=== "email exists")
                    {
                        alert("This email is already in use");
                    }
                    else if (res.json==="ohooo")
                    {
                        alert("An error occured when signing up");
                    }
                })
                .catch((e) => {
                    alert('Something went wrong, try again');
                    console.log(e);
                });
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
        <div className='login-page'>
            <div className="gradient-box">
                <div>
                <img src="/images/Logo.png" alt="Logo" width={235} height={54} className='logo' /> 
                </div>
                <div className='login-title'>Signup</div>
                    <div className="signup-link">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                    <hr class="separator"></hr>
                    <form onSubmit={logincheck} className='loginForm'>
                        <label className="name">Name:</label>
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
                        <label className="email">Email:</label>
                        <input className="email-inp"
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
                        {(password.length<8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) &&
                        (<div className="strong-message">The password must be at least 8 characters long, and contain a mix of <br/> uppercase, lowercase and digits.</div>)}
                        <label className="confirm-password">Confirm Password:</label>
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
                        <label className="address">Address</label>
                        <input className="address-inp"
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                        <div className='dob'>Date of Birth:</div>
                        <div className='dob-picker'>
                        <DatePicker
                            className='dob-input'
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
                        <label className="age">Age</label>
                        <input className="age-inp"
                            type="text"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                        <label className="phone">Phone Number</label>
                        <input className="phone-inp"
                            type="text"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <label className="department">Department</label>
                        <input className="department-inp"
                            type="text"
                            placeholder="Department"
                            value={department}
                            onChange={(e) => setDeparment(e.target.value)}
                            required
                        />
                        <button type="login-button" > Signup </button>
                    </form>   
            </div>
        </div>
    );
    
}

export default EmployeeSignup