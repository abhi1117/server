import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { GrDocumentSound } from "react-icons/gr";
import { IoIosLink } from "react-icons/io";
import { TbUsersGroup } from "react-icons/tb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditCohortsModal.css";
import { useSelector, useDispatch } from "react-redux";
import {
  superAdminAction,
  userId,
  superAdminSelector,
} from "../../redux/reducers/superAdminReducer";

// Function to strip HTML tags
const stripHtmlTags = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const EditCohortsModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    program: "",
    name: "",
    poster: "",
    about: "",
    eligibility: "",
    industry: "",
    focusArea: "",
  });
  const [posterFile, setPosterFile] = useState(null); // New state for the file
  const [loading, setLoading] = useState(true);

  /** START CHANGE FOR FETCHING USER DATA **/
  const [user, setUser] = useState({ name: "", email: "", username: "" });
  const dispatch = useDispatch();
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://incubator.drishticps.org/api/programmanagers/me",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error("Failed to fetch user data. Status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (getUserId) {
      if (role == "Program Manager") {
        fetchUserData();
      } else if (role == "Super Admin") {
        navigate("/cards");
      } else {
        navigate("/admincards");
      }
    } else {
      navigate("/login");
    }
  }, []);
  /** END CHANGE FOR FETCHING USER DATA **/

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/cohorts/${id}`,
          { withCredentials: true }
        );
        const cohortData = response.data;
        console.log("*****:", cohortData);
        setFormData({
          program: cohortData.program || "",
          name: cohortData.name || "",
          // poster: cohortData.poster
          //   ? `https://incubator.drishticps.org/${cohortData.poster}`
          //   : "", // Show old image
          poster: cohortData.poster
            ? cohortData.poster.startsWith("http") // Check if the URL is already absolute
              ? cohortData.poster
              : `https://incubator.drishticps.org/api/cohorts/${cohortData.poster}`
            : "", // Show old image
          about: cohortData.about || "",
          eligibility: cohortData.eligibility || "",
          industry: cohortData.industry || "",
          focusArea: cohortData.focusArea || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching cohort data", err);
        setLoading(false);
      }
    };
    if (getUserId) {
      if (role == "Program Manager") {
        fetchCohort(); // Call the fetch function on component mount
      } else if (role == "Super Admin") {
        navigate("/cards");
      } else {
        navigate("/admincards");
      }
    } else {
      navigate("/login");
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleQuillChange = (value, name) => {
    if (formData[name] !== value) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    setPosterFile(file); // Store the file in state for submission
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        poster: reader.result, // Change poster image preview
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const strippedAbout = stripHtmlTags(formData.about);
    const strippedEligibility = stripHtmlTags(formData.eligibility);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("program", formData.program);
    formDataToSubmit.append("name", formData.name);
    formDataToSubmit.append("about", strippedAbout);
    formDataToSubmit.append("eligibility", strippedEligibility);
    formDataToSubmit.append("industry", formData.industry);
    formDataToSubmit.append("focusArea", formData.focusArea);

    if (posterFile) {
      formDataToSubmit.append("poster", posterFile); // Append file if it was changed
    }

    try {
      await axios.put(
        `https://incubator.drishticps.org/api/cohorts/${id}`,
        formDataToSubmit,
        { withCredentials: true },
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file upload
          },
        }
      );
      toast.success("Cohort updated successfully!");

      setTimeout(() => {
        navigate("/cohorts");
      }, 1500);
    } catch (err) {
      console.error("Error updating cohort", err);
    }
  };

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-editcohortsmodal">
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <aside className="sidebar-editcohortsmodal">
        <div className="logo-container-editcohortsmodal">
          <div className="logo-editcohortsmodal">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-editcohortsmodal"
            />
          </div>
        </div>
        <div className="nav-container-editcohortsmodal">
          <nav className="nav-editcohortsmodal">
            <ul>
              <li>
                <Link to="/homepage">
                  <IoHomeOutline className="nav-icon-editcohortsmodal" />{" "}
                  Homepage
                </Link>
              </li>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-editcohortsmodal" /> Create Query
                  Form
                </Link>
              </li>
              <li>
                <Link to="/cohorts">
                  <GrDocumentSound className="nav-icon-editcohortsmodal" />{" "}
                  Cohorts
                </Link>
              </li>
              <li>
                <Link to="/pipeline">
                  <IoIosLink className="nav-icon-editcohortsmodal" /> Pipeline
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye className="nav-icon-editcohortsmodal" /> Create
                  Evaluation Form
                </Link>
              </li>
              {/* <li>
                <Link to="/applications">
                  <TbUsersGroup className="nav-icon-editcohortsmodal" />{" "}
                  Applications
                </Link>
              </li> */}
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-editcohortsmodal">
        <header className="header-editcohortsmodal">
          <span className="founder-editcohortsmodal">All Forms</span>
          <div className="profile-section-editcohortsmodal">
            <div className="user-info-editcohortsmodal">
              <span className="user-initials-editcohortsmodal">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-editcohortsmodal">
                <span className="user-name-editcohortsmodal">
                  {user.username}
                </span>
                <br />
                <span className="user-email-editcohortsmodal">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              className="logout-button-editcohortsmodal"
              onClick={handleLogout} // Ensure this function is defined in your component
              style={{ marginLeft: "20px", padding: "8px" }} // Add any additional styling as needed
            >
              Logout
            </button>
          </div>
        </header>
        <section className="content-editcohortsmodal">
          <div className="top-editcohort-header">
            <h3 className="editcohort-header">Edit Cohort</h3>
            <button
              className="back-button-editcohorts"
              onClick={() => navigate("/cohorts")}
            >
              Back
            </button>
          </div>
          <form onSubmit={handleUpdate} className="form-editcohortsmodal">
            <label>Program </label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
            />
            <label>Name </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <label>Poster Preview</label>
            <img
              src={formData.poster}
              alt="Poster"
              className="poster-preview"
            />
            <button
              type="button"
              className="change-poster-button-editcohortsmodal"
              onClick={() => document.getElementById("posterInput").click()}
            >
              Change Poster
            </button>
            <input
              type="file"
              id="posterInput"
              style={{ display: "none" }}
              onChange={handlePosterChange}
            />
            <label>About</label>
            <ReactQuill
              value={formData.about}
              onChange={(value) => handleQuillChange(value, "about")}
            />
            <label>Eligibility</label>
            <ReactQuill
              value={formData.eligibility}
              onChange={(value) => handleQuillChange(value, "eligibility")}
            />
            <label>Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
            />
            <label>Focus Area</label>
            <input
              type="text"
              name="focusArea"
              value={formData.focusArea}
              onChange={handleChange}
            />
            <div className="button-group-editcohortsmodal">
              <button
                type="submit"
                className="update-button-editcohortsmodal"
                style={{ width: "10%" }}
              >
                Update
              </button>
              <button
                type="button"
                className="cancel-button-editcohortsmodal"
                onClick={() => navigate("/cohorts")}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditCohortsModal;
