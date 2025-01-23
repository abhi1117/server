import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaRocket, FaTicketAlt, FaUserCircle, FaSort } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoDocumentLock } from "react-icons/io5";
import { IoIosDocument } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./Foundersdata.css";
import logo from "./logo.png";

const Foundersdata = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const navigate = useNavigate();

  const handleMenuClick = (event, founder) => {
    setAnchorEl(event.currentTarget);
    setSelectedFounder(founder);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFounder(null);
  };

  const handleViewDetails = (founderId) => {
    navigate(`/founder-details/${founderId}`);
    handleMenuClose();
  };

  // Sample data for founders with unique ids
  const foundersData = [
    {
      id: 1,
      name: "Wade Warren",
      contactNumber: "+91 9800000121",
      officialEmail: "wwe@gmail.com",
      dob: "12-02-1988",
      designation: "Graphic designer",
      resumeLink: "resume12.pdf",
      qualification: "Mtech",
    },
    {
      id: 2,
      name: "Lari",
      contactNumber: "+91 9800456121",
      officialEmail: "lari@gmail.com",
      dob: "12-02-1988",
      designation: "Designer",
      resumeLink: "resume13.pdf",
      qualification: "Btech",
    },
    {
      id: 3,
      name: "Hala",
      contactNumber: "+91 9800258963",
      officialEmail: "hala@gmail.com",
      dob: "12-02-1988",
      designation: "Engineer",
      resumeLink: "resume14.pdf",
      qualification: "Bcom",
    },
    {
      id: 4,
      name: "Careem",
      contactNumber: "+91 9800789645",
      officialEmail: "careem@gmail.com",
      dob: "12-02-1988",
      designation: "Developer",
      resumeLink: "resume15.pdf",
      qualification: "Bsc",
    },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img src={logo} alt="Logo" style={{ width: "100px", textAlign: "auto" }} />
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
            <button className="add-founder-button">
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
                {foundersData.map((founder) => (
                  <tr key={founder.id}>
                    <td>{founder.name}</td>
                    <td>{founder.contactNumber}</td>
                    <td>{founder.officialEmail}</td>
                    <td>{founder.dob}</td>
                    <td>{founder.designation}</td>
                    <td>
                      <a href={founder.resumeLink} target="_blank" rel="noopener noreferrer">
                        {founder.resumeLink}
                      </a>
                    </td>
                    <td>{founder.qualification}</td>
                    <td>
                      <IconButton onClick={(event) => handleMenuClick(event, founder)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleViewDetails(founder.id)}>
                          View Details
                        </MenuItem>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Foundersdata;
