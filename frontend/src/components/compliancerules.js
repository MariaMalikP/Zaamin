import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/compliancerules.css'; 
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {AlertTitle, Alert} from '@mui/material';

const Compliancerules =() => {
    const [regulations, setRegulations] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [regulationName, setRegulationName] = useState('');
    const [regulationDescription, setRegulationDescription] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        // Fetch regulations from the backend when the component mounts
        fetchRegulations();
    }, []);
    
    const fetchRegulations = async () => {
        try {
            const res = await axios.get('http://localhost:3000/regulations');
            setRegulations(res.data.reg);
            if(res.data==="Internal Server Error")
            {
                alert("Internal Server Error")
            }
        } catch (error) {
            console.error('Error fetching regulations:', error);
        }
    };
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

    const handleDelete = async (regulationId) => {
        try {
            // Make an API request to delete the regulation
            const res = await axios.delete(`http://localhost:3000/regulations?id=${regulationId}`);
            if(res.data.message==="delete successful")
            {
                setAlertOpen(true);
                setAlertSeverity('success');
                setAlertMessage(`Regulation with ID '${regulationId}' deleted successfully.`);
                fetchRegulations();
            }
           
        } catch (error) {
            console.error('Error deleting regulation:', error);
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error deleting regulation. Please try again later.');
            
        }
    };
    const handlebuttonClick=() =>
    {
        setShowPopup(true)
    }
    const handlePopupClose = () => {
        setShowPopup(false);
    };

    return (    
        <div className='comp-container'>
            <div><Header/></div>
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
                    {/* <div className="RegulationVersion">Version: {regulation.version}</div> */}
                    <div className="update-ButtonContainer">
                        <button className="Update-Button" onClick={() => handleDelete(regulation._id)}>
                            <img src="/images/trash.png" alt="Button Image" className="Update-ButtonImage" />
                        </button>
                    </div>
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
            <a href="/violations" class="ViewViolations-link">View Violations</a>
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