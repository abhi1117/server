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
import { Button, Modal, Box } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import "./Founderdata.css";
import logo from "./logo.png";

const Founderdata = () => {
  const [showAddFounder, setShowAddFounder] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleAddFounderClick = () => {
    setShowAddFounder(true);
  };

  const handleCloseAddFounder = () => {
    setShowAddFounder(false);
  };

  const handleOpen = () => {
    setOpenModal(true);
    setShowAddFounder(false);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleConfirm = () => {
    setOpenModal(false);
    setOpenSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setOpenSuccessModal(false);
    navigate("/confirm");
  };

  const handleReverify = () => {
    setOpenModal(false);
  };

  // Data for founders
  const foundersData = [
    {
      name: "Wade Warren",
      contactNumber: "+91 9800000121",
      officialEmail: "wwe@gmail.com",
      dob: "12-02-1988",
      designation: "Graphic designer",
      resumeLink: "resume12.pdf",
      qualification: "BA",
    },
    {
      name: "Esther Howard",
      contactNumber: "+91 9800005450",
      officialEmail: "Esther@gmail.com",
      dob: "12-02-1993",
      designation: "Designer",
      resumeLink: "resume12.pdf",
      qualification: "MCOM",
    },
    {
      name: "Guy Hawkins",
      contactNumber: "+91 9800789000",
      officialEmail: "Guy@gmail.com",
      dob: "12-02-1968",
      designation: "Engineer",
      resumeLink: "resume12.pdf",
      qualification: "BBA",
    },
    {
      name: "Robert Fox",
      contactNumber: "+91 9800004560",
      officialEmail: "Fox@gmail.com",
      dob: "12-02-1998",
      designation: "Software Expert",
      resumeLink: "resume12.pdf",
      qualification: "IT",
      },
     {
      name: "Jacob Jones",
      contactNumber: "+91 9800001590",
      officialEmail: "Jones@gmail.com",
      dob: "12-02-1959",
      designation: "Doctor",
      resumeLink: "resume12.pdf",
      qualification: "MSC-IT",
    },
  ];

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
              +Add new founder
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
                {foundersData.map((founder, index) => (
                  <tr key={index}>
                    <td>{founder.name}</td>
                    <td>{founder.contactNumber}</td>
                    <td>{founder.officialEmail}</td>
                    <td>{founder.dob}</td>
                    <td>{founder.designation}</td>
                    <td><a href={founder.resumeLink} target="_blank" rel="noopener noreferrer">{founder.resumeLink}</a></td>
                    <td>{founder.qualification}</td>
                    <td><button className="view-details">View Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Add new founder modal */}
      {showAddFounder && !openSuccessModal && (
        <div className="add-new-founder-modal">
          <div className="add-new-founder-form">
            {/* Add new founder form content */}
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      <Modal open={openModal} onClose={handleClose} className="custom-modal">
        <Box className="modal-box">
          {/* Confirmation modal content */}
        </Box>
      </Modal>

      {/* Success modal */}
      <Modal
        open={openSuccessModal}
        onClose={handleSuccessModalClose}
        className="custom-modal"
      >
        <Box className="modal-box">
          {/* Success modal content */}
        </Box>
      </Modal>
    </div>
  );
};

export default Founderdata;
