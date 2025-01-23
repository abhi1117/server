import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import "./Verifyredirect.css"; // assuming you have a separate CSS file for styling
import logo from "./logo.png";

function Verifyredirect() {
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const otpInputs = useRef([]);

  useEffect(() => {
    // Focus the first input when the component mounts
    otpInputs.current[0]?.focus(); // Optional chaining to avoid errors if otpInputs.current is undefined
  }, []);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically move focus to the next input field if there's a value
    if (value && index < otp.length - 1) {
      otpInputs.current[index + 1]?.focus(); // Optional chaining to avoid errors
    }
  };

  const handleResend = () => {
    // Here you would typically send a request to resend the OTP to the user's email
    // For this example, let's just increment the resend count
    setResendCount(resendCount + 1);
  };

  const handleVerify = () => {
    // Here you would typically send the email and OTP to your server for verification
    // For this example, let's just check if all OTP fields are filled with '1'
    const isOtpValid = otp.every((digit) => digit === "1");
    if (isOtpValid) {
      setIsVerified(true);
    } else {
      alert("Invalid OTP");
    }
  };

  const handleStartOver = () => {
    setEmail("");
    setOtp(["", "", "", ""]);
    setIsVerified(false);
    otpInputs.current[0]?.focus(); // Focus the first input again, optional chaining used
    navigate("/signin"); // Redirect to "/signin" route
  };

  return (
    <div className="email-verification-container">
      <div className="verification-frame">
        <div className="verification-message">
          <FontAwesomeIcon
            icon={faCheckCircle}
            size="2x" // Using FontAwesome's built-in size classes
            style={{ color: "#0183FF" }}
          />
          <p className="verified">Email Verified Successfully!</p>
          <p style={{ fontSize: "13px", color: "#909090" }}>
            You have been authenticated. Now login with your credentials to get
            started.
          </p>
          <button className="wide-button" onClick={handleStartOver}>
            Go to Sign In
          </button>
        </div>
      </div>
      <img src={logo} alt="Logo" className="logo" />
      {!isVerified && (
        <div className="verification-form">
          <h3 className="head1">Email Verification</h3>
          <p style={{ color: "#8A8A8A" }}>
            Enter one-time password sent to your email address
          </p>
          <p style={{ fontWeight: 600, textAlign: "left" }}>
            Enter Security code
          </p>
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                ref={(input) => (otpInputs.current[index] = input)} // Assigning the reference here
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
          <footer className="footer" style={{backgroundColor:"none"}}>
            Copyright © DrishtiCPS 2024 | All Rights Reserved
          </footer>
        </div>
      )}
    </div>
  );
}

export default Verifyredirect;
