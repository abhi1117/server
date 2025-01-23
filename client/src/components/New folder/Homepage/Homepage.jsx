import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { GrDocumentSound } from "react-icons/gr";
import { IoIosLink } from "react-icons/io";
import { TbUsersGroup } from "react-icons/tb";
import "./Homepage.css";

const Homepage = () => {
  const [user, setUser] = useState({ name: "", email: "", username: "" }); // State for user data
  const [cohortsCount, setCohortsCount] = useState(0); // State to store cohorts count
  const [cohortsList, setCohortsList] = useState([]); // State to store the list of cohorts
  const [applicationsCount, setApplicationsCount] = useState({});
  // *** START  CHANGE FOR total pipeline count--- ***
  const [pipelinesCount, setPipelinesCount] = useState(0); // State to store total pipeline count
  // *** END CHANGE FOR total pipeline count--- ***
  // *** START  CHANGE FOR add table for pipelines ***
  const [pipelinesList, setPipelinesList] = useState([]); // State to store the list of pipelines
  const [pipelineApplicationsCount, setPipelineApplicationsCount] = useState(
    {}
  ); // State to store pipeline applications count
  // *** END  CHANGE FOR add table for pipelines ***
  // *** START  CHANGE FOR add two columns 'Save as Draft' and 'Submit'--- ***
  const [pipelineDraftCount, setPipelineDraftCount] = useState({}); // State for counting drafts
  const [pipelineSubmitCount, setPipelineSubmitCount] = useState({}); // State for counting submissions

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
    fetchCohortsCount(); // Fetch cohorts count on component mount
    fetchCohortsList(); // Fetch cohorts list on component mount
    // *** START  CHANGE FOR add table for pipelines ***
    fetchPipelinesList(); // Fetch the list of pipelines on component mount
    // *** END  CHANGE FOR add table for pipelines ***
  }, []);

  // HIGHLIGHT START: Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://incubator.drishticps.org/api/programmanagers/me",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error("Failed to fetch user data. Status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  // HIGHLIGHT END
  // *** START CHANGE FOR total Cohorts count ***
  const fetchCohortsCount = async () => {
    try {
      const response = await fetch(
        "https://incubator.drishticps.org/api/cohorts/total/count"
      ); // Fetch the total number of cohorts
      if (response.ok) {
        const data = await response.json();
        setCohortsCount(data.count); // Set the count in state
      } else {
        console.error(
          "Failed to fetch cohorts count. Status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error fetching cohorts count:", error);
    }
  };
  // *** END CHANGE FOR total Cohorts count ***
  // *** START CHANGE FOR cohorts list ***
  const fetchCohortsList = async () => {
    try {
      const response = await fetch(
        "https://incubator.drishticps.org/api/cohorts"
      ); // Fetch the list of cohorts
      if (response.ok) {
        const data = await response.json();
        setCohortsList(data); // Set the list in state
        // Call fetchApplicationsCounts once cohortsList is set
        fetchApplicationsCounts(data);
      } else {
        console.error("Failed to fetch cohorts list. Status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching cohorts list:", error);
    }
  };
  // *** END CHANGE FOR cohorts list ***

  // *** START CHANGE for GET all response 'Grand Total count' under particular cohort ***
  const fetchApplicationsCounts = async (cohorts) => {
    const counts = {};
    for (const cohort of cohorts) {
      const response = await fetch(
        `https://incubator.drishticps.org/api/forms/${cohort._id}/pipelines/grandtotalresponses`
      );
      if (response.ok) {
        const data = await response.json();
        counts[cohort._id] = data.grandTotalCount;
      }
    }
    setApplicationsCount(counts); // Store all counts in state
  };
  // *** END CHANGE for GET all response 'Grand Total count' under particular cohort ***
  // *** START CHANGE for applications 'Grand Total ' ***
  const calculateTotalApplications = () => {
    return Object.values(applicationsCount).reduce(
      (total, count) => total + count,
      0
    );
  };
  // *** END CHANGE for applications 'Grand Total ' ***

  // *** START  CHANGE FOR add table for pipelines ***
  // Fetch pipelines list
  const fetchPipelinesList = async () => {
    try {
      const response = await fetch(
        "https://incubator.drishticps.org/api/pipelines"
      );
      if (response.ok) {
        const data = await response.json();
        setPipelinesList(data);
        fetchPipelineApplicationsCount(data);
        fetchPipelineApplicationStatusCounts(data); // Fetch draft and submitted counts after pipelines list is fetched
        // *** START  CHANGE FOR total pipeline count--- ***
        setPipelinesCount(data.length); // Set the total count of pipelines
        // *** END CHANGE FOR total pipeline count--- ***
      } else {
        console.error("Failed to fetch pipelines list.");
      }
    } catch (error) {
      console.error("Error fetching pipelines list:", error);
    }
  };

  // Fetch Application Counts for Each Pipeline
  const fetchPipelineApplicationsCount = async (pipelines) => {
    const counts = {};
    for (const pipeline of pipelines) {
      try {
        if (pipeline.forms) {
          // Ensure pipeline has a form reference
          // console.log(`Fetching application count for pipeline: ${pipeline.title}`); // Log which pipeline is being processed
          const response = await fetch(
            `https://incubator.drishticps.org/api/forms/pipeline/${pipeline._id}/form/${pipeline.forms}/responses/count`
          );
          if (response.ok) {
            const data = await response.json();
            // console.log(`Application count for ${pipeline.title}:`, data.count); // Debugging application count for each pipeline
            counts[pipeline._id] = data.count;
          } else {
            console.error(
              `Failed to fetch count for pipeline ${pipeline.title}. Status:`,
              response.status
            );
          }
        } else {
          console.error(`Pipeline ${pipeline.title} has no form associated.`);
        }
      } catch (error) {
        console.error(
          `Error fetching count for pipeline ${pipeline.title}:`,
          error
        );
      }
    }
    // console.log("Final application counts for pipelines:", counts); // Debugging final counts object
    setPipelineApplicationsCount(counts);
  };

  // Calculate total applications across all pipelines
  const calculateTotalPipelineApplications = () => {
    return Object.values(pipelineApplicationsCount).reduce(
      (total, count) => total + count,
      0
    );
  };
  // *** END  CHANGE FOR add table for pipelines ***

  // Function to fetch draft and submitted counts for each pipeline
  const fetchPipelineApplicationStatusCounts = async (pipelines) => {
    const draftCounts = {};
    const submitCounts = {};

    for (const pipeline of pipelines) {
      try {
        if (pipeline.forms) {
          // console.log(`Fetching draft and submit counts for pipeline: ${pipeline.title}`);
          // console.log(`Pipeline ID: ${pipeline._id}, Form ID: ${pipeline.forms}`);

          // Fetch draft counts
          const draftResponse = await fetch(
            `https://incubator.drishticps.org/api/forms/pipeline/${pipeline._id}/form/${pipeline.forms}/responses/draft/count`
          );

          // Fetch submit counts
          const submitResponse = await fetch(
            `https://incubator.drishticps.org/api/forms/pipeline/${pipeline._id}/form/${pipeline.forms}/responses/submit/count`
          );

          // Handle draft response
          if (draftResponse.ok) {
            const draftData = await draftResponse.json();
            draftCounts[pipeline._id] = draftData.count || 0;
          } else {
            if (draftResponse.status === 404) {
              console.warn(
                `Draft count endpoint not found for pipeline: ${pipeline.title}`
              );
            }
            draftCounts[pipeline._id] = 0; // Default to 0 if no data
          }

          // Handle submit response
          if (submitResponse.ok) {
            const submitData = await submitResponse.json();
            submitCounts[pipeline._id] = submitData.count || 0;
          } else {
            if (submitResponse.status === 404) {
              console.warn(
                `Submit count endpoint not found for pipeline: ${pipeline.title}`
              );
            }
            submitCounts[pipeline._id] = 0; // Default to 0 if no data
          }
        } else {
          console.error(`Pipeline ${pipeline.title} has no form associated.`);
        }
      } catch (error) {
        console.error(
          `Error fetching counts for pipeline ${pipeline.title}:`,
          error
        );
        draftCounts[pipeline._id] = 0; // Default to 0 on error
        submitCounts[pipeline._id] = 0; // Default to 0 on error
      }
    }
    // Update the state with draft and submit counts
    setPipelineDraftCount(draftCounts);
    setPipelineSubmitCount(submitCounts);
  };

  // Calculate total draft counts across all pipelines
  const calculateTotalDrafts = () => {
    return Object.values(pipelineDraftCount).reduce(
      (total, count) => total + count,
      0
    );
  };

  // Calculate total submitted counts across all pipelines
  const calculateTotalSubmits = () => {
    return Object.values(pipelineSubmitCount).reduce(
      (total, count) => total + count,
      0
    );
  };
  // *** END CHANGE FOR add two columns 'Save as Draft' and 'Submit'--- ***

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-homepage">
      <aside className="sidebar-homepage">
        <div className="logo-container-homepage">
          <div className="logo-homepage">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-homepage"
            />
          </div>
        </div>
        <div className="nav-container-homepage">
          <nav className="nav-homepage">
            <ul>
              <li>
                <Link to="/homepage">
                  <IoHomeOutline className="nav-icon-homepage" /> Homepage
                </Link>
              </li>
              <li>
                <Link to="/cohorts">
                  <GrDocumentSound className="nav-icon-homepage" /> Cohorts
                </Link>
              </li>
              <li>
                <Link to="/pipeline">
                  <IoIosLink className="nav-icon-homepage" /> Pipeline
                </Link>
              </li>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-homepage" /> Create Query Form
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye className="nav-icon-homepage" /> Create
                  Evaluation Form
                </Link>
              </li>
              <li>
                <Link to="/applications">
                  <TbUsersGroup className="nav-icon-homepage" /> Applications
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-homepage">
        <header className="header-homepage">
          <span className="founder-homepage">All Forms</span>
          <div className="profile-section-homepage">
            <div className="user-info-homepage">
              <span className="user-initials-homepage">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-homepage">
                {/* HIGHLIGHT START: Displaying fetched username and email */}
                <span className="user-name-homepage">{user.username}</span>
                <br />
                <span className="user-email-homepage">{user.email}</span>
                {/* HIGHLIGHT END */}
              </div>
            </div>
            <button
              className="logout-button-homepage"
              onClick={handleLogout} // Ensure this function is defined in your component
              style={{ marginLeft: "20px", padding: "8px" }} // Add any additional styling as needed
            >
              Logout
            </button>
          </div>
        </header>
        <section className="content-homepage">
          <div className="dashboard-cards-homepage">
            <div className="card-homepage">
              <h4>
                <Link
                  to="/cohorts"
                  className="card-ohorts-count-link-to-cohorts-page-homepage"
                >
                  Cohorts
                </Link>
              </h4>
              <div className="count-homepage-numbers">{cohortsCount}</div>
            </div>
            {/* <div className="card-homepage">
              <h4>Applications</h4>
              <div className="count-homepage"></div>
              <div className="count-homepage-numbers">
                {calculateTotalApplications()}
              </div>
            </div> */}
            <div className="card-homepage">
              <h4>
                <Link
                  to="/pipeline"
                  className="card-ohorts-count-link-to-cohorts-page-homepage"
                >
                  Pipelines
                </Link>
              </h4>
              <div className="count-homepage-numbers">{pipelinesCount}</div>
            </div>

            {/* <Link to="/pipeline" className="card-homepage">
              <div>
                <h4 className="card-ohorts-count-link-to-cohorts-page-homepage">Pipelines</h4>
                <div className="card-ohorts-count-link-to-cohorts-page-homepage">{pipelinesCount}</div>
              </div>
            </Link> */}
            {/* <div className="card-homepage">
              <h4>Startups</h4>
              <div className="count-homepage"></div>
            </div> */}
          </div>
          <div className="table-container-homepage">
            <h3>Cohorts</h3>
            <table className="program-table-homepage">
              <thead>
                <tr>
                  <th>Cohort</th>
                  <th>Applications</th>
                  {/* <th>Startups</th> */}
                </tr>
              </thead>
              <tbody>
                {/* *** START CHANGE FOR cohorts list display *** */}
                {cohortsList.length > 0 ? (
                  cohortsList.map((cohort) => (
                    <tr key={cohort._id}>
                      <td>{cohort.name}</td>
                      <td>{applicationsCount[cohort._id] || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No cohorts available</td>
                  </tr>
                )}
                {/* *** END CHANGE FOR cohorts list display *** */}
              </tbody>
              {/* *** START CHANGE for applications 'Grand Total ' *** */}
              <tfoot className="total-cohort-count-homepage">
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>{calculateTotalApplications()}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* *** START  CHANGE FOR add table for pipelines *** */}
          <div className="table-container-homepage">
            <h3>Pipelines</h3>
            <table className="program-table-homepage">
              <thead>
                <tr>
                  <th>Pipeline</th>
                  <th>Applications</th>
                  <th>Save as Draft</th>
                  <th>Submit</th>
                </tr>
              </thead>
              <tbody>
                {pipelinesList.length > 0 ? (
                  pipelinesList.map((pipeline) => (
                    <tr key={pipeline._id}>
                      <td>{pipeline.title}</td>
                      <td>{pipelineApplicationsCount[pipeline._id] || 0}</td>
                      <td>{pipelineDraftCount[pipeline._id] || 0}</td>
                      <td>{pipelineSubmitCount[pipeline._id] || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No pipelines available</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="total-pipeline-count-homepage">
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>{calculateTotalPipelineApplications()}</strong>
                  </td>
                  <td>
                    <strong>{calculateTotalDrafts()}</strong>
                  </td>
                  <td>
                    <strong>{calculateTotalSubmits()}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* *** END  CHANGE FOR add table for pipelines *** */}
        </section>
      </main>
    </div>
  );
};

export default Homepage;
