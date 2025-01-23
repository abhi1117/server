import React, { useState } from "react";
import { Link, useNavigate } from "router";
import {
  FaBell,
  FaRocket,
  FaTicketAlt,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
  FaDownload
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoDocumentLock } from "react-icons/io5";
import { IoIosDocument } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
// import AddStartupModal from "./AddStartupModal";
// import StartupSuccessModal from "./StartupSuccessModal"; 
import "./Startup.css";
import "../Shared/Sidebar.css";

const Startup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [startups, setStartups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startupsPerPage, setStartupsPerPage] = useState(10);
  const [selectedStartups, setSelectedStartups] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openSuccessModal = () => setIsSuccessModalOpen(true);
  const closeSuccessModal = () => setIsSuccessModalOpen(false);

  const handleSave = (newStartup) => {
    setStartups([...startups, newStartup]);
    closeModal(); 
    openSuccessModal(); 
  };

  const handleExport = () => {
    if (selectedStartups.length === 0) {
      toast.error("Please select at least one startup to export.");
      return;
    }

    const csv = selectedStartups.map(startup => ({
      "Startup Stage": startup.stage,
      "Registered Office Location": startup.location,
      "One Line of Your Startup": startup.oneLiner,
      "Logo": startup.logo.name,
      "Social Media Link": startup.socialMedia,
      "Domain Of Startup": startup.domain,
      "Team Size": startup.teamSize
    }));

    const csvContent = "data:text/csv;charset=utf-8,"
      + Object.keys(csv[0]).join(",") + "\n"
      + csv.map(e => Object.values(e).join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "startups.csv");
    document.body.appendChild(link);
    link.click();
  };

  const renderLogoName = (logo) => {
    if (logo) {
      return logo.name;
    }
    return null;
  };

  const indexOfLastStartup = currentPage * startupsPerPage;
  const indexOfFirstStartup = indexOfLastStartup - startupsPerPage;
  const currentStartups = startups.slice(indexOfFirstStartup, indexOfLastStartup);
  const totalPages = Math.ceil(startups.length / startupsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setStartupsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const handleViewDetails = (startup) => {
    navigate(`/startup-general/${startup.id}`, { state: { startup } });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedStartups([]);
    } else {
      setSelectedStartups(currentStartups);
    }
    setAllSelected(!allSelected);
  };

  const handleSelect = (startup) => {
    if (selectedStartups.includes(startup)) {
      setSelectedStartups(selectedStartups.filter(s => s !== startup));
    } else {
      setSelectedStartups([...selectedStartups, startup]);
    }
  };

  const SortAscIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6l-6 6h12l-6-6z"></path>
    </svg>
  );

  const SortDescIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 18l6-6H6l6 6z"></path>
    </svg>
  );

  const SortBothIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6l-6 6h12l-6-6zM12 18l6-6H6l6 6z"></path>
    </svg>
  );

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = '';
      }
    }
    setSortConfig({ key, direction });
    sortArray(key, direction);
  };

  const sortArray = (key, direction) => {
    if (direction === '') {
      setStartups([...startups]); 
      return;
    }

    const sortedData = [...startups].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setStartups(sortedData);
  };

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img src="/navbar/drishtilogo.jpg" alt="Logo" className="dristilogo" />
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
              <li>
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
            <div>
              <FaBell className="notification-icon" />
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
          <div className="content-header">
            <h2>List of Startups</h2>
            <button className="add-startup-button" onClick={openModal}>
              + Add startup Details
            </button>
          </div>
          <div className="founders-list">
            <table className="no-border-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" onChange={handleSelectAll} checked={allSelected} />  
                  </th>
                  <th onClick={() => requestSort('stage')}>
                    Startup Stage <span className="sort-icon">{getClassNamesFor('stage') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('stage') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                  </th>
                  <th onClick={() => requestSort('location')}>
                    Registered Office Location <span className="sort-icon">{getClassNamesFor('location') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('location') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                  </th>
                  <th onClick={() => requestSort('oneLiner')}>
                    One Line of Your Startup <span className="sort-icon">{getClassNamesFor('oneLiner') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('oneLiner') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                  </th>
                  <th onClick={() => requestSort('logo')}>
                    Logo <span className="sort-icon">{getClassNamesFor('logo') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('logo') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                  </th>
                  <th onClick={() => requestSort('socialMedia')}>
                    Social Media Link <span className="sort-icon">{getClassNamesFor('socialMedia') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('socialMedia') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                  </th>
                  <th onClick={() => requestSort('domain')}>
                    Domain Of Startup <span className="sort-icon">{getClassNamesFor('domain') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('domain') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                  </th>
                  <th onClick={() => requestSort('teamSize')}>
                    Team Size <span className="sort-icon">{getClassNamesFor('teamSize') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('teamSize') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentStartups.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-founder">
                      <div className="no-founder-content">
                        <img src="/founders/nostartupadd.jpg" alt="Logo" style={{ marginTop: "70px", width: "120px", height: "120px" }} />
                        <h4>No Startup Added Yet</h4>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentStartups.map((startup, index) => (
                    <tr key={index}>
                      <td>
                        <input type="checkbox" onChange={() => handleSelect(startup)} checked={selectedStartups.includes(startup)} />
                      </td>
                      <td>{startup.stage}</td>
                      <td>{startup.location}</td>
                      <td>{startup.oneLiner}</td>
                      <td>{renderLogoName(startup.logo)}</td>
                      <td>{startup.socialMedia}</td>
                      <td>{startup.domain}</td>
                      <td>{startup.teamSize}</td>
                      <td>
                        <div className="dropdown">
                          <FaEllipsisV className="dots-icon" />
                          <div className="dropdown-content">
                            <button onClick={() => handleViewDetails(startup)} className="dropdown-button">
                              <span className="icon">&#x1F4C4;</span>
                              View Details
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
                <span>Export Table</span>
              </div>
              <div className="rows-per-page">
                <label>Rows per page</label>
                <select value={startupsPerPage} onChange={handleRowsPerPageChange}>
                  {[2, 10, 15, 20].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
        {/* <AddStartupModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} />
        <StartupSuccessModal isOpen={isSuccessModalOpen} onClose={closeSuccessModal} /> */}
        <ToastContainer position="bottom-right" /> 
      </main>
    </div>
  );
};

export default Startup;
