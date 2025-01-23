import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import logo from "../Public/logo.png";
import "./Emailverified.css";

function EmailVerified() {
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const otpInputs = useRef([]);

  useEffect(() => {
    otpInputs.current[0]?.focus();
  }, []);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleResend = () => {
    setResendCount(resendCount + 1);
  };

  const handleVerify = () => {
    const isOtpValid = otp.every((digit) => digit === "1");
    if (isOtpValid) {
      setIsVerified(true);
      navigate("/verifydirect"); // Redirect to "/verifydirect" route
    } else {
      alert("Invalid OTP");
    }
  };

  const handleStartOver = () => {
    setEmail("");
    setOtp(["", "", "", ""]);
    setIsVerified(false);
    otpInputs.current[0]?.focus();
  };

  return (
    <div className="email-verification-container">
      <img src={logo} alt="Logo" className="logo" />
      <div className="verification-form">
        <h3 className="head2">Email Verification</h3>
        <p style={{ color: "#8A8A8A", textAlign: "left", fontSize: "13px" }}>
          Enter one-time password sent to your email address
        </p>
        <p style={{ fontWeight: 600, textAlign: "left" }}>
          Enter Security code
        </p>
        {/* Apply OTP container class here */}
        <div className="otp-container otp-custom">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              ref={(input) => (otpInputs.current[index] = input)}
              style={{ width: "80px", textAlign: "center", height: "40px" }}
            />
          ))}
        </div>
        <p className="resend-text">
          Didn’t receive the code?{""}
          <button onClick={handleResend}>Resend</button>
        </p>
        <div className="button-container">
          <button className="wide-button" onClick={handleVerify}>
            Verify
          </button>
          <button className="wide-button2" onClick={handleStartOver}>
            Start Over
          </button>
        </div>
      </div>
      <span>
        
        <footer className="footer" >
          Copyright © DrishtiCPS 2024 | All Rights Reserved
        </footer>
      </span>
    </div>
  );
}

export default EmailVerified;
