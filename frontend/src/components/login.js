import { useEffect,useState } from 'react'
import { useNavigate,Link} from 'react-router-dom';
// import axios from 'axios';


const Login= (prop)=>{
    const history=useNavigate();
    const home = async () => {
        try {
            history(`/home`);
        }
        catch (error) {
            console.error('Error during login, try again', error);
        }
    };
    const signup = async () => {
        try {
            history(`/signuplanding`);
        }
        catch (error) {
            console.error('Error during sugnup, try again', error);
        }
    };
    return (        
        <div>
         <button className="sub-button" type="button" onClick={home}>Home</button>
         <button className="sub-button" type="button" onClick={signup}>Signup</button>
        </div>
    )

}

export default Login