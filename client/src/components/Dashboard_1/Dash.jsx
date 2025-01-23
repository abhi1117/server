import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSort, FaBriefcase, FaDollarSign, FaRegLightbulb, FaEllipsisV, FaChevronLeft, FaChevronRight, FaDownload } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./Dash.css";
import logo from "../Public/logo.png";

const Dash = () => {
  const navigate = useNavigate();
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(10); // Default tickets per page
  const startups = ["IKEA Pvt Ltd", "Uber Inc.", "Drishti Pvt Ltd", "Jobs Academy Pvt Ltd", "2Coms Pvt Ltd"];
  const totalPages = Math.ceil(startups.length / ticketsPerPage);

  const toggleDropdown = (index, event) => {
    if (dropdownIndex === index) {
      setDropdownIndex(null);
      return;
    }

    const rect = event.target.getBoundingClientRect();
    const dropdownHeight = 120; // Estimated height of the dropdown menu

    const bottomSpace = window.innerHeight - rect.bottom;
    const topSpace = rect.top;

    let positionStyle;
    if (bottomSpace < dropdownHeight && topSpace > bottomSpace) {
      // Open the dropdown above the element
      positionStyle = { bottom: 'calc(100% + 10px)', right: 0 };
    } else {
      // Open the dropdown below the element
      positionStyle = { top: 'calc(100% + 10px)', right: 0 };
    }

    setDropdownIndex({ index, positionStyle });
  };

  const handleClickOutside = (event) => {
    const isOutside = dropdownRefs.current.every(
      (ref) => ref && !ref.contains(event.target)
    );
    if (isOutside) {
      setDropdownIndex(null);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Startup Name,Startup Registration Date,Domain Name\n"
      + startups.map(startup => `"${startup}","12, Apr 2024","Edtech"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "startups.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleRowsPerPageChange = (event) => {
    setTicketsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing tickets per page
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate current startups to display based on pagination
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const displayedStartups = startups.slice(startIndex, startIndex + ticketsPerPage);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img src={logo} alt="Logo" style={{width:"100px", }}/>
          </div>
        </div>
        <div className="nav-container">
          <nav className="nav">
            <ul>
              <li className="active">
                <FaUserCircle className="nav-icon" /> Dashboard
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <span className="founder">
            <FiMenu style={{ color: "#909090" }} /> Dashboard
          </span>
          <input
            type="text"
            placeholder="Search here"
            className="search-bar"
          />
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

        <div className="metrics">
          <div className="metric">
            <FaBriefcase className="metric-icon" />
            <span className="metric-number">37</span>
            <span className="metric-label">Startups Onboarded</span>
          </div>
          <div className="metric">
            <FaDollarSign className="metric-icon" />
            <span className="metric-number">2</span>
            <span className="metric-label">Startups Funded</span>
          </div>
          <div className="metric">
            <FaRegLightbulb className="metric-icon" />
            <span className="metric-number">5</span>
            <span className="metric-label">Startups Incubated</span>
          </div>
        </div>

        <section className="content">
          <div className="content-header">
            <h2>List of Startups</h2>
          </div>
          <div className="founders-list">
            <table>
              <thead>
                <tr>
                  <th>Startup Name <FaSort className="sorticon" /></th>
                  <th>Startup Registration Date <FaSort className="sorticon" /></th>
                  <th>Domain Name <FaSort className="sorticon" /></th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedStartups.map((startup, index) => (
                  <tr key={index}>
                    <td>{startup}</td>
                    <td>12, Apr 2024</td>
                    <td>Edtech</td>
                    <td>
                      <div className="action-container" ref={el => (dropdownRefs.current[index] = el)}>
                        <FaEllipsisV className="action-icon" onClick={(event) => toggleDropdown(index, event)} />
                        {dropdownIndex?.index === index && (
                          <div className="dropdown-menu" style={dropdownIndex.positionStyle}>
                            <button onClick={() => navigate('/view-startup-details')}>View Startup Details</button>
                            <button>View Founder Details</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-bottom-border"></div>
          </div>
          <div className="pagination-container">
            <div className="pagination">
              <FaChevronLeft
                className={`pagination-arrow ${currentPage === 1 && 'disabled'}`}
                onClick={() => handlePageChange(currentPage - 1)}
              />
              <span className="page-number">
                <span className="current-page">{currentPage}</span> / {totalPages}
              </span>
              <FaChevronRight
                className={`pagination-arrow ${currentPage === totalPages && 'disabled'}`}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </div>
            <div className="exporttablepage">
              <div className="export-table" onClick={handleExport}>
                <FaDownload className="export-icon" />
                <span style={{ fontSize: "13px" }}>Export Table</span>
              </div>
              <div className="rows-per-page">
                <label>Rows per page</label>
                <select value={ticketsPerPage} onChange={handleRowsPerPageChange}>
                  {[2, 10, 15, 20].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dash;
