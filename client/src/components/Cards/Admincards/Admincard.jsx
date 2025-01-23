import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import logo from "../../Public/logo.png";
import loginLogo from "../../Public/login.png";
import "./Admincard.css"; // Ensure you have the necessary CSS styles
import { useSelector, useDispatch } from "react-redux";
import {
  superAdminSelector,
  userId,
  superAdminAction,
} from "../../../redux/reducers/superAdminReducer";

const Admincards = () => {
  const [cardDetails, setCardDetails] = useState({
    activeProgramManagers: 0,
    inactiveProgramManagers: 0,
  });
  const [adminDetails, setAdminDetails] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);
  //console.log('ROLE********:',role)

  const fetchCardDetails = async () => {
    try {
      const [activeResponse, inactiveResponse] = await Promise.all([
        axios.get(
          "https://incubator.drishticps.org/api/programmanagers/active/count/by-admin",
          {
            withCredentials: true,
          }
        ),
        axios.get(
          "https://incubator.drishticps.org/api/programmanagers/inactive/count/by-admin",
          {
            withCredentials: true,
          }
        ),
      ]);

      console.log("Active Program Managers Count:", activeResponse.data);
      console.log(
        "Inactive Program Managers Count:",
        inactiveResponse.data.count
      );

      // Update state with extracted count values
      setCardDetails({
        activeProgramManagers: activeResponse.data.count, // Extract the count field
        inactiveProgramManagers: inactiveResponse.data.count, // Extract the count field
      });
    } catch (error) {
      console.error("Error fetching cards details:", error);
    }
  };

  // Fetch admin details
  const fetchAdminDetails = async () => {
    try {
      //  const token = localStorage.getItem("token");
      /* const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };*/
      if (role == "Super Admin") {
        const response = await axios.get(
          "https://incubator.drishticps.org/api/superadmins/me",
          {
            withCredentials: true, // Ensures cookies (including http-only) are sent
          }
        );
        setAdminDetails(response.data);
      } else {
        const response = await axios.get(
          "https://incubator.drishticps.org/api/admins/me",
          {
            withCredentials: true, // Ensures cookies (including http-only) are sent
          }
        );
        // console.log("**********",response.data);
        setAdminDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (getUserId) {
      if (role == "Admin") {
        fetchCardDetails();
        fetchAdminDetails();
      } else if (role == "Super Admin") {
        navigate("/cards");
      } else {
        navigate("/homepage");
      }
    } else {
      navigate("/login");
    }
  }, []);

  /*
  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };*/
  const handleLogout = async () => {
    try {
      if (role == "Super Admin") {
        // Make a request to clear the cookie on the backend
        const response = await axios.post(
          "https://incubator.drishticps.org/api/logout/superAdmin",
          {},
          { withCredentials: true }
        );

        // Clear the user data from React state
        // setUser(null);
        console.log("RESPONSE 1:", response);
        // Redirect to login or homepage
        setAdminDetails(null);
        dispatch(superAdminAction.logoutUser());
        navigate("/login");
      } else {
        console.log("ADMIN DETAILS:", adminDetails);
        // Make a request to clear the cookie on the backend
        const response = await axios.post(
          `https://incubator.drishticps.org/api/logout/admin/${adminDetails._id}`,
          {},
          { withCredentials: true }
        );

        // Clear the user data from React state
        // setUser(null);
        //  console.log('RESPONSE:',response);
        // Redirect to login or homepage
        setAdminDetails(null);
        dispatch(superAdminAction.logoutUser());
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
    navigate("/login");
  };

  // Handle navigation
  const handleNavigation = (route, state) => {
    navigate(route, { state });
  };

  return (
    <div className="admin-card-dashboard">
      {/* Sidebar with logo and navigation */}
      <aside className="admin-card-sidebar">
        <div className="admin-card-logo-container">
          <div className="admin-card-logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className="admin-card-nav-container">
          <nav className="admin-card-nav">
            <ul>
              <li
                className="admin-card-nav-item"
                onClick={() =>
                  handleNavigation("/admindash", { showActive: true })
                }
              >
                <FaUserCircle className="admin-card-nav-icon" /> Program Manager
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <main className="admin-card-main-content">
        <header className="admin-card-header">
          <span className="admin-card-founder">Admin Dashboard</span>

          <div className="admin-card-profile-section">
            <div className="admin-card-user-info">
              <span className="admin-card-user-initials">
                <img src={loginLogo} alt="Login" style={{ width: "40px" }} />
              </span>
              <div className="admin-card-user-details">
                <span className="admin-card-user-name">
                  {adminDetails?.email || "Loading..."}
                </span>
                <button
                  className="admin-card-logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Card content */}
        <section className="admin-card-content">
          <div className="admin-card-cards-container">
            <div
              className="admin-card-card"
              onClick={() =>
                handleNavigation("/admindash", { showActive: true })
              }
            >
              <div
                className="admin-card-card-number"
                style={{ backgroundColor: "#ff69b4" }}
              >
                {cardDetails.activeProgramManagers}
              </div>
              <div className="admin-card-card-label">
                Active Program Managers
              </div>
            </div>
            <div
              className="admin-card-card"
              onClick={() =>
                handleNavigation("/admindash", { showActive: false })
              }
            >
              <div
                className="admin-card-card-number"
                style={{ backgroundColor: "#ffd700" }}
              >
                {cardDetails.inactiveProgramManagers}
              </div>
              <div className="admin-card-card-label">
                Inactive Program Managers
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admincards;
