import React, { useState } from "react";
import axios from "axios";
import "./ApplicationPoster.css";

const ApplicationPoster = ({
  onClose,
  onSubmit,
  existingPoster,
  pipelineId,
  roundNumber,
}) => {
  const [poster, setPoster] = useState(null);

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file);
      setPoster(file);
    }
  };

  const handleSubmit = async () => {
    if (!poster) {
      console.error("No poster file selected");
      return;
    }

    const formData = new FormData();
    formData.append("poster", poster);

    try {
      console.log("Submitting poster...");

      // Make an API call to upload the poster
      const response = await axios.post(
        `https://incubator.drishticps.org/api/pipelines/${pipelineId}/rounds/${roundNumber}/poster`,
        formData,
        {
          withCredentials: true,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response received:", response);

      if (response.status === 201 || response.status === 200) {
        console.log("File uploaded successfully");

        // Use the URL provided by the backend
        const posterUrl = `https://incubator.drishticps.org/${response.data.url}`;
        console.log("Poster URL from backend:", posterUrl);

        // onSubmit(posterUrl);
        onSubmit(response.data.url); // Pass the backend URL to the parent component
        onClose(); // Close the modal after successful submission
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error uploading poster:", error);
    }
  };

  return (
    <div className="modal-container-applicationposter">
      <div className="modal-content-applicationposter">
        <h3 className="modal-poster-heading-text-applicationposter">Poster</h3>
        <input
          type="file"
          accept="image/png, image/jpeg"
          className="input-applicationposter"
          onChange={handlePosterChange}
        />
        <div className="button-group-applicationposter">
          <button
            className="submit-button-applicationposter"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button className="cancel-button-applicationposter" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPoster;
