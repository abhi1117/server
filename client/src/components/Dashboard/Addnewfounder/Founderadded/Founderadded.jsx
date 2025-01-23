import React, { useState } from "react";
import {
  FaBell,
  FaRocket,
  FaTicketAlt,
  FaUserCircle,
  FaSort,
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoDocumentLock } from "react-icons/io5";
import { IoIosDocument, IoIosSearch } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./Founderadded.css";
import logo from "./logo.png";
import nouser from "./nouser.jpg";


const Founderadded = () => {
  const [showAddFounder, setShowAddFounder] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAddFounderClick = () => {
    setShowConfirm(true);
  };

  const handleCloseAddFounder = () => {
    setShowAddFounder(false);
  };

  const handleConfirm = () => {
    setShowAddFounder(true);
    setShowConfirm(false);
    setShowSuccessModal(true);
  };

  const handleReverify = () => {
    setShowConfirm(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
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
              Add new founder
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

        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal">
           
              <h2>Founder Added Successfully</h2>
              <p>Founder has been added successfully</p>
              <button onClick={handleCloseSuccessModal}>Ok</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Founderadded;
