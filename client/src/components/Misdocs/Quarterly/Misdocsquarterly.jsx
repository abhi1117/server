import React from "react";
import {
  FaBell,
  FaRocket,
  FaTicketAlt,
  FaUserCircle,
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoDocumentLock } from "react-icons/io5";
import { IoIosDocument, IoIosSearch } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./Misdocsmonthly.css";
import logo from "../Public/logo.png";
import profileImage from "../Public/nouser.jpg"; // Assuming the profile image is similar to 'nouser.jpg'

const MISDocsq = () => {
  return (
    <div className="Misdoc">
        <aside className="sidebar">
        <div className="logo-container">
          <div className="logo" >
            <img src={logo} alt="Logo" style={{width:"100px", textAlign:"auto", marginLeft:"30px"}}/>
          </div>
        </div>
        <div className="nav-container">
          <nav className="nav">
            <ul>
              <li className="active" style={{ marginTop: "80px" }}>
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
            <FiMenu style={{ color: "#909090" }} /> MIS Docs
          </span>
          <input type="text" placeholder="Search here" className="search-bar" />
          <div className="profile-section">
            <div className="notification-icon">
              <FaBell />
            </div>
            <div className="user-info">
              <span className="user-initials">FJ</span>
              <div className="user-details">
                <span className="user-name">
                  Franklin Jr. <RiArrowDropDownLine className="drop" />
                </span>
                <br />
                <span className="user-email">franklinjr@mail.com</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          <div className="content-header">
            <h2>MIS Documents</h2>
          </div>
          <div className="tabs">
            <button className="tab active">Monthly</button>
            <button className="tab">Quarterly</button>
            <button className="tab">Annually</button>
          </div>
          <div className="documents-list">
            <div className="document-item">
              <span>Upload Pitch Deck * <span className="mandatory">Mandatory</span></span>
              <button className="upload-button">Upload File</button>
            </div>
            <div className="document-item">
              <span>Upload One Pager* <span className="mandatory">Mandatory</span></span>
              <button className="upload-button">Upload File</button>
            </div>
            <div className="document-item">
              <span>GST Filled <span className="mandatory">Mandatory</span></span>
              <button className="upload-button">Upload File</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MISDocs;
