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
    const [id, setId] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const location = useLocation();
    const employeeStatus = location.state?.employeeStatus;
    const home = () => {
        history(`/login`);
    };
    async function logincheck(e) {
        e.preventDefault();
        try {
                await axios
                    .post('http://localhost:3000/empsignup', {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate,department,employeeStatus})
                    .then((res) => {
                        if (res.data === "yay") 
                        {
                            setSuccess('Successfully signed up');
                            history(`/login`)
                           
                        } 
                    })
                    .catch((e) => {
                        alert('wrong deets');
                        console.log(e);
                    });
        } catch (e) {
            console.log(e);
        }
    }
    return (
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
                        <label className="confirm-password">Confirm Password:</label>
                        <input className="confpass-inp"
                            type="password"
                            placeholder="Confrim Password"
                            value={confpassword}
                            onChange={(e) => setConfrimPassword(e.target.value)}
                            required
                        />
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
                        {/* <label className="dob">Date Of Birth</label>
                        <input className="dob-inp"
                            type="text"
                            placeholder="dd/mm/yy"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                        /> */}
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