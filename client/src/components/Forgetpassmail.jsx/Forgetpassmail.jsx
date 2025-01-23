import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import "./Forgetpassmail.css";
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.css";

const Forgetpassmail = () => {
  const [formData, setFormData] = useState({
    startupName: "",
    incorporationDate: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mailSent, setMailSent] = useState(false);

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
    console.log("Form submitted:", formData, { rememberMe });
    setMailSent(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleCancel = () => {
    setMailSent(false);
  };

  return (
    <div className="signin-page">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="forgetpass-container">
        {mailSent ? (
          <div className="overlay">
            <div className="mail-sent-popup">
              <i className="fa-regular fa-circle-check"></i>
              <h2 className="mailsent">Mail Sent</h2>
              <p>We have sent you a mail to reset your password</p>
              <div className="button-group">
                <button
                  onClick={() =>
                    (window.location.href = "https://mail.google.com/")
                  }
                  className="submit-btn"
                >
                  Check Mail
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <h2>Forgot Password</h2>
            <h5 className="form-description">
              Enter email id registered with Drishti
            </h5>
            <div className="form-group">
              <label htmlFor="startupName">Email/Phone</label>
              <input
                type="text"
                name="startupName"
                placeholder="Enter Email/Phone"
                id="startupName"
                value={formData.startupName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="submit-btn">
                Submit
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      <footer className="footer">
        Copyright © DrishtiCPS 2024 | All Rights Reserved
      </footer>
    </div>
  );
};

export default Forgetpassmail;
