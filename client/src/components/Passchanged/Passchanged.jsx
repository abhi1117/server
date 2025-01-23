import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import "./Passchanged.css";
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

const Passchanged = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Handle form submission
    console.log("Form submitted:", formData);
    setShowSuccessModal(true); // Show success modal
  };

  const handleCancel = () => {
    setFormData({
      password: "",
      confirmPassword: "",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    // Optionally, redirect to sign in page or perform other actions
  };

  return (
    <div className="signin-page">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="signin-container">
        <form onSubmit={handleSubmit} className="form">
          <h2>Change Password</h2>
          <h5 className="form-description">Set up your new password</h5>
          <div className="form-group">
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
          <div className="form-group">
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
          <p className="password-requirements">
            Password should contain at least 1 upper case, numeric, special
            character and must be 8 characters long.
          </p>
          <div className="button-group">
            <button type="submit" className="submit-btn">
              Submit
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content" style={{width:"20%"}}>
            <div className="icon-container">
              <FontAwesomeIcon icon={faCircleCheck} className="check-icon" />
            </div>
            <h3>Password Changed Successfully</h3>
            <p className="para">
              You have successfully changed your password, Now login with your
              new credentials.
            </p>
            <button onClick={closeSuccessModal} className="signin-btn">
              Go to Sign In
            </button>
          </div>
        </div>
      )}
      <footer className="footer">
        Copyright © DrishtiCPS 2024 | All Rights Reserved
      </footer>
    </div>
  );
};

export default Passchanged;
