import { useEffect,useState } from 'react'
import { useNavigate,Link} from 'react-router-dom';
// import axios from 'axios';


const Home = (prop)=>{
    const history=useNavigate();
    const profilecheck = async () => {
        try {
            history(`/profilehome`);
        }
        catch (error) {
            console.error('Error during login, try again', error);
        }
    };
    return (        
        <div className='home-page'>
         <button className="sub-button" type="button" onClick={profilecheck}>Profile</button>
        </div>
    )

}

export default Home