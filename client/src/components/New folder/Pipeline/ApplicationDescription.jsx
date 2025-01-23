import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./ApplicationDescription.css";

const ApplicationDescription = ({
  onClose,
  onSubmit,
  description: existingDescription,
  pipelineId,
}) => {
  const [description, setDescription] = useState(existingDescription || "");

  // Function to strip HTML tags from the description
  const stripHtmlTags = (html) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || "";
  };

  const handleSubmit = async () => {
    try {
      // const strippedDescription = stripHtmlTags(description); // Remove HTML tags

      let response;

      if (existingDescription) {
        // If the description already exists, update it with a PUT request
        response = await axios.put(
          `https://incubator.drishticps.org/api/pipelines/${pipelineId}/description`,
          {
            description: description,
          }
        );
      } else {
        // If no description exists, create it with a POST request
        response = await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${pipelineId}/description`,
          {
            description: description,
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        onSubmit(description); // Pass the updated or new description to the parent component
        onClose(); // Close the modal after submission
      } else {
        console.error("Failed to save description:", response.data.error);
      }
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };

  useEffect(() => {
    if (existingDescription) {
      setDescription(existingDescription);
    }
  }, [existingDescription]);

  return (
    <div className="modal-background-applicationdescription">
      <div className="modal-content-applicationdescription">
        <h3 className="modal-description-heading-text-applicationdescription">
          Description
        </h3>
        <ReactQuill
          value={description}
          onChange={setDescription}
          placeholder="Enter your description here"
        />
        <div className="modal-buttons-applicationdescription">
          <button
            onClick={handleSubmit}
            className="modal-submit-button-applicationdescription"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="modal-cancel-button-applicationdescription"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDescription;
