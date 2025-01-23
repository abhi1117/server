import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
} from 'react-icons/fa';
import { CgNotes } from 'react-icons/cg';
import { AiOutlineEye } from 'react-icons/ai';
import { FiMenu } from 'react-icons/fi';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EvaluationStartup.css';

const EvaluationStartup = () => {
  const [startups, setStartups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startupsPerPage, setStartupsPerPage] = useState(10);
  const [selectedStartups, setSelectedStartups] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  
  // HIGHLIGHT START: Add state for user data
  const [user, setUser] = useState({ name: '', email: '', username: '' });
  // HIGHLIGHT END
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchStartups();
    fetchUserData(); // HIGHLIGHT START: Fetch user data on component mount
  }, []);

  const fetchStartups = async () => {
    try {
      const response = await axios.get('https://incubator.drishticps.org/api/formSubmissions');
      setStartups(response.data);
    } catch (error) {
      console.error('Error fetching startups:', error);
    }
  };

  // HIGHLIGHT START: Fetch user data function
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://incubator.drishticps.org/api/programmanagers/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user data. Status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  // HIGHLIGHT END

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setStartupsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (selectedStartups.length === 0) {
      toast.error('Please select at least one startup to export.');
      return;
    }

    const csv = selectedStartups.map((startup) => ({
      'Startup Name': startup.formData['Name'],
      'Email': startup.formData[' Email'] || startup.formData['Email'],
      'Registered Office Location': startup.formData['Registered Office Location'] || startup.formData['RegisteredOfficeLocation'],
      'One Line of Your Startup': startup.formData['One Liner of your startup'] || startup.formData['OneLinerOfYourStartup'],
      'Logo': startup.files.find(file => file.mimeType.startsWith('image/'))?.originalName || '',
      'Social Media Link': startup.formData['Social Media Link'] || startup.formData['SocialMediaLink'],
      'Domain Of Startup': startup.formData['Domain Of Startup'] || startup.formData['DomainOfStartup'],
      'Team Size': startup.formData['Startup team size'] || startup.formData['StartupTeamSize'],
    }));

    const csvContent = 'data:text/csv;charset=utf-8,'
      + Object.keys(csv[0]).join(',') + '\n'
      + csv.map((e) => Object.values(e).join(',')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'startups.csv');
    document.body.appendChild(link);
    link.click();
  };

  const indexOfLastStartup = currentPage * startupsPerPage;
  const indexOfFirstStartup = indexOfLastStartup - startupsPerPage;
  const currentStartups = startups.slice(indexOfFirstStartup, indexOfLastStartup);
  const totalPages = Math.ceil(startups.length / startupsPerPage);

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
      setSelectedStartups(selectedStartups.filter((s) => s !== startup));
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
      if (a.formData[key] < b.formData[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a.formData[key] > b.formData[key]) {
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

  const handleViewDetails = (startup) => {
    navigate(`/evaluation-startup/${startup.formTitle}`, { state: { startup } });
  };

  return (
    <div className="dashboard-form-evaluationstartup">
      {/* sidebar start */}
      <aside className="sidebar-evaluationstartup">
        <div className="logo-container-evaluationstartup">
          <div className="logo-evaluationstartup">
            <img src="/navbar/drishtilogo.jpg" alt="Logo" className="dristilogo-evaluationstartup" />
          </div>
        </div>
        <div className="nav-container-evaluationstartup" >
          <nav className="nav-evaluationstartup">
            <ul>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-evaluationstartup" /> General Form
                </Link>
              </li>
              <li>
                <Link to="/evaluation-startup">
                  <AiOutlineEye className="nav-icon-evaluationstartup" /> Evaluator Form
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      {/* sidebar end */}
      <main className="main-content-form-evaluationstartup">
      {/* navbar start */}
        <header className="header-form-evaluationstartup">
          <span className="founder-form-evaluationstartup">
            All Forms
          </span>
          <div className="profile-section-form-evaluationstartup">
            <div>
              <FaBell className="notification-icon-form-evaluationstartup" />
            </div>
            <div className="user-info-form-evaluationstartup">
              {/* <img src="/navbar/profilepicture.png" alt="User Avatar" className="user-initials-form-evaluationstartup" /> */}
              <span className="user-initials-form-evaluationstartup">
                <img
                  src="/navbar/login.png"
                  alt="Login"
                  style={{ width: "40px" }}
                />
              </span>
              <div className="user-details-form-evaluationstartup">
                {/* HIGHLIGHT START: Display username and email */}
                <span className="user-name-form-evaluationstartup">
                  {user.username} 
                </span>
                <br />
                <span className="user-email-form-evaluationstartup">{user.email}</span>
                {/* HIGHLIGHT END */}
              </div>
            </div>
          </div>
        </header>
      {/* navbar end */}
        <section className="content-form-evaluationstartup">
          <div className="content-header-form-evaluationstartup">
            <h2>Evaluation Startup</h2>
          </div>
          <div className="form-list-form-evaluationstartup">
            <div className="search-container-new-evaluationstartup">
              <input type="text" placeholder="Name of the Startup" className="search-bar-small-new-evaluationstartup" />
              <button className="view-startup-button-new-evaluationstartup">View Startup</button>
            </div>
            <div className="table-container-new-evaluationstartup">
              <div className="scrollable-table-container-new-evaluationstartup">
                <table className="evaluation-table-evaluationstartup">
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" onChange={handleSelectAll} checked={allSelected} />
                      </th>
                      <th onClick={() => requestSort('Name')}>
                        Startup Name <span className="sort-icon-evaluationstartup">{getClassNamesFor('Name') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('Name') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                      </th>
                      <th onClick={() => requestSort('Email')}>
                        Email <span className="sort-icon-evaluationstartup">{getClassNamesFor('Email') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('Email') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                      </th>
                      <th onClick={() => requestSort('Registered Office Location')}>
                        Registered Office Location <span className="sort-icon-evaluationstartup">{getClassNamesFor('Registered Office Location') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('Registered Office Location') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                      </th>
                      <th onClick={() => requestSort('One Liner of your startup')}>
                        One Line of Your Startup <span className="sort-icon-evaluationstartup">{getClassNamesFor('One Liner of your startup') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('One Liner of your startup') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                      </th>
                      <th onClick={() => requestSort('Domain Of Startup')}>
                        Domain Of Startup <span className="sort-icon-evaluationstartup">{getClassNamesFor('Domain Of Startup') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('Domain Of Startup') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                      </th>
                      <th onClick={() => requestSort('Startup team size')}>
                        Team Size <span className="sort-icon-evaluationstartup">{getClassNamesFor('Startup team size') === 'ascending' ? <SortAscIcon /> : getClassNamesFor('Startup team size') === 'descending' ? <SortDescIcon /> : <SortBothIcon />}</span>
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStartups.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="no-evaluation-evaluationstartup">
                          <div className="no-evaluation-content-evaluationstartup">
                            <img src="/founders/nostartupadd.jpg" alt="Logo" style={{ marginTop: '70px', width: '120px', height: '120px' }} />
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
                          <td>{startup.formData['Name']}</td>
                          <td>{startup.formData[' Email'] || startup.formData['Email']}</td>
                          <td>{startup.formData['Registered Office Location'] || startup.formData['RegisteredOfficeLocation']}</td>
                          <td>{startup.formData['One Liner of your startup'] || startup.formData['OneLinerOfYourStartup']}</td>
                          <td>{startup.formData['Domain Of Startup'] || startup.formData['DomainOfStartup']}</td>
                          <td>{startup.formData['Startup team size'] || startup.formData['StartupTeamSize']}</td>
                          <td>
                            <div className="action-column-evaluationstartup">
                              <AiOutlineEye className="view-icon-new-evaluationstartup" onClick={() => handleViewDetails(startup)} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="table-bottom-border-new-evaluationstartup"></div>
              </div>
              <div className="pagination-container-new-evaluationstartup">
                <div className="pagination-new-evaluationstartup">
                  <FaChevronLeft
                    className={`pagination-arrow-new-evaluationstartup ${currentPage === 1 && 'disabled'}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                  <span className="page-number-new-evaluationstartup">
                    <span className="current-page-new-evaluationstartup">{currentPage}</span> / {totalPages}
                  </span>
                  <FaChevronRight
                    className={`pagination-arrow-new-evaluationstartup ${currentPage === totalPages && 'disabled'}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                </div>
                <div className="exporttablepage-new-evaluationstartup">
                  <div className="export-table-new-evaluationstartup" onClick={handleExport}>
                    <FaDownload className="export-icon-new-evaluationstartup" />
                    <span>Export Table</span>
                  </div>
                  <div className="rows-per-page-new-evaluationstartup">
                    <label>Rows per page</label>
                    <select value={startupsPerPage} onChange={handleRowsPerPageChange}>
                      {[2, 10, 15, 20].map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EvaluationStartup;
 