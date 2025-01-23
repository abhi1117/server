import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditOrganizationModal.css";

const EditOrganizationModal = ({
  showModal,
  handleClose,
  organizationId,
  handleSuccess,
}) => {
  const [organizationName, setOrganizationName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isHovering, setIsHovering] = useState(false); // State to handle hover effect

  useEffect(() => {
    if (organizationId) {
      const fetchOrganizationDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const response = await axios.get(
            `https://incubator.drishticps.org/api/organizations/${organizationId}`,
            {
              withCredentials: true,
            }
          );
          const data = response.data;
          setOrganizationName(data.name);
          setAdminName(data.adminName);
          setPhoneNumber(data.adminPhone);
          setUsername(data.username);
          setEmail(data.email);
        } catch (error) {
          console.error("Error fetching organization details:", error);
        }
      };
      fetchOrganizationDetails();
    }
  }, [organizationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      organizationName,
      adminName,
      phoneNumber,
      username,
      email,
    };

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      //console.log('updating*****')
      const response = await axios.put(
        `https://incubator.drishticps.org/api/organizations/update/${organizationId}`,
        updatedData,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        handleSuccess();
      } else {
        console.error("Failed to update organization");
        alert("Failed to update organization. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update organization:", error);
      alert("Failed to update organization. Please try again.");
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div
      className="modal-overlay-EditOrganizationModal-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-content-EditOrganizationModal-modal-content">
        <h2 className="modal-title EditOrganizationModal-modal-title">
          Edit Organization ID
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group-EditOrganizationModal-form-group">
            <label htmlFor="organizationName">Name of the Organization</label>
            <input
              type="text"
              id="organizationName"
              placeholder="Enter organization name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
            />
          </div>
          <div className="form-group-EditOrganizationModal-form-group">
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
          <div className="form-group-EditOrganizationModal-form-group">
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
          <div className="form-group-EditOrganizationModal-form-group">
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
          <div className="form-group-EditOrganizationModal-form-group">
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
          <div className="EditOrganizationModal-button-group">
            <button
              type="submit"
              className="btn-primary-EditOrganizationModal-btn-primary"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary-EditOrganizationModal-cancel"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{
                backgroundColor: isHovering ? "#e6f7ff" : "white",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrganizationModal;
