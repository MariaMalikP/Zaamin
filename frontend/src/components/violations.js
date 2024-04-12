import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/violations.css'; 
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
// import {Progress, ProgressLabel, CircularProgress, CircularProgressLabel,} from "@chakra-ui/progress"
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react'
const Violations =() => {
    const [violations, setViolations] = useState([]);
    const [percentage, setPercentage] = useState(0);
    
    // Dummy data for demonstration
    const dummyRegulations = [
        { name: "Regulation Name 1", description:"jsjnjndjfnvjdnfvjdnfvjdfn" },
        { name: "Regulation Name 2", description:"jsjnjndjfnvjdnfvjdnfvjdfn"},
        { name: "Regulation Name 3", description:"jsjnjndjfnvjdnfvjdnfvjdfn" },
        // Add more regulation objects as needed
    ];
    useEffect(() => {
        // Set the regulations state with dummy data
        // setRegulations(dummyRegulations);
        fetchViolations()
    }, []);

    const fetchViolations = async () => {
        try {
            const res = await axios.get('http://localhost:3000/violations');
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
    
    return (   

        <div className='violations-container' style={HeightStyle}>
            <div><Header/></div>
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
            <a href="/compliancerules" class="ViewRegulations-link">View Compliance Regulations</a>
            </div>
           
        </div>
        
        


    );
}

export default Violations