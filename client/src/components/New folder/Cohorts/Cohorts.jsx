import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import { Link, useNavigate } from "react-router-dom";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { GrDocumentSound } from "react-icons/gr";
import { IoIosLink } from "react-icons/io";
import { TbUsersGroup } from "react-icons/tb";
import AddNewCohortsModal from "./AddNewCohortsModal";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "./Cohorts.css";

const Cohorts = () => {
  const [cohorts, setCohorts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" }); // Added state for user data
  const navigate = useNavigate();

  // ** START CHANGE FOR FETCHING USER DATA **
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
        setUser(response.data); // Set the user data
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);
  // ** END CHANGE FOR FETCHING USER DATA **

  // // ** START CHANGE FOR FETCHING COHORTS & APPLICATION COUNT **
  useEffect(() => {
    const fetchCohortsAndPipelines = async () => {
      try {
        const cohortResponse = await axios.get(
          "https://incubator.drishticps.org/api/cohorts"
        );
        const fetchedCohorts = cohortResponse.data;

        // Fetch pipeline counts for each cohort
        const updatedCohorts = await Promise.all(
          fetchedCohorts.map(async (cohort) => {
            try {
              const pipelineResponse = await axios.get(
                `https://incubator.drishticps.org/api/cohorts/${cohort._id}/pipelines/count`
              );
              // *** START CHANGE for GET all response 'Grand Total count' under particular cohort ***
              const applicationsResponse = await axios.get(
                `https://incubator.drishticps.org/api/forms/${cohort._id}/pipelines/grandtotalresponses`
              );
              const applicationsCount =
                applicationsResponse.data.grandTotalCount || 0;
              // *** END CHANGE for GET all response 'Grand Total count' under particular cohort ***
              return {
                ...cohort,
                pipelinesCount: pipelineResponse.data.count,
                applicationsCount: applicationsCount, // Add applications count
              };
            } catch (error) {
              console.error(
                `Error fetching pipeline count for cohort ${cohort._id}:`,
                error
              );
              return {
                ...cohort,
                pipelinesCount: 0, // Default to 0 if there's an error
                applicationsCount: 0, // Default to 0 for applications
              };
            }
          })
        );

        setCohorts(updatedCohorts); // Set the cohorts with pipeline counts
      } catch (err) {
        console.error("Error fetching cohorts", err);
      }
    };

    fetchCohortsAndPipelines();
  }, []); // Only run once on component mount

  const handleCreateNew = (newCohort) => {
    setCohorts([...cohorts, newCohort]);
    setShowModal(false);
  };

  const handleViewCohort = (cohortId) => {
    navigate(`/view-cohort/${cohortId}`); // Navigate to the view page
  };

  const handleEditCohort = (cohortId) => {
    navigate(`/edit-cohort/${cohortId}`);
  };

  // // ** START CHANGE FOR DELETING COHORT **
  // const handleDeleteCohort = async (cohortId) => {
  //   try {
  //     await axios.delete(`https://incubator.drishticps.org/api/cohorts/${cohortId}`);
  //     setCohorts(cohorts.filter((cohort) => cohort._id !== cohortId)); // Remove cohort from UI
  //   } catch (err) {
  //     console.error("Error deleting cohort", err);
  //   }
  // };
  // // ** END CHANGE FOR DELETING COHORT **
  // ** START CHANGE FOR DELETE CONFIRMATION ** //
  const confirmDeleteCohort = (cohortId) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui-cohort">
            <h1>Confirm to Delete</h1>
            <p>
              All collected data will be lost for this cohort. Are you sure you
              want to delete this cohort?
            </p>
            <div className="button-group-cohort">
              <button
                className="delete-button-cohort"
                onClick={() => {
                  handleDeleteCohort(cohortId);
                  onClose();
                }}
              >
                Yes, Delete it!
              </button>
              <button className="cancel-button-cohort" onClick={onClose}>
                No
              </button>
            </div>
          </div>
        );
      },
      overlayClassName: "custom-overlay-cohort",
    });
  };

  const handleDeleteCohort = async (cohortId) => {
    try {
      await axios.delete(
        `https://incubator.drishticps.org/api/cohorts/${cohortId}`
      );
      setCohorts(cohorts.filter((cohort) => cohort._id !== cohortId));
    } catch (err) {
      console.error("Error deleting cohort", err);
    }
  };
  // ** END CHANGE FOR DELETE CONFIRMATION ** //

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-homepage-cohorts">
      <aside className="sidebar-homepage-cohorts">
        <div className="logo-container-homepage-cohorts">
          <div className="logo-homepage-cohorts">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-homepage-cohorts"
            />
          </div>
        </div>
        <div className="nav-container-homepage-cohorts">
          <nav className="nav-homepage-cohorts">
            <ul>
              <li>
                <Link to="/homepage">
                  <IoHomeOutline className="nav-icon-homepage-cohorts" />{" "}
                  Homepage
                </Link>
              </li>
              <li>
                <Link to="/cohorts">
                  <GrDocumentSound className="nav-icon-homepage-cohorts" />{" "}
                  Cohorts
                </Link>
              </li>
              <li>
                <Link to="/pipeline">
                  <IoIosLink className="nav-icon-homepage-cohorts" /> Pipeline
                </Link>
              </li>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-homepage-cohorts" /> Create Query
                  Form
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye className="nav-icon-homepage-cohorts" /> Create
                  Evaluation Form
                </Link>
              </li>
              <li>
                <Link to="/applications">
                  <TbUsersGroup className="nav-icon-homepage-cohorts" />{" "}
                  Applications
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-homepage-cohorts">
        <header className="header-homepage-cohorts">
          <span className="founder-homepage-cohorts">All Forms</span>
          <div className="profile-section-homepage-cohorts">
            <div className="user-info-homepage-cohorts">
              {/* <img
                src="/navbar/profilepicture.png"
                alt="User Avatar"
                className="user-initials-homepage-cohorts"
              /> */}
              <span className="user-initials-homepage-cohorts">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-homepage-cohorts">
                {/* START CHANGE FOR SHOWING USERNAME AND EMAIL */}
                <span className="user-name-homepage-cohorts">
                  {user.username}
                </span>
                <br />
                <span className="user-email-homepage-cohorts">
                  {user.email}
                </span>
                {/* END CHANGE FOR SHOWING USERNAME AND EMAIL */}
              </div>
            </div>
            <button
              className="logout-button-homepage-cohorts"
              onClick={handleLogout} // Ensure this function is defined in your component
              style={{ marginLeft: "20px", padding: "8px" }} // Add any additional styling as needed
            >
              Logout
            </button>
          </div>
        </header>
        <section className="content-homepage-cohorts">
          <div className="cohorts-header">
            <h3>Cohorts</h3>
            <button
              className="add-new-button-cohorts"
              onClick={() => setShowModal(true)}
            >
              Add New
            </button>
          </div>
          {cohorts.length === 0 ? (
            <div>No Cohorts added yet</div>
          ) : (
            <div className="cohorts-list-cohorts">
              {cohorts.map((cohort, index) => (
                <div className="cohort-card-cohorts" key={index}>
                  <img
                    src={cohort.poster}
                    alt="cohort poster"
                    className="cohort-poster"
                  />
                  <h4 className="cohort-name">{cohort.name}</h4>
                  <div className="cohort-statsmain">
                    <div className="cohort-stats">
                      {/* <p className="cohort-stats-pipelines">
                        Pipelines: {cohort.pipelinesCount || 0}{" "}
                      </p> */}
                      <button
                        className="cohort-stats-pipelines"
                        onClick={() =>
                          navigate(`/pipeline?cohort=${cohort._id}`)
                        } // Pass cohort ID in the URL
                      >
                        Pipelines: {cohort.pipelinesCount || 0}
                      </button>
                      {/* <p className="cohort-stats-applications">Applications:</p> */}
                      <p className="cohort-stats-applications">
                        Applications: {cohort.applicationsCount || 0}{" "}
                        {/* Show applications count */}
                      </p>
                    </div>
                    <div className="cohort-card-actions-cohorts">
                      <button
                        className="view-button-cohorts"
                        onClick={() => handleViewCohort(cohort._id)} // Use cohort._id for MongoDB ID
                      >
                        View
                      </button>
                      <button
                        className="edit-button-cohorts"
                        onClick={() => handleEditCohort(cohort._id)} // Use cohort._id for MongoDB ID
                      >
                        Edit
                      </button>
                      <button
                        className="delete-cohorts"
                        // onClick={() => handleDeleteCohort(cohort._id)}
                        onClick={() => confirmDeleteCohort(cohort._id)}
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
        <AddNewCohortsModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateNew}
        />
      )}
    </div>
  );
};

export default Cohorts;
