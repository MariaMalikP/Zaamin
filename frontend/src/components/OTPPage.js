import OTPInput from "react-otp-input";
import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import axios from 'axios'
import "../styles/otp.css";
import {AlertTitle, Alert} from '@mui/material';

function Verify() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const history = useNavigate();
  const location = useLocation();
  const passedThat = location.state;
  let hashedOTP = null;
  let userData = null;

  if (passedThat !== undefined) {
    hashedOTP = passedThat.hashedOTP;
    userData = passedThat.user;
  }
  
  const [OTP, setOTP] = useState("");
  function handleChange(otp) {
    setOTP(otp);
  }

  async function handleVerify () {
    if (hashedOTP == null || userData == null)
      return;

    const match = await bcrypt.compare(OTP, hashedOTP);
    if (match)
    {
      console.log('Sending user sign up request');
      // console.log(userData);
      // await axios.post('http://localhost:3000/empsignup', userData)
      await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/empsignup', userData)
          .then((res) => {
              // console.log("Here" + res.data)
              if (res.data === "yay") 
              {
                // console.log('Successful')
                history("/login")
              } 
              else if (res.data ==="ohooo")
              {
                  setAlertOpen(true);
                  setAlertSeverity('error');
                  setAlertMessage(`An unexpected error occured when signing up, try again.`);
              } 
          })
          .catch((e) => {
              setAlertOpen(true);
              setAlertSeverity('error');
              setAlertMessage(`An unexpected error occured when signing up, try again.`);
              console.log(e);
          });
    }
    else
    {
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertMessage(`Incorrect OTP, try again.`);
    }
  }

  return (
    <div className="verifyDiv">
      <p className="wow">Verify Account</p>
      <p className="woow">
        An OTP has been sent to your entered email.
      </p>
      <p className="woow-also">Enter your Code here</p>
      <div className="otpElements">
        <div className="otp">
          <OTPInput
            onChange={handleChange}
            value={OTP}
            placeholder="0013"
            inputStyle="inputStyle"
            numInputs={4}
            renderInput={(props) => <input {...props} />}
          />
        </div>
        {/* <p className="p3">Didn't receive the code?</p>
        <p className="resend">Resend</p> */}
      </div>
      <button className="verify-button" type="submit" onClick={handleVerify}>Verify</button>
       {/* Alert component */}
       {alertOpen &&
            <Alert className="alert-container-signup"severity={alertSeverity} onClose={() => setAlertOpen(false)} open={alertOpen} sx= {{padding: '20px', fontSize: '20px',opacity:'1',borderRadius: '10px'}}>
               <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
               {alertMessage}
           </Alert>
       }
    </div>
  );
}

export default Verify;
