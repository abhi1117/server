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
    pipelineId: "", // to store the pipelineId
    formId: "",
    formData: {},
    files: [],
    applicationTitle: "",
    currentRound: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";

        // Fetch user basic info
        const userInfoResponse = await axios.get(
          `${API_BASE_URL}/api/users/get-user-info`,
          { withCredentials: true }
        );

        const userEmail = userInfoResponse.data.email;

        // Fetch user's draft or submitted form using email
        const formResponse = await axios.post(
          `${API_BASE_URL}/api/forms/fetch-draft-by-email`,
          { email: userEmail },
          { withCredentials: true }
        );

        const formData = formResponse.data;

        // Update state with user and form details
        setUser({
          name: userInfoResponse.data.name || "User",
          email: userEmail,
          pipelineId: formData.pipelineId || "",
          formId: formData.formId || "",
          formData: formData.formData || {},
          files: formData.files || [],
        });
        setLoading(false); // Data loaded
      } catch (error) {
        console.error("Error fetching user data or form details:", error);
        navigate("/user-signin"); // Redirect to login page if not authenticated
      }
    };

    fetchUserData();
  }, [navigate]);

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
    // Ensure all required data is present
    if (!user.pipelineId || !user.email || !user.formId) {
      console.error("Pipeline ID, Email, or Form ID is missing.");
      console.log("Pipeline ID:", user.pipelineId);
      console.log("Email:", user.email);
      console.log("Form ID:", user.formId);
      return;
    }

    // Navigate to UserFormDetails with the correct state
    navigate("/userformdetails", {
      state: {
        pipelineId: user.pipelineId,
        email: user.email,
        formId: user.formId,
      },
    });
  };

  // useEffect(() => {
  //   console.log("Updated user state:", user);
  // }, [user]);

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";

        // console.log("Pipeline ID:", user.pipelineId);
        // console.log("Form ID:", user.formId);

        if (user.pipelineId) {
          const pipelineResponse = await axios.get(
            `${API_BASE_URL}/api/pipelines/${user.pipelineId}`,
            { withCredentials: true }
          );

          const pipelineData = pipelineResponse.data;
          // console.log("Pipeline Data:", pipelineData);
          // console.log("Rounds in Pipeline:", pipelineData.rounds);

          // Match round using multiple criteria
          const matchingRound = pipelineData.rounds.find((round) => {
            // console.log("Comparing formId:", round.application?.formId?.toString(), "with", user.formId?.toString());
            // console.log("Comparing formTitle:", round.application?.formTitle?.toLowerCase(), "with", user.formData?.formTitle?.toLowerCase());
            return (
              round.application?.formId?.toString() ===
                user.formId?.toString() || // Match formId
              round.application?.formTitle?.toLowerCase() ===
                user.formData?.formTitle?.toLowerCase() // Match formTitle
            );
          });

          // console.log("Matching Round:", matchingRound);

          // Update state with application title and round number
          if (matchingRound) {
            setUser((prevState) => ({
              ...prevState,
              applicationTitle:
                matchingRound.applicationFormDesign?.applicationTitle ||
                "No Title",
              currentRound: matchingRound.roundNumber || "No Round",
            }));
          } else {
            // console.warn("No matching round found. Using default round.");
            // Fallback: Use the first round's application title and round number
            if (pipelineData.rounds.length > 0) {
              setUser((prevState) => ({
                ...prevState,
                applicationTitle:
                  pipelineData.rounds[0].applicationFormDesign
                    ?.applicationTitle || "Default Application Title",
                currentRound: pipelineData.rounds[0].roundNumber || "No Round",
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      }
    };

    if (user.pipelineId && user.formId) {
      fetchPipelineData();
    }
  }, [user.pipelineId, user.formId, user.formData?.formTitle]);

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
            {/* <h4>Fellowship Program 2024 new</h4> */}
            <h4>{user.applicationTitle || "Loading Application Title..."}</h4>

            {/* <p style={{  color:'white' }}>.</p> */}
            {/* <span className="status-userdashboard">Round 1</span> */}

            <span className="status-userdashboard">
              Round {user.currentRound || "Loading..."}
            </span>

            {/* <button className="view-button-userdashboard" onClick={handleViewDetails}>
              View Details
            </button>  */}
            <button
              className="view-button-userdashboard"
              onClick={handleViewDetails}
              disabled={
                loading || !user.formId || !user.pipelineId || !user.email
              }
            >
              {loading ? "Loading..." : "View Details"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
