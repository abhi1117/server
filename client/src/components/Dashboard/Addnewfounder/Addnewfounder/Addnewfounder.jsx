import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaRocket,
  FaTicketAlt,
  FaUserCircle,
  FaSort,
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoDocumentLock } from "react-icons/io5";
import { IoIosDocument } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Button, Modal, Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import "./Addnewfounder.css";
import logo from "./logo.png";
import nouser from "./nouser.jpg";

const Addnewfounder = () => {
  const [showAddFounder, setShowAddFounder] = useState(false);
  const [openModal, setOpenModal] = useState(false); // State to manage the confirmation modal
  const [openSuccessModal, setOpenSuccessModal] = useState(false); // State to manage the success modal
  const navigate = useNavigate(); // Initialize useNavigate

  const handleAddFounderClick = () => {
    setShowAddFounder(true);
  };

  const handleCloseAddFounder = () => {
    setShowAddFounder(false);
  };

  const handleOpen = () => {
    setOpenModal(true);
    setShowAddFounder(false); // Close the add-new-founder form when opening the modal
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleConfirm = () => {
    setOpenModal(false);
    setOpenSuccessModal(true); // Open success modal on confirmation
  };

  const handleSuccessModalClose = () => {
    setOpenSuccessModal(false);
    navigate("/confirm"); // Redirect to Confirm component after closing the success modal
  };

  const handleReverify = () => {
    setOpenModal(false);
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className="nav-container">
          <nav className="nav">
            <ul>
              <li className="active">
                <FaUserCircle className="nav-icon" /> Founders Profile
              </li>
              <li>
                <FaRocket className="nav-icon" /> Startup General
              </li>
              <li>
                <IoDocumentLock className="nav-icon" /> Startup Legal
              </li>
              <li>
                <IoIosDocument className="nav-icon" /> MIS Docs
              </li>
              <li>
                <FaTicketAlt className="nav-icon" /> Tickets
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <span className="founder">
            <FiMenu style={{ color: "#909090" }} /> Founders
          </span>
          <input type="text" placeholder="Search here" className="search-bar" />
          <div className="profile-section">
            <div className="notification-icon">
              <FaBell />
            </div>
            <div className="user-info">
              <span className="user-initials">Amit</span>
              <div className="user-details">
                <span className="user-name">
                  Mr. Amit Rathod <RiArrowDropDownLine className="drop" />
                </span>
                <br />
                <span className="user-email">Amit@mail.com</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          <div className="content-header">
            <h2>List of Founders</h2>
            <button
              className="add-founder-button"
              onClick={handleAddFounderClick}
            >
              + Add new founder
            </button>
          </div>
          <div className="founders-list">
            <table>
              <thead>
                <tr>
                  <th>
                    Name <FaSort className="sorticon" />
                  </th>
                  <th>
                    Contact Number <FaSort className="sorticon" />
                  </th>
                  <th>
                    Official Email <FaSort className="sorticon" />
                  </th>
                  <th>
                    Date Of Birth <FaSort className="sorticon" />
                  </th>
                  <th>
                    Designation <FaSort className="sorticon" />
                  </th>
                  <th>
                    Resume <FaSort className="sorticon" />
                  </th>
                  <th>
                    Qualification <FaSort className="sorticon" />
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="8" className="no-founder">
                    <div className="no-founder-content">
                      <img
                        src={nouser}
                        alt="No User found"
                        style={{ marginTop: "50px" }}
                      />
                      <h4>No Founder Added Yet</h4>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showAddFounder && !openSuccessModal && (
        <div className="add-new-founder-modal">
          <div className="add-new-founder-form">
            <h2>Add New Founder</h2>
            <form>
              <div className="form-columns">
                <div className="form-column">
                  <label>Name</label>
                  <input type="text" placeholder="Enter Name" />
                </div>
                <div className="form-column">
                  <label>Contact Number</label>
                  <input type="text" placeholder="Enter Contact Number" />
                </div>
              </div>
              <div className="form-columns">
                <div className="form-column">
                  <label>Email Id</label>
                  <input type="email" placeholder="Enter Email id" />
                </div>
                <div className="form-column">
                  <label>Date Of Birth</label>
                  <input
                    type="date"
                    placeholder="Select date"
                    style={{ color: "#909090" }}
                  />
                </div>
              </div>
              <div className="form-columns">
                <div className="form-column">
                  <label>Designation</label>
                  <select style={{ color: "#424342" }}>
                    <option value="" disabled selected>
                      Select Designation
                    </option>
                    <option value="ceo" style={{ color: "#424342" }}>
                      CEO
                    </option>
                    <option value="cto" style={{ color: "#424342" }}>
                      CTO
                    </option>
                    <option value="cfo" style={{ color: "#424342" }}>
                      CFO
                    </option>
                  </select>
                </div>
                <div                  className="form-column"
                >
                  <label>Resume (in PDF)</label>
                  <input
                    style={{ color: "#909090" }}
                    type="file"
                    accept="application/pdf"
                  />
                </div>
              </div>
              <div className="form-columns">
                <div className="form-column">
                  <label>Qualification</label>
                  <select style={{ color: "#424342" }}>
                    <option value="" disabled selected>
                      Select Qualification
                    </option>
                    <option value="bachelors">Bachelors</option>
                    <option value="masters">Masters</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div className="form-column">
                  <label>Stakeholder%age</label>
                  <input type="number" placeholder="Enter %" />
                </div>
              </div>
              <div className="form-buttons">
                <button type="button" className="save-button" onClick={handleOpen}>
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseAddFounder}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal open={openModal} onClose={handleClose}>
        <Box className="modal-box">
          <FontAwesomeIcon icon={faCircleExclamation} style={{ fontSize: "2.3em", color: "#0183FF", marginBottom: "10px" }} />

          <Typography variant="h6" component="h2" style={{ textAlign: "center", fontWeight: "700" }}>
            Please Confirm!
          </Typography>
          <Typography sx={{ mt: 2 }} style={{ color: "#909090", fontSize: "13px" }}>
            Are you sure you want to proceed? You will not be allowed to edit the founder details again.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleConfirm} sx={{ mr: 2 }}>
              Confirm
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleReverify}>
              Reverify
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openSuccessModal} onClose={handleSuccessModalClose}>
        <Box className="modal-box">
          <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: "2.3em", color: "#0183FF", marginBottom: "10px" }} />

          <Typography variant="h6" component="h2" style={{ textAlign: "center", fontWeight: "700" }}>
            Founder Added Successfully
          </Typography>
          <Typography sx={{ mt: 2 }} style={{ color: "#909090", fontSize: "13px" }}>
            Founder has been added successfully.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSuccessModalClose} sx={{ mr: 2 }} style={{textAlign:"center"}}>
              Continue
            </Button>
          </Box>
        </Box>
      </Modal>

    </div>
  );
};

export default Addnewfounder;

