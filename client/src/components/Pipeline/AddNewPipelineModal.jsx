import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for making API requests
import "./AddNewPipelineModal.css";

const AddNewPipelineModal = ({ onClose, onSubmit }) => {
  const [program, setProgram] = useState("IMPACT Program");
  const [cohort, setCohort] = useState(""); // Updated to initialize with an empty string
  const [cohorts, setCohorts] = useState([]); // State to store fetched cohorts  const [type, setType] = useState("Application");
  const [type, setType] = useState("Application");
  const [title, setTitle] = useState("");

  // Function to fetch cohorts from the backend
  /*** START CHANGE FOR all cohort --- ***/
  // useEffect(() => {
  //   const fetchCohorts = async () => {
  //     try {
  //       const response = await axios.get("https://incubator.drishticps.org/api/cohorts");
  //       setCohorts(response.data); // Set the fetched cohorts to state
  //     } catch (error) {
  //       console.error("Error fetching cohorts:", error);
  //     }
  //   };

  //   fetchCohorts();
  // }, []);
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const response = await axios.get(
          "https://incubator.drishticps.org/api/cohorts",
          { withCredentials: true }
        );
        // ** START CHANGE FOR "cohort first option post"  --- **
        setCohorts(response.data); // Set the fetched cohorts to state

        // Set the cohort state to the first cohort if it exists
        if (response.data.length > 0) {
          setCohort(response.data[0].name);
        }
        // ** END CHANGE FOR "cohort first option post"  --- **
      } catch (error) {
        console.error("Error fetching cohorts:", error);
      }
    };

    fetchCohorts();
  }, []);

  /*** END CHANGE FOR all cohort --- ***/

  // Function to handle form submission
  const handleSubmit = async () => {
    // ** START CHANGE FOR "cohort first option post"  --- **
    // Ensure cohort is not an empty string
    if (!cohort) {
      console.error("Cohort is required to create a pipeline.");
      return;
    }
    // ** END CHANGE FOR "cohort first option post"  --- **
    // Data to be sent to the backend
    const pipelineData = {
      program,
      cohort,
      type,
      title,
      rounds: [
        {
          roundNumber: 1,
          type: "Public",
          link: "",
          startDate: new Date(),
          endDate: new Date(),
          status: "Not open yet",
        },
      ],
    };

    try {
      // Send the data to your backend API
      const response = await axios.post(
        "https://incubator.drishticps.org/api/pipelines",
        pipelineData,
        { withCredentials: true }
      );

      // If successful, call onSubmit with the new pipeline data
      onSubmit(response.data);

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error creating pipeline:", error);
      // Handle error (you can show an error message to the user here)
    }
  };

  return (
    <div className="modal-container-addnewpipelinemodal">
      <div className="modal-addnewpipelinemodal">
        <div className="modal-header-addnewpipelinemodal-with-cross">
          <h2 className="modal-title-addnewpipelinemodal">Add Pipeline</h2>
          <button
            className="close-button-addnewpipelinemodal-cross"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <label className="modal-label-addnewpipelinemodal">Program</label>
        <select
          className="modal-input-addnewpipelinemodal"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
        >
          <option value="IMPACT Program">IMPACT Program</option>
          <option value="Another Program">Another Program</option>
        </select>

        <label className="modal-label-addnewpipelinemodal">Cohort</label>
        <select
          className="modal-input-addnewpipelinemodal"
          value={cohort}
          onChange={(e) => setCohort(e.target.value)}
        >
          {/* Map through the fetched cohorts and render options dynamically */}
          {cohorts.map((cohort) => (
            <option key={cohort._id} value={cohort.name}>
              {cohort.name}
            </option>
          ))}
        </select>

        <label className="modal-label-addnewpipelinemodal">Type</label>
        <div className="radio-group-addnewpipelinemodal">
          <label className="radio-label-addnewpipelinemodal">
            <input
              type="radio"
              name="type"
              value="Application"
              checked={type === "Application"}
              onChange={() => setType("Application")}
            />
            Application
          </label>
          <label className="radio-label-addnewpipelinemodal">
            <input
              type="radio"
              name="type"
              value="Startup"
              checked={type === "Startup"}
              onChange={() => setType("Startup")}
            />
            Startup
          </label>
        </div>

        <label className="modal-label-addnewpipelinemodal">Title</label>
        <input
          type="text"
          className="modal-input-addnewpipelinemodal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Title"
        />
        <div className="modal-buttons-addnewpipelinemodal">
          <button
            className="btn-submit-addnewpipelinemodal"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button className="btn-cancel-addnewpipelinemodal" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewPipelineModal;
