import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHouseUser } from "react-icons/fa";
import axios from "axios";
import "./UserDashboard.css";

const UserDashboard = () => {
  // Initialize state to hold user information (name and email)
  const [user, setUser] = useState({
    name: "",
    email: "",
    formData: {},
    files: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch user data from the server
    const fetchUserData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";

        // *** START CHANGE FOR FETCHING USER INFO WITH COOKIES ***
        // Use axios to send a GET request with credentials (cookies) to fetch user info
        const response = await axios.get(
          `${API_BASE_URL}/api/users/get-user-info`,
          {
            withCredentials: true, // Ensure that cookies are sent with the request
          }
        );

        // Set the fetched user information (name, email) to the state
        setUser({ name: response.data.name, email: response.data.email });
        // *** END CHANGE FOR FETCHING USER INFO WITH COOKIES ***
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/user-signin"); // Redirect to login page if not authenticated
      }
    };

    /*** START CHANGE FOR FETCHING NAME FROM formData ***/
    // Fetch user form data using 'fetch-draft-by-email' API
    const fetchUserNameFromFormData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";

        if (user.email) {
          const response = await axios.post(
            `${API_BASE_URL}/api/forms/fetch-draft-by-email`,
            { email: user.email },
            { withCredentials: true }
          );

          // If 'formData' contains 'Name', update the user's name in the state
          setUser((prevState) => ({
            ...prevState,
            name: response.data.formData.Name || prevState.name, // Use 'Name' from formData if available
          }));
        }
      } catch (error) {
        console.error("Error fetching user form data:", error);
      }
    };

    // Fetch user data and then fetch the name from formData
    fetchUserData().then(() => {
      fetchUserNameFromFormData();
    });
    /*** END CHANGE FOR FETCHING NAME FROM formData ***/
  }, [navigate, user.email]);

  // Handle the logout process
  const handleLogout = async () => {
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        "https://incubator.drishticps.org";

      // *** START CHANGE FOR LOGOUT ***
      // Make a request to the backend to clear the JWT cookie
      await axios.post(
        `${API_BASE_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );

      // Redirect the user to the login page after logout
      navigate("/user-signin");
      // *** END CHANGE FOR LOGOUT ***
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // ** START CHANGE FOR add card below Information heading---**
  const handleViewDetails = () => {
    navigate("/userformdetails"); // Navigate to UserFormDetails
  };

  return (
    <div className="dashboard-homepage-userdashboard">
      <aside className="sidebar-homepage-userdashboard">
        <div className="logo-container-homepage-userdashboard">
          <div className="logo-homepage-userdashboard">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-homepage-userdashboard"
            />
          </div>
        </div>
        <div className="nav-container-homepage-userdashboard">
          <nav className="nav-homepage-userdashboard">
            <ul>
              <li>
                <Link to="/userdashboard">
                  <FaHouseUser className="nav-icon-homepage-userdashboard" />{" "}
                  UserDashboard
                </Link>
              </li>
              {/* <li>
                <Link to="/homepage">
                  <IoHomeOutline className="nav-icon-homepage-userdashboard" />{" "}
                  Homepage
                </Link>
              </li> */}
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-homepage-userdashboard">
        <header className="header-homepage-userdashboard">
          <h6 className="founder-homepage-userdashboard">
            Welcome: {user.name}
          </h6>
          <div className="profile-section-homepage-userdashboard">
            <div className="user-info-homepage-userdashboard">
              <span className="user-initials-homepage-userdashboard">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-homepage-userdashboard">
                <span className="user-name-homepage-userdashboard">
                  {/* {user.username} */}
                  {user.name}
                </span>
                <br />
                <span className="user-email-homepage-userdashboard">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              className="logout-button-homepage-userdashboard"
              onClick={handleLogout}
              style={{ marginLeft: "20px", padding: "8px" }}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="content-homepage-userdashboard">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3>Applications</h3>
            </div>
          </div>
          {/* Card Section */}
          <div className="card-userdashboard">
            <h4>Fellowship Program 2024 new</h4>
            <p>Draft Form : </p>
            <p>Submitted Form: </p>
            <span className="status-userdashboard">Round 1</span>
            <button
              className="view-button-userdashboard"
              onClick={handleViewDetails}
            >
              View Details
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;

///////////before user login
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaHouseUser } from "react-icons/fa";
// import axios from "axios";
// import "./UserDashboard.css";

// const UserDashboard = () => {
//   // const [user, setUser] = useState({ name: "", email: "" });
//   const [user, setUser] = useState({
//     name: "",
//     email: "",
//     formData: {},
//     files: [],
//   });
//   const [formStatusDetails, setFormStatusDetails] = useState(null); // Add state for form status details
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const token = localStorage.getItem("token"); // Get the token from local storage
//         const response = await axios.get(
//           "https://incubator.drishticps.org/api/programmanagers/me", // API to get user basic info
//           {
//             headers: {
//               Authorization: `Bearer ${token}`, // Pass token for authorization
//             },
//           }
//         );
//         // setUser({ username: response.data.username, email: response.data.email }); // Store name and email in state
//         setUser({ name: response.data.username, email: response.data.email }); // Store name and email in state
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };
//     fetchUserData();
//   }, []); // Fetch on component load

//   // ** START CHANGE FOR add card below Information heading---**
//   const handleViewDetails = () => {
//     navigate("/userformdetails"); // Navigate to UserFormDetails
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <div className="dashboard-homepage-userdashboard">
//       <aside className="sidebar-homepage-userdashboard">
//         <div className="logo-container-homepage-userdashboard">
//           <div className="logo-homepage-userdashboard">
//             <img
//               src="/navbar/drishtilogo.jpg"
//               alt="Logo"
//               className="dristilogo-homepage-userdashboard"
//             />
//           </div>
//         </div>
//         <div className="nav-container-homepage-userdashboard">
//           <nav className="nav-homepage-userdashboard">
//             <ul>
//               <li>
//                 <Link to="/userdashboard">
//                   <FaHouseUser className="nav-icon-homepage-userdashboard" />{" "}
//                   UserDashboard
//                 </Link>
//               </li>
//               {/* <li>
//                 <Link to="/homepage">
//                   <IoHomeOutline className="nav-icon-homepage-userdashboard" />{" "}
//                   Homepage
//                 </Link>
//               </li> */}
//             </ul>
//           </nav>
//         </div>
//       </aside>
//       <main className="main-content-homepage-userdashboard">
//         <header className="header-homepage-userdashboard">
//           <h6 className="founder-homepage-userdashboard">
//             Welcome: {user.name}
//           </h6>
//           <div className="profile-section-homepage-userdashboard">
//             <div className="user-info-homepage-userdashboard">
//               <span className="user-initials-homepage-userdashboard">
//                 <img
//                   src="/navbar/login.png"
//                   alt="Login"
//                   style={{ width: "40px" }}
//                 />
//               </span>
//               <div className="user-details-homepage-userdashboard">
//                 <span className="user-name-homepage-userdashboard">
//                   {/* {user.username} */}
//                   {user.name}
//                 </span>
//                 <br />
//                 <span className="user-email-homepage-userdashboard">
//                   {user.email}
//                 </span>
//               </div>
//             </div>
//             <button
//               className="logout-button-homepage-userdashboard"
//               onClick={handleLogout}
//               style={{ marginLeft: "20px", padding: "8px" }}
//             >
//               Logout
//             </button>
//           </div>
//         </header>

//         <section className="content-homepage-userdashboard">
//           <div style={{  display: "flex", justifyContent: "space-between", alignItems: "center", }} >
//             <div>
//               <h3>Applications</h3>
//             </div>
//           </div>
//           {/* Card Section */}
//           <div className="card-userdashboard">
//             <h4>Fellowship Program 2024 new</h4>
//             <p>Draft Form : </p>
//             <p>Submitted Form: </p>
//             <span className="status-userdashboard">Round 1</span>
//             <button className="view-button-userdashboard" onClick={handleViewDetails}>
//               View Details
//             </button>
//           </div>

//         </section>
//       </main>
//     </div>
//   );
// };

// export default UserDashboard;

// <div
// style={{
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
// }}
// >
// <div>
//   <h3>Information</h3>
// </div>
// <div>
//   {formStatusDetails &&
//     formStatusDetails.formStatus === "Saved" && (
//       <button
//         onClick={handleCompleteProfile}
//         className="complete-profile-button-userformdetails"
//       >
//         Complete Form
//       </button>
//     )}

//   {formStatusDetails &&
//     formStatusDetails.formStatus === "Submitted" && (
//        <p
//         style={{
//           border: "1px solid black",
//           borderRadius: "4px",
//           padding: "2px",
//         }}
//       >
//         Your profile is submitted
//       </p>
//      )}
// </div>
// </div>

// <div className="user-info-section-userformdetails">
// {user.formData && Object.keys(user.formData).length > 0 ? (
//   Object.keys(user.formData).map(
//     (key, index) =>
//       key !== "pipelineId" &&
//       key !== "_id" && (
//         <div key={key} className="response-item-userformdetails">
//           <div className="number-box-userformdetails">
//             {index + 1}
//           </div>
//           <div className="response-key-top-userformdetails">
//             <h5 className="response-key-userformdetails">{key} :</h5>
//             <p
//               className="response-value-userformdetails"
//               dangerouslySetInnerHTML={createMarkup(
//                 user.formData[key]
//               )}
//             ></p>
//           </div>
//         </div>
//       )
//   )
// ) : (
//   <p>No form data available.</p>
// )}
// </div>

// <hr />

// {formStatusDetails && (
// <div className="form-status-details-userformdetails">
//   <h4 className="documents-heading-userformdetails">
//     Form Status Details
//   </h4>
//   <div className="response-item-userformdetails">
//     <div className="number-box-userformdetails">1</div>
//     <div className="response-key-top-userformdetails">
//       <h5 className="response-key-userformdetails">Form Status :</h5>
//       <p className="response-value-userformdetails">
//         {formStatusDetails.formStatus || "N/A"}
//       </p>
//     </div>
//   </div>
//   <div className="response-item-userformdetails">
//     <div className="number-box-userformdetails">2</div>
//     <div className="response-key-top-userformdetails">
//       <h5 className="response-key-userformdetails">
//         Form First Saved Time :
//       </h5>
//       <p className="response-value-userformdetails">
//         {formStatusDetails.formFirstSavedTime
//           ? new Date(
//               formStatusDetails.formFirstSavedTime
//             ).toLocaleString()
//           : "N/A"}
//       </p>
//     </div>
//   </div>
//   <div className="response-item-userformdetails">
//     <div className="number-box-userformdetails">3</div>
//     <div className="response-key-top-userformdetails">
//       <h5 className="response-key-userformdetails">
//         Last Modified :
//       </h5>
//       <p className="response-value-userformdetails">
//         {formStatusDetails.lastModified
//           ? new Date(
//               formStatusDetails.lastModified
//             ).toLocaleString()
//           : "N/A"}
//       </p>
//     </div>
//   </div>
//   <div className="response-item-userformdetails">
//     <div className="number-box-userformdetails">4</div>
//     <div className="response-key-top-userformdetails">
//       <h5 className="response-key-userformdetails">
//         Form Submission Time :
//       </h5>
//       <p className="response-value-userformdetails">
//         {formStatusDetails.formSubmissionTime
//           ? new Date(
//               formStatusDetails.formSubmissionTime
//             ).toLocaleString()
//           : "N/A"}
//       </p>
//     </div>
//   </div>
// </div>
// )}

// <hr />

// <div className="documents-section-userformdetails">
// <h4 className="documents-heading-userformdetails">Documents</h4>
// {Array.isArray(user.files) && user.files.length > 0 ? (
//   user.files.map((file, index) => (
//     <div key={index} className="file-item-userformdetails">
//       <div className="number-box-userformdetails">{index + 1}</div>
//       <h5
//         style={{ width: "415px" }}
//         className="response-key-document-userformdetails"
//       >
//         {file.labelName}
//         <span className="response-value-file-userformdetails">
//           uploaded at
//         </span>{" "}
//         {new Date(file.uploadedAt).toLocaleString()}:
//       </h5>
//       <a
//         href={`${file.path}`}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="file-response-userformdetails"
//       >
//         {file.originalName}
//       </a>
//     </div>
//   ))
// ) : (
//   <p>No documents uploaded yet.</p>
// )}
// </div>

//////////before card in userdash 13 10 2024
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaHouseUser } from "react-icons/fa";
// import axios from "axios";
// import "./UserDashboard.css";

// const UserDashboard = () => {
//   // const [user, setUser] = useState({ name: "", email: "" });
//   const [user, setUser] = useState({
//     name: "",
//     email: "",
//     formData: {},
//     files: [],
//   });
//   const [formStatusDetails, setFormStatusDetails] = useState(null); // Add state for form status details
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const token = localStorage.getItem("token"); // Get the token from local storage
//         const response = await axios.get(
//           "https://incubator.drishticps.org/api/programmanagers/me", // API to get user basic info
//           {
//             headers: {
//               Authorization: `Bearer ${token}`, // Pass token for authorization
//             },
//           }
//         );
//         // setUser({ username: response.data.username, email: response.data.email }); // Store name and email in state
//         setUser({ name: response.data.username, email: response.data.email }); // Store name and email in state
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };
//     fetchUserData();
//   }, []); // Fetch on component load

//   useEffect(() => {
//     const fetchAllUserData = async () => {
//       try {
//         const token = localStorage.getItem("token"); // Get token from local storage
//         if (user.email) {
//           console.log("Fetching draft data for email:", user.email); // Log the email being sent
//           const response = await axios.post(
//             "https://incubator.drishticps.org/api/forms/fetch-draft-by-email", // API to get user-specific data by email

//             { email: user.email }, // Pass email dynamically
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`, // Pass token for authorization
//               },
//             }
//           );
//           console.log("Draft Data:", response.data); // Log the draft data

//           setUser((prevState) => ({
//             ...prevState,
//             formData: {
//               ...response.data.formData,
//               pipelineId: response.data.pipelineId, // Ensure pipelineId is set in formData
//               _id: response.data._id, // Ensure the form submission ID is part of formData
//             },
//             files: response.data.files || [], // Save the fetched files // Ensure files is an array
//           }));
//           console.log("Pipeline ID:", response.data.pipelineId); // Log the pipelineId to debug
//           /** START CHANGE FOR get "Form Status Details" by email id --- **/
//           if (response.data._id) {
//             console.log("Form Submission ID found:", response.data._id); // Log success

//             try {
//               // Fetch form status details
//               const formStatusResponse = await axios.get(
//                 `/api/forms/form-submissions/${response.data._id}/status`
//               );
//               setFormStatusDetails(formStatusResponse.data);
//               console.log("Form Status Details:", formStatusResponse.data); // Log form status details
//             } catch (error) {
//               console.error(
//                 "Error fetching form status:",
//                 error.response?.data || error.message
//               );
//               setFormStatusDetails(null);
//             }
//           } else {
//             console.error("Form submission ID not found.");
//           }
//           /** END CHANGE FOR get "Form Status Details" by email id --- **/
//         }
//       } catch (error) {
//         console.error(
//           "Error fetching user data:",
//           error.response?.data || error.message
//         );
//       }
//     };

//     if (user.email) {
//       fetchAllUserData(); // Only fetch if email is available
//     }
//   }, [user.email]); // Trigger this effect when the user's email is available

//   /** START CHANGE FOR open form after press "Complete profile" button with correct ID --- **/
//   const handleCompleteProfile = () => {
//     console.log("Form status details:", formStatusDetails); // Debug log for formStatusDetails
//     console.log("User form data:", user.formData); // Debug log for formData

//     // Ensure proper logging of Pipeline ID from formData
//     const pipelineId =
//       user.formData.pipelineId || formStatusDetails?.pipelineId;

//     if (!pipelineId) {
//       console.error("Pipeline ID not found in formData or form status.");
//       return;
//     }

//     if (formStatusDetails?.formStatus === "Saved") {
//       console.log("Navigating to form with Pipeline ID:", pipelineId); // Log form ID
//       navigate(`/fe/${pipelineId}`, {
//         // state: { email: user.email },
//         state: { email: user.email, preFilledData: user.formData },
//       });
//     } else {
//       console.warn("Form status is not 'Saved', cannot proceed.");
//     }
//   };
//   console.log("Form Status Details before navigating:", formStatusDetails);
//   /** END CHANGE FOR open form after press "Complete profile" button with correct ID --- **/
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   const createMarkup = (html) => {
//     return { __html: html };
//   };

//   return (
//     <div className="dashboard-homepage-userdashboard">
//       <aside className="sidebar-homepage-userdashboard">
//         <div className="logo-container-homepage-userdashboard">
//           <div className="logo-homepage-userdashboard">
//             <img
//               src="/navbar/drishtilogo.jpg"
//               alt="Logo"
//               className="dristilogo-homepage-userdashboard"
//             />
//           </div>
//         </div>
//         <div className="nav-container-homepage-userdashboard">
//           <nav className="nav-homepage-userdashboard">
//             <ul>
//               <li>
//                 <Link to="/userdashboard">
//                   <FaHouseUser className="nav-icon-homepage-userdashboard" />{" "}
//                   UserDashboard
//                 </Link>
//               </li>
//               {/* <li>
//                 <Link to="/homepage">
//                   <IoHomeOutline className="nav-icon-homepage-userdashboard" />{" "}
//                   Homepage
//                 </Link>
//               </li> */}
//             </ul>
//           </nav>
//         </div>
//       </aside>
//       <main className="main-content-homepage-userdashboard">
//         <header className="header-homepage-userdashboard">
//           <h6 className="founder-homepage-userdashboard">
//             Welcome: {user.name}
//           </h6>
//           <div className="profile-section-homepage-userdashboard">
//             <div className="user-info-homepage-userdashboard">
//               <span className="user-initials-homepage-userdashboard">
//                 <img
//                   src="/navbar/login.png"
//                   alt="Login"
//                   style={{ width: "40px" }}
//                 />
//               </span>
//               <div className="user-details-homepage-userdashboard">
//                 <span className="user-name-homepage-userdashboard">
//                   {/* {user.username} */}
//                   {user.name}
//                 </span>
//                 <br />
//                 <span className="user-email-homepage-userdashboard">
//                   {user.email}
//                 </span>
//               </div>
//             </div>
//             <button
//               className="logout-button-homepage-userdashboard"
//               onClick={handleLogout}
//               style={{ marginLeft: "20px", padding: "8px" }}
//             >
//               Logout
//             </button>
//           </div>
//         </header>

//         <section className="content-homepage-userdashboard">
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
//                   /** START CHANGE FOR showing "Complete profile" button if form status is "Saved"--- **/
//                   <button
//                     onClick={handleCompleteProfile}
//                     className="complete-profile-button-userdashboard"
//                   >
//                     Complete Form
//                   </button>
//                   /** END CHANGE FOR showing "Complete profile" button if form status is "Saved"--- **/
//                 )}

//               {formStatusDetails &&
//                 formStatusDetails.formStatus === "Submitted" && (
//                   /** START CHANGE FOR hiding "Complete profile" button if form status is "Submitted"--- **/
//                   // <p>Your profile is already complete and submitted.</p>
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

//           <div className="user-info-section-userdashboard">
//             {user.formData && Object.keys(user.formData).length > 0 ? (
//               Object.keys(user.formData).map(
//                 (key, index) =>
//                   /** START CHANGE FOR not show pipelineId and _id in UI --- **/
//                   key !== "pipelineId" &&
//                   key !== "_id" && (
//                     <div key={key} className="response-item-userdashboard">
//                       <div className="number-box-userdashboard">
//                         {index + 1}
//                       </div>
//                       <div className="response-key-top-userdashboard">
//                         <h5 className="response-key-userdashboard">{key} :</h5>
//                         <p
//                           className="response-value-userdashboard"
//                           dangerouslySetInnerHTML={createMarkup(
//                             user.formData[key]
//                           )}
//                         ></p>
//                       </div>
//                     </div>
//                   )
//                 /** END CHANGE FOR not show pipelineId and _id in UI --- **/
//               )
//             ) : (
//               <p>No form data available.</p>
//             )}
//           </div>
//           <hr />
//           {/** START CHANGE FOR displaying form status details in UserDashboard --- **/}
//           {formStatusDetails && (
//             <div className="form-status-details-userdashboard">
//               <h4 className="documents-heading-userdashboard">
//                 Form Status Details
//               </h4>
//               <div className="response-item-userdashboard">
//                 <div className="number-box-userdashboard">1</div>
//                 <div className="response-key-top-userdashboard">
//                   <h5 className="response-key-userdashboard">Form Status :</h5>
//                   <p className="response-value-userdashboard">
//                     {formStatusDetails.formStatus || "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="response-item-userdashboard">
//                 <div className="number-box-userdashboard">2</div>
//                 <div className="response-key-top-userdashboard">
//                   <h5 className="response-key-userdashboard">
//                     Form First Saved Time :
//                   </h5>
//                   <p className="response-value-userdashboard">
//                     {formStatusDetails.formFirstSavedTime
//                       ? new Date(
//                           formStatusDetails.formFirstSavedTime
//                         ).toLocaleString()
//                       : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="response-item-userdashboard">
//                 <div className="number-box-userdashboard">3</div>
//                 <div className="response-key-top-userdashboard">
//                   <h5 className="response-key-userdashboard">
//                     Last Modified :
//                   </h5>
//                   <p className="response-value-userdashboard">
//                     {formStatusDetails.lastModified
//                       ? new Date(
//                           formStatusDetails.lastModified
//                         ).toLocaleString()
//                       : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="response-item-userdashboard">
//                 <div className="number-box-userdashboard">4</div>
//                 <div className="response-key-top-userdashboard">
//                   <h5 className="response-key-userdashboard">
//                     Form Submission Time :
//                   </h5>
//                   <p className="response-value-userdashboard">
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
//           {/** END CHANGE FOR displaying form status details in UserDashboard --- **/}
//           <hr />
//           <div className="documents-section-userdashboard">
//             <h4 className="documents-heading-userdashboard">Documents</h4>
//             {Array.isArray(user.files) && user.files.length > 0 ? (
//               user.files.map((file, index) => (
//                 <div key={index} className="file-item-userdashboard">
//                   <div className="number-box-userdashboard">{index + 1}</div>
//                   <h5
//                     style={{ width: "415px" }}
//                     className="response-key-document-userdashboard"
//                   >
//                     {file.labelName}
//                     <span className="response-value-file-userdashboard">
//                       uploaded at
//                     </span>{" "}
//                     {new Date(file.uploadedAt).toLocaleString()}:
//                     {/* {moment(file.uploadedAt).format("DD/MM/YYYY hh:mm A")} : */}
//                   </h5>
//                   <a
//                     href={`${file.path}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="file-response-userdashboard"
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
//   );
// };

// export default UserDashboard;
