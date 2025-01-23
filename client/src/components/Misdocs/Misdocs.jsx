import React, { useState } from "react";
import { FaBell, FaRocket, FaTicketAlt, FaUserCircle } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoDocumentLock } from "react-icons/io5";
import { IoIosDocument } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./Misdocs.css";
import logo from "../../components/Public/logo.png";
import profileImage from "../../components/Public/nouser.jpg";

const MISDocs = () => {
  const [activeTab, setActiveTab] = useState("Monthly");

  // Function to handle file selection
  const handleFileUpload = () => {
    // Assuming you want to open a file selection dialog
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true; // Allow multiple file selection
    fileInput.click(); // Simulate a click to open file dialog
  };

  const renderDocuments = () => {
    switch (activeTab) {
      case "Monthly":
        return (
          <>
            <div className="document-item">
              <span>
                Upload Pitch Deck * <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                Upload One Pager* <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                GST Filled <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
          </>
        );
      case "Quarterly":
        return (
          <>
            <div className="document-item">
              <span>
                Upload IP Status* <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                Upload Job Creation Sheet <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                GST Filled <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
          </>
        );
      case "Annually":
        return (
          <>
            <div className="document-item">
              <span>
                Upload IP Status* <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                Upload Job Creation Sheet <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                GST Filled <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                ITR Filling <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                Updated Investments <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
            <div className="document-item">
              <span>
                Growth in terms of revenue / Product development / Customer Acquisition{" "}
                <span className="mandatory">Mandatory</span>
              </span>
              <button className="upload-button" onClick={handleFileUpload}>
                Upload File
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="Misdoc">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img src={logo} alt="Logo" style={{ width: "100px", textAlign: "auto", marginLeft: "0px" }} />
          </div>
        </div>
        <div className="nav-container">
          <nav className="nav">
            <ul>
              <li className="nav-item active" style={{ marginTop: "80px" }}>
                <FaUserCircle className="nav-icon" /> Founders Profile
              </li>
              <li className="nav-item">
                <FaRocket className="nav-icon" /> Startup General
              </li>
              <li className="nav-item">
                <IoDocumentLock className="nav-icon" /> Startup Legal
              </li>
              <li className="nav-item">
                <IoIosDocument className="nav-icon" /> MIS Docs
              </li>
              <li className="nav-item">
                <FaTicketAlt className="nav-icon" /> Tickets
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <span className="founder">
            <FiMenu style={{ color: "#909090", fontSize: "24px", textAlign: "center" }} /> MIS Docs
          </span>
          <input type="text" placeholder="Search here" className="search-bar" style={{height:"28px"}}/>
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
            <button className={`tab ${activeTab === "Monthly" ? "active" : ""}`} onClick={() => setActiveTab("Monthly")}>Monthly</button>
            <button className={`tab ${activeTab === "Quarterly" ? "active" : ""}`} onClick={() => setActiveTab("Quarterly")}>Quarterly</button>
            <button className={`tab ${activeTab === "Annually" ? "active" : ""}`} onClick={() => setActiveTab("Annually")}>Annually</button>
          </div>

          <div className="documents-list">
            {renderDocuments()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MISDocs;
