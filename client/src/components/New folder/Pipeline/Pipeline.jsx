import React, { useState, useEffect } from "react";
import AddNewPipelineModal from "./AddNewPipelineModal";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { GrDocumentSound } from "react-icons/gr";
import { IoIosLink } from "react-icons/io";
import { TbUsersGroup } from "react-icons/tb";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import the CSS
import "./Pipeline.css";

const Pipeline = () => {
  const [pipelines, setPipelines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const [applicationCounts, setApplicationCounts] = useState({}); // Store counts for each pipeline
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook to get the location object

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://incubator.drishticps.org/api/programmanagers/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);
  // *** START CHANGE FOR INTEGRATING COHORT FILTER WITH EXISTING FUNCTIONALITY ***
  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const cohortId = params.get("cohort"); // Get cohort ID from URL
        const apiUrl = cohortId
          ? `https://incubator.drishticps.org/api/cohorts/${cohortId}/pipelines`
          : "https://incubator.drishticps.org/api/pipelines";
        const response = await axios.get(apiUrl);
        setPipelines(response.data);

        // Fetch the count of form submissions for each pipeline and form
        response.data.forEach(async (pipeline) => {
          try {
            // Fetch the count of form submissions for each specific pipeline and form
            const countResponse = await axios.get(
              `https://incubator.drishticps.org/api/forms/pipeline/${pipeline._id}/form/${pipeline.forms}/responses/count`
            );
            setApplicationCounts((prevCounts) => ({
              ...prevCounts,
              [pipeline._id]: countResponse.data.count, // Use pipeline ID as key
            }));
          } catch (countError) {
            console.error("Error fetching submission count", countError);
          }
        });
      } catch (err) {
        console.error("Error fetching pipelines", err);
      }
    };
    fetchPipelines();
  }, [location.search]); // Depend on location.search to refetch when the search params change
  // *** END CHANGE FOR INTEGRATING COHORT FILTER WITH EXISTING FUNCTIONALITY ***

  // Create new pipeline
  const handleCreateNewPipeline = async (newPipeline) => {
    setPipelines([...pipelines, newPipeline]);
    setShowModal(false);

    // *** START CHANGE application total responses count ***
    try {
      const countResponse = await axios.get(
        `https://incubator.drishticps.org/api/forms/pipeline/${newPipeline._id}/form/${newPipeline.forms}/responses/count`
      );
      setApplicationCounts((prevCounts) => ({
        ...prevCounts,
        [newPipeline._id]: countResponse.data.count || 0,
      }));
    } catch (error) {
      console.error("Error fetching submission count for new pipeline", error);
    }
    // *** END CHANGE FOR application total responses count ***
  };

  // Delete pipeline
  // const handleDeletePipeline = async (pipelineId) => {
  //   try {
  //     await axios.delete(`https://incubator.drishticps.org/api/pipelines/${pipelineId}`);
  //     setPipelines(pipelines.filter((pipeline) => pipeline._id !== pipelineId));
  //   } catch (error) {
  //     console.error("Error deleting pipeline:", error);
  //   }
  // };

  const handleDeletePipeline = async (pipelineId) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui-pipeline">
            <h1>Confirm to Delete</h1>
            <p>
              All collected data will be lost for this pipeline. Are you sure
              you want to delete this Pipeline?
            </p>
            <div className="button-group-pipeline">
              <button
                className="delete-button-pipeline"
                onClick={async () => {
                  try {
                    await axios.delete(
                      `https://incubator.drishticps.org/api/pipelines/${pipelineId}`
                    );
                    setPipelines(
                      pipelines.filter(
                        (pipeline) => pipeline._id !== pipelineId
                      )
                    ); // Remove pipeline from UI
                    onClose();
                  } catch (error) {
                    console.error("Error deleting pipeline:", error);
                  }
                }}
              >
                Yes, Delete it!
              </button>
              <button
                className="cancel-button-normal-pipeline"
                onClick={onClose}
              >
                No
              </button>
            </div>
          </div>
        );
      },
      overlayClassName: "custom-overlay-pipeline",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-homepage-pipeline">
      <aside className="sidebar-homepage-pipeline">
        <div className="logo-container-homepage-pipeline">
          <div className="logo-homepage-pipeline">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-homepage-pipeline"
            />
          </div>
        </div>
        <div className="nav-container-homepage-pipeline">
          <nav className="nav-homepage-pipeline">
            <ul>
              <li>
                <Link to="/homepage">
                  <IoHomeOutline className="nav-icon-homepage-pipeline" />{" "}
                  Homepage
                </Link>
              </li>
              <li>
                <Link to="/cohorts">
                  <GrDocumentSound className="nav-icon-homepage-pipeline" />{" "}
                  Cohorts
                </Link>
              </li>
              <li>
                <Link to="/pipeline">
                  <IoIosLink className="nav-icon-homepage-pipeline" /> Pipeline
                </Link>
              </li>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-homepage-pipeline" /> Create
                  Query Form
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye className="nav-icon-homepage-pipeline" /> Create
                  Evaluation Form
                </Link>
              </li>
              <li>
                <Link to="/applications">
                  <TbUsersGroup className="nav-icon-homepage-pipeline" />{" "}
                  Applications
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-homepage-pipeline">
        <header className="header-homepage-pipeline">
          <span className="founder-homepage-pipeline">All Forms</span>
          <div className="profile-section-homepage-pipeline">
            <div className="user-info-homepage-pipeline">
              <span className="user-initials-homepage-pipeline">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-homepage-pipeline">
                <span className="user-name-homepage-pipeline">
                  {user.username}
                </span>
                <br />
                <span className="user-email-homepage-pipeline">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              className="logout-button-homepage-pipeline"
              onClick={handleLogout}
              style={{ marginLeft: "20px", padding: "8px" }}
            >
              Logout
            </button>
          </div>
        </header>
        <section className="content-homepage-pipeline">
          <div className="pipelines-header-pipeline">
            <h3>Pipelines</h3>
            <button
              className="add-new-button-pipeline"
              onClick={() => setShowModal(true)}
            >
              Add New
            </button>
          </div>
          {pipelines.length === 0 ? (
            <div>No Pipeline added yet</div>
          ) : (
            <div className="pipelines-list-pipeline">
              {pipelines.map((pipeline, index) => (
                <div className="pipeline-card-pipeline" key={index}>
                  <h4 className="pipeline-name-pipeline">{pipeline.title}</h4>
                  <div className="pipeline-stats-pipeline">
                    <p>Program: {pipeline.program}</p>
                    <p>Cohort: {pipeline.cohort}</p>
                    <p>Type: {pipeline.type}</p>
                    <div className="bottom-section">
                      <div className="count-pipeline">
                        {/* Display total applications under this pipeline*/}
                        <Link
                          to={{
                            pathname: `/applications`,
                            state: {
                              pipelineId: pipeline._id,
                              formId: pipeline.forms,
                              title: pipeline.title, // *** START CHANGE for passing pipeline title ***
                            }, // Pass pipelineId and formId correctly
                          }}
                          state={{
                            pipelineId: pipeline._id,
                            formId: pipeline.forms,
                            title: pipeline.title, // Ensure the title is passed
                          }}
                          className="count-pipeline" // Ensure the state is passed outside the 'to' prop as well
                        >
                          <p>
                            Applications:{" "}
                            {applicationCounts[pipeline._id] !== undefined
                              ? applicationCounts[pipeline._id]
                              : "Loading..."}
                          </p>
                        </Link>
                      </div>
                    </div>
                    <div className="pipeline-card-actions-pipeline">
                      {/* <button className="view-edit-pipeline">View/Edit</button> */}
                      <Link to={`/vieweditpipeline/${pipeline._id}`}>
                        <button className="view-edit-pipeline">
                          View/Edit
                        </button>
                      </Link>
                      <button
                        className="delete-pipeline-pm"
                        onClick={() => handleDeletePipeline(pipeline._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      {showModal && (
        <AddNewPipelineModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateNewPipeline}
        />
      )}
    </div>
  );
};

export default Pipeline;
