import React, { useState } from "react";
import axios from "axios"; // Import axios for making API requests
import "./ApplicationSupportingDocuments.css";

const ApplicationSupportingDocuments = ({
  onClose,
  onSubmit,
  pipelineId,
  roundNumber,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("supportingDocument", selectedFile);

      try {
        // Make an API call to upload the file
        const response = await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${pipelineId}/rounds/${roundNumber}/supportingDocuments`,
          formData,
          {
            withCredentials: true,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
              withCredentials: true, // Enable credentials if necessary
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          // Pass the response data (e.g., uploaded document info) to the parent
          onSubmit(response.data);
          onClose(); // Close the modal after successful submission
        }
      } catch (error) {
        console.error("Error uploading supporting document:", error);
        // You can display an error message to the user here if needed
      }
    }
  };

  return (
    <div className="modal-background-applicationsupportingdocuments">
      <div className="modal-content-applicationsupportingdocuments">
        <h3 className="modal-supportingdocuments-heading-text-applicationsupportingdocuments">
          Supporting Documents
        </h3>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.docx,.pptx"
        />
        <div className="modal-buttons-applicationsupportingdocuments">
          <button
            onClick={handleSubmit}
            className="modal-submit-button-applicationsupportingdocuments"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="modal-cancel-button-applicationsupportingdocuments"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSupportingDocuments;
