import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/violations.css'; 
import axios from 'axios';

const Violations =() => {
    const [regulations, setViolations] = useState([]);
    
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
            const res = await axios.get('http://localhost:3000/regulations');
          setViolations(res.data);
        } catch (error) {
          console.error('Error fetching violations:', error);
        }
      };
    
    return (    
        <div className='violations-container'>
            <div><Header/></div>
            <div className="Group2280-violations" >
                <img src="/images/compliance.png" alt="Icon" className="ClipboardIcon-violations" />
                <div className="ComplianceDashboardViolations"> Compliance Dashboard / Violations</div> 
            </div>
            {regulations.length>0 && (
            <div className="RegulationBar-violations">
                {regulations.map((regulation, index) => (
                <div key={index} className="RegulationBox-violations" style={{top: index * 200 + 100}}>
                    <div className="RegulationName-violations">{regulation.name}</div>
                    <div className="description-violations">{regulation.description}</div>
                </div>
                    ))}
            </div>
            )} 
            
        </div>
        


    );
}

export default Violations