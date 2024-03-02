import '../styles/signup.css';
import { useNavigate,Link} from 'react-router-dom';
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
    const [selectedDate, setSelectedDate] = useState('');
    const [id, setId] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const home = () => {
        history(`/login`);
    };
    async function logincheck(e) {
        try {
                await axios
                    .post('http://localhost:3000/empsignup', {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate})
                    .then((res) => {
                        if (res.data === "yay") 
                        {
                            setSuccess('Successfully signed up');
                            history(`/login`);
                           
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
                <div className='login-title'>Signup</div>
                    <div className="signup-link">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                    <form onSubmit={logincheck} className='loginForm'>
                        <label className="name">Name:</label>
                        <input className="first-name"
                            type="email"
                            placeholder="First Name"
                            value={firstname}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <input className="last-name"
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
                        <label className="security-question">Security Question</label>
                        <input className="securityQ-inp"
                            type="password"
                            placeholder="Some Question"
                            value={securityQ}
                            onChange={(e) => setSecurityQ(e.target.value)}
                            required
                        />
                        <label className="address">Address</label>
                        <input className="address-inp"
                            type="password"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                        <label className="dob">Date Of Birth</label>
                        <input className="dob-inp"
                            type="password"
                            placeholder="Date of Birth"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                        />
                        <label className="age">Age</label>
                        <input className="age-inp"
                            type="password"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                        <label className="phone">Phone Number</label>
                        <input className="phone-inp"
                            type="password"
                            placeholder="Phone Number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                        <button type="login-button" onClick={logincheck}> Signup </button>
                    </form>
            </div>
        </div>
    );
    
}

export default EmployeeSignup