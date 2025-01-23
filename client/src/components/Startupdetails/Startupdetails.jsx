import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./Startupdetails.css";
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.css";

const Startupdetails = () => {
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    console.log("Form submitted:", formData);
    navigate("/security-code");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleCancel = () => {
    // Handle cancel action here, like clearing the form fields
    setFormData({
      startupName: "",
      incorporationDate: "",
      email: "",
      contactNumber: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="Startupdetails-page">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="Startupdetails-container" style={{width:"22%"}}>
        <form onSubmit={handleSubmit} className="form">
          <h2>Startup Details</h2>
          <h5 className="form-description">Add your startup details</h5>
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
            <label htmlFor="incorporationDate">Startup Registration Date</label>
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
          <div className="button-container">
          <button
            type="submit"
            style={{ width: "calc(50% - 5px)", marginRight: "5px" }}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            style={{ width: "calc(50% - 5px)", marginLeft: "5px" }}
          >
            Cancel
          </button>
        </div>
        </form>
      </div>
      <footer className="footer" style={{
        marginTop: "100px",
        textAlign: "center",
        fontSize: "11px",
        color: "#666",
        backgroundColor: "#f0f2f5"
      }}>
        Copyright © DrishtiCPS 2024 | All Rights Reserved
      </footer>
    </div>
  );
};

export default Startupdetails;
