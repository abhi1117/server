import React, { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AddPosterModal from "./AddPosterModal";
import "./AddNewCohortsModal.css";

// Function to strip HTML tags
const stripHtmlTags = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const AddNewCohortsModal = ({ onClose, onCreate }) => {
  const [cohortData, setCohortData] = useState({
    program: "",
    name: "",
    about: "",
    eligibility: "",
    industry: "",
    focusArea: "",
  });

  const [posterFile, setPosterFile] = useState(null); // To store the file
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [program, setProgram] = useState("Skill Development");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCohortData({
      ...cohortData,
      [name]: value,
    });
  };

  const handleQuillChange = (value, name) => {
    setCohortData({
      ...cohortData,
      [name]: value,
    });
  };

  const handlePosterSubmit = (file) => {
    setPosterFile(file); // Store the file when the poster is submitted
    setShowPosterModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strip HTML tags from rich text fields
    const strippedAbout = stripHtmlTags(cohortData.about);
    const strippedEligibility = stripHtmlTags(cohortData.eligibility);

    // Prepare form data
    const formData = new FormData();
    formData.append("program", cohortData.program);
    formData.append("name", cohortData.name);
    formData.append("about", strippedAbout);
    formData.append("eligibility", strippedEligibility);
    formData.append("industry", cohortData.industry);
    formData.append("focusArea", cohortData.focusArea);

    if (posterFile) {
      formData.append("poster", posterFile); // Append the poster file if selected
    }

    try {
      const response = await axios.post(
        "https://incubator.drishticps.org/api/cohorts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Required for file uploads
          },
        }
      );
      onCreate(response.data); // Pass the created cohort to the parent component
    } catch (err) {
      console.error("Error creating cohort", err);
    }
  };

  return (
    <div className="modal-container-addnewcohortsmodal">
      <div className="modal-content-addnewcohortsmodal">
        <div className="modal-header-addnewcohortsmodal">
          <h2>Add a cohort</h2>
          <button className="close-button-addnewcohortsmodal" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Program</label>
          <input
            type="text"
            name="program"
            value={cohortData.program}
            onChange={handleChange}
            placeholder="Enter Program Name"
            required
          />
          {/* <select
          className="modal-input-addnewpipelinemodal"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
        >
          <option value="Skill Development">Skill Development</option>
          <option value="Another Program">Another Program</option>
        </select> */}
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={cohortData.name}
            onChange={handleChange}
            placeholder="Enter Cohort Name"
            required
          />
          <label>Poster</label>
          <button
            type="button"
            className="add-poster-button-addnewcohortsmodal"
            onClick={() => setShowPosterModal(true)}
          >
            {posterFile ? posterFile.name : "Add Poster"}
          </button>

          <label>About</label>
          <ReactQuill
            value={cohortData.about}
            onChange={(value) => handleQuillChange(value, "about")}
            placeholder="About the Cohort"
            theme="snow"
          />

          <label>Eligibility</label>
          <ReactQuill
            value={cohortData.eligibility}
            onChange={(value) => handleQuillChange(value, "eligibility")}
            placeholder="Eligibility Requirements"
            theme="snow"
          />

          <label>Industry</label>
          <input
            type="text"
            name="industry"
            value={cohortData.industry}
            onChange={handleChange}
            placeholder="Industry"
          />
          <label>Focus Area</label>
          <input
            type="text"
            name="focusArea"
            value={cohortData.focusArea}
            onChange={handleChange}
            placeholder="Focus Area"
          />
          <div className="button-group-addnewcohortsmodal">
            <button
              type="submit"
              className="submit-button-addnewcohortsmodal"
              style={{ width: "38%" }}
            >
              Submit
            </button>
            <button
              type="button"
              className="cancel-button-addnewcohortsmodal"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      {showPosterModal && (
        <AddPosterModal
          onClose={() => setShowPosterModal(false)}
          onSubmit={handlePosterSubmit}
        />
      )}
    </div>
  );
};

export default AddNewCohortsModal;
