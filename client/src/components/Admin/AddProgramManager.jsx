import React, { useState } from "react";
import axios from "axios";
import "./AddProgramManager.css";

const AddProgramManagerModal = ({ showModal, handleClose, handleSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    adminName: "",
    email: "",
    adminPhone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.adminName) {
      errors.adminName = "Admin Name is required";
    } else if (/@/.test(formData.adminName)) {
      errors.adminName = "Admin Name should not contain '@'";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.adminPhone) {
      errors.adminPhone = "Admin Phone is required";
    } else if (!/^\d{10}$/.test(formData.adminPhone)) {
      errors.adminPhone = "Admin Phone should be a 10 digit number";
    }
    if (!formData.username) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username should be at least 3 characters long";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password should be at least 6 characters long";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        // const token = localStorage.getItem("token");
        /* const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };*/
        console.log(
          "Sending data to:",
          "https://incubator.drishticps.org/api/programmanagers"
        );
        console.log("Data:", formData);
        const response = await axios.post(
          "https://incubator.drishticps.org/api/programmanagers",
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          handleSuccess();
          handleClose();
        } else {
          setErrors({
            general:
              response.data.msg ||
              "Failed to add program manager. Please try again.",
          });
        }
      } catch (err) {
        console.error(
          "Failed to add program manager:",
          err.response ? err.response.data : err.message
        );
        setErrors({ general: err.response?.data?.msg || "Server error" });
      }
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="modal-overlay-addprogrammanager">
      <div className="modal-content-addprogrammanager">
        <h2 className="modal-title-addprogrammanager">Add Program Manager</h2>
        <form onSubmit={handleSubmit}>
          {Object.entries(formData).map(([key, value]) => (
            <div className="form-group-addprogrammanager" key={key}>
              <label>
                {key === "adminName"
                  ? "Admin Name"
                  : key[0].toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={key === "password" ? "password" : "text"}
                name={key}
                placeholder={`Enter ${
                  key === "adminName"
                    ? "Admin Name"
                    : key[0].toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")
                }`}
                value={value}
                onChange={handleChange}
                required
              />
              {errors[key] && (
                <div className="error-addprogrammanager">{errors[key]}</div>
              )}
            </div>
          ))}
          <div className="button-group-addprogrammanager">
            <button type="submit" className="btn-primary-addprogrammanager">
              Add
            </button>
            <button
              onClick={handleClose}
              className="btn-secondary22-addprogrammanager"
            >
              Cancel
            </button>
          </div>
          {errors.general && (
            <div className="error-addprogrammanager">{errors.general}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProgramManagerModal;
