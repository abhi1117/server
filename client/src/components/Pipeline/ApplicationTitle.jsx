import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ApplicationTitle.css";

const ApplicationTitle = ({
  onClose,
  onSubmit,
  applicationtitle: existingApplicationTitle,
  pipelineId,
  roundNumber,
}) => {
  const [applicationtitle, setApplicationTitle] = useState(
    existingApplicationTitle || ""
  );

  const handleSubmit = async () => {
    try {
      let response;
      if (existingApplicationTitle) {
        // If the application title already exists, update it with a PUT request
        response = await axios.put(
          `https://incubator.drishticps.org/api/pipelines/${pipelineId}/rounds/${roundNumber}/applicationTitle`, // Include roundNumber in the endpoint
          { applicationTitle: applicationtitle },
          { withCredentials: true }
        );
      } else {
        // If no application title exists, create it with a POST request
        response = await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${pipelineId}/rounds/${roundNumber}/applicationTitle`, // Include roundNumber in the endpoint
          { applicationTitle: applicationtitle },
          { withCredentials: true }
        );
      }
      if (response.status === 200 || response.status === 201) {
        onSubmit(applicationtitle);
        onClose();
      } else {
        console.error("Failed to save application title:", response.data.error);
      }
    } catch (error) {
      console.error("Error saving application title:", error);
    }
  };

  useEffect(() => {
    if (existingApplicationTitle) {
      setApplicationTitle(existingApplicationTitle);
    }
  }, [existingApplicationTitle]);

  return (
    <div className="modal-container-applicationtitle">
      <div className="modal-content-applicationtitle">
        <h3 className="modal-title-text-applicationtitle">Application Title</h3>
        <input
          type="text"
          className="input-applicationtitle"
          value={applicationtitle}
          onChange={(e) => setApplicationTitle(e.target.value)}
          placeholder="Enter the application title"
          required
        />
        <div className="button-group-applicationtitle">
          <button
            className="submit-button-applicationtitle"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button className="cancel-button-applicationtitle" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTitle;
