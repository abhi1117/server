import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons"; // Add faCheckCircle
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./SecurityCodeFrame.css";
import logo from "../Public/logo.png";

const SecurityCodeFrame = () => {
  const [formData, setFormData] = useState({
    startupName: "",
    incorporationDate: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true); // State for modal visibility

  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoneChange = (phone) => {
    setFormData({
      ...formData,
      contactNumber: phone,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Here you can add the logic to send the security code
    setIsModalOpen(true); // Show the modal when form is submitted
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Hide the modal
    navigate("/email-verified"); // Redirect to the email verified page
  };

  return (
    <div className="signup-page">
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{width:"20%"}}>
            <FontAwesomeIcon icon={faCheckCircle} size="2x" color="#0183FF" />{" "}
            {/* Add the tick mark icon */}
            <h3>Security code sent</h3>
            <p style={{ color: "#5B5B5B" , fontSize:"13px" }}>
              Please check the security code sent to your email address
            </p>
            <button className="modal-button" onClick={handleModalClose}>
              Enter Code
            </button>
          </div>
        </div>
      )}
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="signup-container">
        <form onSubmit={handleSubmit} className="form">
          <h2>
            Sign Up to <span className="drishti">DRISHTI</span>
          </h2>
          <h5 className="form-description">
            Enter the following details to register yourself on Drishti
          </h5>
          <div className="form-group">
            <label htmlFor="startupName">Startup Name</label>
            <input
              type="text"
              name="startupName"
              placeholder="Enter Startup Name"
              id="startupName"
              value={formData.startupName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="incorporationDate">Incorporation Date</label>
            <input
              type="date"
              name="incorporationDate"
              id="incorporationDate"
              placeholder="Enter Incorporation Date"
              value={formData.incorporationDate}
              onChange={handleChange}
              required
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = e.target.value ? "date" : "text")}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Official Startup Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Startup Email Address"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <PhoneInput
              country={"in"}
              value={formData.contactNumber}
              onChange={handlePhoneChange}
              inputProps={{
                name: "contactNumber",
                required: true,
                autoFocus: false,
              }}
            />
          </div>
          <div className="form-group-row">
            <div className="form-group half-width">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-visibility"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            <div className="form-group half-width">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Enter Password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-visibility"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>
          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>
      <footer className="footer">
        Copyright © DrishtiCPS 2024 | All Rights Reserved
      </footer>
    </div>
  );
};

export default SecurityCodeFrame;
