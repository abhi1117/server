import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./Signup.css";
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.css";
import Modal from "./Modal";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startupName: "",
    incorporationDate: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      incorporationDate: e.target.value,
    });
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const isValidDate = (dateString) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateString)) return false;

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidDate(formData.incorporationDate)) {
      alert("Please enter the date in DD/MM/YYYY format.");
      return;
    }

    if (formData.startupName.trim() === "") {
      alert("Please enter a startup name.");
      return;
    }

    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!validatePhoneNumber(formData.contactNumber)) {
      alert("Please enter a valid phone number.");
      return;
    }

    console.log("Form submitted:", formData);
    setIsModalVisible(true);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (phoneNumber) => {
    return phoneNumber.length >= 10;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleModalClose = () => {
    setIsModalVisible(true);
    navigate("/email-verified");
  };

  return (
    <div className="signup-page">
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
              value={formData.startupName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="incorporationDate">Incorporation Date</label>
            <input
              type="text"
              name="incorporationDate"
              id="incorporationDate"
              placeholder="DD/MM/YYYY"
              value={formData.incorporationDate}
              onChange={handleDateChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Official Startup Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Startup Email Address"
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
          <div className="form-group full-width">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password-visibility"
                onClick={togglePasswordVisibility}
              >
                <i
                  className={`fas ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                  style={{ marginTop: "10px" }}
                ></i>
              </button>
            </div>
          </div>
          <button type="submit" style={{ width: "auto" }}>
            Sign Up
          </button>
        </form>
      </div>
      {isModalVisible && (
        <Modal isVisible={isModalVisible} onClose={handleModalClose}>
          <div className="modal-body">
            <i className="fas fa-check-circle" style={{ fontSize: "2rem", color: "#007bff" }}></i>
            <h3 style={{fontWeight:"700"}}>Security Code Sent</h3>
            <p style={{color:"#909090", fontSize:"14px"}}>Please check the security code sent to your email address</p>
            <button className="submit-btn" onClick={handleModalClose}>Enter Code</button>
          </div>
        </Modal>
      )}
      <footer className="footer">
        Copyright © DrishtiCPS 2024 | All Rights Reserved
      </footer>
    </div>
  );
};

export default Signup;
