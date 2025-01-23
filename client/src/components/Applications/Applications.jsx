import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { GrDocumentSound } from "react-icons/gr";
import { IoIosLink } from "react-icons/io";
import { TbUsersGroup } from "react-icons/tb";
import { FaSort } from "react-icons/fa";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import EditColumnsModal from "./EditColumnsModal";
import "./Applications.css";
import { useSelector, useDispatch } from "react-redux";
import {
  superAdminAction,
  userId,
  superAdminSelector,
} from "../../redux/reducers/superAdminReducer";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [rounds, setRounds] = useState([]); // state for storing rounds
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [selectedApplications, setSelectedApplications] = useState([]); // Track selected applications
  const [selectAllApplications, setSelectAllApplications] = useState(false); // Track select all checkbox
  const [user, setUser] = useState({ name: "", email: "" });
  const [activeTab, setActiveTab] = useState("Applications");
  const [selectedResponse, setSelectedResponse] = useState(null); // For showing details of a user
  const [selectedUserResponses, setSelectedUserResponses] = useState([]);
  const [activeResponseTab, setActiveResponseTab] = useState(null); // Active response tab
  const [currentPageApplications, setCurrentPageApplications] = useState(1); // For pagination
  const [responsesPerPageApplications, setResponsesPerPageApplications] =
    useState(5); // For pagination
  const location = useLocation(); // Get the passed state from Pipeline.jsx
  const { pipelineId, formId, title } = location.state || {}; // Extract pipelineId and formId
  const [nameSortConfig, setNameSortConfig] = useState({
    key: null,
    direction: "asc",
  }); // *** START CHANGE sorting for Name --- ***
  // Add state for date sorting configuration
  const [dateSortConfig, setDateSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/pipelines/${pipelineId}`,
          { withCredentials: true }
        );
        setRounds(response.data.rounds || []); // Set fetched rounds to state
      } catch (error) {
        console.error("Error fetching round data:", error);
      }
    };

    fetchRounds(); // Call the fetchRounds function on component load
  }, [pipelineId]);

  // Log the location to ensure you're getting the state
  // console.log("Location object:", location);
  // console.log("Extracted pipelineId:", pipelineId, "formId:", formId);

  const [columns, setColumns] = useState([
    // Initial default columns that will always be visible
    { name: "Name", label: "Applicant", isVisible: true },
    { name: "Email", label: "Email", isVisible: true },
    { name: "currentRound", label: "Round", isVisible: true }, // Round column
    { name: "createdAt", label: "Applied On", isVisible: true },
    { name: "formStatus", label: "Form Status", isVisible: true }, // Added Form Status column
    { name: "Individual", label: "Individual", isVisible: true },
  ]);
  const [allColumns, setAllColumns] = useState([]); // Store all available columns
  const [showModal, setShowModal] = useState(false); // ** State for showing modal

  // Function to handle modal open
  // Open and close modal
  const handleEditColumns = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Save selected columns from modal
  const handleSaveColumns = (selectedColumns) => {
    const updatedColumns = allColumns.map((column) => ({
      ...column,
      isVisible: selectedColumns.includes(column.name),
    }));
    setColumns(updatedColumns); // Set the selected columns as visible
    setShowModal(false);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://incubator.drishticps.org/api/programmanagers/me",
          {
            withCredentials: true,
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (getUserId) {
      if (role == "Program Manager") {
        fetchUserData();
      } else if (role == "Admin") {
        navigate("/admincards");
      } else {
        navigate("/cards");
      }
    } else {
      navigate("/login");
    }
  }, []);

  // *** START CHANGE for showes all response list ***
  // Fetch applications related to the pipeline and form dynamically
  useEffect(() => {
    // Ensure `formId` is a valid non-null array or string before proceeding
    const validFormId = Array.isArray(formId)
      ? formId.filter((id) => id !== null)
      : formId;

    if (pipelineId && validFormId && validFormId.length > 0) {
      const fetchApplications = async () => {
        try {
          console.log("formId:", validFormId);
          console.log("pipelineId:", pipelineId);

          // const response = await axios.get(
          //   // `/api/forms/pipeline/${pipelineId}/form/${validFormId[0]}/responses`, // Use first valid ID
          //   `/api/forms/pipeline/${pipelineId}/form/${validFormId[0]}/responses?round=${currentRoundNumber}`, // Filter by round
          //   { withCredentials: true }
          // );

          // Fetch data based on the current round
          let response;
          if (currentRoundNumber === 1) {
            /*** START CHANGE FOR fetching all responses for Round 1 ***/
            response = await axios.get(
              `/api/forms/pipeline/${pipelineId}/form/${validFormId[0]}/responses/all`, // Fetch all responses for Round 1
              { withCredentials: true }
            );
            /*** END CHANGE FOR fetching all responses for Round 1 ***/
          } else {
            /*** START CHANGE FOR fetching responses for other rounds ***/
            response = await axios.get(
              `/api/forms/pipeline/${pipelineId}/form/${validFormId[0]}/responses?round=${currentRoundNumber}`, // Fetch responses filtered by the current round
              { withCredentials: true }
            );
            /*** END CHANGE FOR fetching responses for other rounds ***/
          }

          /*** START CHANGE for filtering out "Name" and "Email" columns ***/
          const dynamicColumns = Object.keys(response.data[0].formData || {})
            .filter((key) => key !== "Name" && key !== "Email") // Filter out unwanted columns
            .map((key) => ({
              name: key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              isVisible: false, // Default to not visible
            }));
          /*** END CHANGE FOR filtering out "Name" and "Email" columns ***/

          setAllColumns((prevColumns) => [
            ...columns, // Keep the default visible columns
            ...dynamicColumns, // Add dynamic columns
          ]);

          const sortedApplications = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setApplications(sortedApplications);
        } catch (err) {
          console.error("Error fetching applications", err);
        }
      };
      fetchApplications();
    } else {
      console.log(
        "pipelineId or validFormId missing.",
        pipelineId,
        validFormId
      );
    }
  }, [pipelineId, formId, currentRoundNumber]);

  /*** START CHANGE FOR filtering applications by round --- ***/
  const fetchApplicationsForCurrentRound = async () => {
    try {
      let response;

      if (currentRoundNumber === 1) {
        // Fetch all responses for Round 1
        response = await axios.get(
          `/api/forms/pipeline/${pipelineId}/form/${formId[0]}/responses/all`, // Endpoint for all responses in Round 1
          { withCredentials: true }
        );
      } else {
        // Fetch responses filtered by the current round
        response = await axios.get(
          `/api/forms/pipeline/${pipelineId}/form/${formId[0]}/responses/current?round=${currentRoundNumber}`,
          { withCredentials: true }
        );
      }

      setApplications(response.data); // Update the state with the fetched responses
    } catch (err) {
      console.error("Error fetching applications for current round:", err);
    }
  };

  /*** END CHANGE FOR filtering applications by round --- ***/

  // Move to Next Stage Button handler
  /*** START CHANGE FOR handleMoveToNextStage function --- ***/
  const handleMoveToNextStage = async () => {
    const selectedApplicantIds = selectedApplications.map((app) => app._id); // Collect selected applicants
    if (selectedApplicantIds.length === 0) {
      toast.error("Please select at least one applicant."); // Show error if no applicants are selected
      return;
    }

    try {
      const response = await axios.post(
        `/api/pipelines/${pipelineId}/rounds/${currentRoundNumber}/move-to-next`,
        { applicantIds: selectedApplicantIds },
        { withCredentials: true }
      );
      toast.success(response.data.message); // Show success message
      setSelectedApplications([]); // Deselect all applications
      setSelectAllApplications(false); // Reset Select All checkbox
      // Refresh the applications for the current round
      fetchApplicationsForCurrentRound();
    } catch (error) {
      console.error("Error moving applicants:", error);
      toast.error("Failed to move applicants to the next stage.");
    }
  };
  /*** END CHANGE FOR handleMoveToNextStage function --- ***/
  /*** START CHANGE FOR handleMoveToPreviousStage function --- ***/
  const handleMoveToPreviousStage = async () => {
    const selectedApplicantIds = selectedApplications.map((app) => app._id); // Collect selected applicants
    if (selectedApplicantIds.length === 0) {
      toast.error("Please select at least one applicant."); // Show error if no applicants are selected
      return;
    }

    if (currentRoundNumber === 1) {
      toast.error("Cannot move applicants back from Round 1."); // Prevent moving back from Round 1
      return;
    }

    try {
      const response = await axios.post(
        `/api/pipelines/${pipelineId}/rounds/${currentRoundNumber}/move-to-previous`,
        { applicantIds: selectedApplicantIds },
        { withCredentials: true }
      );
      toast.success(response.data.message); // Show success message
      setSelectedApplications([]); // Deselect all applications
      setSelectAllApplications(false); // Reset Select All checkbox
      // Refresh the applications for the current round
      fetchApplicationsForCurrentRound();
    } catch (error) {
      console.error("Error moving applicants back:", error);
      toast.error("Failed to move applicants back to the previous stage.");
    }
  };
  /*** END CHANGE FOR handleMoveToPreviousStage function --- ***/

  // *** END CHANGE for showes all response list ***
  /*** START CHANGE FOR handleRoundChange function --- ***/
  // const handleRoundChange = (roundNumber) => {
  //   setCurrentRoundNumber(roundNumber); // Update the current round number
  //   fetchApplicationsForCurrentRound(); // Fetch applications for the new round
  // };
  // *** START CHANGE FOR fetching applications correctly based on the round selected ***
  const handleRoundChange = async (roundNumber) => {
    try {
      setCurrentRoundNumber(roundNumber); // Update the current round number immediately
      let response;

      if (roundNumber === 1) {
        // Fetch all responses for Round 1
        response = await axios.get(
          `/api/forms/pipeline/${pipelineId}/form/${formId[0]}/responses/all`, // Endpoint for all responses in Round 1
          { withCredentials: true }
        );
      } else {
        // Fetch responses for the selected round
        response = await axios.get(
          `/api/forms/pipeline/${pipelineId}/form/${formId[0]}/responses/current?round=${roundNumber}`, // Endpoint for responses for specific rounds
          { withCredentials: true }
        );
      }
      console.log(`API Response for Round ${roundNumber}:`, response.data); // Debugging: Check API response

      if (response.data && response.data.length > 0) {
        const sortedApplications = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log(
          `Sorted Applications for Round ${roundNumber}:`,
          sortedApplications
        ); // Debugging

        setApplications(sortedApplications); // Update state with the fetched responses
      } else {
        setApplications([]); // Clear applications if no data is returned
      }
    } catch (err) {
      console.error("Error fetching applications for selected round:", err);
      setApplications([]); // Clear applications in case of an error
    }
  };
  // *** END CHANGE FOR fetching applications correctly based on the round selected ***

  // Update the onClick handler for the round buttons
  {
    rounds.map((round) => (
      <span
        key={round.roundNumber}
        className={`round-name-allapplications ${
          currentRoundNumber === round.roundNumber ? "active-round" : ""
        }`}
        onClick={() => handleRoundChange(round.roundNumber)} // Call the updated handleRoundChange function
      >
        Round {round.roundNumber}
      </span>
    ));
  }

  /*** END CHANGE FOR handleRoundChange function --- ***/

  // *** START CHANGE sorting for Name --- ***
  const handleNameSort = () => {
    const sortedApplications = [...applications];
    if (nameSortConfig.direction === "asc") {
      sortedApplications.sort((a, b) =>
        a.formData["Name"].localeCompare(b.formData["Name"])
      );
      setNameSortConfig({ key: "Name", direction: "desc" });
    } else {
      sortedApplications.sort((a, b) =>
        b.formData["Name"].localeCompare(a.formData["Name"])
      );
      setNameSortConfig({ key: "Name", direction: "asc" });
    }
    setApplications(sortedApplications);
  };
  // *** END CHANGE sorting for Name --- ***
  /*** START CHANGE sorting for Applied On (Date and Time) --- ***/
  // Function to handle date and time sorting
  const handleDateSort = () => {
    const sortedApplications = [...applications];
    if (dateSortConfig.direction === "asc") {
      sortedApplications.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setDateSortConfig({ key: "Applied On", direction: "desc" });
    } else {
      sortedApplications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setDateSortConfig({ key: "Applied On", direction: "asc" });
    }
    setApplications(sortedApplications);
  };
  /*** END CHANGE sorting for Applied On (Date and Time) --- ***/

  const handleLogout = async () => {
    const response = await axios.post(
      `https://incubator.drishticps.org/api/logout/programManager/${user._id}`,
      {},
      { withCredentials: true }
    );
    setUser(null);
    dispatch(superAdminAction.logoutUser());
    navigate("/login");
  };

  // Helper function to format the date and time
  const formatDateAndTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString(); // Get only the date
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }); // Get the time in HH:MM format
    return { formattedDate, formattedTime };
  };

  const handleViewDetails = async (response) => {
    try {
      const res = await axios.get(
        `/api/forms/pipeline/${response.pipelineId}/user/${response.formData.Email}/responses`,
        { withCredentials: true }
      );

      console.log("API Response for User Details:", res.data); // Debugging: Log full API response

      if (res.data && res.data.length > 0) {
        // const sortedResponses = res.data.sort(
        //   (a, b) => a.currentRound - b.currentRound
        // );
        // console.log("Sorted Responses:", sortedResponses); // Debugging: Log sorted responses
        const sortedResponses = res.data.map((resp) => {
          console.log("Checking formData:", resp.formData);
          return {
            ...resp,
            formData: resp.formData || {}, // Provide a fallback for missing data
          };
        });
        setSelectedUserResponses(sortedResponses);
        setActiveResponseTab(response.currentRound);
        setSelectedResponse(response);
      } else {
        toast.error("No responses available for this user.");
      }
    } catch (error) {
      console.error("Error fetching user responses:", error);
      toast.error("Failed to fetch user responses.");
    }
  };

  const handleBackToApplications = () => {
    setSelectedResponse(null); // Go back to applications list
  };

  // *** START CHANGE for checkbox functionality --- ***
  // Handle selecting all applications
  const handleSelectAllApplications = () => {
    if (selectAllApplications) {
      setSelectedApplications([]); // Deselect all
    } else {
      setSelectedApplications(applications); // Select all
    }
    setSelectAllApplications(!selectAllApplications); // Toggle select all checkbox
  };

  // Handle selecting individual applications
  const handleSelectApplication = (application) => {
    const isSelected = selectedApplications.includes(application);
    if (isSelected) {
      setSelectedApplications(
        selectedApplications.filter((a) => a !== application)
      ); // Deselect
    } else {
      setSelectedApplications([...selectedApplications, application]); // Select
    }
  };

  useEffect(() => {
    setSelectAllApplications(
      selectedApplications.length === applications.length
    );
  }, [selectedApplications, applications]);
  // *** END CHANGE for checkbox functionality --- ***

  // Pagination logic

  // *** START CHANGE for pagination number --- ***
  const handleRowsPerPageChangeApplications = (e) => {
    setResponsesPerPageApplications(Number(e.target.value));
    setCurrentPageApplications(1);
  };

  const handlePageChangeApplications = (page) => {
    if (page > 0 && page <= totalPagesApplications) {
      setCurrentPageApplications(page);
    }
  };

  const indexOfLastResponseApplications =
    currentPageApplications * responsesPerPageApplications;
  const indexOfFirstResponseApplications =
    indexOfLastResponseApplications - responsesPerPageApplications;
  const currentResponsesApplications = applications.slice(
    indexOfFirstResponseApplications,
    indexOfLastResponseApplications
  );
  const totalPagesApplications = Math.ceil(
    applications.length / responsesPerPageApplications
  );
  // *** END CHANGE FOR pagination --- ***

  // ** START CHANGE for export to CSV --- **
  const handleExportToCSV = () => {
    if (selectedApplications.length === 0) {
      toast.error("Please select at least one row to export."); // Show Toastify message
      return;
    }

    const csvContent = convertToCSV(selectedApplications);
    downloadCSV(csvContent, "applications_responses.csv");
  };

  // const convertToCSV = (data) => {
  //   const array = [Object.keys(data[0].formData)].concat(
  //     data.map((item) => Object.values(item.formData))
  //   );
  //   return array.map((row) => row.join(",")).join("\n");
  // };
  const convertToCSV = (data) => {
    // Step 1: Get all unique form field labels
    const allLabels = [
      ...new Set(data.flatMap((item) => Object.keys(item.formData || {}))),
    ];

    // Step 2: Create the CSV header
    const csvHeader = allLabels.join(",");

    // Step 3: Map data rows ensuring empty fields are represented as blank cells
    const csvRows = data.map((item) => {
      return allLabels
        .map((label) => {
          const value = item.formData[label] || ""; // Use empty string for missing values
          return typeof value === "string" && value.includes(",")
            ? `"${value}"` // Escape values with commas
            : value;
        })
        .join(",");
    });

    // Step 4: Combine header and rows into a single CSV string
    return [csvHeader, ...csvRows].join("\n");
  };

  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  // ** END CHANGE FOR export to CSV --- **

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const formatUrl = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };
  /*** START CHANGE FOR text styling --- ***/
  // Function to safely render HTML in JSX for user responses
  const createMarkup = (html) => {
    return { __html: html };
  };
  /*** END CHANGE FOR text styling --- ***/

  const renderResponseTabs = () => {
    // Debugging: Log all user responses
    console.log("Selected User Responses:", selectedUserResponses);
    // Debugging: Check rounds and active response tab
    console.log("Rounds Data:", rounds);
    console.log("Active Response Tab (Current Round):", activeResponseTab);
    // Check if there are no responses at all
    if (!selectedUserResponses || selectedUserResponses.length === 0) {
      console.warn("No responses found for the selected user.");
      return <p>No responses found.</p>;
    }
    return (
      <div>
        <div className="response-details-applications">
          {/* <div className="header-with-button-applications">
            <h4 style={{color:'white'}}>.</h4>
            <button
              className="button-back-to-applications"
              onClick={handleBackToApplications}
            >
              Back to Applications
            </button>
          </div> */}
          <div className="header-with-button-applications">
            <h4 style={{ color: "white" }}>.</h4>
            <div className="button-group-allapplications">
              <button
                className="button-print-response-allapplications"
                onClick={() => window.print()} // Trigger print functionality
              >
                Print Response
              </button>
              <button
                className="button-back-to-applications"
                onClick={handleBackToApplications}
              >
                Back to Applications
              </button>
            </div>
          </div>
          <div className="tab-buttons-allapplications">
            {rounds.map((round) => (
              <button
                key={round.roundNumber}
                className={`tab-button-allapplications ${
                  activeResponseTab === round.roundNumber ? "active" : ""
                }`}
                // onClick={() => {
                //   setActiveResponseTab(round.roundNumber);
                // }}
                onClick={() => {
                  console.log(`Switching to Round ${round.roundNumber}`);
                  setActiveResponseTab(round.roundNumber);
                }}
              >
                Round {round.roundNumber} Response
              </button>
            ))}
          </div>

          <div className="custom-response-details-applications">
            {selectedUserResponses.some(
              // // (resp) => resp.roundsCompleted.includes(activeResponseTab)
              // (resp) =>
              //   // resp.currentRound === activeResponseTab ||
              //   resp.roundsCompleted.includes(activeResponseTab)
              // (resp) =>
              //   resp.roundsCompleted.includes(activeResponseTab) &&
              //   rounds.find(
              //     (round) =>
              //       round.roundNumber === activeResponseTab &&
              //       round.application.formId === resp.formTitle
              //   )
              (resp) => resp.roundNumber === activeResponseTab
            ) ? (
              selectedUserResponses
                // // // .filter((resp) => resp.roundsCompleted.includes(activeResponseTab))
                // // .filter(
                // //   (resp) =>
                // //     resp.currentRound === activeResponseTab ||
                // //     resp.roundsCompleted.includes(activeResponseTab)
                // // )

                // // // .filter((resp) => resp.currentRound === activeResponseTab)
                // .filter(
                //   (resp) =>
                //     resp.roundsCompleted.includes(activeResponseTab) &&
                //     rounds.find(
                //       (round) =>
                //         round.roundNumber === activeResponseTab &&
                //         round.application.formId === resp.formTitle
                //     )
                // )
                .filter((resp) => resp.roundNumber === activeResponseTab)

                .map((resp, idx) => (
                  <div key={idx}>
                    {/* Applicant Details */}
                    <div style={{ marginTop: "20px" }}>
                      <h4 className="documents-heading-allapplications">
                        Applicant Form Details
                      </h4>
                      {console.log(
                        "formData for this Response:",
                        resp.formData
                      )}{" "}
                      {/* Debugging */}
                      {resp.formData &&
                      Object.keys(resp.formData).length > 0 ? (
                        Object.keys(resp.formData).map((key, index) => (
                          <div
                            key={index}
                            className="response-item-applications"
                          >
                            <div className="number-box-allapplications">
                              {index + 1}
                            </div>
                            <div className="response-key-top-allapplications">
                              <h5 className="response-key-allapplications">
                                {key} :
                              </h5>
                              <p
                                className="response-value-allapplications"
                                dangerouslySetInnerHTML={createMarkup(
                                  resp.formData[key]
                                )}
                              ></p>
                            </div>
                          </div>
                          // ))}
                        ))
                      ) : (
                        <p>No Applicant Details available.</p>
                      )}
                    </div>

                    <hr />

                    {/* Form Status Details */}
                    <div className="form-timing-section-allapplications">
                      <h4 className="documents-heading-allapplications">
                        Form Status Details
                      </h4>
                      <div className="response-item-applications">
                        <div className="number-box-allapplications">1</div>
                        <div className="response-key-top-allapplications">
                          <h5 className="response-key-allapplications">
                            Form Status :
                          </h5>
                          <p className="response-value-allapplications">
                            {resp.formStatus || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="response-item-applications">
                        <div className="number-box-allapplications">2</div>
                        <div className="response-key-top-allapplications">
                          <h5 className="response-key-allapplications">
                            Form First Saved Time :
                          </h5>
                          <p className="response-value-allapplications">
                            {resp.formFirstSavedTime
                              ? new Date(
                                  resp.formFirstSavedTime
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="response-item-applications">
                        <div className="number-box-allapplications">3</div>
                        <div className="response-key-top-allapplications">
                          <h5 className="response-key-allapplications">
                            Last Modified :
                          </h5>
                          <p className="response-value-allapplications">
                            {resp.lastModified
                              ? new Date(resp.lastModified).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="response-item-applications">
                        <div className="number-box-allapplications">4</div>
                        <div className="response-key-top-allapplications">
                          <h5 className="response-key-allapplications">
                            Form Submission Time :
                          </h5>
                          <p className="response-value-allapplications">
                            {resp.formSubmissionTime
                              ? new Date(
                                  resp.formSubmissionTime
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr />

                    {/* Documents Section */}
                    <div className="documents-section-allapplications">
                      <h4 className="documents-heading-allapplications">
                        Documents
                      </h4>
                      {resp.files && resp.files.length > 0 ? (
                        <div className="documents-data-section-allapplications">
                          {resp.files.map((file, index) => (
                            <div
                              key={index}
                              className="file-item-allapplications"
                            >
                              <div className="number-box-allapplications">
                                {index + 1}
                              </div>
                              <h5
                                style={{ width: "465px" }}
                                className="response-key-document-allapplications"
                              >
                                {file.labelName}
                                <span className="response-value-file-allapplications">
                                  uploaded at
                                </span>{" "}
                                {moment(file.uploadedAt).format(
                                  "DD/MM/YYYY hh:mm A"
                                )}{" "}
                                :
                              </h5>
                              <a
                                href={`${file.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="file-response-allapplications"
                              >
                                {file.originalName}
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No documents uploaded yet.</p>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <p style={{ marginTop: "20px" }}>
                No response available for this round.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (selectedResponse) {
      console.warn("No responses found to render tabs."); // Debugging: Log if no responses are available
      return renderResponseTabs();
    }
    switch (activeTab) {
      case "Applications":
        return (
          <div>
            {applications.length === 0 ? (
              <div>No Applications response yet</div>
            ) : (
              <div className="applications-table-allapplications">
                <div className="custom-response-header-allapplications">
                  <h4 className="custom-print-title">All Responses</h4>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={handleEditColumns}
                      className="custom-button-export-allapplications"
                    >
                      Edit Columns
                    </button>
                    <button
                      className="custom-button-export-allapplications"
                      onClick={handleExportToCSV}
                    >
                      Export to CSV
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "-20px",
                    marginLeft: "5px",
                    marginBottom: "5px",
                  }}
                >
                  <button
                    onClick={handleMoveToNextStage}
                    className="custom-button-next-stage-allapplications"
                    title="Move selected applications to the next stage"
                  >
                    <span>
                      <FaArrowRight />
                    </span>
                    Next Stage
                  </button>
                  <button
                    onClick={handleMoveToPreviousStage}
                    className="custom-button-previous-stage-allapplications"
                    title="Move selected applications to the previous stage"
                  >
                    <span>
                      <FaArrowLeft />
                    </span>
                    Previous Stage
                  </button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          onChange={handleSelectAllApplications}
                          checked={selectAllApplications}
                        />
                      </th>
                      {columns
                        .filter((col) => col.isVisible)
                        .map((col) => (
                          <th key={col.name}>
                            {col.label}
                            {col.name === "Name" && (
                              <FaSort
                                className="sorticon-applications"
                                onClick={handleNameSort}
                                style={{ cursor: "pointer" }}
                              />
                            )}
                            {col.name === "createdAt" && (
                              <FaSort
                                className="sorticon-applications"
                                onClick={handleDateSort}
                                style={{ cursor: "pointer" }}
                              />
                            )}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentResponsesApplications.map((app, index) => {
                      const { formattedDate, formattedTime } =
                        formatDateAndTime(app.createdAt);
                      return (
                        <tr key={index}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedApplications.includes(app)}
                              onChange={() => handleSelectApplication(app)}
                            />
                          </td>
                          {columns
                            .filter((col) => col.isVisible)
                            .map((col) => (
                              <td key={col.name}>
                                {col.name === "createdAt" ? (
                                  `${
                                    formatDateAndTime(app.createdAt)
                                      .formattedDate
                                  } ${
                                    formatDateAndTime(app.createdAt)
                                      .formattedTime
                                  }`
                                ) : col.name === "currentRound" ? (
                                  `Round ${app.currentRound}` // Populate Round column
                                ) : col.name === "Individual" ? (
                                  // Add the button logic for the Individual column
                                  <button
                                    className="view-details-button-applications"
                                    onClick={() => handleViewDetails(app)}
                                  >
                                    View Details
                                  </button>
                                ) : col.name === "formStatus" ? (
                                  /*** START CHANGE FOR add new column "Form Status" ***/
                                  app.formStatus // Display form status
                                ) : (
                                  /*** END CHANGE FOR add new column "Form Status"--- ***/

                                  app.formData[col.name] || "N/A"
                                )}
                              </td>
                            ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="pagination-container-applications">
                  <div className="pagination-applications">
                    <button
                      className={`pagination-arrow-applications ${
                        currentPageApplications === 1 && "disabled"
                      }`}
                      onClick={() =>
                        handlePageChangeApplications(
                          currentPageApplications - 1
                        )
                      }
                    >
                      &lt;
                    </button>
                    <span className="page-number-applications">
                      <span className="current-page-applications">
                        {currentPageApplications}
                      </span>{" "}
                      / {totalPagesApplications}
                    </span>
                    <button
                      className={`pagination-arrow-applications ${
                        currentPageApplications === totalPagesApplications &&
                        "disabled"
                      }`}
                      onClick={() =>
                        handlePageChangeApplications(
                          currentPageApplications + 1
                        )
                      }
                    >
                      &gt;
                    </button>
                  </div>
                  <div className="rows-info-applications">
                    <span>
                      Showing {indexOfFirstResponseApplications + 1} -{" "}
                      {Math.min(
                        indexOfLastResponseApplications,
                        applications.length
                      )}{" "}
                      of {applications.length} Results
                    </span>
                  </div>
                  <div className="rows-per-page-applications">
                    <label style={{ marginRight: "10px" }}>Rows per page</label>
                    <select
                      value={responsesPerPageApplications}
                      onChange={handleRowsPerPageChangeApplications}
                    >
                      {[5, 10, 15, 20].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* *** END CHANGE FOR pagination --- *** */}
              </div>
            )}
          </div>
        );
      case "Evaluations":
        return <div>Evaluations Content</div>;
      case "Evaluators":
        return <div>Evaluators Content</div>;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-homepage-allapplications">
      <ToastContainer position="bottom-right" />{" "}
      {/* ** Added for react-toastify notifications ** */}
      <aside className="sidebar-homepage-allapplications">
        <div className="logo-container-homepage-allapplications">
          <div className="logo-homepage-allapplications">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-homepage-allapplications"
            />
          </div>
        </div>
        <div className="nav-container-homepage-allapplications">
          <nav className="nav-homepage-allapplications">
            <ul>
              <li>
                <Link to="/homepage">
                  <IoHomeOutline className="nav-icon-homepage-allapplications" />{" "}
                  Homepage
                </Link>
              </li>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-homepage-allapplications" />{" "}
                  Create Query Form
                </Link>
              </li>
              <li>
                <Link to="/cohorts">
                  <GrDocumentSound className="nav-icon-homepage-allapplications" />{" "}
                  Cohorts
                </Link>
              </li>
              <li>
                <Link to="/pipeline">
                  <IoIosLink className="nav-icon-homepage-allapplications" />{" "}
                  Pipeline
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye className="nav-icon-homepage-allapplications" />{" "}
                  Create Evaluation Form
                </Link>
              </li>
              {/* <li>
                <Link to="/applications">
                  <TbUsersGroup className="nav-icon-homepage-allapplications" />{" "}
                  Applications
                </Link>
              </li> */}
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-homepage-allapplications">
        <header className="header-homepage-allapplications">
          <span className="founder-homepage-allapplications">All Forms</span>
          <div className="profile-section-homepage-allapplications">
            <div className="user-info-homepage-allapplications">
              <span className="user-initials-homepage-allapplications">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-homepage-allapplications">
                <span className="user-name-homepage-allapplications">
                  {user.username}
                </span>
                <br />
                <span className="user-email-homepage-allapplications">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              className="logout-button-homepage-allapplications"
              onClick={handleLogout}
              style={{ marginLeft: "20px", padding: "8px" }}
            >
              Logout
            </button>
          </div>
        </header>
        <section className="content-homepage-allapplications">
          <div className="title-rounds-container">
            <h3>{title}</h3>
            {rounds.length > 0 && (
              <div className="round-info-allapplications">
                {rounds.map((round) => (
                  <span
                    key={round.roundNumber}
                    className={`round-name-allapplications ${
                      currentRoundNumber === round.roundNumber
                        ? "active-round"
                        : ""
                    }`}
                    onClick={() => handleRoundChange(round.roundNumber)}
                  >
                    Round {round.roundNumber}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pipeline-tabs-allapplications">
            <button
              className={`tab-button-allapplications ${
                activeTab === "Applications" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Applications")}
            >
              Applications
            </button>
            <button
              className={`tab-button-allapplications ${
                activeTab === "Evaluations" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Evaluations")}
            >
              {/* Evaluations */}
              Tab 1
            </button>
            <button
              className={`tab-button-allapplications ${
                activeTab === "Evaluators" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Evaluators")}
            >
              {/* Evaluators */}
              Tab 2
            </button>
            {/* *** END CHANGE tab button style --- ***/}
          </div>

          <div className="tab-content-allapplications">
            {renderTabContent()}
          </div>
        </section>
        {/* *** START CHANGE for Edit Columns Modal --- */}
        <EditColumnsModal
          show={showModal}
          handleClose={handleCloseModal}
          columns={allColumns} // Pass all columns here
          handleSave={handleSaveColumns}
        />
        {/* *** END CHANGE for Edit Columns Modal --- */}
      </main>
    </div>
  );
};

export default Applications;
