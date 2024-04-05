import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import '../styles/medical.css'; 
import { Link } from 'react-router-dom';

const FinanceCheck = () => {
  // State variables
  const { email , role} = useParams();
  const [medicalData, setMedicalData] = useState(null);

  // useEffect(() => {
  //   // Function to fetch medical data from the server
  //   const fetchMedicalData = async () => {
  //     try {
  //       const response = await axios.get('/api/medical-info'); // Assuming endpoint to fetch medical info is '/api/medical-info'
  //       setMedicalData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching medical data:', error);
  //     }
  //   };

  //   fetchMedicalData(); // Fetch medical data when component mounts
  // }, []);

  const handleFileUpload = async (event) => {
    window.alert("Medical Check Details Updated Successfully");
    // const file = event.target.files[0];
    // const formData = new FormData();
    // formData.append('medicalHistory', file);

    // try {
    //   await axios.post('/api/update-medical-history', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });
    //   // Refresh medical data after successful upload
    //   const response = await axios.get('/api/medical-info');
    //   setMedicalData(response.data);
    // } catch (error) {
    //   console.error('Error uploading medical history:', error);
    // }
  };


  return (
    <div>
      <div className="finannce">
      {/* <Header email={email} userProfile={userProfile} /> */}
        <h2>Medical Check Details</h2>
        {medicalData && (
          <div>
            <p>Name: {email}</p>
            <p>role: {role}</p>
            {/* <p>Document: {medicalData.medicalHistory}</p> */}
          </div>
        )}
        <input type="file" onChange={handleFileUpload} />
        <Link to="/other-page">Go to Other Page</Link>
      </div>
    </div>
  );
};

export default FinanceCheck;
