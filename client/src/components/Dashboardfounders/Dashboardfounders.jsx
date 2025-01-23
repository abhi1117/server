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

import "./Dashboardfounders.css";
import logo from "./logo.png";


const Dashboardfounders = () => {
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
                  <td>Wade Warren</td>
                  <td>+91 9800000000</td>
                  <td>wwe@gmail.com</td>
                  <td>12-02-1977</td>
                  <td>Graphic designer</td>
                  <td><a href="resume12.pdf">resume12.pdf</a></td>
                  <td>BSC-IT</td>
                  <td><button className="view-details">View Details</button></td>
                </tr>
                <tr>
                  <td>Esther Howard</td>
                  <td>+91 9800000000</td>
                  <td>eh@gmail.com</td>
                  <td>12-02-1987</td>
                  <td>Motion designer</td>
                  <td><a href="resume23.pdf">resume23.pdf</a></td>
                  <td>MSC-IT</td>
                  <td><button className="view-details">View Details</button></td>
                </tr>
                <tr>
                  <td>Guy Hawkins</td>
                  <td>+91 94343434343</td>
                  <td>gh@gmail.com</td>
                  <td>23-02-1997</td>
                  <td>Animator</td>
                  <td><a href="resume32.pdf">resume32.pdf</a></td>
                  <td>BSC-IT</td>
                  <td><button className="view-details">View Details</button></td>
                </tr>
                <tr>
                  <td>Robert Fox</td>
                  <td>+91 9800000000</td>
                  <td>rf@gmail.com</td>
                  <td>03-02-1987</td>
                  <td>UI designer</td>
                  <td><a href="resume09.pdf">resume09.pdf</a></td>
                  <td>MSC-IT</td>
                  <td><button className="view-details">View Details</button></td>
                </tr>
                <tr>
                  <td>Jacob Jones</td>
                  <td>+91 94343434343</td>
                  <td>jj@gmail.com</td>
                  <td>12-02-1977</td>
                  <td>Graphic designer</td>
                  <td><a href="resume45.pdf">resume45.pdf</a></td>
                  <td>BSC-IT</td>
                  <td><button className="view-details">View Details</button></td>
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
                    <option value="coo" style={{ color: "#424342" }}>
                      COO
                    </option>
                  </select>
                </div>
                <div className="form-column">
                  <label>Qualification</label>
                  <select style={{ color: "#424342" }}>
                    <option value="" disabled selected>
                      Select Qualification
                    </option>
                    <option value="bsc" style={{ color: "#424342" }}>
                      BSC
                    </option>
                    <option value="msc" style={{ color: "#424342" }}>
                      MSC
                    </option>
                    <option value="phd" style={{ color: "#424342" }}>
                      PHD
                    </option>
                  </select>
                </div>
              </div>
              <div className="form-columns">
                <div className="form-column">
                  <label>Upload Resume</label>
                  <input
                    type="file"
                    placeholder="Upload File"
                    style={{ color: "#909090" }}
                  />
                </div>
              </div>
            </form>
            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCloseAddFounder}
              >
                Cancel
              </button>
              <button type="button" className="save-button" onClick={handleOpen}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal open={openModal} onClose={handleClose} className="custom-modal">
        <Box className="modal-box">
          <Typography className="modal-message">
            <FontAwesomeIcon icon={faCircleExclamation} className="exclamation" />
            Are you sure you want to submit the data?
          </Typography>
          <Box className="modal-buttons">
            <Button onClick={handleReverify} className="reverify-button">
              Reverify
            </Button>
            <Button onClick={handleConfirm} className="confirm-button">
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openSuccessModal}
        onClose={handleSuccessModalClose}
        className="custom-modal"
      >
        <Box className="modal-box">
          <Typography className="modal-message">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            Data added successfully!
          </Typography>
          <Box className="modal-buttons">
            <Button onClick={handleSuccessModalClose} className="ok-button">
              OK
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Dashboardfounders;
