import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import axios from "axios";
import OTPInput from "react-otp-input";
import "../styles/otp.css";

function SendingOTPedit() {
  const history = useNavigate();
  const location = useLocation();
  const passedThat = location.state;
  const hashedOTP = passedThat.hashedOTP || null;
  const email = passedThat.email || null;

  const [OTP, setOTP] = useState("");
  function handleChange(otp) {
    setOTP(otp);
  }

  async function handleVerify() {
    if (hashedOTP == null) return;

    const match = await bcrypt.compare(OTP, hashedOTP);
    if (match) {
      history(`/editprofile/${email}/${passedThat.role}`);
    } else {
      alert("Incorrect OTP");
    }
  }

  return (
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
  );
}

export default SendingOTPedit;