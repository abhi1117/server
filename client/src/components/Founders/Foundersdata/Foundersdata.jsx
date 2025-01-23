import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaRocket,
  FaTicketAlt,
  FaUserCircle,
  FaSort,
  FaFileExport,
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoDocumentLock } from "react-icons/io5";
import { IoIosDocument } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./Foundersdata.css";
import logo from "../../Public/logo.png";

const Foundersdata = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
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

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectedAll(checked);
    if (checked) {
      const allIds = foundersData.map((founder) => founder.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (event, id) => {
    const checked = event.target.checked;
    if (checked) {
      setSelectedIds((prevSelectedIds) => [...prevSelectedIds, id]);
    } else {
      setSelectedIds((prevSelectedIds) =>
        prevSelectedIds.filter((selectedId) => selectedId !== id)
      );
    }
  };

  const isSelected = (id) => selectedIds.includes(id);

  const foundersData = [
    {
      id: 1,
      name: "Wade Warren",
      contactNumber: "+91 9800000000",
      officialEmail: "ww@gmail.com",
      dob: "12-02-1977",
      designation: "Graphic designer",
      resumeLink: "resume12.pdf",
      qualification: "BSC-IT",
    },
    {
      id: 2,
      name: "Esther Howard",
      contactNumber: "+91 9800000000",
      officialEmail: "eh@gmail.com",
      dob: "12-02-1987",
      designation: "Motion designer",
      resumeLink: "resume23.pdf",
      qualification: "MSC-IT",
    },
    {
      id: 3,
      name: "Guy Hawkins",
      contactNumber: "+91 94343434343",
      officialEmail: "gh@gmail.com",
      dob: "23-02-1997",
      designation: "Animator",
      resumeLink: "resume32.pdf",
      qualification: "BSC-IT",
    },
    {
      id: 4,
      name: "Robert Fox",
      contactNumber: "+91 9800000000",
      officialEmail: "rf@gmail.com",
      dob: "03-02-1987",
      designation: "UI designer",
      resumeLink: "resume09.pdf",
      qualification: "MSC-IT",
    },
    {
      id: 5,
      name: "Jacob Jones",
      contactNumber: "+91 94343434343",
      officialEmail: "jj@gmail.com",
      dob: "12-02-1977",
      designation: "Graphic designer",
      resumeLink: "resume45.pdf",
      qualification: "BSC-IT",
    },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "100px", textAlign: "auto" }}
            />
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
          <span className="founder" style={{fontSize:"24px"}}>
            <FiMenu style={{ color: "#909090" }} /> Founders
          </span>
          <input type="text" placeholder="Search here" className="search-bar" style={{height:"28px"}} />
          <div className="profile-section">
            <div className="notification-icon">
              <FaBell />
            </div>
            <div className="user-info">
              <span className="user-initials">Franklin Jr.</span>
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
            <h2>List of Founders</h2>
            <button className="add-founder-button">+ Add new founder</button>
          </div>
          <div className="founders-list">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedAll}
                      onChange={handleSelectAll}
                    />
                  </th>
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
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected(founder.id)}
                        onChange={(event) => handleSelectOne(event, founder.id)}
                      />
                    </td>
                    <td>{founder.name}</td>
                    <td>{founder.contactNumber}</td>
                    <td>{founder.officialEmail}</td>
                    <td>{founder.dob}</td>
                    <td>{founder.designation}</td>
                    <td>
                      <a
                        href={founder.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {founder.resumeLink}
                      </a>
                    </td>
                    <td>{founder.qualification}</td>
                    <td>
                      <IconButton
                        onClick={(event) => handleMenuClick(event, founder)}
                      >
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
            <div className="table-footer">
              <button className="export-button">
                <FaFileExport className="icon" /> Export Table
              </button>
              <div className="pagination">
                <button className="pagination-button disabled">{"<"}</button>
                <span className="pagination-info">1 of 1</span>
                <button className="pagination-button disabled">{">"}</button>
                <div className="rows-per-page">
                  <span>Rows per page</span>
                  <select>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Foundersdata;
