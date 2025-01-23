import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  FaBell,
  FaRocket,
  FaTicketAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { IoDocumentLock } from 'react-icons/io5';
import { IoIosDocument } from 'react-icons/io';
import { RiArrowDropDownLine } from 'react-icons/ri';
import '../Shared/Sidebar.css';
import "../Shared/ViewStartupDetails.css";


const ViewStartupDetails = () => {
  const location = useLocation();
  const { startup } = location.state;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
          <img src="/navbar/drishtilogo.jpg" alt="Logo" className="dristilogo"/> 
          </div>
        </div>
        <div className="nav-container">
          <nav className="nav">
            <ul>
              <li>
                <Link to="/founders">
                  <FaUserCircle className="nav-icon" /> Founders Profile
                </Link>
              </li>
              <li className="active">
                <Link to="/startup-general">
                  <FaRocket className="nav-icon" /> Startup General
                </Link>
              </li>
              <li>
                <Link to="/startup-legal">
                  <IoDocumentLock className="nav-icon" /> Startup Legal
                </Link>
              </li>
              <li>
                <Link to="/mis-docs">
                  <IoIosDocument className="nav-icon" /> MIS Docs
                </Link>
              </li>
              <li>
                <Link to="/tickets">
                  <FaTicketAlt className="nav-icon" /> Tickets
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <span className="founder">
            <FiMenu style={{ color: "#909090" }} /> Startup General
          </span>
          <input type="text" placeholder="Search here" className="search-bar" />
          <div className="profile-section">
            <div >
              <FaBell className="notification-icon"/>
            </div>
            <div className="user-info">
              <img src="/navbar/profilepicture.png" alt="User Avatar" className="user-initials" />
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
          <div className="content-headerlist">
            <h2>Startup Information</h2>
          </div>
          <div className="startup-detail">
            <div className="detail-card">
                <div style={{display:'flex', gap:'30px'}}>
              <div className="logo-container">
                <img src={URL.createObjectURL(startup.logo)} alt="logo" className="logo" />
              </div>
                    <div>
              <h2 className="company-name">DRISHTI CPS Foundation</h2>
                   </div>
                </div>
              <div className="info-row">
                <div className="info-item-first">
                  <p><span className="label">Startup:</span> <span className="value" style={{fontWeight:'400'}}>{startup.stage}</span></p>
                  <p><span className="label">Registered Office Location:</span> <span className="value" style={{fontWeight:'lighter'}}>{startup.location}</span></p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <p><span className="label" style={{width:'100px'}}>One liner of your startup (45 Words):</span> <span className="value">{startup.oneLiner}</span></p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <p><span className="label">Website:</span> <span className="value">{startup.website}</span></p>
                </div>
                <div className="info-item">
                  <p><span className="label">   Type of Service:</span> <span className="value">{startup.service}</span></p>
                </div>
                <div className="info-item">
                  <p><span className="label">Incubated:</span> <span className="value">{startup.incubated}</span></p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <p><span className="label">Brief Description (250 Words):</span> <span className="value">{startup.description}</span></p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <p><span className="label">Social Media Link:</span> <span className="value">{startup.socialMedia}</span></p>
                </div>
                <div className="info-item">
                  <p><span className="label">Domain of Startup:</span> <span className="value">{startup.domain}</span></p>
                </div>
                <div className="info-item">
                  <p><span className="label">Team Size:</span> <span className="value">{startup.teamSize}</span></p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <p><span className="label">Startup support you are looking for?:</span> <span className="value">{startup.support}</span></p>
                </div>
                <div className="info-item">
                  <p><span className="label">Startup Postal Address:</span> <span className="value">{startup.address}</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ViewStartupDetails;