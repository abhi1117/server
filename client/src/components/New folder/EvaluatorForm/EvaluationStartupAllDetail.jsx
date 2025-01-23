import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { CgNotes } from "react-icons/cg";
import { AiOutlineEye } from "react-icons/ai";
import "./EvaluationStartupAllDetail.css";
import "../Shared/Sidebar2.css";

const EvaluationStartupAllDetail = () => {
  const location = useLocation();
  const { formTitle } = useParams();
  const [startup, setStartup] = useState(null);
  const [activeTab, setActiveTab] = useState("Monthly");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const response = await axios.get(
          `https://incubator.drishticps.org/api/formSubmissions/startup/${formTitle}`
        );
        setStartup(response.data);
        console.log(response);
      } catch (error) {
        console.error("Error fetching startup details:", error);
      }
    };

    fetchStartup();
  }, [formTitle]);

  const handleEvaluateClick = () => {
    navigate("/evaluator-form", { state: { startup } });
  };

  const renderDocuments = () => {
    switch (activeTab) {
      case "Monthly":
        return (
          <>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                Pitch Deck
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Pending for Verification
              </span>
              <span className="document-file-evaluationstartupalldetail">
                1 File Attached
              </span>
            </div>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                One Pager
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Pending for Verification
              </span>
              <span className="document-file-evaluationstartupalldetail">
                1 File Attached
              </span>
            </div>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                GST Filled
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Pending for Verification
              </span>
              <span className="document-file-evaluationstartupalldetail">
                1 File Attached
              </span>
            </div>
          </>
        );
      case "Quarterly":
        return (
          <>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                Quarterly Report
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Pending for Verification
              </span>
              <span className="document-file-evaluationstartupalldetail">
                2 Files Attached
              </span>
            </div>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                Financial Summary
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Verified
              </span>
              <span className="document-file-evaluationstartupalldetail">
                3 Files Attached
              </span>
            </div>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                Compliance Documents
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Pending for Verification
              </span>
              <span className="document-file-evaluationstartupalldetail">
                1 File Attached
              </span>
            </div>
          </>
        );
      case "Annually":
        return (
          <>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                Annual Report
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Pending for Verification
              </span>
              <span className="document-file-evaluationstartupalldetail">
                1 File Attached
              </span>
            </div>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                Tax Returns
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Verified
              </span>
              <span className="document-file-evaluationstartupalldetail">
                2 Files Attached
              </span>
            </div>
            <div className="document-item-evaluationstartupalldetail">
              <span className="document-title-evaluationstartupalldetail">
                Audit Report
              </span>
              <span className="document-status-evaluationstartupalldetail">
                Pending for Verification
              </span>
              <span className="document-file-evaluationstartupalldetail">
                1 File Attached
              </span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (!startup) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-form-evaluationstartupalldetail">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img
              src="/navbar/drishtilogo.jpg"
              alt="Logo"
              className="dristilogo"
            />
          </div>
        </div>
        <div className="nav-container">
          <nav className="nav">
            <ul>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon" /> General Form
                </Link>
              </li>
              <li>
                <Link to="/evaluation-startup">
                  <AiOutlineEye className="nav-icon" /> Evaluator Form
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-form-evaluationstartupalldetail">
        <header className="header-form-evaluationstartupalldetail">
          <span className="founder-form-evaluationstartupalldetail">
            <FiMenu style={{ color: "#909090" }} />
            All Forms
          </span>
          <input
            type="text"
            placeholder="Search here"
            className="search-bar-form-evaluationstartupalldetail"
          />
          <div className="profile-section-form-evaluationstartupalldetail">
            <div>
              <FaBell className="notification-icon-form-evaluationstartupalldetail" />
            </div>
            <div className="user-info-form-evaluationstartupalldetail">
              <img
                src="/navbar/profilepicture.png"
                alt="User Avatar"
                className="user-initials-form-evaluationstartupalldetail"
              />
              <div className="user-details-form-evaluationstartupalldetail">
                <span className="user-name-form-evaluationstartupalldetail">
                  Program Mang{" "}
                  <RiArrowDropDownLine className="drop-form-evaluationstartupalldetail" />
                </span>
                <br />
                <span className="user-email-form-evaluationstartupalldetail">
                  manager@mail.com
                </span>
              </div>
            </div>
          </div>
        </header>
        <section className="content-form-evaluationstartupalldetail">
          <div className="content-header-form-evaluationstartupalldetail">
            <h2>Startup Information</h2>
          </div>
          <div className="startup-details-form-evaluationstartupalldetail">
            <div className="startup-info-header-wrapper-evaluationstartupalldetail">
              <div className="startup-info-header-evaluationstartupalldetail">
                <div className="logo-container-evaluationstartupalldetail">
                  <img
                    src="/navbar/drishtilogo.jpg"
                    alt="Startup Logo"
                    className="startup-logo-evaluationstartupalldetail"
                  />
                </div>
                <div className="startup-name-container-evaluationstartupalldetail">
                  <h3>{startup.formData["Name"]}</h3>
                </div>
              </div>
            </div>
            <div className="startup-info-body-evaluationstartupalldetail">
              <div className="info-row-evaluationstartupalldetail">
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Startup:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Startup"]}
                  </span>
                </div>
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Registered Office Location:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Registered Office Location"]}
                  </span>
                </div>
              </div>
              <div className="info-row-evaluationstartupalldetail">
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    One line of your startup (45 Words):
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["One Liner of your startup"]}
                  </span>
                </div>
              </div>
              <div className="info-row-evaluationstartupalldetail">
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Website:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    <a
                      href={startup.formData["Website"]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {startup.formData["Website"]}
                    </a>
                  </span>
                </div>
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Type of Service:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Type of Service"]}
                  </span>
                </div>
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Incubated:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Incubated"] ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <div className="info-row-evaluationstartupalldetail">
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Brief Description (250 Words):
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Brief Description"]}
                  </span>
                </div>
              </div>
              <div className="info-row-evaluationstartupalldetail">
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Social Media Link:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    <a
                      href={startup.formData["Social Media Link"]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {startup.formData["Social Media Link"]}
                    </a>
                  </span>
                </div>
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Domain of Startup:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Domain Of Startup"]}
                  </span>
                </div>
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Team Size:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Startup team size"]}
                  </span>
                </div>
              </div>
              <div className="info-row-evaluationstartupalldetail">
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Startup support you are looking for:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Startup support you are looking for"]}
                  </span>
                </div>
                <div className="info-item-evaluationstartupalldetail">
                  <span className="info-title-evaluationstartupalldetail">
                    Startup Postal Address:
                  </span>
                  <span className="info-value-evaluationstartupalldetail">
                    {startup.formData["Startup Postal Address"]}
                  </span>
                </div>
              </div>
            </div>
            <div className="documents-section-evaluationstartupalldetail">
              <div className="main-documents-evaluationstartupalldetail">
                <h4>Main Documents</h4>
                <div className="document-item-evaluationstartupalldetail">
                  <span className="document-title-evaluationstartupalldetail">
                    Pitch Deck
                  </span>
                  <span className="document-status-evaluationstartupalldetail">
                    Pending for Verification
                  </span>
                  <span className="document-file-evaluationstartupalldetail">
                    1 File Attached
                  </span>
                </div>
                <div className="document-item-evaluationstartupalldetail">
                  <span className="document-title-evaluationstartupalldetail">
                    One Pager
                  </span>
                  <span className="document-status-evaluationstartupalldetail">
                    Pending for Verification
                  </span>
                  <span className="document-file-evaluationstartupalldetail">
                    1 File Attached
                  </span>
                </div>
              </div>
              <div className="additional-documents-evaluationstartupalldetail">
                <h4>Additional Documents</h4>
                <div className="document-item-evaluationstartupalldetail">
                  <span className="document-title-evaluationstartupalldetail">
                    Pitch Deck
                  </span>
                  <span className="document-status-evaluationstartupalldetail">
                    Pending for Verification
                  </span>
                  <span className="document-file-evaluationstartupalldetail">
                    1 File Attached
                  </span>
                </div>
                <div className="document-item-evaluationstartupalldetail">
                  <span className="document-title-evaluationstartupalldetail">
                    One Pager
                  </span>
                  <span className="document-status-evaluationstartupalldetail">
                    Pending for Verification
                  </span>
                  <span className="document-file-evaluationstartupalldetail">
                    1 File Attached
                  </span>
                </div>
              </div>
              <div className="mis-documents-evaluationstartupalldetail">
                <h4>MIS Documents</h4>
                <div className="mis-tabs-evaluationstartupalldetail">
                  <span
                    className={`mis-tab-evaluationstartupalldetail ${
                      activeTab === "Monthly" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("Monthly")}
                  >
                    Monthly
                  </span>
                  <span
                    className={`mis-tab-evaluationstartupalldetail ${
                      activeTab === "Quarterly" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("Quarterly")}
                  >
                    Quarterly
                  </span>
                  <span
                    className={`mis-tab-evaluationstartupalldetail ${
                      activeTab === "Annually" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("Annually")}
                  >
                    Annually
                  </span>
                </div>
                {renderDocuments()}
              </div>
            </div>
            <div className="buttonvaluateStartup-evaluationstartupalldetail">
              <button
                className="evaluate-button-evaluationstartupalldetail"
                onClick={handleEvaluateClick}
              >
                Evaluate Startup
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EvaluationStartupAllDetail;
