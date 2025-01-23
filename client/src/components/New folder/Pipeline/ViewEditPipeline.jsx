import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import { GrDocumentSound } from "react-icons/gr";
import { TbUsersGroup } from "react-icons/tb";
import axios from "axios";
import AttachForm from "./AttachForm";
import ApplicationTitle from "./ApplicationTitle";
import ApplicationPoster from "./ApplicationPoster";
import ApplicationDescription from "./ApplicationDescription";
import ApplicationSupportingDocuments from "./ApplicationSupportingDocuments";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ViewEditPipeline.css";

const ViewEditPipeline = () => {
  const [pipeline, setPipeline] = useState({ title: "" });
  const [activeTab, setActiveTab] = useState("General");

  const [rounds, setRounds] = useState([
    {
      roundNumber: 1,
      type: "Public",
      link: "",
      startDate: new Date(), // Initialize with a date object
      endDate: new Date(), // Initialize with a date object
      status: "Not open yet",
    },
  ]);

  const [switchStates, setSwitchStates] = useState({
    currentlyActiveRound: false,
    addApplication: false, // Added state for add application switch
  });

  const [toggleStates, setToggleStates] = useState({
    onboardingEmail: false,
    onboardingSMS: false,
    submissionEmail: false,
    formSavedEmail: false,
    submissionSMS: false,
    autoMoveApplication: false,
    reminderEmails: false,
    autoPromote: false,
    allowMultiApplication: false,
    currentlyActiveRound: false,
    addApplication: false, // Added state for add application switch
  });

  const [showModal, setShowModal] = useState(false); // State to control the modal visibility
  const [selectedForm, setSelectedForm] = useState(null); // State to store the selected form
  const [description, setDescription] = useState(""); // Fix: Define description state
  // To track form updates without refreshing the page
  const [formUpdated, setFormUpdated] = useState(false);
  // To track document updates without refreshing the page
  const [documentsUpdated, setDocumentsUpdated] = useState(false);
  // To track poster updates without refreshing the page
  const [posterUpdated, setPosterUpdated] = useState(false);
  const [user, setUser] = useState({ username: "", email: "" }); // Define user state
  /** START CHANGE FOR MODAL HANDLING **/
  const [showApplicationTitleModal, setShowApplicationTitleModal] =
    useState(false);
  const [applicationtitle, setApplicationTitle] = useState("");
  const [poster, setPoster] = useState(""); // State to store the poster image
  const [showPosterModal, setShowPosterModal] = useState(false); // State to handle poster modal
  const [showDescriptionModal, setShowDescriptionModal] = useState(false); // State for modal
  /*** START CHANGE FOR Supporting Documents --- ***/
  const [supportingDocuments, setSupportingDocuments] = useState([]);
  const [showSupportingDocumentsModal, setShowSupportingDocumentsModal] =
    useState(false);
  /*** END CHANGE FOR Supporting Documents --- ***/

  /** START CHANGE FOR link generate and save  --- **/

  // State to store the active round's link
  const [activeLink, setActiveLink] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

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
        setUser(response.data); // Set the fetched user data to state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    // console.log("Pipeline ID:", id); // Debugging: Check if ID is coming correctly
    const fetchPipelineTitle = async () => {
      try {
        const response = await axios.get(`/api/pipelines/${id}`);
        setPipeline({ title: response.data.title });
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      }
    };
    fetchPipelineTitle();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleToggleChange = (event) => {
    const { name, checked } = event.target;
    setToggleStates({ ...toggleStates, [name]: checked });

    if (name === "addApplication" && checked) {
      setShowModal(true);
    }
  };

  /*** START CHANGE FOR link --- ***/

  const handleSwitchChange = async (event) => {
    const { name, checked } = event.target;
    setSwitchStates({ ...switchStates, [name]: checked });

    if (name === "currentlyActiveRound") {
      try {
        if (checked) {
          // Generate the link and activate the round in the backend
          const response = await axios.post(
            `https://incubator.drishticps.org/api/pipelines/${id}/activateRound`,
            {
              startDate: rounds[0].startDate, // Assuming roundNumber 1 is the active round
              endDate: rounds[0].endDate, // Assuming roundNumber 1 is the active round
            }
          );
          setActiveLink(response.data.link);
          setRounds((prevRounds) =>
            prevRounds.map((round) =>
              round.roundNumber === 1
                ? {
                    ...round,
                    link: response.data.link,
                    status: "Open",
                  }
                : round
            )
          );
        } else {
          // Clear the link if the switch is turned off
          setRounds((prevRounds) =>
            prevRounds.map((round) =>
              round.roundNumber === 1
                ? {
                    ...round,
                    link: "", // Empty link when switch is off
                    status: "Not open yet",
                  }
                : round
            )
          );
          setActiveLink(""); // Clear the active link state
        }
      } catch (error) {
        console.error("Error activating round:", error);
      }
    }
  };
  /** END CHANGE FOR link generate and save  --- **/

  /*** END CHANGE FOR link --- ***/
  const addNewRound = () => {
    setRounds([
      ...rounds,
      {
        roundNumber: rounds.length + 1,
        type: "Public",
        link: "",
        startDate: new Date(),
        endDate: new Date(),
        status: "Not open yet",
      },
    ]);
  };
  ////////for attach form
  // Added formUpdated dependency to re-fetch pipeline data on form update
  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        const response = await axios.get(`/api/pipelines/${id}`);
        setPipeline(response.data);
        if (response.data.forms) {
          const formResponse = await axios.get(
            `/api/forms/${response.data.forms}`
          );
          setSelectedForm(formResponse.data.title);
        }

        // Fetching the startDate and endDate from backend
        if (response.data.startDate && response.data.endDate) {
          setRounds((prevRounds) =>
            prevRounds.map((round) =>
              round.roundNumber === 1
                ? {
                    ...round,
                    startDate: new Date(response.data.startDate),
                    endDate: new Date(response.data.endDate),
                  }
                : round
            )
          );
        }

        // Load round data including link and status
        if (response.data.roundLink) {
          setRounds((prevRounds) =>
            prevRounds.map((round) =>
              round.roundNumber === 1
                ? {
                    ...round,
                    link: response.data.roundLink,
                    status: response.data.roundStatus,
                  }
                : round
            )
          );
          setSwitchStates({
            currentlyActiveRound: response.data.roundStatus === "Open",
          });
          setActiveLink(response.data.roundLink);
        }
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      }
    };
    fetchPipelineData();
  }, [id, formUpdated]);
  /*** START CHANGE FOR get application title --- ***/
  useEffect(() => {
    const fetchApplicationTitle = async () => {
      try {
        const response = await axios.get(`/api/pipelines/${id}`);
        setPipeline(response.data);
        setApplicationTitle(response.data.applicationTitle || ""); // Fetch and set the application title
      } catch (error) {
        console.error("Error fetching application title:", error);
      }
    };
    fetchApplicationTitle();
  }, [id]);
  /*** END CHANGE FOR get application title --- ***/

  const handleFormAttach = async (form) => {
    try {
      await axios.put(`/api/pipelines/${id}/forms`, { formId: form._id });
      setSelectedForm(form.title);
      setFormUpdated(!formUpdated); // Toggle the formUpdated state
      setShowModal(false);
    } catch (error) {
      console.error("Error attaching form:", error);
    }
  };

  /** START CHANGE FOR TITLE SUBMISSION HANDLING **/
  // Function to handle title submission from modal
  const handleApplicationTitleSubmit = (submittedApplicationTitle) => {
    setApplicationTitle(submittedApplicationTitle); // Set the submitted applicationtitle
    setShowApplicationTitleModal(false); // Close modal after submission
  };

  /** END CHANGE FOR TITLE HANDLING **/
  const handlePosterSubmit = (posterUrl) => {
    // console.log("Poster URL received in parent component:", posterUrl);
    setPoster(posterUrl); // Save the poster URL
    setPosterUpdated(!posterUpdated); // Trigger poster update state
  };
  const handleDescriptionSubmit = (submittedDescription) => {
    setDescription(submittedDescription); // Save the description
    setShowDescriptionModal(false); // Close the modal after submission
  };
  // file submission
  useEffect(() => {
    const fetchSupportingDocuments = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/pipelines/${id}/supportingDocuments`
        );
        setSupportingDocuments(response.data);
        setDocumentsUpdated(!documentsUpdated); // Toggle the documentsUpdated state
      } catch (error) {
        console.error("Error fetching supporting documents:", error);
      }
    };

    fetchSupportingDocuments();
  }, [id, documentsUpdated]);

  // /*** END CHANGE FOR Supporting Documents --- ***/
  const handleDocumentDelete = async (docId) => {
    try {
      const response = await axios.delete(
        `https://incubator.drishticps.org/api/pipelines/${id}/supportingDocuments/${docId}`
      );

      if (response.status === 200) {
        setSupportingDocuments(
          supportingDocuments.filter((doc) => doc._id !== docId)
        );
        setDocumentsUpdated(!documentsUpdated); // Toggle the documentsUpdated state
      } else {
        console.error("Failed to delete the document.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };
  // To  poster
  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/pipelines/${id}/poster`
        );
        setPoster(response.data[0].url ? response.data[0].url : "");
      } catch (error) {
        console.error("Error fetching poster data:", error);
      }
    };
    fetchPoster();
  }, [id, posterUpdated]);
  /*** START CHANGE FOR get application poster delete --- ***/
  // Function to handle poster deletion
  const handlePosterDelete = async () => {
    try {
      const response = await axios.delete(`/api/pipelines/${id}/poster`);
      if (response.status === 200) {
        setPoster(""); // Clear the poster URL from state
        setPosterUpdated(!posterUpdated); // Trigger state update
      } else {
        console.error("Failed to delete the poster.");
      }
    } catch (error) {
      console.error("Error deleting poster:", error);
    }
  };
  /*** END CHANGE FOR get application poster delete--- ***/

  const saveApplicationTitle = async (submittedApplicationTitle) => {
    try {
      let response;

      if (pipeline.applicationTitle) {
        // If the application title already exists, update it with a PUT request
        response = await axios.put(
          `https://incubator.drishticps.org/api/pipelines/${id}/applicationTitle`,
          {
            applicationTitle: submittedApplicationTitle,
          }
        );
      } else {
        // If no application title exists, create it with a POST request
        response = await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${id}/applicationTitle`,
          {
            applicationTitle: submittedApplicationTitle,
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        setApplicationTitle(submittedApplicationTitle); // Update state with the new title
        setShowApplicationTitleModal(false); // Close the modal after submission
      } else {
        console.error("Failed to save application title:", response.data.error);
      }
    } catch (error) {
      console.error("Error saving application title:", error);
    }
  };

  // Render the modal conditionally in the JSX return:

  // Inside ViewEditPipeline component

  <ApplicationTitle
    onClose={() => setShowApplicationTitleModal(false)}
    onSubmit={saveApplicationTitle}
    applicationtitle={applicationtitle}
    pipelineId={id} // Pass the correct ID here
  />;

  // for description
  /*** START CHANGE FOR get description --- ***/
  useEffect(() => {
    const fetchDescription = async () => {
      try {
        const response = await axios.get(`/api/pipelines/${id}`);
        setPipeline(response.data);
        setDescription(response.data.description || ""); // Fetch and set the description
      } catch (error) {
        console.error("Error fetching description:", error);
      }
    };
    fetchDescription();
  }, [id]);
  /*** END CHANGE FOR get description --- ***/

  const saveDescription = async (submittedDescription) => {
    try {
      let response;

      if (pipeline.description) {
        // If the description already exists, update it with a PUT request
        response = await axios.put(
          `https://incubator.drishticps.org/api/pipelines/${id}/description`,
          {
            description: submittedDescription,
          }
        );
      } else {
        // If no description exists, create it with a POST request
        response = await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${id}/description`,
          {
            description: submittedDescription,
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        setDescription(submittedDescription); // Update state with the new description
        setShowDescriptionModal(false); // Close the modal after submission
      } else {
        console.error("Failed to save description:", response.data.error);
      }
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };

  /*** START CHANGE CALENDAR --- ***/
  /*** START CHANGE FOR save(POST) and fetch(GET) date and time   --- ***/

  // Function to handle start date change and post to backend
  const handleStartDateChange = async (date, roundNumber) => {
    setRounds((prevRounds) =>
      prevRounds.map((round) =>
        round.roundNumber === roundNumber
          ? { ...round, startDate: date }
          : round
      )
    );

    // Update the backend with the new start date and trigger the status update
    try {
      const response = await axios.post(
        `https://incubator.drishticps.org/api/pipelines/${id}/activateRound`,
        {
          startDate: date,
          endDate: rounds[roundNumber - 1].endDate, // Pass the existing endDate
        }
      );
      setRounds((prevRounds) =>
        prevRounds.map((round) =>
          round.roundNumber === roundNumber
            ? { ...round, status: response.data.status }
            : round
        )
      );
    } catch (error) {
      console.error("Error updating start date:", error);
    }
  };

  // Function to handle end date change and post to backend
  const handleEndDateChange = async (date, roundNumber) => {
    setRounds((prevRounds) =>
      prevRounds.map((round) =>
        round.roundNumber === roundNumber ? { ...round, endDate: date } : round
      )
    );

    // Update the backend with the new end date and trigger the status update
    try {
      const response = await axios.post(
        `https://incubator.drishticps.org/api/pipelines/${id}/activateRound`,
        {
          startDate: rounds[roundNumber - 1].startDate, // Pass the existing startDate
          endDate: date,
        }
      );
      setRounds((prevRounds) =>
        prevRounds.map((round) =>
          round.roundNumber === roundNumber
            ? { ...round, status: response.data.status }
            : round
        )
      );
    } catch (error) {
      console.error("Error updating end date:", error);
    }
  };
  /*** END CHANGE FOR save(POST) and fetch(GET) date and time   --- ***/
  /*** END CHANGE FOR link status update and date change  --- ***/

  /*** END CHANGE CALENDAR --- ***/
  /** START CHANGE FOR link status fetching  --- **/
  useEffect(() => {
    // Fetch the link status from the backend and update the card status
    const fetchLinkStatus = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/pipelines/check-link/${id}`
        );
        const status = response.data.status;
        setRounds((prevRounds) =>
          prevRounds.map((round) =>
            round.roundNumber === 1
              ? {
                  ...round,
                  status: status === "Active" ? "Open" : "Expired",
                }
              : round
          )
        );
      } catch (error) {
        console.error("Error fetching link status:", error);
      }
    };

    if (switchStates.currentlyActiveRound) {
      fetchLinkStatus();
    }
  }, [id, switchStates.currentlyActiveRound]);
  /** END CHANGE FOR link status fetching  --- **/
  // Create a function to safely render HTML in JSX
  const createMarkup = (html) => {
    return { __html: html };
  };

  /** START CHANGE FOR TAB FUNCTIONALITY **/
  const renderTabContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <div className="tab-content-general-vieweditpipeline">
            <div className="general-option-vieweditpipeline">
              <h3 className="general-tab-input-heading-vieweditpipeline">
                Currently Active Round
              </h3>

              <label className="switch-vieweditpipeline">
                <input
                  type="checkbox"
                  name="currentlyActiveRound"
                  checked={switchStates.currentlyActiveRound}
                  onChange={handleSwitchChange}
                />
                <span className="slider-vieweditpipeline"></span>
              </label>
            </div>
            <p>
              Do you want to make this round as currently active round of the
              pipeline?
            </p>
          </div>
        );
      case "Application":
        return (
          <div className="tab-content-application-vieweditpipeline">
            <div className="application-option-vieweditpipeline">
              <h3 className="general-tab-input-heading-vieweditpipeline">
                Add Application
              </h3>
              <div className="switch-container">
                <label className="switch-vieweditpipeline">
                  <input
                    type="checkbox"
                    name="addApplication"
                    checked={toggleStates.addApplication}
                    onChange={handleToggleChange}
                  />
                  <span className="slider-vieweditpipeline"></span>
                </label>
              </div>
            </div>

            {selectedForm ? (
              <div className="form-template-container">
                <div className="form-template-text">
                  <p>Form Template Name: {pipeline.formTitle}</p>
                </div>
                <div className="change-button-container">
                  <button
                    className="change-button-vieweditpipeline"
                    onClick={() => setShowModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <p>Do you want to add an application form to this round?</p>
            )}
          </div>
        );
      case "Application Form Design":
        if (!selectedForm) {
          // First Condition: No form is added
          return (
            <div className="application-form-design-empty-applicationformdesign">
              <h3>Application form not available for this round</h3>
            </div>
          );
        } else {
          // Second Condition: Form is added
          return (
            <div className="application-form-design-applicationformdesign">
              <div className="form-field-applicationformdesign">
                <label className="general-tab-input-heading-vieweditpipeline">
                  Application Title
                </label>
                {applicationtitle ? (
                  <div className="title-display-container">
                    <span>{applicationtitle}</span>
                    <button
                      className="edit-button-applicationformdesign"
                      onClick={() => setShowApplicationTitleModal(true)}
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    className="add-button-applicationformdesign"
                    onClick={() => setShowApplicationTitleModal(true)}
                  >
                    Add
                  </button>
                )}
              </div>
              {/* Poster Section */}
              <div className="form-field-applicationformdesign">
                <label className="general-tab-input-heading-vieweditpipeline">
                  Poster
                </label>
                {poster ? (
                  <div>
                    {/* START CHANGE FOR MOVING POSTER BELOW LABEL */}
                    <div className="poster-container-applicationformdesignposter">
                      <div>
                        <img
                          src={poster}
                          alt="Uploaded Poster"
                          className="application-poster-image-vieweditpipeline"
                        />
                      </div>
                      <a
                        href={poster}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="poster-link-applicationformdesignposter"
                      >
                        {poster.split("/").pop()}
                      </a>

                      <button
                        className="delete-button-applicationformsupportingdocuments"
                        onClick={handlePosterDelete}
                      >
                        Delete
                      </button>
                    </div>
                    {/* END CHANGE FOR MOVING POSTER BELOW LABEL */}
                  </div>
                ) : (
                  <button
                    className="add-button-applicationformdesignposter"
                    onClick={() => setShowPosterModal(true)}
                  >
                    Add
                  </button>
                )}
              </div>
              <div className="form-field-applicationformdesigndescription">
                <label className="general-tab-input-heading-vieweditpipeline">
                  Description
                </label>
                <div className="description-container-applicationdesigndescription">
                  <div
                    className="description-text-container-applicationdesigndescription"
                    dangerouslySetInnerHTML={createMarkup(description)} // Render HTML safely
                  ></div>
                  <div className="description-button-container-applicationdesigndescription">
                    {description ? (
                      <button
                        className="edit-button-applicationformdesign-applicationformdesigndescription"
                        onClick={() => setShowDescriptionModal(true)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="add-button-applicationformdesign-applicationformdesigndescription"
                        onClick={() => setShowDescriptionModal(true)}
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="supporting-documents-form-field-applicationformdesign">
                <label className="general-tab-input-heading-vieweditpipeline">
                  Supporting Documents
                </label>
                {supportingDocuments.length > 0 ? (
                  <div className="supporting-documents-list-applicationformsupportingdocuments">
                    {supportingDocuments.map((doc, index) => (
                      <div
                        key={doc.id}
                        className="supporting-document-item-applicationformsupportingdocuments"
                      >
                        <span className="document-number-applicationformsupportingdocuments">
                          {index + 1}.
                        </span>
                        <a
                          href={doc.url || "#"} // Fallback to "#" if URL is not defined
                          target="_blank" // Open the document in a new tab
                          rel="noopener noreferrer"
                          className="document-name-applicationformsupportingdocuments"
                        >
                          {doc.name}
                        </a>
                        <button
                          className="delete-button-applicationformsupportingdocuments"
                          onClick={() => handleDocumentDelete(doc._id)} // Use doc._id instead of doc.id
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="pareagraph-no-document-applicationformsupportingdocuments">
                    No supporting documents added yet.
                  </p>
                )}
                <button
                  className="add-button-applicationformsupportingdocuments"
                  onClick={() => setShowSupportingDocumentsModal(true)}
                >
                  Add
                </button>
              </div>
            </div>
          );
        }

      default:
        return null;
    }
  };
  /** END CHANGE FOR TAB FUNCTIONALITY **/

  return (
    <div className="dashboard-homepage-vieweditpipeline">
      <aside className="sidebar-homepage-vieweditpipeline">
        <div className="logo-container-homepage-vieweditpipeline">
          <div className="logo-homepage-vieweditpipeline">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo-homepage-vieweditpipeline"
            />
          </div>
        </div>
        <div className="nav-container-homepage-vieweditpipeline">
          <nav className="nav-homepage-vieweditpipeline">
            <ul>
              <li>
                <Link to="/homepage">
                  <IoHomeOutline
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Homepage
                </Link>
              </li>
              <li>
                <Link to="/cohorts">
                  <GrDocumentSound
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Cohorts
                </Link>
              </li>
              <li>
                <Link to="/pipeline">
                  <IoIosLink
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Pipeline
                </Link>
              </li>
              <li>
                <Link to="/form">
                  <CgNotes
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Create Query Form
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Create Evaluation Form
                </Link>
              </li>
              <li>
                <Link to="/applications">
                  <TbUsersGroup
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Applications
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="main-content-homepage-vieweditpipeline">
        <header className="header-homepage-vieweditpipeline">
          <span className="founder-homepage-vieweditpipeline">All Forms</span>
          <div className="profile-section-homepage-vieweditpipeline">
            <div className="user-info-homepage-vieweditpipeline">
              <span className="user-initials-homepage-vieweditpipeline">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-homepage-vieweditpipeline">
                <span className="user-name-homepage-vieweditpipeline">
                  {user.username}
                </span>
                <br />
                <span className="user-email-homepage-vieweditpipeline">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              className="logout-button-homepage-vieweditpipeline"
              onClick={handleLogout}
              style={{ marginLeft: "20px", padding: "8px" }}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="content-homepage-vieweditpipeline">
          <div className="pipeline-header-vieweditpipeline">
            <h3>{pipeline.title}</h3>
            <button
              className="back-button-vieweditpipeline"
              onClick={() => navigate("/pipeline")}
            >
              Back
            </button>
          </div>

          <div className="rounds-container">
            {rounds.map((round, index) => (
              <div className="round-card" key={index}>
                <h6 className="round-card-heading">
                  Round {round.roundNumber}
                </h6>
                <p className="date-label-vieweditpipeline">
                  Type :&nbsp; {round.type}
                </p>
                {round.link && (
                  <p className="date-label-vieweditpipeline">
                    Link:{" "}
                    <a
                      href={round.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="round-link-vieweditpipeline"
                    >
                      {round.link}
                    </a>
                  </p>
                )}
                <p className="date-label-vieweditpipeline">
                  Starts:
                  <DatePicker
                    selected={round.startDate}
                    onChange={(date) =>
                      handleStartDateChange(date, round.roundNumber)
                    }
                    showTimeSelect
                    dateFormat="dd MMM yyyy h:mm aa"
                    className="date-picker-vieweditpipeline"
                  />
                </p>
                <p className="date-label-vieweditpipeline">
                  Ends :
                  <DatePicker
                    selected={round.endDate}
                    onChange={(date) =>
                      handleEndDateChange(date, round.roundNumber)
                    }
                    showTimeSelect
                    dateFormat="dd MMM yyyy h:mm aa"
                    className="date-picker-vieweditpipeline"
                  />
                </p>
                <p className="date-label-vieweditpipeline">
                  Status: {round.status}
                </p>
                {index === rounds.length - 1 && (
                  <button
                    className="add-round-button-vieweditpipeline"
                    onClick={addNewRound}
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pipeline-tabs-vieweditpipeline">
            <button
              className={`tab-button-vieweditpipeline ${
                activeTab === "General" ? "active" : ""
              }`}
              onClick={() => setActiveTab("General")}
            >
              General
            </button>
            <button
              className={`tab-button-vieweditpipeline ${
                activeTab === "Application" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Application")}
            >
              Application
            </button>
            <button
              className={`tab-button-vieweditpipeline ${
                activeTab === "Application Form Design" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Application Form Design")}
            >
              Application Form Design
            </button>
          </div>

          <div className="tab-content">{renderTabContent()}</div>
        </section>
        {showModal && (
          <AttachForm
            onClose={() => setShowModal(false)}
            onAttach={handleFormAttach}
          />
        )}

        {showApplicationTitleModal && (
          <ApplicationTitle
            onClose={() => setShowApplicationTitleModal(false)}
            onSubmit={saveApplicationTitle}
            applicationtitle={applicationtitle}
            pipelineId={id} // Passing the correct pipeline ID here
          />
        )}
        {showPosterModal && (
          <ApplicationPoster
            onClose={() => setShowPosterModal(false)}
            onSubmit={handlePosterSubmit}
            existingPoster={poster}
            pipelineId={id} // Passing the correct pipeline ID here
          />
        )}
        {/* Conditionally render the ApplicationDescription modal */}

        {showDescriptionModal && (
          <ApplicationDescription
            onClose={() => setShowDescriptionModal(false)}
            onSubmit={saveDescription}
            description={description}
            pipelineId={id} // Passing the correct pipeline ID here
          />
        )}

        {showSupportingDocumentsModal && (
          <ApplicationSupportingDocuments
            onClose={() => setShowSupportingDocumentsModal(false)}
            onSubmit={(data) => console.log("Document uploaded:", data)}
            pipelineId={id} // Passing the correct pipeline ID here
          />
        )}
      </main>
    </div>
  );
};

export default ViewEditPipeline;
