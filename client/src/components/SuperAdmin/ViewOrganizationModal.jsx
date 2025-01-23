import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewOrganizationModal.css";

const ViewOrganizationModal = ({ showModal, handleClose, organizationId }) => {
  const [organizationDetails, setOrganizationDetails] = useState(null);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationDetails();
    }
  }, [organizationId]);

  const fetchOrganizationDetails = async () => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(
        `https://incubator.drishticps.org/api/organizations/${organizationId}`,
        {
          withCredentials: true,
        }
      );
      //console.log('response:',response.data)
      setOrganizationDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch organization details:", error);
      alert("Failed to load details. Please try again.");
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div
      className="modal-overlay ViewOrganizationModal-modal-overlay"
      onClick={handleClose}
    >
      <div
        className="modal-content ViewOrganizationModal-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="ViewOrganizationModal-modal-title">
          Organization Details
        </h2>
        {organizationDetails ? (
          <div className="ViewOrganizationModal-details">
            <p className="ViewOrganizationModal-detail">
              <strong>Name:</strong> {organizationDetails.name}
            </p>
            <p className="ViewOrganizationModal-detail">
              <strong>Admin Name:</strong> {organizationDetails.adminName}
            </p>
            <p className="ViewOrganizationModal-detail">
              <strong>Phone:</strong> {organizationDetails.adminPhone}
            </p>
            <p className="ViewOrganizationModal-detail">
              <strong>Username:</strong> {organizationDetails.username}
            </p>
            <p className="ViewOrganizationModal-detail">
              <strong>Email:</strong> {organizationDetails.email}
            </p>
          </div>
        ) : (
          <p className="ViewOrganizationModal-loading">Loading...</p>
        )}
        <button
          onClick={handleClose}
          className="ViewOrganizationModal-close-btn"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewOrganizationModal;
