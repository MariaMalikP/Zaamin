 /* eslint-disable */
 
import { useEffect,useState } from 'react'
import Header from './header';
import '../styles/home.css'; 
import { useNavigate, Link, useParams } from 'react-router-dom';
// import axios from 'axios';


const Home = (prop)=>{
    const history=useNavigate();
    const [email, setemail] = useState('');
    const profilecheck = async () => {
        try {
            history(`/profilehome/${email}`);
        }
        catch (error) {
            console.error('Error during login, try again', error);
        }
    };
    return (    
        <div className='home'>
        {/* <div><Header /></div> */}
        <form className='form'>
        <div>
            <input
                className="user-inp"
                type='email'
                placeholder='email'
                value={email}
                onChange={(e) => setemail(e.target.value)}
            />
       </div>    
       </form>
         <button className="sub-button" type="button" onClick={profilecheck}>Profile</button>
        </div>
    )

}

export default Home