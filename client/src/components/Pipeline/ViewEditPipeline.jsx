import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import { GrDocumentSound } from "react-icons/gr";
import axios from "axios";
import AttachForm from "./AttachForm";
import ApplicationTitle from "./ApplicationTitle";
import ApplicationPoster from "./ApplicationPoster";
import ApplicationDescription from "./ApplicationDescription";
import ApplicationSupportingDocuments from "./ApplicationSupportingDocuments";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ViewEditPipeline.css";
import { useSelector, useDispatch } from "react-redux";
import {
  superAdminAction,
  userId,
  superAdminSelector,
} from "../../redux/reducers/superAdminReducer";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
const ViewEditPipeline = () => {
  const [pipeline, setPipeline] = useState({ title: "" });
  const [activeTab, setActiveTab] = useState("General");

  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(1); // Set default to Round 1

  const [switchStates, setSwitchStates] = useState({
    currentlyActiveRound: false,
    addApplication: false, // Added state for add application switch
    showLastDateToApply: false, // New toggle state for controlling date visibility
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
  const dispatch = useDispatch();
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);
  const { id } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://incubator.drishticps.org/api/programmanagers/me",
          {
            withCredentials: true,
          }
        );
        setUser(response.data); // Set the fetched user data to state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (getUserId) {
      if (role == "Program Manager") {
        fetchUserData();
      } else if (role == "Admin") {
        navigate("/admincards");
      } else {
        navigate("/cards");
      }
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    // console.log("Pipeline ID:", id); // Debugging: Check if ID is coming correctly
    const fetchPipelineTitle = async () => {
      try {
        const response = await axios.get(`/api/pipelines/${id}`, {
          withCredentials: true,
        });
        setPipeline({ title: response.data.title });
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      }
    };
    fetchPipelineTitle();
  }, [id]);

  const handleLogout = async () => {
    //  localStorage.removeItem("token");
    const response = await axios.post(
      `https://incubator.drishticps.org/api/logout/programManager/${user._id}`,
      {},
      { withCredentials: true }
    );
    setUser(null);
    dispatch(superAdminAction.logoutUser());
    navigate("/login");
  };

  const handleToggleChange = async (event) => {
    const { name, checked } = event.target;
    setToggleStates({ ...toggleStates, [name]: checked });

    if (name === "addApplication") {
      setShowModal(checked); // Show modal if toggled on

      try {
        await axios.put(
          `/api/pipelines/${id}/rounds/${selectedRound}/addApplication`,
          { addApplication: checked },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error updating addApplication toggle:", error);
      }
    }
  };

  /*** START CHANGE FOR link --- ***/

  const handleSwitchChange = async (event) => {
    const { name, checked } = event.target;
    setSwitchStates({ ...switchStates, [name]: checked });

    if (name === "currentlyActiveRound") {
      try {
        const activeRound = rounds.find((r) => r.roundNumber === selectedRound); // Identify the selected round
        if (checked) {
          // Generate the link and activate the round
          const response = await axios.post(
            `https://incubator.drishticps.org/api/pipelines/${id}/activateRound`,
            {
              // startDate: activeRound.startDate,
              // endDate: activeRound.endDate,
              roundNumber: selectedRound,
              startDate: activeRound.startDate,
              endDate: activeRound.endDate,
              isActive: true, // Set isActive based on the toggle
              showLastDateToApply: switchStates.showLastDateToApply, // Keep current showLastDateToApply state
            },
            { withCredentials: true }
          );

          setActiveLink(response.data.link);
          setRounds((prevRounds) =>
            prevRounds.map((round) =>
              round.roundNumber === selectedRound
                ? { ...round, link: response.data.link, status: "Open" }
                : round
            )
          );
        } else {
          // Deactivate the round if unchecked
          const response = await axios.post(
            `https://incubator.drishticps.org/api/pipelines/${id}/activateRound`,
            {
              roundNumber: selectedRound,
              startDate: activeRound.startDate,
              endDate: activeRound.endDate,
              isActive: false,
              showLastDateToApply: switchStates.showLastDateToApply,
            },
            { withCredentials: true }
          );

          setRounds((prevRounds) =>
            prevRounds.map((round) =>
              round.roundNumber === selectedRound
                ? { ...round, link: "", status: "Not open yet" }
                : round
            )
          );
          setActiveLink(""); // Clear the active link state
        }
      } catch (error) {
        console.error("Error activating round:", error);
      }
    }
    /** START CHANGE FOR save last date to apply--- **/
    if (name === "showLastDateToApply") {
      try {
        await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${id}/activateRound`,
          {
            roundNumber: selectedRound,
            startDate: rounds.find((r) => r.roundNumber === selectedRound)
              ?.startDate,
            endDate: rounds.find((r) => r.roundNumber === selectedRound)
              ?.endDate,
            isActive: switchStates.currentlyActiveRound, // Maintain currentlyActiveRound state
            showLastDateToApply: checked, // Update showLastDateToApply based on the toggle
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error updating last date toggle:", error);
      }
    }
    /** END CHANGE FOR save last date to apply--- **/
  };

  /** END CHANGE FOR link generate and save  --- **/
  /** START CHANGE FOR show last date to apply --- **/
  /** START CHANGE FOR show last date to apply toggle --- **/
  /*** START CHANGE FOR show last date to apply toggle --- ***/
  const renderLastDateToApply = () => {
    const selectedRoundEndDate = rounds.find(
      (r) => r.roundNumber === selectedRound
    )?.endDate;

    return (
      <div className="last-date-to-apply-vieweditpipeline">
        <p>
          <strong>Last date to apply:</strong> {/* Always show the label */}
          {switchStates.showLastDateToApply && selectedRoundEndDate ? ( // Ensure endDate is available and valid
            <>
              {" "}
              {new Date(selectedRoundEndDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {" at "}
              {new Date(selectedRoundEndDate).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </>
          ) : (
            " Not available"
          )}
        </p>
      </div>
    );
  };
  /*** END CHANGE FOR show last date to apply toggle --- ***/

  /** END CHANGE FOR show last date to apply toggle --- **/

  /** END CHANGE FOR show last date to apply --- **/
  /*** END CHANGE FOR link --- ***/
  /*** START CHANGE FOR dynamically creating new rounds and saving them--- ***/
  const addNewRound = async () => {
    const newRound = {
      roundNumber: rounds.length + 1,
      type: "Private",
      link: "",
      startDate: null, // Start as null to avoid displaying initially
      endDate: null, // End as null to avoid displaying initially
      status: "Not open yet",
      general: { isActive: false, showLastDateToApply: false },
      application: { addApplication: false, formId: null, formTitle: "" },
      applicationFormDesign: {
        applicationTitle: "",
        posterUrl: "",
        description: "",
        supportingDocuments: [],
      },
    };

    try {
      const response = await axios.post(
        `/api/pipelines/${id}/rounds`,
        newRound,
        {
          withCredentials: true,
        }
      );
      setRounds((prevRounds) => [...prevRounds, response.data]);
    } catch (error) {
      console.error("Error adding new round:", error);
    }
  };
  /*** END CHANGE FOR dynamically creating new rounds and saving them--- ***/
  ////////for attach form

  useEffect(() => {
    let isMounted = true; // Flag to prevent updates after component is unmounted

    const fetchPipelineData = async () => {
      if (!isMounted) return; // Exit early if component is unmounted
      console.log("Starting fetchPipelineData with ID:", id); // Debugging statement to track function execution

      try {
        const response = await axios.get(`/api/pipelines/${id}`, {
          withCredentials: true,
        });
        if (!isMounted) return; // Exit early if component is unmounted

        console.log("Fetched pipeline data from backend:", response.data); // Log the response data

        setPipeline(response.data);

        // Set rounds data from the backend response or create a default round if empty
        // Debugging rounds from the backend response
        if (response.data.rounds && Array.isArray(response.data.rounds)) {
          console.log("Backend rounds data:", response.data.rounds);

          // Check if Round 1 exists in the backend response
          const hasRound1 = response.data.rounds.find(
            (round) => round.roundNumber === 1
          );

          if (!hasRound1) {
            console.log("Round 1 missing, initializing with default Round 1");

            // Add default Round 1 to the rounds array

            const defaultRound1 = {
              roundNumber: 1,
              type: "Public",
              link: "",
              startDate: new Date(),
              endDate: new Date(),
              status: "Not open yet",
              general: { isActive: false, showLastDateToApply: false },
              application: {
                addApplication: false,
                formId: null,
                formTitle: "",
              },
              applicationFormDesign: {
                applicationTitle: "",
                posterUrl: "",
                description: "",
                supportingDocuments: [],
              },
            };

            const updatedRounds = [defaultRound1, ...response.data.rounds];
            setRounds(updatedRounds);

            // Save updated rounds to the backend
            await axios.put(
              `/api/pipelines/${id}`,
              { rounds: updatedRounds },
              { withCredentials: true }
            );
            console.log(
              "Default Round 1 saved to backend along with existing rounds"
            );
          } else {
            // Use the existing rounds if Round 1 is already present
            setRounds(response.data.rounds);
            console.log(
              "Using existing rounds from backend:",
              response.data.rounds
            );

            // Set the initial values for the switch states based on the first round's data
            const selectedRound = response.data.rounds.find(
              (round) => round.roundNumber === 1
            );
            if (selectedRound) {
              // Log the general field to verify the value of isActive
              console.log(
                "Selected Round 1 general data:",
                selectedRound.general
              );
              setSwitchStates({
                currentlyActiveRound: selectedRound.general.isActive,
                showLastDateToApply: selectedRound.general.showLastDateToApply,
              });
              console.log("Switch states set for Round 1:", {
                currentlyActiveRound: selectedRound.general.isActive,
                showLastDateToApply: selectedRound.general.showLastDateToApply,
              });
            }
          }
        } else {
          console.warn("No rounds array received from backend.");
        }

        // Fetch form title if form data exists
        if (response.data.forms) {
          const formResponse = await axios.get(
            `/api/forms/${response.data.forms}`,
            { withCredentials: true }
          );
          if (!isMounted) return; // Exit early if component is unmounted
          setSelectedForm(formResponse.data.title);

          console.log("Form title set to:", formResponse.data.title);
        }

        // Fetching the startDate and endDate from backend
        if (response.data.startDate && response.data.endDate) {
          console.log(
            "Setting startDate and endDate for Round 1:",
            response.data.startDate,
            response.data.endDate
          );

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
          console.log(
            "Updating Round 1 link and status:",
            response.data.roundLink,
            response.data.roundStatus
          );

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
          // setSwitchStates({
          //   currentlyActiveRound: response.data.roundStatus === "Open",
          //   showLastDateToApply: response.data.showLastDateToApply, // Fetch last date toggle status
          // });
          setActiveLink(response.data.roundLink);

          console.log("Active link set:", response.data.roundLink);
        }
        /*** START CHANGE FOR addApplication toggle persistence --- ***/
        // Fetch the addApplication toggle state for the selected round (Round 1 assumed here)
        const selectedRound = response.data.rounds.find(
          (round) => round.roundNumber === 1
        );
        if (selectedRound?.application?.addApplication !== undefined) {
          setToggleStates((prev) => ({
            ...prev,
            addApplication: selectedRound.application.addApplication,
          }));
          console.log(
            "addApplication toggle state set to:",
            selectedRound.application.addApplication
          );
        } else {
          console.warn("addApplication field is missing for Round 1.");
        }

        // Check and log form title for the selected round (Round 1 assumed here)
        if (selectedRound?.application?.formTitle) {
          setSelectedForm(selectedRound.application.formTitle);
          console.log(
            "Selected form title set:",
            selectedRound.application.formTitle
          );
        } else {
          console.warn("Selected round has no form title.");
        }
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      }
    };

    fetchPipelineData();

    return () => {
      isMounted = false; // Cleanup flag to prevent state updates after unmount
    };
  }, [id, formUpdated]);

  /*** START CHANGE FOR get application title --- ***/

  /*** END CHANGE FOR get application title --- ***/
  useEffect(() => {
    const fetchApplicationTitle = async () => {
      try {
        const response = await axios.get(`/api/pipelines/${id}`, {
          withCredentials: true,
        });

        // **START CHANGE FOR round-specific application title ---**
        const selectedRoundData = response.data.rounds.find(
          (round) => round.roundNumber === selectedRound
        );
        if (selectedRoundData && selectedRoundData.applicationFormDesign) {
          setApplicationTitle(
            selectedRoundData.applicationFormDesign.applicationTitle || ""
          );
        } else {
          setApplicationTitle("");
        }
        // **END CHANGE FOR round-specific application title ---**
      } catch (error) {
        console.error("Error fetching application title:", error);
      }
    };
    fetchApplicationTitle();
  }, [id, selectedRound, applicationtitle]);

  const handleFormAttach = async (form) => {
    try {
      await axios.put(
        `/api/pipelines/${id}/rounds/${selectedRound}/forms`,
        { formId: form._id },
        { withCredentials: true }
      );
      setSelectedForm(form.title); // Update the selected form's title for display
      setFormUpdated(!formUpdated); // Toggle update to refresh view
      setShowModal(false); // Close modal
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
  //This function is not included.
  const handleDescriptionSubmit = (submittedDescription) => {
    setDescription(submittedDescription); // Save the description
    setShowDescriptionModal(false); // Close the modal after submission
  };
  // file submission
  /*** START CHANGE FOR INSTANT DOCUMENT LIST UPDATE ***/
  useEffect(() => {
    const fetchSupportingDocuments = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/pipelines/${id}/rounds/${selectedRound}/supportingDocuments`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          // Directly update the supportingDocuments array
          setSupportingDocuments(response.data);

          // Also update rounds to keep data synchronized
          setRounds((prevRounds) =>
            prevRounds.map((round) =>
              round.roundNumber === selectedRound
                ? {
                    ...round,
                    applicationFormDesign: {
                      ...round.applicationFormDesign,
                      supportingDocuments: response.data,
                    },
                  }
                : round
            )
          );
        } else {
          console.warn("Unexpected response status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching supporting documents:", error);
      }
    };

    fetchSupportingDocuments();
  }, [id, selectedRound, documentsUpdated]); // Added documentsUpdated as dependency
  /*** END CHANGE FOR INSTANT DOCUMENT LIST UPDATE ***/

  /*** START CHANGE - Document Add handling ***/
  /*** START CHANGE FOR INSTANT DOCUMENT UPDATE ***/
  const handleDocumentAdd = async (data) => {
    try {
      // Update the supportingDocuments state immediately
      setSupportingDocuments((prevDocs) => [...prevDocs, data]); // Directly add the new document

      // Update rounds state to reflect the new document in the selected round
      setRounds((prevRounds) =>
        prevRounds.map((round) =>
          round.roundNumber === selectedRound
            ? {
                ...round,
                applicationFormDesign: {
                  ...round.applicationFormDesign,
                  supportingDocuments: [
                    ...round.applicationFormDesign.supportingDocuments,
                    data,
                  ],
                },
              }
            : round
        )
      );

      setDocumentsUpdated(!documentsUpdated); // Trigger re-render to update instantly
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };
  /*** END CHANGE FOR INSTANT DOCUMENT UPDATE ***/

  /*** START CHANGE FOR INSTANT DOCUMENT DELETE UPDATE ***/
  const handleDocumentDelete = async (docId) => {
    try {
      const response = await axios.delete(
        `https://incubator.drishticps.org/api/pipelines/${id}/rounds/${selectedRound}/supportingDocuments/${docId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Update the supportingDocuments state to remove the deleted document
        setSupportingDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc._id !== docId)
        );

        // Also update rounds state to reflect changes in the selected round's documents
        setRounds((prevRounds) =>
          prevRounds.map((round) =>
            round.roundNumber === selectedRound
              ? {
                  ...round,
                  applicationFormDesign: {
                    ...round.applicationFormDesign,
                    supportingDocuments:
                      round.applicationFormDesign.supportingDocuments.filter(
                        (doc) => doc._id !== docId
                      ),
                  },
                }
              : round
          )
        );

        setDocumentsUpdated(!documentsUpdated); // Trigger re-render
      } else {
        console.error("Failed to delete the document.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };
  /*** END CHANGE FOR INSTANT DOCUMENT DELETE UPDATE ***/

  /*** END CHANGE FOR Round-specific Supporting Document Deletion ***/

  // // To  poster
  // Fetch poster for the selected round
  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/pipelines/${id}/rounds/${selectedRound}/poster`,
          { withCredentials: true }
        );
        setPoster(response.data.posterUrl || "");
      } catch (error) {
        console.error("Error fetching poster:", error);
      }
    };
    fetchPoster();
  }, [id, selectedRound, posterUpdated]);

  // Delete poster for the selected round
  const handlePosterDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/pipelines/${id}/rounds/${selectedRound}/poster`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setPoster(""); // Clear the state
        setPosterUpdated(!posterUpdated); // Trigger update
      }
    } catch (error) {
      console.error("Error deleting poster:", error);
    }
  };

  const saveApplicationTitle = async (submittedApplicationTitle) => {
    try {
      let response;

      if (pipeline.applicationTitle) {
        // If the application title already exists, update it with a PUT request
        response = await axios.put(
          `https://incubator.drishticps.org/api/pipelines/${id}/applicationTitle`,
          {
            applicationTitle: submittedApplicationTitle,
          },
          {
            withCredentials: true,
          }
        );
      } else {
        // If no application title exists, create it with a POST request
        response = await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${id}/applicationTitle`,
          {
            applicationTitle: submittedApplicationTitle,
          },
          {
            withCredentials: true,
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

  // Inside ViewEditPipeline component

  <ApplicationTitle
    onClose={() => setShowApplicationTitleModal(false)}
    onSubmit={saveApplicationTitle}
    applicationtitle={applicationtitle}
    pipelineId={id} // Pass the correct ID here
    roundNumber={selectedRound} // Round number
  />;

  // for description
  /*** START CHANGE FOR get description --- ***/
  /*** START CHANGE FOR fetching and displaying Description --- ***/
  useEffect(() => {
    const fetchDescription = async () => {
      try {
        const response = await axios.get(`/api/pipelines/${id}`, {
          withCredentials: true,
        });
        console.log("Fetchin desc******", response);
        const selectedRoundData = response.data.rounds.find(
          (round) => round.roundNumber === selectedRound
        );
        console.log(
          "Selected round:",
          selectedRoundData.applicationFormDesign.description
        );
        if (selectedRoundData && selectedRoundData.applicationFormDesign) {
          setDescription(
            selectedRoundData.applicationFormDesign.description || ""
          );
          console.log("description:", description);
        } else {
          setDescription("");
        }
      } catch (error) {
        console.error("Error fetching description:", error);
      }
    };
    fetchDescription();
  }, [id, selectedRound]);
  /*** END CHANGE FOR fetching and displaying Description --- ***/
  /*** END CHANGE FOR get description --- ***/

  /*** START CHANGE FOR saving Description --- ***/
  const saveDescription = async (submittedDescription) => {
    try {
      let response;
      if (description) {
        // Update the existing description
        response = await axios.put(
          `https://incubator.drishticps.org/api/pipelines/${id}/rounds/${selectedRound}/description`,
          { description: submittedDescription },
          { withCredentials: true }
        );
      } else {
        // Create a new description
        response = await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${id}/rounds/${selectedRound}/description`,
          { description: submittedDescription },
          { withCredentials: true }
        );
      }
      if (response.status === 200 || response.status === 201) {
        setDescription(submittedDescription); // Update the local description state
        setRounds((prevRounds) =>
          prevRounds.map((round) =>
            round.roundNumber === selectedRound
              ? {
                  ...round,
                  applicationFormDesign: {
                    ...round.applicationFormDesign,
                    description: submittedDescription,
                  },
                }
              : round
          )
        ); // Update rounds to trigger re-render

        setShowDescriptionModal(false);
      } else {
        console.error("Failed to save description:", response.data.error);
      }
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };
  /*** END CHANGE FOR saving Description --- ***/
  /*** START CHANGE CALENDAR --- ***/
  /*** START CHANGE FOR save(POST) and fetch(GET) date and time   --- ***/
  // // Function to handle start date change and post to backend
  const handleStartDateChange = async (date, roundNumber) => {
    setRounds((prevRounds) =>
      prevRounds.map((round) =>
        round.roundNumber === roundNumber
          ? { ...round, startDate: date }
          : round
      )
    );

    try {
      await axios.put(
        `/api/pipelines/${id}/rounds/${roundNumber}/updateDates`,
        {
          startDate: date,
          endDate: rounds.find((r) => r.roundNumber === roundNumber)?.endDate,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating start date:", error);
    }
  };
  // *** END CHANGE FOR updating start date --- ***
  // Function to handle end date change and post to backend
  const handleEndDateChange = async (date, roundNumber) => {
    setRounds((prevRounds) =>
      prevRounds.map((round) =>
        round.roundNumber === roundNumber ? { ...round, endDate: date } : round
      )
    );

    try {
      await axios.put(
        `/api/pipelines/${id}/rounds/${roundNumber}/updateDates`,
        {
          startDate: rounds.find((r) => r.roundNumber === roundNumber)
            ?.startDate,
          endDate: date,
        },
        { withCredentials: true }
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
          `https://incubator.drishticps.org/api/pipelines/check-link/${id}`,
          { withCredentials: true }
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
  // Memoize selected round data to prevent unnecessary calculations
  const handleRoundClick = (roundNumber) => {
    setSelectedRound(roundNumber);
    setActiveTab("General");

    /*** START CHANGE FOR initializing selected round data ***/
    const selectedRoundData = rounds.find(
      (round) => round.roundNumber === roundNumber
    );

    if (selectedRoundData) {
      // Update the relevant states based on the selected round's data
      setSwitchStates({
        currentlyActiveRound: selectedRoundData.general?.isActive || false,
        showLastDateToApply:
          selectedRoundData.general?.showLastDateToApply || false,
      });

      setToggleStates({
        addApplication: selectedRoundData.application?.addApplication || false,
      });
      setSelectedForm(selectedRoundData.application?.formTitle || ""); // Show form title for selected round only

      // Set tab-specific data for the selected round
      setApplicationTitle(
        selectedRoundData.applicationFormDesign?.applicationTitle || ""
      );
      setPoster(selectedRoundData.applicationFormDesign?.posterUrl || "");
      setDescription(
        selectedRoundData.applicationFormDesign?.description || ""
      );
      setSupportingDocuments(
        selectedRoundData.applicationFormDesign?.supportingDocuments || []
      );
    }
    /*** END CHANGE FOR initializing selected round data ***/
  };

  /*** START CHANGE FOR ROUND DELETE HANDLING AND TAB DATA RETENTION ***/
  const handleRoundDelete = (roundNumber) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui-vieweditpipeline">
            <h1>Confirm to Delete</h1>
            <p>
              All collected data will be lost for this round. Are you sure you
              want to delete this Round?
            </p>
            <div className="button-group-vieweditpipeline">
              <button
                className="delete-button-vieweditpipeline"
                onClick={async () => {
                  try {
                    const response = await axios.delete(
                      `/api/pipelines/${id}/rounds/${roundNumber}`,
                      { withCredentials: true }
                    );

                    if (response.status === 200) {
                      // Update the rounds after deletion
                      setRounds((prevRounds) => {
                        const updatedRounds = prevRounds.filter(
                          (r) => r.roundNumber !== roundNumber
                        );

                        // Re-select the first round after deletion
                        if (updatedRounds.length > 0) {
                          const firstRoundNumber = updatedRounds[0].roundNumber;
                          setSelectedRound(firstRoundNumber);
                          handleRoundClick(firstRoundNumber); // Ensure data loads for the first round
                        } else {
                          setSelectedRound(null); // No rounds left, clear selectedRound
                        }

                        return updatedRounds;
                      });
                    }
                  } catch (error) {
                    console.error("Error deleting round:", error);
                  }
                  onClose();
                }}
              >
                Yes, Delete it!
              </button>
              <button
                className="cancel-button-normal-vieweditpipeline"
                onClick={onClose}
              >
                No
              </button>
            </div>
          </div>
        );
      },
      overlayClassName: "custom-overlay-vieweditpipeline",
    });
  };
  /*** END CHANGE FOR ROUND DELETE HANDLING AND TAB DATA RETENTION ***/

  /*** END CHANGE FOR delete round functionality ***/

  const selectedRoundData = useMemo(
    () => rounds.find((round) => round.roundNumber === selectedRound),
    [rounds, selectedRound]
  );
  const renderTabContent = useMemo(() => {
    console.log("*************12********************");
    if (!selectedRoundData) return null;

    // if (selectedRound === null) return null; // Show tabs only if a round is selected
    const round = rounds.find((r) => r.roundNumber === selectedRound);
    if (!round) return null;

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
            <div className="general-option-vieweditpipeline">
              <h3 className="general-tab-input-heading-vieweditpipeline">
                Show Last Date to Apply?
              </h3>
              <label className="switch-vieweditpipeline">
                <input
                  type="checkbox"
                  name="showLastDateToApply"
                  checked={switchStates.showLastDateToApply}
                  onChange={handleSwitchChange}
                />
                <span className="slider-vieweditpipeline"></span>
              </label>
            </div>

            {renderLastDateToApply(round)}
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
                  {/* <p>Form Template Name: {pipeline.formTitle}</p> */}
                  {/* <p>Form Template Name: {selectedRoundData.application.formTitle}</p> */}
                  <p>Form Template Name: {selectedForm}</p>{" "}
                  {/* Display selectedForm */}
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
                      (console.log("desc", description),
                      (
                        <button
                          className="edit-button-applicationformdesign-applicationformdesigndescription"
                          onClick={() => setShowDescriptionModal(true)}
                        >
                          Edit
                        </button>
                      ))
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
  }, [activeTab, selectedRoundData, switchStates, applicationtitle, poster]);
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
                <Link to="/form">
                  <CgNotes
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Create Query Form
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
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Create Evaluation Form
                </Link>
              </li>
              {/* <li>
                <Link to="/applications">
                  <TbUsersGroup
                    className="nav-icon-homepage-vieweditpipeline"
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Applications
                </Link>
              </li> */}
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
              <div
                className="round-card"
                key={round.roundNumber}
                onClick={() => handleRoundClick(round.roundNumber)}
              >
                <h6 className="round-card-heading">
                  Round {round.roundNumber}
                </h6>
                <p className="date-label-vieweditpipeline">
                  Type : {round.type}
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
                    selected={
                      round.startDate ? new Date(round.startDate) : null
                    }
                    onChange={(date) =>
                      handleStartDateChange(date, round.roundNumber)
                    }
                    showTimeSelect
                    dateFormat="dd MMM yyyy h:mm aa"
                    className="date-picker-vieweditpipeline"
                    placeholderText="Select Start Date"
                  />
                </p>
                <p className="date-label-vieweditpipeline">
                  Ends :
                  <DatePicker
                    selected={round.endDate ? new Date(round.endDate) : null}
                    onChange={(date) =>
                      handleEndDateChange(date, round.roundNumber)
                    }
                    showTimeSelect
                    dateFormat="dd MMM yyyy h:mm aa"
                    className="date-picker-vieweditpipeline"
                    placeholderText="Select End Date"
                  />
                </p>
                <p className="date-label-vieweditpipeline">
                  Status: {round.status}
                </p>
                {round.roundNumber !== 1 && (
                  <button
                    className="delete-round-button-vieweditpipeline"
                    onClick={() => handleRoundDelete(round.roundNumber)}
                  >
                    Delete Round
                  </button>
                )}
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

          {/* Display Tabs Below Rounds */}
          {selectedRound && (
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
          )}
          {/* <div className="tab-content">{renderTabContent()}</div> */}
          <div className="tab-content">{renderTabContent}</div>
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
            roundNumber={selectedRound} // Ensure selectedRound is passed as roundNumber
          />
        )}
        {showPosterModal && (
          <ApplicationPoster
            onClose={() => setShowPosterModal(false)}
            onSubmit={handlePosterSubmit}
            existingPoster={poster}
            pipelineId={id} // Passing the correct pipeline ID here
            roundNumber={selectedRound} // Pass the selected round number here
          />
        )}
        {/* Conditionally render the ApplicationDescription modal */}

        {showDescriptionModal && (
          <ApplicationDescription
            onClose={() => setShowDescriptionModal(false)}
            onSubmit={saveDescription}
            description={description}
            pipelineId={id} // Passing the correct pipeline ID here
            selectedRound={selectedRound}
          />
        )}

        {showSupportingDocumentsModal && (
          <ApplicationSupportingDocuments
            onClose={() => setShowSupportingDocumentsModal(false)}
            // onSubmit={(data) => console.log("Document uploaded:", data)}
            onSubmit={handleDocumentAdd}
            pipelineId={id} // Passing the correct pipeline ID here
            roundNumber={selectedRound}
          />
        )}
      </main>
    </div>
  );
};

export default ViewEditPipeline;
