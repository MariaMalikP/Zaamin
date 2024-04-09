import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/compliancerules.css'; 
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const Compliancerules =() => {
    const [regulations, setRegulations] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [regulationName, setRegulationName] = useState('');
    const [regulationDescription, setRegulationDescription] = useState('');

    // Dummy data for demonstration
    // const dummyRegulations = [
    //     { name: "Regulation Name 1", description:"jsjnjndjfnvjdnfvjdnfvjdfn" },
    //     { name: "Regulation Name 2", description:"jsjnjndjfnvjdnfvjdnfvjdfn"},
    //     { name: "Regulation Name 3", description:"jsjnjndjfnvjdnfvjdnfvjdfn" },
    //     // Add more regulation objects as needed
    // ];
    // useEffect(() => {
    //     // Set the regulations state with dummy data
    //     setRegulations(dummyRegulations);
    // }, []);
    useEffect(() => {
        // Fetch regulations from the backend when the component mounts
        fetchRegulations();
    }, []);
    
    const fetchRegulations = async () => {
        try{
        await axios
        .post('http://localhost:3000/regulations_get')
        .then((res) => {
            setRegulations(res.data);
            alert(res.data.description)
        })
    }
        catch(error)
        {
            console.error('Error fetching regulations:', error);
        }
    };
    const handleAddRegulation = () => {
        // Send POST request to add a new regulation
        axios.post('http://localhost:3000/regulations', { name: regulationName, description: regulationDescription })
            .then(() => {
                // Refresh regulations after adding
                fetchRegulations();
                // Clear input fields
                setRegulationName('');
                setRegulationDescription('');
                // Close popup
                setShowPopup(false);
            })
            .catch(error => {
                console.error('Error adding regulation:', error);
            });
    };

    const handleupdate = () => {
        alert("clicked")
        
        console.log(`Button clicked for regulation with ID:`);
    }
    const handlebuttonClick=() =>
    {
        setShowPopup(true)
    }
    const handlePopupClose = () => {
        setShowPopup(false);
    };
    const handleSubmit = () => {
        
        setRegulationName('');
        setRegulationDescription('');
        setShowPopup(false);
    };


    return (    
        <div className='comp-container'>
            <div><Header/></div>
            <div className="Group2280" >
                <img src="/images/compliance.png" alt="Icon" className="ClipboardIcon" />
                <div className="ComplianceDashboardRegulations"> Compliance Dashboard / Regulations</div> 
            </div>
            {regulations.length>0 && (
            <div className="RegulationBar">
                {regulations.map((regulation, index) => (
                <div key={index} className="RegulationBox" style={{top: index * 200 + 100}}>
                    <div className="RegulationName">{regulation.name}</div>
                    <div className="regulation-description">{regulation.description}</div>
                    <div className="update-ButtonContainer">
                        <button className="Update-Button" onClick={() => handleupdate()}>
                            <img src="/images/pen.png" alt="Button Image" className="Update-ButtonImage" />
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
            {showPopup && (
                <div className="Popup">
                    <div className="PopupContent">
                        <span className="CloseButton" onClick={handlePopupClose}>×</span>
                        <div className='PopupTitle-comp '>Add a Regulation</div> {/* Heading for adding a regulation */}
                        <input
                            type="text"
                            name="regulationName"
                            value={regulationName}
                            onChange={(e) => setRegulationName(e.target.value)}
                            placeholder="Regulation Name"
                            className="InputField RegulationNameInput"
                        />
                        <input
                            type="text"
                            name="regulationDescription"
                            value={regulationDescription}
                            onChange={(e) => setRegulationDescription(e.target.value)}
                            placeholder="Regulation Description"
                            className="InputField RegulationDescriptionInput"
                        />
                        <div className="SubmitButtonContainer">
                            <button onClick={handleAddRegulation} className="SubmitButton">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>


    );
}

export default Compliancerules