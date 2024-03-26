import '../styles/signuplanding.css';
import { useNavigate,Link} from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

const Signuplanding= (prop)=>{
    const history=useNavigate();
    const employee = async () => {
        try {
            history(`/employeesignup`, { state: { employeeStatus: `employee` } });
        }
        catch (error) {
            console.error('Error going to the page, sorry', error);
        }
    };
    const admin = async () => {
        try {
            history(`/employeesignup`, { state: { employeeStatus: `admin` } });
        }
        catch (error) {
            console.error('Error going to the page, sorry', error);
        }
    };
    const manager = async () => {
        try {
            history(`/employeesignup`, { state: { employeeStatus: `manager` } });
        }
        catch (error) {
            console.error('Error going to the page, sorry', error);
        }
    };

    return (        
        <div className='sul'>
            <div className='sulgradient-box'>
                <div className='container_signup'>
                <div>
                <img src="/images/Logo.png" alt="Logo" width={235} height={54} className='signuplandlogo' /> 
                </div>
                <div className='signupLand-title'>SIGN UP AS</div>
                <button className="emp-button" onClick = {employee}>Employee</button>
                <button className="hr-button"onClick = {admin}>Admin</button>
                {/* <div>
                <img src="/images/maanger.png" alt="manager" className='manager' /> 
                </div> */}
                <button className="manager-button"onClick = {manager}>Manager</button>
                <div>
                <img src="/images/maanger.png" alt="manager" className='manager' /> 
                </div>
                <div>
                <img src="/images/admin.png" alt="adminr" className='admin' /> 
                </div>
                <div>
                <img src="/images/employee.png" alt="employee" className='employee' /> 
                </div>
                </div>
            </div>
        </div>
    )
}

export default Signuplanding