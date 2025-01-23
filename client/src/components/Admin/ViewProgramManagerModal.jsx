import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewProgramManagerModal.css";

const ViewProgramManagerModal = ({
  showModal,
  handleClose,
  programManagerId,
}) => {
  const [programManagerDetails, setProgramManagerDetails] = useState(null);

  useEffect(() => {
    if (programManagerId) {
      fetchProgramManagerDetails();
    }
  }, [programManagerId]);

  const fetchProgramManagerDetails = async () => {
    //  const token = localStorage.getItem('token');
    /*  const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };*/
    try {
      const response = await axios.get(
        `https://incubator.drishticps.org/api/programmanagers/${programManagerId}`,
        {
          withCredentials: true,
        }
      );
      setProgramManagerDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch program manager details:", error);
      alert("Failed to load details. Please try again.");
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="modal-overlay ViewProgramManagerModal-modal-overlay">
      <div
        className="modal-content ViewProgramManagerModal-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="ViewProgramManagerModal-modal-title">
          Program Manager Details
        </h2>
        {programManagerDetails ? (
          <div>
            <p className="ViewProgramManagerModal-detail">
              <strong>Name:</strong> {programManagerDetails.name}
            </p>
            <p className="ViewProgramManagerModal-detail">
              <strong>Admin Name:</strong> {programManagerDetails.adminName}
            </p>
            <p className="ViewProgramManagerModal-detail">
              <strong>Phone:</strong> {programManagerDetails.adminPhone}
            </p>
            <p className="ViewProgramManagerModal-detail">
              <strong>Username:</strong> {programManagerDetails.username}
            </p>
            <p className="ViewProgramManagerModal-detail">
              <strong>Email:</strong> {programManagerDetails.email}
            </p>
          </div>
        ) : (
          <p className="ViewProgramManagerModal-loading">Loading...</p>
        )}
        <button
          onClick={handleClose}
          className="ViewProgramManagerModal-close-btn"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewProgramManagerModal;
