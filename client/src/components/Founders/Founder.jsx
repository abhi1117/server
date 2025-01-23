import React from "react";
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
import "./Founder.css";
import logo from "../Public/logo.png";
import nouser from "../Public/nouser.jpg";

const Founder = () => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className="nav-container">
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
      </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <span className="founder" style={{ fontSize:"24px" }}>
            <FiMenu style={{ color: "#909090" , fontWeight:"700"}} /> Founders
          </span>
          <input type="text" placeholder="Search here" className="search-bar" style={{height:"28px"}} />
          <div className="profile-section">
            <div className="notification-icon">
              <FaBell />
            </div>
            <div className="user-info">
              <span className="user-initials">Startup</span>
              <div className="user-details">
                <span className="user-name">
                  Startup Name <RiArrowDropDownLine className="drop" />
                </span>
                <span className="user-email">startup@mail.com</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          <div className="content-header">
            <h2>List of Founders</h2>
            <button className="add-founder-button"  style={{padding:"10px"}}>Add new founder</button>
          </div>
          <div className="founders-list">
            <table>
              <thead>
                <tr>
                  <th>
                    Name <FaSort className="sorticon" />
                  </th>
                  <th>
                    Contact Number
                    <FaSort className="sorticon" />
                  </th>
                  <th>
                    Official Email
                    <FaSort className="sorticon" />
                  </th>
                  <th>
                    Date Of Birth
                    <FaSort className="sorticon" />
                  </th>
                  <th>
                    Designation
                    <FaSort className="sorticon" />
                  </th>
                  <th>
                    Resume
                    <FaSort className="sorticon" />
                  </th>
                  <th>
                    Qualification
                    <FaSort className="sorticon" />
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
    </div>
  );
};

export default Founder;
