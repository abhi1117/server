import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./AddOrganizationModal.css";

const AddOrganizationModal = ({ showModal, handleClose, handleSuccess }) => {
  const [organizationName, setOrganizationName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const firstInputRef = useRef(null);

  useEffect(() => {
    if (showModal) {
      document.addEventListener("keydown", handleKeyDown);
      firstInputRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const formData = {
      organizationName,
      adminName,
      phoneNumber,
      username,
      email,
      password,
    };

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        "https://incubator.drishticps.org/api/organizations",
        formData,
        {
          //ADDED THIS TO POST
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        handleSuccess();
        handleClose();
      } else {
        console.error("Failed to add organization");
        alert("Failed to add organization. Please try again.");
      }
    } catch (error) {
      console.error("Failed to add organization:", error);
      alert("Failed to add organization. Please try again.");
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="modal-overlay-orgmodal" onClick={handleOverlayClick}>
      <div className="modal-content-orgmodal">
        <h2 className="modal-title-orgmodal">Add New Organization ID</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group-orgmodal">
            <label htmlFor="organizationName">Name of the Organization</label>
            <input
              ref={firstInputRef}
              type="text"
              id="organizationName"
              placeholder="Enter organization name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
            />
          </div>
          <div className="form-group-orgmodal">
            <label htmlFor="adminName">Name of the Admin</label>
            <input
              type="text"
              id="adminName"
              placeholder="Enter admin name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>
          <div className="form-group-orgmodal">
            <label htmlFor="phoneNumber">Phone number of Admin</label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="Enter admin mobile"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group-orgmodal">
            <label htmlFor="username">User Name</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group-orgmodal">
            <label htmlFor="email">Email Id</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group-orgmodal">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group-orgmodal">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-container-orgmodal">
            <button type="submit" className="btn-primary-orgmodal-create">
              Create
            </button>
            <button
              type="button"
              className="btn-secondary-orgmodal-cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrganizationModal;
