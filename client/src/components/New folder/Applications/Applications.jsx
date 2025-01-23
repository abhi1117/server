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
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import EditColumnsModal from "./EditColumnsModal";
import "./Applications.css";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]); // Track selected applications
  const [selectAllApplications, setSelectAllApplications] = useState(false); // Track select all checkbox
  const [user, setUser] = useState({ name: "", email: "" });
  const [activeTab, setActiveTab] = useState("Applications");
  const [selectedResponse, setSelectedResponse] = useState(null); // For showing details of a user
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

  // Log the location to ensure you're getting the state
  // console.log("Location object:", location);
  // console.log("Extracted pipelineId:", pipelineId, "formId:", formId);

  const [columns, setColumns] = useState([
    // Initial default columns that will always be visible
    { name: "Name", label: "Applicant", isVisible: true },
    { name: "Email", label: "Email", isVisible: true },
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

  // *** START CHANGE for showes all response list ***
  // Fetch applications related to the pipeline and form dynamically
  useEffect(() => {
    if (pipelineId && formId) {
      const fetchApplications = async () => {
        try {
          const response = await axios.get(
            `/api/forms/pipeline/${pipelineId}/form/${formId}/responses`
          );
          /*** START CHANGE for filtering out "Name" and "Email" columns --- ***/
          // Set columns dynamically based on response data keys, excluding "Name" and "Email"
          const dynamicColumns = Object.keys(response.data[0].formData || {})
            .filter((key) => key !== "Name" && key !== "Email") // Filter out the unwanted columns
            .map((key) => ({
              name: key,
              label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the first letter
              isVisible: false, // Default to not visible
            }));
          /*** END CHANGE FOR filtering out "Name" and "Email" columns --- ***/

          setAllColumns((prevColumns) => [
            ...columns, // Keep the default visible columns
            ...dynamicColumns, // Add the dynamic columns fetched from API
          ]);

          // setApplications(response.data);
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
        "pipelineId or formId missing. pipelineId:",
        pipelineId,
        "formId:",
        formId
      ); // Log missing pipelineId or formId
    }
  }, [pipelineId, formId]);
  // *** END CHANGE for showes all response list ***

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

  const handleLogout = () => {
    localStorage.removeItem("token");
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

  const handleViewDetails = (response) => {
    setSelectedResponse(response); // Set the selected user response
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

  const convertToCSV = (data) => {
    const array = [Object.keys(data[0].formData)].concat(
      data.map((item) => Object.values(item.formData))
    );
    return array.map((row) => row.join(",")).join("\n");
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
  const renderTabContent = () => {
    if (selectedResponse && activeTab === "Applications") {
      //
      return (
        <div>
          <div className="response-details-applications">
            <div className="header-with-button-applications">
              <h4>Applicant Details</h4>
              <button
                className="button-back-to-applications"
                onClick={handleBackToApplications}
              >
                Back to Applications
              </button>
            </div>
            <div
              className="custom-response-details-applications"
              style={{ marginTop: "20px" }}
            >
              {Object.keys(selectedResponse.formData).map((key, index) => (
                <div key={key} className="response-item-applications">
                  <div className="number-box-allapplications">{index + 1}</div>
                  <div className="response-key-top-allapplications">
                    <h5 className="response-key-allapplications">{key} :</h5>
                    {/* Check if the value is a URL */}
                    {isValidUrl(selectedResponse.formData[key]) ? (
                      <a
                        href={formatUrl(selectedResponse.formData[key])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-response-applications"
                      >
                        {selectedResponse.formData[key]}
                      </a>
                    ) : (
                      <p
                        className="response-value-allapplications"
                        dangerouslySetInnerHTML={createMarkup(
                          selectedResponse.formData[key]
                        )}
                      ></p>
                      // END CHANGE FOR text styling
                    )}
                  </div>
                </div>
              ))}
            </div>
            <hr />
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
                    {selectedResponse.formStatus || "N/A"}
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
                    {selectedResponse.formFirstSavedTime
                      ? new Date(
                          selectedResponse.formFirstSavedTime
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
                    {selectedResponse.lastModified
                      ? new Date(selectedResponse.lastModified).toLocaleString()
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
                    {selectedResponse.formSubmissionTime
                      ? new Date(
                          selectedResponse.formSubmissionTime
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            {/*** END CHANGE FOR add "Form Status", "Form First Saved/Submission Time", "Form Submission Time", "Last Modified" ***/}

            <hr />

            {/* Add Documents Section */}
            <div className="documents-section-allapplications">
              <h4 className="documents-heading-allapplications">Documents</h4>
              {selectedResponse.files && selectedResponse.files.length > 0 ? (
                <div className="documents-section-allapplications">
                  {/*** START CHANGE FOR dynamic numbering in Documents section ***/}
                  {selectedResponse.files.map((file, index) => (
                    <div key={index} className="file-item-allapplications">
                      {/* Adding dynamic numbering to documents section */}
                      <div className="number-box-allapplications">
                        {index + 1}
                      </div>
                      <h5
                        style={{ width: "415px" }}
                        className="response-key-document-allapplications"
                      >
                        {file.labelName}
                        <span className="response-value-file-allapplications">
                          uploaded at
                        </span>{" "}
                        {moment(file.uploadedAt).format("DD/MM/YYYY hh:mm A")} :
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
                  {/*** END CHANGE FOR dynamic numbering in Documents section ***/}
                </div>
              ) : (
                /*** START CHANGE FOR 'No documents uploaded yet.' message ***/
                <p>No documents uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      );
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
                <Link to="/form">
                  <CgNotes className="nav-icon-homepage-allapplications" />{" "}
                  Create Query Form
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye className="nav-icon-homepage-allapplications" />{" "}
                  Create Evaluation Form
                </Link>
              </li>
              <li>
                <Link to="/applications">
                  <TbUsersGroup className="nav-icon-homepage-allapplications" />{" "}
                  Applications
                </Link>
              </li>
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
          <h3>{title}</h3>
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
              Evaluations
            </button>
            <button
              className={`tab-button-allapplications ${
                activeTab === "Evaluators" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Evaluators")}
            >
              Evaluators
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
