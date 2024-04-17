import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import axios from "axios";
import OTPInput from "react-otp-input";
import "../styles/otp.css";
import {AlertTitle, Alert} from '@mui/material';

function SendingOTP() {
  const history = useNavigate();
  const location = useLocation();
  const passedThat = location.state;
  const hashedOTP = passedThat.hashedOTP || null;
  const email = passedThat.email || null;
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [OTP, setOTP] = useState("");
  function handleChange(otp) {
    setOTP(otp);
  }

  async function handleVerify() {
    if (hashedOTP == null) return;

    const match = await bcrypt.compare(OTP, hashedOTP);
    if (match) {
      history(`/changepass/${email}`);
    } else {
      // alert("Incorrect OTP");
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertMessage('Incorrect OTP, try again');
    }
  }

  return (
    <div>
    <div className="verifyDiv">
      <p className="wow">Verify Account</p>
      <p className="woow">An OTP has been sent to your entered email.</p>
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
      </div>
      <button className="verify-button" type="submit" onClick={handleVerify}>
        Verify
      </button>
    </div>
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

export default SendingOTP;