import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHouseUser } from "react-icons/fa";
import axios from "axios";
import "./UserFormDetails.css";

const UserFormDetails = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    formData: {},
    files: [],
  });
  const [formStatusDetails, setFormStatusDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("Round 1");
  const navigate = useNavigate();

  useEffect(() => {
    /*** START CHANGE FOR fetching user data without localStorage ***/
    const fetchUserData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";
        // console.log("Fetching user data..."); // Debugging log

        // Fetch user info using cookies (no localStorage)
        const response = await axios.get(
          `${API_BASE_URL}/api/users/get-user-info`,
          {
            withCredentials: true, // Include credentials (cookies)
          }
        );
        // console.log("User data received from API:", response.data); // Debug log to check API response

        // Set user name and email from the response
        setUser((prevState) => ({
          ...prevState,
          // name: response.data.username, // Name received from API
          email: response.data.email, // Email received from API
        }));

        // Check if the name is not empty
        if (!response.data.username) {
          console.warn("Username is missing in the response data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/user-signin"); // Redirect to login if user is not authenticated
      }
    };
    fetchUserData();
    /*** END CHANGE FOR fetching user data without localStorage ***/
  }, [navigate]);

  useEffect(() => {
    /*** START CHANGE FOR fetching all form data by user email --- ***/
    const fetchAllUserData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";

        // Fetch form data using the user's email
        if (user.email) {
          // console.log("Fetching form data for user with email:", user.email); // Debug log

          const response = await axios.post(
            `${API_BASE_URL}/api/forms/fetch-draft-by-email`,
            { email: user.email }, // Pass user email dynamically
            { withCredentials: true } // Ensure cookies are sent with the request
          );

          // console.log("Form data received:", response.data); // Debug log to check the form data

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

          // Fetch form status details if form submission ID is available
          if (response.data._id) {
            const formStatusResponse = await axios.get(
              `${API_BASE_URL}/api/forms/form-submissions/${response.data._id}/status`
            );
            setFormStatusDetails(formStatusResponse.data); // Set form status details
          }
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    // Fetch form data only if user email is available
    if (user.email) {
      fetchAllUserData();
    }
    /*** END CHANGE FOR fetching all form data by user email --- ***/
  }, [user.email]);

  /*** START CHANGE FOR updating handleCompleteProfile to open the correct form based on form status and ID ***/
  const handleCompleteProfile = () => {
    console.log("Form status details:", formStatusDetails); // Debug log for formStatusDetails
    console.log("User form data:", user.formData); // Debug log for formData

    // Ensure proper logging of Pipeline ID from formData
    const pipelineId =
      user.formData.pipelineId || formStatusDetails?.pipelineId;

    if (!pipelineId) {
      console.error("Pipeline ID not found in formData or form status.");
      return;
    }

    if (formStatusDetails?.formStatus === "Saved") {
      console.log("Navigating to form with Pipeline ID:", pipelineId); // Log form ID
      navigate(`/fe/${pipelineId}`, {
        state: { email: user.email, preFilledData: user.formData }, // Pass user data and form details
      });
    } else {
      console.warn("Form status is not 'Saved', cannot proceed.");
    }
  };
  /*** END CHANGE FOR updating handleCompleteProfile ***/

  /*** START CHANGE FOR handleLogout similar to UserDashboard.jsx ***/
  const handleLogout = async () => {
    try {
      // Make an API call to the server to log out and clear the session cookies
      await axios.post("/api/users/logout", {}, { withCredentials: true });

      // Navigate the user to the login page after successful logout
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  /*** END CHANGE FOR handleLogout similar to UserDashboard.jsx ***/

  const createMarkup = (html) => {
    return { __html: html };
  };

  /*** START CHANGE FOR Tab button functionality --- ***/
  const renderTabContent = () => {
    switch (activeTab) {
      case "Round 1":
        return (
          <>
            {formStatusDetails && (
              <div className="form-status-details-userformdetails">
                <h4 className="documents-heading-userformdetails">
                  Form Status Details
                </h4>
                <div className="response-item-userformdetails">
                  <div className="number-box-userformdetails">1</div>
                  <div className="response-key-top-userformdetails">
                    <h5 className="response-key-userformdetails">
                      Form Status :
                    </h5>
                    <p className="response-value-userformdetails">
                      {formStatusDetails.formStatus || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="response-item-userformdetails">
                  <div className="number-box-userformdetails">2</div>
                  <div className="response-key-top-userformdetails">
                    <h5 className="response-key-userformdetails">
                      Form First Saved Time :
                    </h5>
                    <p className="response-value-userformdetails">
                      {formStatusDetails.formFirstSavedTime
                        ? new Date(
                            formStatusDetails.formFirstSavedTime
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="response-item-userformdetails">
                  <div className="number-box-userformdetails">3</div>
                  <div className="response-key-top-userformdetails">
                    <h5 className="response-key-userformdetails">
                      Last Modified :
                    </h5>
                    <p className="response-value-userformdetails">
                      {formStatusDetails.lastModified
                        ? new Date(
                            formStatusDetails.lastModified
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="response-item-userformdetails">
                  <div className="number-box-userformdetails">4</div>
                  <div className="response-key-top-userformdetails">
                    <h5 className="response-key-userformdetails">
                      Form Submission Time :
                    </h5>
                    <p className="response-value-userformdetails">
                      {formStatusDetails.formSubmissionTime
                        ? new Date(
                            formStatusDetails.formSubmissionTime
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/*** END CHANGE FOR show the all 'Form Status Details' --- ***/}
            <hr />
            <div className="documents-section-userformdetails">
              <h4 className="documents-heading-userformdetails">Documents</h4>
              {Array.isArray(user.files) && user.files.length > 0 ? (
                user.files.map((file, index) => (
                  <div key={index} className="file-item-userformdetails">
                    <div className="number-box-userformdetails">
                      {index + 1}
                    </div>
                    <h5
                      style={{ width: "415px" }}
                      className="response-key-document-userformdetails"
                    >
                      {file.labelName}
                      <span className="response-value-file-userformdetails">
                        uploaded at
                      </span>{" "}
                      {new Date(file.uploadedAt).toLocaleString()}:
                    </h5>
                    <a
                      href={`${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-response-userformdetails"
                    >
                      {file.originalName}
                    </a>
                  </div>
                ))
              ) : (
                <p>No documents uploaded yet.</p>
              )}
            </div>

            <hr />
            <div className="form-response-section-userformdetails">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3>Form Information</h3>
                </div>
                <div>
                  {formStatusDetails &&
                    formStatusDetails.formStatus === "Saved" && (
                      <button
                        onClick={handleCompleteProfile}
                        className="complete-profile-button-userformdetails"
                      >
                        Complete Form
                      </button>
                    )}

                  {formStatusDetails &&
                    formStatusDetails.formStatus === "Submitted" && (
                      <p
                        style={{
                          border: "1px solid black",
                          borderRadius: "4px",
                          padding: "2px",
                        }}
                      >
                        Your profile is submitted
                      </p>
                    )}
                </div>
              </div>

              <div className="user-info-section-userformdetails">
                {user.formData && Object.keys(user.formData).length > 0 ? (
                  Object.keys(user.formData).map(
                    (key, index) =>
                      key !== "pipelineId" &&
                      key !== "_id" && (
                        <div
                          key={key}
                          className="response-item-userformdetails"
                        >
                          <div className="number-box-userformdetails">
                            {index + 1}
                          </div>
                          <div className="response-key-top-userformdetails">
                            <h5 className="response-key-userformdetails">
                              {key} :
                            </h5>
                            <p
                              className="response-value-userformdetails"
                              dangerouslySetInnerHTML={createMarkup(
                                user.formData[key]
                              )}
                            ></p>
                          </div>
                        </div>
                      )
                  )
                ) : (
                  <p>No form data available.</p>
                )}
              </div>
            </div>
          </>
        );
      case "Round 2":
        return <div>Round 2 Details</div>;
      case "Round 3":
        return <div>Round 3 Details</div>;
      default:
        return null;
    }
  };
  /*** END CHANGE FOR Tab button functionality --- ***/
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
          <div className="tab-buttons-userformdetails">
            <button
              className={`tab-button-userformdetails ${
                activeTab === "Round 1" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Round 1")}
            >
              Round 1
            </button>
            <button
              className={`tab-button-userformdetails ${
                activeTab === "Round 2" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Round 2")}
            >
              Round 2
            </button>
            <button
              className={`tab-button-userformdetails ${
                activeTab === "Round 3" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Round 3")}
            >
              Round 3
            </button>
          </div>

          <div className="tab-content-userformdetails">
            {renderTabContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserFormDetails;

////////before user login in 21 10 2024
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaHouseUser } from "react-icons/fa";
// import axios from "axios";
// import "./UserFormDetails.css";

// const UserFormDetails = () => {
//     const [user, setUser] = useState({
//         name: "",
//         email: "",
//         formData: {},
//         files: [],
//       });
//       const [formStatusDetails, setFormStatusDetails] = useState(null);
//       const [activeTab, setActiveTab] = useState("Round 1");
//       const navigate = useNavigate();

//       useEffect(() => {
//         const fetchUserData = async () => {
//           try {
//             const token = localStorage.getItem("token"); // Get the token from local storage
//             const response = await axios.get(
//               "https://incubator.drishticps.org/api/programmanagers/me", // API to get user basic info
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`, // Pass token for authorization
//                 },
//               }
//             );
//             // setUser({ username: response.data.username, email: response.data.email }); // Store name and email in state
//             setUser({ name: response.data.username, email: response.data.email }); // Store name and email in state
//           } catch (error) {
//             console.error("Error fetching user data:", error);
//           }
//         };
//         fetchUserData();
//       }, []); // Fetch on component load

//       useEffect(() => {
//         const fetchAllUserData = async () => {
//           try {
//             const token = localStorage.getItem("token"); // Get token from local storage
//             if (user.email) {
//               console.log("Fetching draft data for email:", user.email); // Log the email being sent
//               const response = await axios.post(
//                 "https://incubator.drishticps.org/api/forms/fetch-draft-by-email", // API to get user-specific data by email

//                 { email: user.email }, // Pass email dynamically
//                 {
//                   headers: {
//                     Authorization: `Bearer ${token}`, // Pass token for authorization
//                   },
//                 }
//               );
//               console.log("Draft Data:", response.data); // Log the draft data

//               setUser((prevState) => ({
//                 ...prevState,
//                 formData: {
//                   ...response.data.formData,
//                   pipelineId: response.data.pipelineId, // Ensure pipelineId is set in formData
//                   _id: response.data._id, // Ensure the form submission ID is part of formData
//                 },
//                 files: response.data.files || [], // Save the fetched files // Ensure files is an array
//               }));
//               console.log("Pipeline ID:", response.data.pipelineId); // Log the pipelineId to debug
//               /** START CHANGE FOR get "Form Status Details" by email id --- **/
//               if (response.data._id) {
//                 console.log("Form Submission ID found:", response.data._id); // Log success

//                 try {
//                   // Fetch form status details
//                   const formStatusResponse = await axios.get(
//                     `/api/forms/form-submissions/${response.data._id}/status`
//                   );
//                   setFormStatusDetails(formStatusResponse.data);
//                   console.log("Form Status Details:", formStatusResponse.data); // Log form status details
//                 } catch (error) {
//                   console.error(
//                     "Error fetching form status:",
//                     error.response?.data || error.message
//                   );
//                   setFormStatusDetails(null);
//                 }
//               } else {
//                 console.error("Form submission ID not found.");
//               }
//               /** END CHANGE FOR get "Form Status Details" by email id --- **/
//             }
//           } catch (error) {
//             console.error(
//               "Error fetching user data:",
//               error.response?.data || error.message
//             );
//           }
//         };

//         if (user.email) {
//           fetchAllUserData(); // Only fetch if email is available
//         }
//       }, [user.email]); // Trigger this effect when the user's email is available

//       /** START CHANGE FOR open form after press "Complete profile" button with correct ID --- **/
//       const handleCompleteProfile = () => {
//         console.log("Form status details:", formStatusDetails); // Debug log for formStatusDetails
//         console.log("User form data:", user.formData); // Debug log for formData

//         // Ensure proper logging of Pipeline ID from formData
//         const pipelineId =
//           user.formData.pipelineId || formStatusDetails?.pipelineId;

//         if (!pipelineId) {
//           console.error("Pipeline ID not found in formData or form status.");
//           return;
//         }

//         if (formStatusDetails?.formStatus === "Saved") {
//           console.log("Navigating to form with Pipeline ID:", pipelineId); // Log form ID
//           navigate(`/fe/${pipelineId}`, {
//             // state: { email: user.email },
//             state: { email: user.email, preFilledData: user.formData },
//           });
//         } else {
//           console.warn("Form status is not 'Saved', cannot proceed.");
//         }
//       };
//       console.log("Form Status Details before navigating:", formStatusDetails);
//       /** END CHANGE FOR open form after press "Complete profile" button with correct ID --- **/
//       const handleLogout = () => {
//         localStorage.removeItem("token");
//         navigate("/login");
//       };

//       const createMarkup = (html) => {
//         return { __html: html };
//       };

//   /*** START CHANGE FOR Tab button functionality --- ***/
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "Round 1":
//         return (
//           <>
//    {formStatusDetails && (
//                             <div className="form-status-details-userformdetails">
//                                 <h4 className="documents-heading-userformdetails">Form Status Details</h4>
//                                 <div className="response-item-userformdetails">
//                                     <div className="number-box-userformdetails">1</div>
//                                     <div className="response-key-top-userformdetails">
//                                         <h5 className="response-key-userformdetails">Form Status :</h5>
//                                         <p className="response-value-userformdetails">
//                                             {formStatusDetails.formStatus || "N/A"}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="response-item-userformdetails">
//                                     <div className="number-box-userformdetails">2</div>
//                                     <div className="response-key-top-userformdetails">
//                                         <h5 className="response-key-userformdetails">Form First Saved Time :</h5>
//                                         <p className="response-value-userformdetails">
//                                             {formStatusDetails.formFirstSavedTime
//                                                 ? new Date(formStatusDetails.formFirstSavedTime).toLocaleString()
//                                                 : "N/A"}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="response-item-userformdetails">
//                                     <div className="number-box-userformdetails">3</div>
//                                     <div className="response-key-top-userformdetails">
//                                         <h5 className="response-key-userformdetails">Last Modified :</h5>
//                                         <p className="response-value-userformdetails">
//                                             {formStatusDetails.lastModified
//                                                 ? new Date(formStatusDetails.lastModified).toLocaleString()
//                                                 : "N/A"}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="response-item-userformdetails">
//                                     <div className="number-box-userformdetails">4</div>
//                                     <div className="response-key-top-userformdetails">
//                                         <h5 className="response-key-userformdetails">Form Submission Time :</h5>
//                                         <p className="response-value-userformdetails">
//                                             {formStatusDetails.formSubmissionTime
//                                                 ? new Date(formStatusDetails.formSubmissionTime).toLocaleString()
//                                                 : "N/A"}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                         {/*** END CHANGE FOR show the all 'Form Status Details' --- ***/}
//             <hr />
//             <div className="documents-section-userformdetails">
//               <h4 className="documents-heading-userformdetails">Documents</h4>
//               {Array.isArray(user.files) && user.files.length > 0 ? (
//                 user.files.map((file, index) => (
//                   <div key={index} className="file-item-userformdetails">
//                     <div className="number-box-userformdetails">{index + 1}</div>
//                     <h5 style={{ width: "415px" }} className="response-key-document-userformdetails">
//                       {file.labelName}
//                       <span className="response-value-file-userformdetails">uploaded at</span>{" "}
//                       {new Date(file.uploadedAt).toLocaleString()}:
//                     </h5>
//                     <a
//                       href={`${file.path}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="file-response-userformdetails"
//                     >
//                       {file.originalName}
//                     </a>
//                   </div>
//                 ))
//               ) : (
//                 <p>No documents uploaded yet.</p>
//               )}
//             </div>

//             <hr />
//             <div className="form-response-section-userformdetails">

//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <div>
//                 <h3>Form Information</h3>
//               </div>
//               <div>
//                 {formStatusDetails &&
//                   formStatusDetails.formStatus === "Saved" && (
//                     <button
//                       onClick={handleCompleteProfile}
//                       className="complete-profile-button-userformdetails"
//                     >
//                       Complete Form
//                     </button>
//                   )}

//                 {formStatusDetails &&
//                   formStatusDetails.formStatus === "Submitted" && (
//                     <p
//                       style={{
//                         border: "1px solid black",
//                         borderRadius: "4px",
//                         padding: "2px",
//                       }}
//                     >
//                       Your profile is submitted
//                     </p>
//                   )}
//               </div>
//             </div>

//             <div className="user-info-section-userformdetails">
//               {user.formData && Object.keys(user.formData).length > 0 ? (
//                 Object.keys(user.formData).map(
//                   (key, index) =>
//                     key !== "pipelineId" &&
//                     key !== "_id" && (
//                       <div key={key} className="response-item-userformdetails">
//                         <div className="number-box-userformdetails">
//                           {index + 1}
//                         </div>
//                         <div className="response-key-top-userformdetails">
//                           <h5 className="response-key-userformdetails">{key} :</h5>
//                           <p
//                             className="response-value-userformdetails"
//                             dangerouslySetInnerHTML={createMarkup(user.formData[key])}
//                           ></p>
//                         </div>
//                       </div>
//                     )
//                 )
//               ) : (
//                 <p>No form data available.</p>
//               )}
//             </div>
//             </div>
//           </>
//         );
//       case "Round 2":
//         return <div>Round 2 Details</div>;
//       case "Round 3":
//         return <div>Round 3 Details</div>;
//       default:
//         return null;
//     }
//   };
//   /*** END CHANGE FOR Tab button functionality --- ***/
//   return (
//     <div className="dashboard-homepage-userformdetails">
//       <aside className="sidebar-homepage-userformdetails">
//         <div className="logo-container-homepage-userformdetails">
//           <div className="logo-homepage-userformdetails">
//             <img
//               src="/navbar/drishtilogo.jpg"
//               alt="Logo"
//               className="dristilogo-homepage-userformdetails"
//             />
//           </div>
//         </div>
//         <div className="nav-container-homepage-userformdetails">
//           <nav className="nav-homepage-userformdetails">
//             <ul>
//               <li>
//                 <Link to="/userdashboard">
//                   <FaHouseUser className="nav-icon-homepage-userformdetails" />{" "}
//                   UserDashboard
//                 </Link>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </aside>
//       <main className="main-content-homepage-userformdetails">
//         <header className="header-homepage-userformdetails">
//           <h6 className="founder-homepage-userformdetails">
//             Welcome: {user.name}
//           </h6>
//           <div className="profile-section-homepage-userformdetails">
//             <div className="user-info-homepage-userformdetails">
//               <span className="user-initials-homepage-userformdetails">
//                 <img
//                   src="/navbar/login.png"
//                   alt="Login"
//                   style={{ width: "40px" }}
//                 />
//               </span>
//               <div className="user-details-homepage-userformdetails">
//                 <span className="user-name-homepage-userformdetails">
//                   {user.name}
//                 </span>
//                 <br />
//                 <span className="user-email-homepage-userformdetails">
//                   {user.email}
//                 </span>
//               </div>
//             </div>
//             <button
//               className="logout-button-homepage-userformdetails"
//               onClick={handleLogout}
//             >
//               Logout
//             </button>
//           </div>
//         </header>

//         <section className="content-homepage-userformdetails">
//         <div className="tab-buttons-userformdetails">
//             <button
//               className={`tab-button-userformdetails ${activeTab === "Round 1" ? "active" : ""}`}
//               onClick={() => setActiveTab("Round 1")}
//             >
//               Round 1
//             </button>
//             <button
//               className={`tab-button-userformdetails ${activeTab === "Round 2" ? "active" : ""}`}
//               onClick={() => setActiveTab("Round 2")}
//             >
//               Round 2
//             </button>
//             <button
//               className={`tab-button-userformdetails ${activeTab === "Round 3" ? "active" : ""}`}
//               onClick={() => setActiveTab("Round 3")}
//             >
//               Round 3
//             </button>
//           </div>

//           <div className="tab-content-userformdetails">{renderTabContent()}</div>
//         </section>
//       </main>
//     </div>
//   )
// }

// export default UserFormDetails

////////////weithot tab button
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaHouseUser } from "react-icons/fa";
// import axios from "axios";
// import "./UserFormDetails.css";

// const UserFormDetails = () => {

//     const [user, setUser] = useState({
//         name: "",
//         email: "",
//         formData: {},
//         files: [],
//       });
//       const [formStatusDetails, setFormStatusDetails] = useState(null); // Add state for form status details
//       const navigate = useNavigate();

//       useEffect(() => {
//         const fetchUserData = async () => {
//           try {
//             const token = localStorage.getItem("token"); // Get the token from local storage
//             const response = await axios.get(
//               "https://incubator.drishticps.org/api/programmanagers/me", // API to get user basic info
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`, // Pass token for authorization
//                 },
//               }
//             );
//             // setUser({ username: response.data.username, email: response.data.email }); // Store name and email in state
//             setUser({ name: response.data.username, email: response.data.email }); // Store name and email in state
//           } catch (error) {
//             console.error("Error fetching user data:", error);
//           }
//         };
//         fetchUserData();
//       }, []); // Fetch on component load

//       useEffect(() => {
//         const fetchAllUserData = async () => {
//           try {
//             const token = localStorage.getItem("token"); // Get token from local storage
//             if (user.email) {
//               console.log("Fetching draft data for email:", user.email); // Log the email being sent
//               const response = await axios.post(
//                 "https://incubator.drishticps.org/api/forms/fetch-draft-by-email", // API to get user-specific data by email

//                 { email: user.email }, // Pass email dynamically
//                 {
//                   headers: {
//                     Authorization: `Bearer ${token}`, // Pass token for authorization
//                   },
//                 }
//               );
//               console.log("Draft Data:", response.data); // Log the draft data

//               setUser((prevState) => ({
//                 ...prevState,
//                 formData: {
//                   ...response.data.formData,
//                   pipelineId: response.data.pipelineId, // Ensure pipelineId is set in formData
//                   _id: response.data._id, // Ensure the form submission ID is part of formData
//                 },
//                 files: response.data.files || [], // Save the fetched files // Ensure files is an array
//               }));
//               console.log("Pipeline ID:", response.data.pipelineId); // Log the pipelineId to debug
//               /** START CHANGE FOR get "Form Status Details" by email id --- **/
//               if (response.data._id) {
//                 console.log("Form Submission ID found:", response.data._id); // Log success

//                 try {
//                   // Fetch form status details
//                   const formStatusResponse = await axios.get(
//                     `/api/forms/form-submissions/${response.data._id}/status`
//                   );
//                   setFormStatusDetails(formStatusResponse.data);
//                   console.log("Form Status Details:", formStatusResponse.data); // Log form status details
//                 } catch (error) {
//                   console.error(
//                     "Error fetching form status:",
//                     error.response?.data || error.message
//                   );
//                   setFormStatusDetails(null);
//                 }
//               } else {
//                 console.error("Form submission ID not found.");
//               }
//               /** END CHANGE FOR get "Form Status Details" by email id --- **/
//             }
//           } catch (error) {
//             console.error(
//               "Error fetching user data:",
//               error.response?.data || error.message
//             );
//           }
//         };

//         if (user.email) {
//           fetchAllUserData(); // Only fetch if email is available
//         }
//       }, [user.email]); // Trigger this effect when the user's email is available

//       /** START CHANGE FOR open form after press "Complete profile" button with correct ID --- **/
//       const handleCompleteProfile = () => {
//         console.log("Form status details:", formStatusDetails); // Debug log for formStatusDetails
//         console.log("User form data:", user.formData); // Debug log for formData

//         // Ensure proper logging of Pipeline ID from formData
//         const pipelineId =
//           user.formData.pipelineId || formStatusDetails?.pipelineId;

//         if (!pipelineId) {
//           console.error("Pipeline ID not found in formData or form status.");
//           return;
//         }

//         if (formStatusDetails?.formStatus === "Saved") {
//           console.log("Navigating to form with Pipeline ID:", pipelineId); // Log form ID
//           navigate(`/fe/${pipelineId}`, {
//             // state: { email: user.email },
//             state: { email: user.email, preFilledData: user.formData },
//           });
//         } else {
//           console.warn("Form status is not 'Saved', cannot proceed.");
//         }
//       };
//       console.log("Form Status Details before navigating:", formStatusDetails);
//       /** END CHANGE FOR open form after press "Complete profile" button with correct ID --- **/
//       const handleLogout = () => {
//         localStorage.removeItem("token");
//         navigate("/login");
//       };

//       const createMarkup = (html) => {
//         return { __html: html };
//       };

//   return (
//     <div className="dashboard-homepage-userformdetails">
//       <aside className="sidebar-homepage-userformdetails">
//         <div className="logo-container-homepage-userformdetails">
//           <div className="logo-homepage-userformdetails">
//             <img
//               src="/navbar/drishtilogo.jpg"
//               alt="Logo"
//               className="dristilogo-homepage-userformdetails"
//             />
//           </div>
//         </div>
//         <div className="nav-container-homepage-userformdetails">
//           <nav className="nav-homepage-userformdetails">
//             <ul>
//               <li>
//                 <Link to="/userdashboard">
//                   <FaHouseUser className="nav-icon-homepage-userformdetails" />{" "}
//                   UserDashboard
//                 </Link>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </aside>
//       <main className="main-content-homepage-userformdetails">
//         <header className="header-homepage-userformdetails">
//           <h6 className="founder-homepage-userformdetails">
//             Welcome: {user.name}
//           </h6>
//           <div className="profile-section-homepage-userformdetails">
//             <div className="user-info-homepage-userformdetails">
//               <span className="user-initials-homepage-userformdetails">
//                 <img
//                   src="/navbar/login.png"
//                   alt="Login"
//                   style={{ width: "40px" }}
//                 />
//               </span>
//               <div className="user-details-homepage-userformdetails">
//                 <span className="user-name-homepage-userformdetails">
//                   {user.name}
//                 </span>
//                 <br />
//                 <span className="user-email-homepage-userformdetails">
//                   {user.email}
//                 </span>
//               </div>
//             </div>
//             <button
//               className="logout-button-homepage-userformdetails"
//               onClick={handleLogout}
//             >
//               Logout
//             </button>
//           </div>
//         </header>

//         <section className="content-homepage-userformdetails">
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <div>
//               <h3>Information</h3>
//             </div>
//             <div>
//               {formStatusDetails &&
//                 formStatusDetails.formStatus === "Saved" && (
//                   <button
//                     onClick={handleCompleteProfile}
//                     className="complete-profile-button-userformdetails"
//                   >
//                     Complete Form
//                   </button>
//                 )}

//               {formStatusDetails &&
//                 formStatusDetails.formStatus === "Submitted" && (
//                   /** START CHANGE FOR hiding "Complete profile" button if form status is "Submitted"--- **/
//                   <p
//                     style={{
//                       border: "1px solid black",
//                       borderRadius: "4px",
//                       padding: "2px",
//                     }}
//                   >
//                     Your profile is submitted
//                   </p>
//                   /** END CHANGE FOR hiding "Complete profile" button if form status is "Submitted"--- **/
//                 )}
//             </div>
//           </div>

//           <div className="user-info-section-userformdetails">
//             {user.formData && Object.keys(user.formData).length > 0 ? (
//               Object.keys(user.formData).map(
//                 (key, index) =>
//                   key !== "pipelineId" &&
//                   key !== "_id" && (
//                     <div key={key} className="response-item-userformdetails">
//                       <div className="number-box-userformdetails">
//                         {index + 1}
//                       </div>
//                       <div className="response-key-top-userformdetails">
//                         <h5 className="response-key-userformdetails">{key} :</h5>
//                         <p
//                           className="response-value-userformdetails"
//                           dangerouslySetInnerHTML={createMarkup(
//                             user.formData[key]
//                           )}
//                         ></p>
//                       </div>
//                     </div>
//                   )
//               )
//             ) : (
//               <p>No form data available.</p>
//             )}
//           </div>

//           <hr />

//           {formStatusDetails && (
//             <div className="form-status-details-userformdetails">
//               <h4 className="documents-heading-userformdetails">
//                 Form Status Details
//               </h4>
//               <div className="response-item-userformdetails">
//                 <div className="number-box-userformdetails">1</div>
//                 <div className="response-key-top-userformdetails">
//                   <h5 className="response-key-userformdetails">Form Status :</h5>
//                   <p className="response-value-userformdetails">
//                     {formStatusDetails.formStatus || "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="response-item-userformdetails">
//                 <div className="number-box-userformdetails">2</div>
//                 <div className="response-key-top-userformdetails">
//                   <h5 className="response-key-userformdetails">
//                     Form First Saved Time :
//                   </h5>
//                   <p className="response-value-userformdetails">
//                     {formStatusDetails.formFirstSavedTime
//                       ? new Date(
//                           formStatusDetails.formFirstSavedTime
//                         ).toLocaleString()
//                       : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="response-item-userformdetails">
//                 <div className="number-box-userformdetails">3</div>
//                 <div className="response-key-top-userformdetails">
//                   <h5 className="response-key-userformdetails">
//                     Last Modified :
//                   </h5>
//                   <p className="response-value-userformdetails">
//                     {formStatusDetails.lastModified
//                       ? new Date(
//                           formStatusDetails.lastModified
//                         ).toLocaleString()
//                       : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="response-item-userformdetails">
//                 <div className="number-box-userformdetails">4</div>
//                 <div className="response-key-top-userformdetails">
//                   <h5 className="response-key-userformdetails">
//                     Form Submission Time :
//                   </h5>
//                   <p className="response-value-userformdetails">
//                     {formStatusDetails.formSubmissionTime
//                       ? new Date(
//                           formStatusDetails.formSubmissionTime
//                         ).toLocaleString()
//                       : "N/A"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           <hr />

//           <div className="documents-section-userformdetails">
//             <h4 className="documents-heading-userformdetails">Documents</h4>
//             {Array.isArray(user.files) && user.files.length > 0 ? (
//               user.files.map((file, index) => (
//                 <div key={index} className="file-item-userformdetails">
//                   <div className="number-box-userformdetails">{index + 1}</div>
//                   <h5
//                     style={{ width: "415px" }}
//                     className="response-key-document-userformdetails"
//                   >
//                     {file.labelName}
//                     <span className="response-value-file-userformdetails">
//                       uploaded at
//                     </span>{" "}
//                     {new Date(file.uploadedAt).toLocaleString()}:
//                   </h5>
//                   <a
//                     href={`${file.path}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="file-response-userformdetails"
//                   >
//                     {file.originalName}
//                   </a>
//                 </div>
//               ))
//             ) : (
//               <p>No documents uploaded yet.</p>
//             )}
//           </div>
//         </section>
//       </main>
//     </div>
//   )
// }

// export default UserFormDetails
