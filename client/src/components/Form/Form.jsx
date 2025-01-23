import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment"; // Import Moment.js
import { FaBell, FaChevronLeft, FaChevronRight, FaSort } from "react-icons/fa";
import { CgNotes } from "react-icons/cg";
import {
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineShareAlt,
} from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { GrDocumentSound } from "react-icons/gr";
import { TbUsersGroup } from "react-icons/tb";
import { IoIosLink } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import AddNewFormModal from "./AddNewFormModal";
import EditFormModal from "./EditFormModal";
import ShareModal from "./ShareModal";
import { ToastContainer, toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "./Form.css";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  superAdminAction,
  userId,
  superAdminSelector,
} from "../../redux/reducers/superAdminReducer";

const Form = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [shareableLink, setShareableLink] = useState("");
  const [formDetails, setFormDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formsPerPage, setFormsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState({ name: "", email: "", username: "" }); // State for user data
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // *** START CHANGE for sorting --- Added state for sorting configuration ***
  const [lastModifiedSortConfig, setLastModifiedSortConfig] = useState({
    key: "lastModified",
    direction: "asc",
  }); // *** START CHANGE sorting by date and time --- Added state for Last Modified sorting ***
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);

  useEffect(() => {
    if (getUserId) {
      if (role == "Program Manager") {
        fetchForms();
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

  const fetchForms = async () => {
    try {
      const response = await fetch(
        "https://incubator.drishticps.org/api/forms",
        { credentials: "include" }
      );
      const data = await response.json();

      const sortedForms = data.sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
      );

      setForms(sortedForms);
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

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
            //  Authorization: `Bearer ${token}`,
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

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (form) => {
    setCurrentForm(form);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentForm(null);
  };

  const viewResponses = (formId) => {
    navigate(`/general-form-all-responses/${formId}`);
  };

  const addForm = (form) => {
    if (!form.lastModified) {
      form.lastModified = new Date().toISOString();
    }

    setForms([form, ...forms]); // Add the new form to the start of the array
  };

  const editForm = (updatedForm) => {
    const updatedForms = forms.map((form) =>
      form._id === updatedForm._id ? updatedForm : form
    );
    setForms(updatedForms);
  };

  const deleteForm = async (formToDelete) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="confirm-delete-ui">
            <h2
              style={{
                fontSize: "24px",
                textAlign: "center",
                marginBottom: "15PX",
              }}
            >
              Confirm to Delete
            </h2>
            <p style={{ textAlign: "center", marginBottom: "15PX" }}>
              Form structure will be lost. Are you sure you want to delete this
              form?
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            >
              <button
                className="delete-button-alert-generalform"
                onClick={async () => {
                  try {
                    await fetch(
                      `https://incubator.drishticps.org/api/forms/${formToDelete._id}`,
                      { method: "DELETE", credentials: "include" }
                    );
                    setForms(
                      forms.filter((form) => form._id !== formToDelete._id)
                    );
                    onClose();
                  } catch (error) {
                    console.error("Error deleting form:", error);
                    onClose();
                  }
                }}
              >
                Yes, Delete it!
              </button>
              <button
                className="modal-button-cancel-no-generalform"
                onClick={onClose}
              >
                No
              </button>
            </div>
          </div>
        );
      },
      overlayClassName: "confirm-delete-overlay",
    });
  };

  const handleFormClick = async (form) => {
    try {
      const response = await fetch(
        `https://incubator.drishticps.org/api/forms/general/${form._id}`,
        { credentials: "include" }
      );
      if (response.status === 404) {
        navigate("/form-builder", {
          state: {
            formElements: [],
            formTitle: form.title,
            formId: form._id,
          },
        });
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const formStructure = await response.json();
      if (formStructure.fields.length > 0) {
        navigate("/form-preview", {
          state: {
            formElements: formStructure.fields,
            formTitle: formStructure.title,
            formId: form._id,
          },
        });
      } else {
        navigate("/form-builder", {
          state: {
            formElements: [],
            formTitle: form.title,
            formId: form._id,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching form structure:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleShareClick = (formId) => {
    const link = `https://incubator.drishticps.org/public-form-preview/${formId}`;
    setShareableLink(link);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Error copying link:", err);
      });
  };

  const closeShareModal = () => {
    setShareableLink("");
  };

  // // *** START CHANGE for sorting --- Added sorting logic ***
  // const handleSort = () => {
  //   const sortedForms = [...forms];
  //   if (sortConfig.direction === "asc") {
  //     sortedForms.sort((a, b) => a.title.localeCompare(b.title));
  //     setSortConfig({ key: "title", direction: "desc" });
  //   } else {
  //     sortedForms.sort((a, b) => b.title.localeCompare(a.title));
  //     setSortConfig({ key: "title", direction: "asc" });
  //   }
  //   setForms(sortedForms);
  // };
  // // *** END CHANGE for sorting --- ***
  // *** START CHANGE sorting by title logic ***
  const handleTitleSort = () => {
    const sortedForms = [...forms];
    if (sortConfig.direction === "asc") {
      sortedForms.sort((a, b) => a.title.localeCompare(b.title));
      setSortConfig({ key: "title", direction: "desc" });
    } else {
      sortedForms.sort((a, b) => b.title.localeCompare(a.title));
      setSortConfig({ key: "title", direction: "asc" });
    }
    setForms(sortedForms);
  };
  // *** END CHANGE sorting by title logic ***

  // *** START CHANGE sorting by date and time (Last Modified) ***
  const handleLastModifiedSort = () => {
    const sortedForms = [...forms];
    if (lastModifiedSortConfig.direction === "asc") {
      sortedForms.sort(
        (a, b) => new Date(a.lastModified) - new Date(b.lastModified)
      );
      setLastModifiedSortConfig({ key: "lastModified", direction: "desc" });
    } else {
      sortedForms.sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
      );
      setLastModifiedSortConfig({ key: "lastModified", direction: "asc" });
    }
    setForms(sortedForms);
  };
  // *** END CHANGE sorting by date and time (Last Modified) ***

  // Pagination related calculations
  const indexOfLastForm = currentPage * formsPerPage;
  const indexOfFirstForm = indexOfLastForm - formsPerPage;
  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentFilteredForms = filteredForms.slice(
    indexOfFirstForm,
    indexOfLastForm
  );
  const totalPages = Math.ceil(filteredForms.length / formsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setFormsPerPage(Number(e.target.value));
    setCurrentPage(1);
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

  return (
    <div className="dashboard-form">
      {/* sidebar start */}
      <aside className="sidebar-form">
        <div className="logo-container-form">
          <div className="logo">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo-form"
              className="dristilogo"
            />
          </div>
        </div>
        <div className="nav-container-form">
          <nav className="nav-form">
            <ul>
              <li>
                <Link to="/homepage">
                  <IoHomeOutline className="nav-icon-form" /> Homepage
                </Link>
              </li>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-form" /> Create Query Form
                </Link>
              </li>
              <li>
                <Link to="/cohorts">
                  <GrDocumentSound className="nav-icon-form" /> Cohorts
                </Link>
              </li>
              <li>
                <Link to="/pipeline">
                  <IoIosLink className="nav-icon-form" /> Pipeline
                </Link>
              </li>
              <li>
                <Link to="/evaluator-dashboard">
                  <AiOutlineEye className="nav-icon-form" /> Create Evaluation
                  Form
                </Link>
              </li>
              {/* <li>
                <Link to="/applications">
                  <TbUsersGroup className="nav-icon-form" /> Applications
                </Link>
              </li> */}
            </ul>
          </nav>
        </div>
      </aside>
      {/* sidebar end */}
      <main className="main-content-form">
        {/* navbar start */}
        <header className="header-form">
          <span className="founder-form">All Forms</span>
          <div className="profile-section-form">
            <div className="user-info-form">
              <span className="user-initials-form">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-form">
                <span className="user-name-form">{user.username}</span>
                <br />
                <span className="user-email-form">{user.email}</span>
              </div>
            </div>
            <button
              className="logout-button-form"
              onClick={handleLogout} // Ensure this function is defined in your component
              style={{ marginLeft: "20px", padding: "8px" }} // Add any additional styling as needed
            >
              Logout
            </button>
          </div>
        </header>

        {/* navbar end */}
        <section className="content-form">
          <div className="content-header-form-generalform">
            <h3 className="header-title-generalform">Forms</h3>
            <div className="search-bar-container-generalform">
              <input
                type="text"
                placeholder="Search by title"
                className="search-bar-form-generalform"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="add-form-button-generalform"
              onClick={openAddModal}
            >
              Add New
            </button>
          </div>

          <div className="form-list-form">
            <table className="form-table-form">
              <thead>
                <tr>
                  {/* <th onClick={handleSort} style={{ cursor: "pointer" }}>
                    {" "}
                    Form Title{" "}
                    <FaSort className="sorticon superadmindash-sorticon" />{" "}
                  </th>{" "} */}
                  <th onClick={handleTitleSort} style={{ cursor: "pointer" }}>
                    Form Title
                    <FaSort className="sorticon superadmindash-sorticon" />
                  </th>
                  {/* <th>Last Modified</th> */}
                  <th
                    onClick={handleLastModifiedSort}
                    style={{ cursor: "pointer" }}
                  >
                    Last Modified
                    <FaSort className="sorticon superadmindash-sorticon" />
                  </th>
                  <th>Category</th>
                  {/* <th>Applications</th> */}
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentFilteredForms.map((form, index) => (
                  <tr key={index}>
                    <td
                      onClick={() => handleFormClick(form)}
                      className="form-title"
                    >
                      {form.title}
                    </td>
                    <td>{moment(form.lastModified).format("D/M/YYYY")}</td>
                    <td>{form.category}</td>
                    {/* <td></td> */}
                    <td style={{ textAlign: "center" }}>
                      {/* <button
                        className="action-button-form share"
                        onClick={() => handleShareClick(form._id)}
                        data-tooltip-id="share-tooltip-form"
                        data-tooltip-content="Share"
                      >
                        <AiOutlineShareAlt className="action-icon" />
                        <div className="tooltip-form">Share</div>
                      </button> */}
                      <button
                        className="action-button-form edit"
                        onClick={() => openEditModal(form)}
                        data-tooltip-id="edit-tooltip-form"
                        data-tooltip-content="Edit Form Title"
                      >
                        <AiOutlineEdit className="action-icon" />
                        <div className="tooltip-form">Edit Form Title</div>
                      </button>
                      {/* <button
                        className="action-button-form delete"
                        onClick={() => deleteForm(form)}
                        data-tooltip-id="delete-tooltip-form"
                        data-tooltip-content="Delete Form"
                      >
                        <AiOutlineDelete className="action-icon" />
                        <div className="tooltip-form">Delete Form</div>
                      </button> */}
                      {/* <button
                        className="action-button-form view"
                        onClick={() => viewResponses(form._id)}
                        data-tooltip-id="view-tooltip-form"
                        data-tooltip-content="View"
                      >
                        <AiOutlineEye className="action-icon" />
                        <div className="tooltip-form">View Responses</div>
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-container-form">
              <div className="pagination-form">
                <FaChevronLeft
                  className={`pagination-arrow-form ${
                    currentPage === 1 && "disabled"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
                <span className="page-number-form">
                  <span className="current-page-form">{currentPage}</span> /{" "}
                  {totalPages}
                </span>
                <FaChevronRight
                  className={`pagination-arrow-form ${
                    currentPage === totalPages && "disabled"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </div>
              <div className="rows-per-page-form">
                <label>Rows per page</label>
                <select value={formsPerPage} onChange={handleRowsPerPageChange}>
                  {[7, 10, 15, 20].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
        {isAddModalOpen && (
          <AddNewFormModal closeModal={closeAddModal} addForm={addForm} />
        )}
        {isEditModalOpen && (
          <EditFormModal
            closeModal={closeEditModal}
            form={currentForm}
            editForm={editForm}
          />
        )}
        {shareableLink && (
          <ShareModal
            shareableLink={shareableLink}
            copyLinkToClipboard={copyLinkToClipboard}
            closeShareModal={closeShareModal}
          />
        )}
        <ToastContainer position="bottom-right" />
      </main>
    </div>
  );
};

export default Form;
