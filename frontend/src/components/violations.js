import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/violations.css'; 
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';



const Violations =() => {
    const { email, role, hashp } = useParams();
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [returnStatus, setReturnStatus] = useState('');
    const [violations, setViolations] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const navigate = useNavigate();


      
  useEffect(() => {
    authcheck();

    // Function to get profile picture for the header
    const fetchProfilePic = async () => {
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
            }
        } catch (error) {
            //display error is profile information cannot be fetched
            alert('Error fetching Profile Information'+ error);
        }
    }
    fetchProfilePic();
    }, []);
    useEffect(() => {
        // Fetch violations from the backend when the component mounts
        fetchViolations()
    }, []);

    const requiredRole="admin"
    const authcheck =  async () =>{
      // Fucntion to make sure admin is accessing the page, if anyone else attempts to, they are redirected to an error page.
      const validcheck = await axios.post('https://zaaminbackend.vercel.app/validcheck', { email, hashp, role,requiredRole });
      if(validcheck.data.message!= 'success')
      {
        navigate("/errorpage")
      }
    }

    // Fucntion to get all violations form the database table
    const fetchViolations = async () => {
        try {
            const res = await axios.get('https://zaaminbackend.vercel.app/violations');
          setViolations(res.data.violations);
          setPercentage(res.data.percentage);
        } catch (error) {
          console.error('Error fetching violations:', error);
        }
      };

      // Calculating the height of the conatiner according to the number of vioaltions
      // recieved by add a base value and multiplying the number of violations with a set value (160px)
      const containerHeight = (violations.length*150) +1000
      const HeightStyle = { height:`${containerHeight}px` }

      //Fucntion to control the colour of the ring according to the percentage given
      const getColorForPercentage = (percentage) => {
        // Define color ranges
        if (percentage<=25)
        {
            return '#E53935'; //red
        }
        else if (percentage > 25 && percentage <= 75) 
        {
            return '#FFB300'; //orange
        } 
        else if (percentage > 75 && percentage <= 100) 
        {
            return '#8BC34A'; //green
        }

        // Default to black if no range matches
        return 'black';
    };

    const getTrailingForPercentage = (percentage) => {
        // Define color ranges
        if (percentage<=25)
        {
            return '#EF9A9A';
        }
        else if (percentage > 25 && percentage <= 75) 
        {
            return '#FFECB3';
        } 
        else if (percentage > 75 && percentage <= 100) 
        {
            return '#DCEDC8';
        }

        // Default to black if no range matches
        return '#B0BEC5';
    };

  // Function to navigate to the regulations page  
  const navRegulations = async () => {
    navigate(`/compliancerules/${email}/${role}/${hashp}`);

  };

    // Displaying the Violations using a map function. Also showing the 
    // violations commited as a percentage of the total vioaltion. If less than
    // or equal to 25 percent, the circular component is hown in red, if between 25 and 75
    // orange, else green.
    return (   

        <div className='violations-container' style={HeightStyle}>
      <Header email={email} userProfile={userProfilePic} hashp={hashp}/>
            <div className="Group2280-violations" >
                <img src="/images/compliance.png" alt="Icon" className="ClipboardIcon-violations" />
                <div className="ComplianceDashboardViolations"> Compliance Dashboard / Violations</div> 
            </div>
            {violations.length>0 && (
            <div className="RegulationBar-violations">
                {violations.map((regulation, index) => (
                <div key={index} className="RegulationBox-violations" style={{top: index * 150 + 100}}>
                    <div className="RegulationName-violations">{regulation.name}</div>
                    <div className="description-violations">{regulation.description}</div>
                </div>
                    ))}
            </div>
            )} 
            
           
            <div className="circular-container">
                <div className='progress-heading-violations' >Compliance Progress</div>
            <CircularProgressbar
                value={percentage}
                text={`${percentage}%`} // Display the value as text in the center of the progress bar
                styles={buildStyles({

                    // Text size
                    textSize: '27px',

                    // How long animation takes to go from one percentage to another, in seconds
                    pathTransitionDuration: 0.5,
    
                    // Colors
                    pathColor: getColorForPercentage(percentage),
                    textColor: '#13476F',
                    trailColor: getTrailingForPercentage(percentage),
                  })}
            />
            </div>
            <div>
            <button className='ViewRegulations-link' onClick={navRegulations}>View Compliance Regulations</button>
            </div>
           
        </div>
        
        


    );
}

export default Violations