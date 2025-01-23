import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHouseUser } from "react-icons/fa";
import axios from "axios";
import "./UserFormDetails.css";

const UserFormDetails = () => {
  const location = useLocation();
  const { pipelineId, email, formId } = location.state || {}; // Retrieve state from navigation
  console.log("Received Pipeline ID from navigation:", pipelineId);
  console.log("Received Email from navigation:", email);
  const [user, setUser] = useState({
    name: "",
    email: email || "", // Initialize with email if available
    pipelineId: pipelineId || "", // Initialize with pipelineId if available
    formId: formId || "", // Initialize formId from navigation state
    formData: {},
    files: [],
  });

  const [formStatusDetails, setFormStatusDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("Round 1");
  const [responsesByRound, setResponsesByRound] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";
        const response = await axios.post(
          `${API_BASE_URL}/api/forms/fetch-draft-by-email`,
          { email: user.email },
          { withCredentials: true }
        );

        console.log("Form data received:", response.data);

        setUser((prevState) => ({
          ...prevState,
          name: response.data.formData.Name || "User",
          pipelineId: response.data.pipelineId,
          formId: response.data.formId || response.data._id || "",
          formData: {
            ...response.data.formData,
            currentRound: response.data.currentRound || 1,
            roundsCompleted: response.data.roundsCompleted || [],
          },
          files: response.data.files || [],
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user.email) {
      fetchUserData();
    }
  }, [user.email]);

  useEffect(() => {
    const fetchAllUserData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";

        // Fetch form data using the user's email
        if (user.email) {
          console.log("Fetching form data for user with email:", user.email);

          const response = await axios.post(
            `${API_BASE_URL}/api/forms/fetch-draft-by-email`,
            { email: user.email },
            { withCredentials: true }
          );

          console.log("Form data received:", response.data);

          // Update user form data and files
          setUser((prevState) => ({
            ...prevState,
            formData: {
              ...response.data.formData,
              pipelineId: response.data.pipelineId, // Ensure pipelineId is set
              _id: response.data._id, // Ensure form submission ID is part of formData
            },
            files: response.data.files || [], // Store files fetched from the form
          }));
          // Debugging log
          console.log("User state after fetching form data:", {
            ...user,
            formData: response.data.formData,
          });
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    if (user.email) {
      fetchAllUserData();
    }
  }, [user.email]);

  // Fetch responses by round
  /*** START CHANGE: Fetch all responses for completed and current rounds ***/
  /*** START CHANGE --- Fetch responses for accessible rounds ***/
  // useEffect(() => {
  //   const fetchAllResponses = async () => {
  //     const { pipelineId, email, formId } = user;

  //     if (!pipelineId || !email || !formId) {
  //       console.warn("fetchAllResponses: Missing required parameters.");
  //       return;
  //     }

  //     try {
  //       const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://incubator.drishticps.org";
  //       const response = await axios.post(
  //         `${API_BASE_URL}/api/forms/pipeline/${pipelineId}/responses`,
  //         { email, formId },
  //         { withCredentials: true }
  //       );

  //       console.log("API Response Received:", response.data);

  //       if (response.data && response.data.length > 0) {
  //         const groupedResponses = response.data.reduce((acc, round) => {
  //           acc[`Round ${round.roundNumber}`] = round.response ? [round.response] : [];
  //           return acc;
  //         }, {});
  //         console.log("Grouped Responses:", groupedResponses);
  //         setResponsesByRound(groupedResponses);
  //       } else {
  //         console.warn("No responses found for this user.");
  //         setResponsesByRound({});
  //       }
  //     } catch (error) {
  //       if (error.response && error.response.status === 404) {
  //         console.warn("No responses found for the given pipeline and form.");
  //       } else {
  //         console.error("Unexpected error during API call:", error);
  //       }
  //     }
  //   };

  //   fetchAllResponses();
  // }, [user.pipelineId, user.formId, user.email]);
  useEffect(() => {
    const fetchAllResponses = async () => {
      const { pipelineId, email } = user;

      if (!pipelineId || !email) {
        console.warn("fetchAllResponses: Missing required parameters.");
        return;
      }

      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";
        const response = await axios.post(
          `${API_BASE_URL}/api/forms/pipeline/${pipelineId}/responses`,
          { email },
          { withCredentials: true }
        );

        console.log("API Response Received:", response.data);

        // Group responses by round
        const groupedResponses = response.data.reduce((acc, round) => {
          acc[`Round ${round.roundNumber}`] = round.response
            ? [round.response]
            : [];
          return acc;
        }, {});

        console.log("Grouped Responses:", groupedResponses);
        setResponsesByRound(groupedResponses);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn("No responses found for the given pipeline.");
        } else {
          console.error("Unexpected error during API call:", error);
        }
      }
    };

    fetchAllResponses();
  }, [user.pipelineId, user.email]);
  /*** END CHANGE --- Fetch responses for accessible rounds ***/

  /*** END CHANGE: Fetch all responses for completed and current rounds ***/

  const handleCompleteProfile = (pipelineId, formId) => {
    if (!pipelineId) {
      console.error("Pipeline ID not found.");
      return;
    }

    navigate(`/fa/${pipelineId}`, {
      state: { email: user.email, preFilledData: user.formData },
    });
  };

  /*** END CHANGE FOR updating handleCompleteProfile ***/

  /*** START CHANGE FOR handleLogout similar to UserDashboard.jsx ***/
  const handleLogout = async () => {
    try {
      // Make an API call to the server to log out and clear the session cookies
      await axios.post("/api/users/logout", {}, { withCredentials: true });

      // Navigate the user to the login page after successful logout
      navigate("/user-signin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  /*** END CHANGE FOR handleLogout similar to UserDashboard.jsx ***/

  const createMarkup = (html) => {
    return { __html: html };
  };

  useEffect(() => {
    console.log("Responses by round state:", responsesByRound);
  }, [responsesByRound]);

  useEffect(() => {
    console.log("User formData state:", user.formData);
  }, [user.formData]);

  useEffect(() => {
    console.log("Updated User State:", user);
  }, [user]);

  useEffect(() => {
    console.log("Debugging IDs:", {
      pipelineId: user.pipelineId,
      formId: user.formId,
    });
  }, [user.pipelineId, user.formId]);

  /*** START CHANGE: Render response tabs based on form status ***/
  // const renderResponseTabs = () => {
  //   return Object.keys(responsesByRound).length > 0 ? (
  //     Object.keys(responsesByRound)
  //       .filter((round) => {
  //         const roundResponses = responsesByRound[round] || [];
  //         return roundResponses.some(
  //           (response) =>
  //             response.formStatus === "Saved" || response.formStatus === "Not Started"
  //         );
  //       })
  //       .map((round, index) => (
  //         <button
  //           key={index}
  //           className={`tab-button-userformdetails ${activeTab === round ? "active" : ""}`}
  //           onClick={() => setActiveTab(round)}
  //         >
  //           {round}
  //         </button>
  //       ))
  //   ) : (
  //     <p>No response tabs available for this user.</p>
  //   );
  // };
  /*** END CHANGE: Render response tabs based on form status ***/
  const renderResponseTabs = () => {
    return Object.keys(responsesByRound).map((round, index) => (
      <button
        key={index}
        className={`tab-button-userformdetails ${
          activeTab === round ? "active" : ""
        }`}
        onClick={() => setActiveTab(round)}
      >
        {round}
      </button>
    ));
  };
  /*** START CHANGE: Render response fields for all rounds ***/
  // const renderResponseFields = () => {
  //   console.log("Active tab:", activeTab);
  //   const roundResponses = responsesByRound[activeTab] || []; // Fetch responses for the active tab

  //   // If responses are available, render them
  //   //   if (roundResponses.length === 0) {
  //   //   const isCurrentRound = `Round ${user.formData.currentRound}` === activeTab;

  //   //   return isCurrentRound ? (
  //   //     <div>
  //   //       <p>No response filled by user yet for {activeTab}.</p>
  //   //       <button
  //   //         onClick={() => handleCompleteProfile(user.pipelineId, user.formId)}
  //   //         className="complete-form-button-userformdetails"
  //   //       >
  //   //         Form Complete
  //   //       </button>
  //   //     </div>
  //   //   ) : (
  //   //     <p>No data available for {activeTab}.</p>
  //   //   );
  //   // }
  //   if (roundResponses.length === 0) {
  //     return (
  //       <p>No data available for {activeTab}. The form might not be filled yet.</p>
  //     );
  //   }
  //   return roundResponses.map((response, index) => {
  //     const showCompleteButton =
  //       response.formStatus === "Saved" || response.formStatus === "Not Started"; // Check form status

  //   return roundResponses.map((response, index) => (
  //     <div key={index}>
  //       {/* Form Status Details */}
  //       <div className="form-status-details-userformdetails">
  //         <h4>Form Status Details</h4>
  //         <p>Form Status: {response.formStatus || "N/A"}</p>
  //         <p>
  //           Form First Saved Time:{" "}
  //           {response.formFirstSavedTime ? new Date(response.formFirstSavedTime).toLocaleString() : "N/A"}
  //         </p>
  //         <p>
  //           Last Modified:{" "}
  //           {response.lastModified ? new Date(response.lastModified).toLocaleString() : "N/A"}
  //         </p>
  //         <p>
  //           Form Submission Time:{" "}
  //           {response.formSubmissionTime ? new Date(response.formSubmissionTime).toLocaleString() : "N/A"}
  //         </p>
  //       </div>

  //       {/* Documents */}
  //       <div className="documents-section-userformdetails">
  //         <h4>Documents</h4>
  //         {response.files && response.files.length > 0 ? (
  //           response.files.map((file, fileIndex) => (
  //             <div key={fileIndex}>
  //               <p>{file.labelName}</p>
  //               <a href={file.path} target="_blank" rel="noopener noreferrer">
  //                 {file.originalName}
  //               </a>
  //             </div>
  //           ))
  //         ) : (
  //           <p>No documents uploaded.</p>
  //         )}
  //       </div>

  //       {/* Form Information */}
  //       <div className="form-response-section-userformdetails">
  //         <h4>Form Information</h4>
  //         {response.formData && Object.keys(response.formData).length > 0 ? (
  //           Object.keys(response.formData).map((key, fieldIndex) => (
  //             <div key={fieldIndex}>
  //               <p>
  //                 {key}: {response.formData[key]}
  //               </p>
  //             </div>
  //           ))
  //         ) : (
  //           <p>No form data available.</p>
  //         )}
  //       </div>

  //       {/* Complete Form Button */}
  //       {/* {response.isDraft && (
  //         <button
  //           onClick={() => handleCompleteProfile(user.pipelineId, user.formId)}
  //           className="complete-form-button-userformdetails"
  //         >
  //           Form Complete
  //         </button>
  //       )} */}
  //               {showCompleteButton && (
  //           <button
  //             onClick={() => handleCompleteProfile(user.pipelineId, user.formId)}
  //             className="complete-form-button-userformdetails"
  //           >
  //             Form Complete
  //           </button>
  //         )}
  //     </div>
  //   ));
  // });

  // };

  /*** END CHANGE: Render response fields for all rounds ***/
  const renderResponseFields = () => {
    const roundResponses = responsesByRound[activeTab] || [];

    if (
      roundResponses.length === 0 ||
      roundResponses[0].formStatus === "No Response"
    ) {
      return (
        <div>
          <p>No response filled by user yet for {activeTab}.</p>
          <button
            onClick={() => handleCompleteProfile(user.pipelineId, user.formId)}
            className="complete-form-button-userformdetails"
          >
            Form Complete
          </button>
        </div>
      );
    }

    return roundResponses.map((response, index) => (
      <div key={index}>
        {/* Form Status Details */}
        {/* <div className="form-status-details-userformdetails">
        <h4>Form Status Details</h4>
        <p>Form Status: {response.formStatus || 'N/A'}</p>
        <p>
          Form First Saved Time:{' '}
          {response.formFirstSavedTime ? new Date(response.formFirstSavedTime).toLocaleString() : 'N/A'}
        </p>
        <p>
          Last Modified:{' '}
          {response.lastModified ? new Date(response.lastModified).toLocaleString() : 'N/A'}
        </p>
      </div> */}
        {/* Form Status Details */}
        <div className="form-timing-section-userformdetails">
          <div className="form-status-header-userformdetails">
            <h4 className="documents-heading-userformdetails">
              Form Status Details
            </h4>
            {response.isDraft && (
              <button
                onClick={() =>
                  handleCompleteProfile(user.pipelineId, user.formId)
                }
                className="complete-form-button-userformdetails"
              >
                Form Complete
              </button>
            )}
          </div>
          <div className="response-item-userformdetails">
            <div className="number-box-userformdetails">1</div>
            <div className="response-key-top-userformdetails">
              <h5 className="response-key-userformdetails">Form Status:</h5>
              <p className="response-value-userformdetails">
                {response.formStatus || "N/A"}
              </p>
            </div>
          </div>
          <div className="response-item-userformdetails">
            <div className="number-box-userformdetails">2</div>
            <div className="response-key-top-userformdetails">
              <h5 className="response-key-userformdetails">
                Form First Saved Time:
              </h5>
              <p className="response-value-userformdetails">
                {response.formFirstSavedTime
                  ? new Date(response.formFirstSavedTime).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="response-item-userformdetails">
            <div className="number-box-userformdetails">3</div>
            <div className="response-key-top-userformdetails">
              <h5 className="response-key-userformdetails">Last Modified:</h5>
              <p className="response-value-userformdetails">
                {response.lastModified
                  ? new Date(response.lastModified).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="response-item-userformdetails">
            <div className="number-box-userformdetails">4</div>
            <div className="response-key-top-userformdetails">
              <h5 className="response-key-userformdetails">
                Form Submission Time:
              </h5>
              <p className="response-value-userformdetails">
                {response.formSubmissionTime
                  ? new Date(response.formSubmissionTime).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
        <hr style={{ width: "50%", marginLeft: "300px" }} />

        {/* Documents */}
        {/* <div className="documents-section-userformdetails">
        <h4>Documents</h4>
        {response.files && response.files.length > 0 ? (
          response.files.map((file, fileIndex) => (
            <div key={fileIndex}>
              <p>{file.labelName}</p>
              <a href={file.path} target="_blank" rel="noopener noreferrer">
                {file.originalName}
              </a>
            </div>
          ))
        ) : (
          <p>No documents uploaded.</p>
        )}
      </div> */}
        {/* Documents Section */}
        <div className="documents-section-userformdetails">
          <h4 className="documents-heading-userformdetails">Documents</h4>
          {response.files && response.files.length > 0 ? (
            <div className="documents-list-userformdetails">
              {response.files.map((file, index) => (
                <div key={index} className="file-item-userformdetails">
                  <div className="number-box-userformdetails">{index + 1}</div>
                  <h5
                    style={{ width: "415px" }}
                    className="response-key-document-userformdetails"
                  >
                    {file.labelName}
                    <span className="response-value-file-userformdetails">
                      uploaded at
                    </span>{" "}
                    {new Date(file.uploadedAt).toLocaleString()} :
                  </h5>

                  {/* {moment(file.uploadedAt).format(
                                            "DD/MM/YYYY hh:mm A"
                                          )}{" "}
                                          : */}
                  <a
                    href={file.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-response-userformdetails"
                  >
                    {file.originalName}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: "20px" }}>
              No response available for this round.
            </p>
          )}
        </div>

        <hr style={{ width: "50%", marginLeft: "300px" }} />
        {/* 
        <div className="form-response-section-userformdetails">
          <h4>Form Information</h4>
          {response.formData && Object.keys(response.formData).length > 0 ? (
            Object.keys(response.formData).map((key, fieldIndex) => (
              <div key={fieldIndex}>
                <p>
                  {key}: {response.formData[key]}
                </p>
              </div>
            ))
          ) : (
            <p>No form data available.</p>
          )}
        </div>

        {response.isDraft && (
          <button
            onClick={() => handleCompleteProfile(user.pipelineId, user.formId)}
            className="complete-form-button-userformdetails"
          >
            Form Complete
          </button>
        )} */}

        {/* Form Information */}
        <div className="form-information-section-userformdetails">
          <h4 className="form-information-heading-userformdetails">
            Form Information
          </h4>
          {response.formData && Object.keys(response.formData).length > 0 ? (
            Object.keys(response.formData).map((key, index) => (
              <div key={index} className="response-item-userformdetails">
                <div className="number-box-userformdetails">{index + 1}</div>
                <div className="response-key-top-userformdetails">
                  <h5 className="response-key-userformdetails">{key}:</h5>
                  <p
                    className="response-value-userformdetails"
                    dangerouslySetInnerHTML={{ __html: response.formData[key] }}
                  ></p>
                </div>
              </div>
            ))
          ) : (
            <p>No form data available.</p>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="dashboard-homepage-userformdetails">
      <aside className="sidebar-homepage-userformdetails">
        <div className="logo-container-homepage-userformdetails">
          <div className="logo-homepage-userformdetails">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-homepage-userformdetails"
            />
          </div>
        </div>
        <div className="nav-container-homepage-userformdetails">
          <nav className="nav-homepage-userformdetails">
            <ul>
              <li>
                <Link to="/userdashboard">
                  <FaHouseUser className="nav-icon-homepage-userformdetails" />{" "}
                  UserDashboard
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-homepage-userformdetails">
        <header className="header-homepage-userformdetails">
          <h6 className="founder-homepage-userformdetails">
            {/* Welcome: {user.name} */}
            Welcome: {user.formData.Name || "User"}
          </h6>
          <div className="profile-section-homepage-userformdetails">
            <div className="user-info-homepage-userformdetails">
              <span className="user-initials-homepage-userformdetails">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-homepage-userformdetails">
                <span className="user-name-homepage-userformdetails">
                  {/* {user.name} */}
                  {user.formData.Name || "User"}
                </span>
                <br />
                <span className="user-email-homepage-userformdetails">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              className="logout-button-homepage-userformdetails"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="content-homepage-userformdetails">
          {/* Tabs for each round */}
          {/* START CHANGE: Render tabs for all completed and current rounds   */}
          <div className="tab-buttons-userformdetails">
            {/* {Object.keys(responsesByRound).length > 0 ? (
    Object.keys(responsesByRound).map((round, index) => (
      <button
        key={index}
        className={`tab-button-userformdetails ${activeTab === round ? "active" : ""}`}
        onClick={() => setActiveTab(round)}
      >
        {round}
      </button>
    ))
  ) : (
    <p>No response tabs available for this user.</p>
  )} */}
            {renderResponseTabs()}
          </div>

          {/* END CHANGE: Render tabs for all completed and current rounds  */}
          {/* Render content based on active tab */}
          <div className="tab-content-userformdetails">
            {renderResponseFields()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserFormDetails;
