//working
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaRocket } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import axios from "axios";
import logo from "../../Public/logo.png";
import loginLogo from "../../Public/login.png";
import "./Superadmincard.css"; // Assuming you have a CSS file for styling
import { useSelector, useDispatch } from "react-redux";
import {
  superAdminSelector,
  userToken,
  userId,
  superAdminAction,
} from "../../../redux/reducers/superAdminReducer";

const Superadmincards = () => {
  const [cardDetails, setCardDetails] = useState({
    activeOrganizations: 0,
    inactiveOrganizations: 0,
    activeProgramManagers: 0,
    inactiveProgramManagers: 0,
    activeStartups: 0,
    inactiveStartups: 0,
  });
  const [superAdminDetails, setSuperAdminDetails] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(userToken);
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);
  console.log("role in superadmin card:", role);
  console.log("user id in superadmin card:", getUserId);

  // console.log("***:",role);
  //GET ALL OTHER DETAILS FOR SUPER ADMIN.
  const fetchCardDetails = async () => {
    try {
      // Axios config with withCredentials: true to include cookies
      const config = {
        withCredentials: true, // Ensures the HTTP-only cookie with the token is sent
      };

      // Fetch the data in parallel
      const [
        activeOrgs,
        inactiveOrgs,
        activeProgramManagers,
        inactiveProgramManagers,
      ] = await Promise.all([
        axios.get(
          "https://incubator.drishticps.org/api/organizations/active",
          config
        ),
        axios.get(
          "https://incubator.drishticps.org/api/organizations/inactive",
          config
        ),
        axios.get(
          "https://incubator.drishticps.org/api/programmanagers/active",
          config
        ),
        axios.get(
          "https://incubator.drishticps.org/api/programmanagers/inactive",
          config
        ),
      ]);

      // Set the card details with the fetched data
      setCardDetails({
        activeOrganizations: activeOrgs.data.length,
        inactiveOrganizations: inactiveOrgs.data.length,
        activeProgramManagers: activeProgramManagers.data.length,
        inactiveProgramManagers: inactiveProgramManagers.data.length,
      });
      // console.log('cardDetails:',cardDetails);
    } catch (error) {
      //console.log('*****************:',error)
      console.error("Error fetching cards details:", error);
    }
  };

  /*
  const fetchSuperAdminDetails = async () => {
       try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        "https://incubator.drishticps.org/api/superadmins/me",
        config
      );
      setSuperAdminDetails(response.data);
    } catch (error) {
      console.error("Error fetching super admin details:", error);
    }
  };  
  */
  //FETCH SUPER ADMIN DETAILS.
  const fetchSuperAdminDetails = async () => {
    // console.log('running***********')
    try {
      const response = await axios.get(
        "https://incubator.drishticps.org/api/superadmins/me",
        {
          withCredentials: true, // Ensures cookies (including http-only) are sent
        }
      );
      // console.log('response data:',response.data);
      setSuperAdminDetails(response.data); // Store the fetched details in state
    } catch (error) {
      console.error(
        "Error fetching super admin details:",
        error.response || error
      );
    }
  };

  useEffect(() => {
    //  console.log("token:",token)
    //  console.log("role:",role)
    //  console.log("user id:",getUserId);

    if (getUserId) {
      if (role == "Super Admin") {
        fetchCardDetails();
        fetchSuperAdminDetails();
      } else if (role === "Admin") {
        navigate("/admincards"); // Redirect if not authorized
        return;
      } else {
        navigate("/homepage");
      }
    } else {
      console.log("Navigating back to login page");
      navigate("/login");
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Make a request to clear the cookie on the backend
      const response = await axios.post(
        "https://incubator.drishticps.org/api/logout/superAdmin",
        {},
        { withCredentials: true }
      );

      // Clear the user data from React state
      // setUser(null);
      console.log("RESPONSE:", response);
      // Redirect to login or homepage
      setSuperAdminDetails(null);
      dispatch(superAdminAction.logoutUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    navigate("/login");
  };

  const handleNavigation = (route, state) => {
    navigate(route, { state });
  };

  return (
    <div className="card-dashboard">
      <aside className="card-sidebar">
        <div className="card-logo-container">
          <div className="card-logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className="card-nav-container">
          <nav className="card-nav">
            <ul>
              <li
                className="card-nav-item"
                style={{ marginTop: "0px", width: "240px" }}
                onClick={() =>
                  handleNavigation("/SuperadminDash", { showActive: true })
                }
              >
                <FaUserCircle className="card-nav-icon" /> Organization
              </li>

              <li
                className="card-nav-item"
                onClick={() =>
                  handleNavigation("/admindash", {
                    showActive: true,
                    allProgramManagers: true,
                  })
                }
              >
                <FaRocket className="card-nav-icon" /> Program Manager
              </li>
              <li
                className="card-nav-item"
                onClick={() => handleNavigation("/SuperadminDash")}
              >
                <FaRocket className="card-nav-icon" /> Startup
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="card-main-content">
        <header className="card-header">
          <span
            className="card-founder"
            style={{ fontSize: "24px", fontWeight: "700" }}
          >
            Super Admin
          </span>

          <div className="card-profile-section">
            <div className="card-user-info">
              <span className="card-user-initials">
                <img src={loginLogo} alt="Login" style={{ width: "40px" }} />
              </span>
              <div className="card-user-details">
                <span className="card-user-name">
                  {superAdminDetails?.name || "Loading..."}
                  <span className="card-drop" />
                </span>
                {/* <span className="card-user-email">
                  {superAdminDetails?.email || "Loading..."}
                </span> */}
              </div>
              <button
                className="card-logout-button"
                onClick={handleLogout}
                style={{ marginLeft: "10px", padding: "8px" }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="card-content">
          <div className="card-cards-container">
            <div
              className="card-card"
              onClick={() =>
                handleNavigation("/SuperadminDash", { showActive: true })
              }
            >
              <div
                className="card-card-number"
                style={{ backgroundColor: "#6a5acd" }}
              >
                {cardDetails.activeOrganizations}
              </div>
              <div className="card-card-label">Active Organization</div>
            </div>
            <div
              className="card-card"
              onClick={() =>
                handleNavigation("/SuperadminDash", { showActive: false })
              }
            >
              <div
                className="card-card-number"
                style={{ backgroundColor: "#32cd32" }}
              >
                {cardDetails.inactiveOrganizations}
              </div>
              <div className="card-card-label">Inactive Organization</div>
            </div>
            <div
              className="card-card"
              onClick={() =>
                handleNavigation("/admindash", {
                  showActive: true,
                  allProgramManagers: true,
                })
              }
            >
              <div
                className="card-card-number"
                style={{ backgroundColor: "#ff69b4" }}
              >
                {cardDetails.activeProgramManagers}
              </div>
              <div className="card-card-label">Active Program Managers</div>
            </div>
            <div
              className="card-card"
              onClick={() =>
                handleNavigation("/admindash", {
                  showActive: false,
                  allProgramManagers: true,
                })
              }
            >
              <div
                className="card-card-number"
                style={{ backgroundColor: "#ffd700" }}
              >
                {cardDetails.inactiveProgramManagers}
              </div>
              <div className="card-card-label">Inactive Program Managers</div>
            </div>
            <div
              className="card-card"
              onClick={() => handleNavigation("/SuperadminDash")}
            >
              <div
                className="card-card-number"
                style={{ backgroundColor: "#9370db" }}
              >
                {cardDetails.activeStartups}
              </div>
              <div className="card-card-label">Active Startup</div>
            </div>

            <div
              className="card-card"
              onClick={() => handleNavigation("/SuperadminDash")}
            >
              <div
                className="card-card-number"
                style={{ backgroundColor: "#9370db" }}
              >
                {cardDetails.inactiveStartups}
              </div>
              <div className="card-card-label">Inactive Startup</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Superadmincards;
