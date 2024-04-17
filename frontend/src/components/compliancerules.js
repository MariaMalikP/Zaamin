import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/compliancerules.css'; 
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {AlertTitle, Alert} from '@mui/material';

const Compliancerules =() => {
    const navigate = useNavigate();
    const { email, role, hashp } = useParams();
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [returnStatus, setReturnStatus] = useState('');
    const [regulations, setRegulations] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [regulationName, setRegulationName] = useState('');
    const [regulationDescription, setRegulationDescription] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    
  useEffect(() => {
    authcheck();

    // Function to get profile picture for the header
    const fetchProfilePic = async () => {
        try {
            const response = await axios.post('http://localhost:3000/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
            }
        } catch (error) {
            //display error is profile information cannot be fetched
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error while fetching profile information');
        }
        
    }
    fetchProfilePic();
}, []);

    useEffect(() => {
        // Fetch regulations from the backend when the component mounts
        fetchRegulations();
    }, []);
    
    // Fucntion to make sure admin is accessing the page, if anyone else attempts to, they are redirected to an error page.
    const requiredRole="admin"
    const authcheck =  async () =>{
      
      const validcheck = await axios.post('http://localhost:3000/validcheck', { email, hashp, role,requiredRole });
      if(validcheck.data.message!= 'success')
      {
        navigate("/errorpage")
      }
    }

    // Fucntion to get all regulations form the database table
    const fetchRegulations = async () => {
        try {
            const res = await axios.get('http://localhost:3000/regulations');
            setRegulations(res.data.reg);
            if(res.data==="Internal Server Error")
            {
                setAlertOpen(true);
                setAlertSeverity('error');
                setAlertMessage('An Internal Server Error occured');
        
                
            }
        } catch (error) {
            console.error('Error fetching regulations:', error);
        }
    };

    // Function to add a new regualtion to the database table
    const handleAddRegulation = () => {
        // Send POST request to add a new regulation
        axios.post('http://localhost:3000/regulations', { name: regulationName, description: regulationDescription })
            .then((res) => {
                // Refresh regulations after adding
                fetchRegulations();
                // Clear input fields
                setRegulationName('');
                setRegulationDescription('');
                // Close popup
                setShowPopup(false);

                //updating alert components to set the success alert
                setAlertOpen(true);
                setAlertSeverity('success');
                setAlertMessage(`Regulation with name '${regulationName}' added successfully.`);
            })
            .catch(error => {
                console.error('Error adding regulation:', error);
            });
    };

    // Functions to control popup closing and showing
    const handlebuttonClick=() =>
    {
        setShowPopup(true)
    }
    const handlePopupClose = () => {
        setShowPopup(false);
    };
    // Function to navigate to the violations page
    const navViolations = async () => {
        navigate(`/violations/${email}/${role}/${hashp}`);
      };

    // Displaying the Regualtions using a map function. If the add regualtion button is clicked, a popup is shown to 
    // add regulations. Once the cross button is clicked on the popup, the handlePopupClose function is called. The submit button in the
    // is connected to handleAddRegualtion to add regulations to the database, the version number is also updated there.
    return (    
        <div className='comp-container'>
        <Header email={email} userProfile={userProfilePic} hashp={hashp}/>
            <div className="Group2280" >
                <img src="/images/compliance.png" alt="Icon" className="ClipboardIcon" />
                <div className="ComplianceDashboardRegulations"> Compliance Dashboard / Regulations</div> 
                {regulations.length>0 && 
                <div className="RegulationVersion">Version: {regulations[0].version}</div>
                }
            </div>
            {regulations.length>0 && (
            <div className="RegulationBar">
                {regulations.map((regulation, index) => (
                <div key={index} className="RegulationBox" style={{top: index * 200 + 150}}>
                    <div className="RegulationName">{regulation.name}</div>
                    <div className="regulation-description">{regulation.description}</div>
                </div>
                    ))}
            </div>
            )} 

            <div className="AddRegulationButton" onClick={handlebuttonClick}>
                <div className="Rectangle-add-button" />
                <div className="Frame-add-button">
                    <div className="text-add-button">Add a Regulation</div>
                </div>
            </div>
            <button className='ViewViolations-link' onClick={navViolations}>View Violations</button>

            {showPopup && (
                <div className="Popup">
                    <div className="PopupContent">
                        <span className="CloseButton-comp" onClick={handlePopupClose}>×</span>
                        <div className='PopupTitle-comp '>Add a Regulation</div> {/* Heading for adding a regulation */}
                        <input
                            type="text"
                            name="regulationName"
                            value={regulationName}
                            onChange={(e) => setRegulationName(e.target.value)}
                            placeholder="Regulation Name"
                            className="InputField-name-comp RegulationNameInput"
                        />
                        <input
                            type="text"
                            name="regulationDescription"
                            value={regulationDescription}
                            onChange={(e) => setRegulationDescription(e.target.value)}
                            placeholder="Regulation Description"
                            className="InputField-description-comp RegulationDescriptionInput"
                        />
                        <div className="SubmitButtonContainer">
                            <button onClick={handleAddRegulation} className="SubmitButton">Submit</button>
                        </div>
                    </div>
                </div>
            )}
             {/* Alert component */}
             {alertOpen &&
             <Alert className="alert-container-compliance"severity={alertSeverity} onClose={() => setAlertOpen(false)} open={alertOpen} sx= {{padding: '20px', fontSize: '20px',}}>
                <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                {alertMessage}
            </Alert>
        }
        </div>
    );
}

export default Compliancerules