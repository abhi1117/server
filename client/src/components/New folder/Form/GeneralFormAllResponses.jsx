import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import "./GeneralFormAllResponses.css";
import { FaPrint, FaSort } from "react-icons/fa";

const GeneralFormAllResponses = () => {
  const { formId } = useParams();
  const [formDetails, setFormDetails] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [responsesPerPage, setResponsesPerPage] = useState(10);
  const [allSelected, setAllSelected] = useState(false);
  const [nameSortConfig, setNameSortConfig] = useState({
    key: null,
    direction: "asc",
  }); // *** START CHANGE for sorting --- Added state for name sorting configuration ***
  const [dateSortConfig, setDateSortConfig] = useState({
    key: null,
    direction: "asc",
  }); // *** START CHANGE for sorting --- Added state for date sorting configuration ***
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const response = await fetch(
          `https://incubator.drishticps.org/api/forms/form-submissions/${formId}`
        );
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response format");
        }

        setFormDetails(data);

        if (data.length === 0) {
          toast.info("No responses yet");
        }
      } catch (error) {
        console.error("Error fetching form details:", error);
      }
    };

    fetchFormDetails();
  }, [formId]);

  const handleViewDetails = (response) => {
    setSelectedResponse(response);
  };

  const handleBackToResponses = () => {
    setSelectedResponse(null);
  };

  // Start of code change - Export to CSV with Toastify Message
  const handleExportToCSV = () => {
    if (selectedResponses.length === 0) {
      toast.error("Please select at least one row to export."); // Show Toastify message
      return;
    }

    const csvContent = convertToCSV(selectedResponses);
    downloadCSV(csvContent, "form_responses.csv");
  };
  // End of code change

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

  // // *** START CHANGE for sorting --- Added sorting logic ***

  const handleNameSort = () => {
    const sortedResponses = [...formDetails];
    if (nameSortConfig.direction === "asc") {
      sortedResponses.sort((a, b) =>
        a.formData["Name"].localeCompare(b.formData["Name"])
      );
      setNameSortConfig({ key: "Name", direction: "desc" });
    } else {
      sortedResponses.sort((a, b) =>
        b.formData["Name"].localeCompare(a.formData["Name"])
      );
      setNameSortConfig({ key: "Name", direction: "asc" });
    }
    setFormDetails(sortedResponses);
  };
  // *** END CHANGE for name sorting --- ***

  // *** START CHANGE for time and date sorting --- Added sorting logic for Applied On ***
  const handleDateSort = () => {
    const sortedResponses = [...formDetails];
    if (dateSortConfig.direction === "asc") {
      sortedResponses.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setDateSortConfig({ key: "Applied On", direction: "desc" });
    } else {
      sortedResponses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setDateSortConfig({ key: "Applied On", direction: "asc" });
    }
    setFormDetails(sortedResponses);
  };
  // *** END CHANGE for time and date sorting --- ***

  const indexOfLastResponse = currentPage * responsesPerPage;
  const indexOfFirstResponse = indexOfLastResponse - responsesPerPage;
  const currentResponses = formDetails.slice(
    indexOfFirstResponse,
    indexOfLastResponse
  );
  const totalPages = Math.ceil(formDetails.length / responsesPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setResponsesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Start of code change - Select All across all pages
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedResponses([]);
    } else {
      setSelectedResponses(formDetails);
    }
    setAllSelected(!allSelected);
  };
  // End of code change

  useEffect(() => {
    setAllSelected(selectedResponses.length === formDetails.length);
  }, [selectedResponses, formDetails]);

  const handleSelect = (response) => {
    if (selectedResponses.includes(response)) {
      setSelectedResponses(selectedResponses.filter((r) => r !== response));
    } else {
      setSelectedResponses([...selectedResponses, response]);
    }
  };

  const startIndex = indexOfFirstResponse + 1;
  const endIndex = Math.min(indexOfLastResponse, formDetails.length);
  const totalResponses = formDetails.length;
  // Place this function definition inside your component, but before the return statement

  const handlePrintAllResponses = () => {
    const printableContent = formDetails
      .map(
        (response, index) =>
          `<div key=${index} style="page-break-after: always;">
      ${Object.keys(response.formData)
        .map(
          (key) =>
            `<div>
          <strong style="width: 200px;">${key}:</strong>
          ${
            isValidUrl(response.formData[key])
              ? `<a href="${formatUrl(
                  response.formData[key]
                )}" target="_blank" rel="noopener noreferrer">${
                  response.formData[key]
                }</a>`
              : `<span>${response.formData[key]}</span>`
          }
        </div>`
        )
        .join("")}
      <hr />
      ${
        response.files && response.files.length > 0
          ? `<div>
          <h4>Documents</h4>
          ${response.files
            .map((file, index) => {
              const fileKey = Object.keys(response.formData).find((key) =>
                response.formData[key].includes(file.originalName)
              );
              return `<div key=${index}>
                <strong style="width: 315px;">${fileKey}:</strong>
                <a href="${file.path}" target="_blank" rel="noopener noreferrer">${file.originalName}</a>
              </div>`;
            })
            .join("")}
        </div>`
          : ""
      }
    </div>`
      )
      .join("");

    const newWindow = window.open("", "", "width=800,height=600");

    // Start of code change - Hide "React App" during print
    newWindow.document.write(
      `<html><head><style>
        @media print {
          /* Hides elements with these classes */
          .react-app-title {
            display: none !important;
          }
        }
        </style></head><body>${printableContent}</body></html>`
    );
    // End of code change

    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };
  /*** START CHANGE FOR text styling --- ***/
  // Function to safely render HTML in JSX for user responses
  const createMarkup = (html) => {
    return { __html: html };
  };
  /*** END CHANGE FOR text styling --- ***/

  return (
    <div className="custom-background-generalformallresponses">
      <ToastContainer position="bottom-right" />
      <div className="custom-container-generalformallresponses">
        {selectedResponse ? (
          <div>
            <div className="custom-response-header-generalformallresponses">
              <h4 className="react-app-title">Response Details</h4>{" "}
              {/* React App title */}
              <div style={{ display: "flex", gap: "10px" }}>
                {" "}
                {/* Adjust the gap as needed */}
                <button
                  className="custom-button-export-delete-backtoresponses-generalformallresponses"
                  onClick={() => window.print()} // Print current response
                >
                  <FaPrint
                    style={{ marginRight: "5px" }}
                    className="print-response-icon-generalformallresponses"
                  />
                  Print Response
                </button>
                <button
                  className="custom-button-export-delete-backtoresponses-generalformallresponses"
                  onClick={handleBackToResponses}
                >
                  Back to Responses
                </button>
              </div>
            </div>

            <hr />
            <div
              className="custom-response-details-generalformallresponses"
              style={{ marginTop: "40px" }}
            >
              {Object.keys(selectedResponse.formData).map((key) => (
                <div
                  key={key}
                  className="custom-response-item-generalformallresponses"
                >
                  <div style={{ display: "flex", gap: "10px" }}>
                    <strong style={{ width: "200px" }}>{key}:</strong>{" "}
                    {isValidUrl(selectedResponse.formData[key]) ? (
                      <a
                        href={formatUrl(selectedResponse.formData[key])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-response-generalformallresponses"
                      >
                        {selectedResponse.formData[key]}
                      </a>
                    ) : (
                      // <span>{selectedResponse.formData[key]}</span>
                      // START CHANGE: Render HTML for 'ReactQuill' inputs
                      <span
                        dangerouslySetInnerHTML={createMarkup(
                          selectedResponse.formData[key]
                        )}
                      ></span>
                      // END CHANGE FOR text styling
                    )}
                  </div>
                </div>
              ))}
              <hr />
              {selectedResponse.files && selectedResponse.files.length > 0 && (
                <div className="custom-response-item-generalformallresponses">
                  <h4 className="documents-generalformallresponses">
                    Documents
                  </h4>
                  {selectedResponse.files.map((file, index) => {
                    const fileKey = Object.keys(selectedResponse.formData).find(
                      (key) =>
                        selectedResponse.formData[key].includes(
                          file.originalName
                        )
                    );
                    return (
                      <div key={index} style={{ display: "flex", gap: "10px" }}>
                        <strong style={{ width: "315px" }}>{fileKey}:</strong>
                        <a
                          href={`${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-response-generalformallresponses"
                        >
                          {file.originalName}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="custom-response-header-generalformallresponses">
              <h4 className="custom-print-title">All Responses</h4>{" "}
              {/* Print All Responses title */}
              <div style={{ display: "flex", gap: "10px" }}>
                {" "}
                {/* Adjust the gap as needed */}
                <button
                  className="custom-button-export-delete-backtoresponses-generalformallresponses"
                  onClick={handleExportToCSV}
                >
                  Export to CSV
                </button>
                {/* <button
                  className="custom-button-export-delete-backtoresponses-generalformallresponses"
                  onClick={handlePrintAllResponses} // Print all responses
                >
                  <FaPrint
                    style={{ marginRight: "5px" }}
                    className="print-response-icon-generalformallresponses"
                  />{" "}
                  Print All Responses
                </button> */}
              </div>
            </div>
            {formDetails && formDetails.length > 0 ? (
              <ul className="custom-response-list-generalformallresponses">
                <li
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    marginTop: "30px",
                    fontWeight: "bold",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={allSelected}
                      style={{ marginRight: "10px" }}
                    />
                    {/* <span>Name</span> */}
                    <span
                      onClick={handleNameSort}
                      style={{ cursor: "pointer" }}
                    >
                      Name{" "}
                      <FaSort className="sorticon superadmindash-sorticon" />{" "}
                      {/* *** START CHANGE for name sorting --- Added FaSort icon and onClick handler *** */}
                    </span>{" "}
                    {/* *** END CHANGE for name sorting --- */}
                  </div>
                  <span>Email</span>
                  {/* <span>Applied On</span>  */}
                  <span onClick={handleDateSort} style={{ cursor: "pointer" }}>
                    Applied On{" "}
                    <FaSort className="sorticon superadmindash-sorticon" />{" "}
                    {/* *** START CHANGE for time and date sorting --- Added FaSort icon and onClick handler *** */}
                  </span>{" "}
                  {/* *** END CHANGE for time and date sorting --- */}
                  <span>Individual</span>
                </li>
                {currentResponses.map((response, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        onChange={() => handleSelect(response)}
                        checked={selectedResponses.includes(response)}
                        style={{ marginRight: "10px" }}
                      />
                      {response.formData["Name"] ? (
                        <span style={{ textAlign: "left", width: "120px" }}>
                          {response.formData["Name"]}
                        </span>
                      ) : (
                        <span>{`Response ${index + 1}`}</span>
                      )}
                    </div>
                    {/* <span>{response.formData["Email"]}</span>
                    <span>
                      {response.formData["Qualification(Recent One)"]}
                    </span> */}
                    <span style={{ textAlign: "left", width: "200px" }}>
                      {response.formData["Email"]}
                    </span>

                    {/* <span style={{ textAlign: "left", width: "140px" }}>{new Date(response.createdAt).toLocaleDateString()}</span> */}
                    <span style={{ textAlign: "left", width: "140px" }}>
                      {moment(response.createdAt).format("DD/MM/YYYY")}
                    </span>
                    <button
                      className="custom-button-view-details-generalformallresponses"
                      onClick={() => handleViewDetails(response)}
                    >
                      View Details
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <div className="no-responses-found-generalformallresponses">
                  <img
                    src="/founders/notfound.png"
                    alt="Logo"
                    style={{
                      marginTop: "70px",
                      width: "120px",
                      height: "120px",
                    }}
                  />
                  <h4>No responses yet</h4>
                </div>
              </div>
            )}
            <div className="pagination-container">
              <div className="pagination">
                <button
                  className={`pagination-arrow-generalformallresponses ${
                    currentPage === 1 && "disabled"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{
                    backgroundColor: currentPage === 1 ? "inherit" : "",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = "";
                    }
                  }}
                >
                  &lt;
                </button>
                <span className="page-number">
                  <span className="current-page">{currentPage}</span> /{" "}
                  {totalPages}
                </span>
                <button
                  className={`pagination-arrow-generalformallresponses ${
                    currentPage === totalPages && "disabled"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{
                    backgroundColor:
                      currentPage === totalPages ? "inherit" : "",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.backgroundColor = "";
                    }
                  }}
                >
                  &gt;
                </button>
              </div>
              <div className="rows-info-generalformallresponses">
                <span>
                  Showing {startIndex} - {endIndex} of {totalResponses} Results
                </span>
              </div>
              <div className="rows-per-page">
                <label>Rows per page</label>
                <select
                  value={responsesPerPage}
                  onChange={handleRowsPerPageChange}
                >
                  {[2, 10, 15, 20].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        <button
          className="custom-button-close-modal-generalformallresponses"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default GeneralFormAllResponses;
