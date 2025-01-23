import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { GrDocumentSound } from "react-icons/gr";
import { IoIosLink } from "react-icons/io";
import { TbUsersGroup } from "react-icons/tb";
import "./ViewCohorts.css";

const ViewCohorts = () => {
  const { id } = useParams(); // Get the cohort ID from the URL params
  const [cohort, setCohort] = useState(null); // State to store cohort data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [user, setUser] = useState({ name: "", email: "" }); // ** START CHANGE FOR USER INFO **
  const navigate = useNavigate(); // Hook for navigating between pages

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/cohorts/${id}`
        ); // Fetch cohort data by ID
        setCohort(response.data); // Set cohort data in state
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        console.error("Error fetching cohort data", err);
        setLoading(false); // Set loading to false in case of an error
      }
    };

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Fetch token from localStorage
        const response = await axios.get(
          "https://incubator.drishticps.org/api/programmanagers/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data); // Set the user info (name and email)
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchCohort(); // Call the fetch function on component mount
    fetchUserData(); // Call the fetch user function on component mount
  }, [id]); // Dependency array with ID to refetch if ID changes

  if (loading) {
    return <div>Loading...</div>; // Show loading spinner or message
  }

  if (!cohort) {
    return <div>No cohort found</div>; // Show if cohort data is null
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-viewcohorts">
      <aside className="sidebar-viewcohorts">
        <div className="logo-container-viewcohorts">
          <div className="logo-viewcohorts">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-viewcohorts"
            />
          </div>
        </div>
        <div className="nav-container-viewcohorts">
          <nav className="nav-viewcohorts">
            <ul>
              <li>
                <Link to="/homepage">
                  <IoHomeOutline className="nav-icon-viewcohorts" /> Homepage
                </Link>
              </li>
              <li>
                <Link to="/cohorts">
                  <GrDocumentSound className="nav-icon-viewcohorts" /> Cohorts
                </Link>
              </li>
              <li>
                <Link to="/pipeline">
                  <IoIosLink className="nav-icon-viewcohorts" /> Pipeline
                </Link>
              </li>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-viewcohorts" /> Create Query Form
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye className="nav-icon-viewcohorts" /> Create
                  Evaluation Form
                </Link>
              </li>
              <li>
                <Link to="/applications">
                  <TbUsersGroup className="nav-icon-viewcohorts" /> Applications
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-viewcohorts">
        <header className="header-viewcohorts">
          <span className="founder-viewcohorts">All Forms</span>
          <div className="profile-section-viewcohorts">
            <div className="user-info-viewcohorts">
              <span className="user-initials-viewcohorts">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-viewcohorts">
                <span className="user-name-viewcohorts">
                  {user.username} {/* ** Display the name dynamically */}
                </span>
                <br />
                <span className="user-email-viewcohorts">
                  {user.email}
                </span>{" "}
                {/* ** Display the email dynamically */}
              </div>
            </div>
            <button
              className="logout-button-viewcohorts"
              onClick={handleLogout} // Ensure this function is defined in your component
              style={{ marginLeft: "20px", padding: "8px" }} // Add any additional styling as needed
            >
              Logout
            </button>
          </div>
        </header>
        <section className="content-viewcohorts">
          <div className="cohort-header">
            <h2 className="cohort-name-viewcohorts">{cohort.name}</h2>

            <div className="cohort-info">
              {/* ** START CHANGE FOR "Show cohort image"  --- **/}
              {cohort.poster && (
                <img
                  src={
                    cohort.poster.startsWith("http")
                      ? cohort.poster
                      : `https://incubator.drishticps.org/${cohort.poster.replace(
                          /\\/g,
                          "/"
                        )}`
                  } // Replacing backslashes with forward slashes for proper URL formatting
                  alt={`${cohort.name} Poster`}
                  className="cohort-poster-viewcohorts" ///// for responsive CSS class
                />
              )}
              {/* ** END CHANGE FOR "Show cohort image"  --- **/}
            </div>
            {/* START CHANGE FOR ADDING BACK BUTTON */}
            <button
              className="back-button-viewcohorts"
              onClick={() => navigate("/cohorts")}
            >
              Back
            </button>
            {/* END CHANGE FOR ADDING BACK BUTTON */}
          </div>

          <div className="cohort-details-viewcohorts">
            <h3>About</h3>
            <p>{cohort.about || "No description provided"}</p>

            <h3>Eligibility</h3>
            <p>{cohort.eligibility || "No eligibility criteria added"}</p>

            <h3>Industry</h3>
            <p>{cohort.industry || "No industry selected"}</p>

            <h3>Focus Area</h3>
            <p>{cohort.focusArea || "No focus-area selected"}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ViewCohorts;
