import OTPInput from "react-otp-input";
import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import axios from 'axios'
import "../styles/otp.css";

function Verify() {
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
      await axios.post('http://localhost:3000/empsignup', userData)
          .then((res) => {
              if (res.data === "yay") 
              {
                  history(`/login`)
              } 
              else if (res.data === "email exists") //maybe move this back to sign up?
              {
                  alert("The email you signed up with is already in use");
              }
              else if (res.json ==="ohooo")
              {
                  alert("An error occured when signing up");
              }
          })
          .catch((e) => {
              alert('Something went wrong, try again');
              console.log(e);
          });
    }
    else
    {
      alert("Incorrect OTP")
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
    </div>
  );
}

export default Verify;
