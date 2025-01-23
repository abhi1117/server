//working dashboard 13 aug
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBell,
  FaRocket,
  FaUserCircle,
  FaSort,
  FaFileExport,
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import logo from "../Public/logo.png";
import successIcon from "../Public/Vector.png";
import "./admindash.css";
import AddProgramManagerModal from "./AddProgramManager";
import EditProgramManagerModal from "./EditProgramManager";
import ViewProgramManagerModal from "./ViewProgramManagerModal";
import loginLogo from "../Public/login.png";
import { useSelector, useDispatch } from "react-redux";
import {
  superAdminSelector,
  userId,
  superAdminAction,
} from "../../redux/reducers/superAdminReducer";

const SuccessModal = ({ showSuccessModal, handleClose }) => {
  if (!showSuccessModal) {
    return null;
  }

  return (
    <div className="modal-overlay admindash-modal-overlay">
      <div className="modal-content admindash-modal-content">
        <img
          src={successIcon}
          alt="Success"
          style={{ width: "50px", display: "block", margin: "0 auto" }}
        />
        <h2
          className="modal-title admindash-modal-title"
          style={{ marginTop: "15px", fontSize: "18px" }}
        >
          Program Manager Added Successfully
        </h2>
        <p style={{ color: "#909090" }}>
          Program Manager details have been added successfully.
        </p>
        <button
          onClick={handleClose}
          className="btn-primary admindash-btn-primary"
          style={{ width: "auto" }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

const Admindash = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [programManagerId, setProgramManagerId] = useState(null);
  const [programManagers, setProgramManagers] = useState([]);
  const [filteredProgramManagers, setFilteredProgramManagers] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [allProgramManagers, setAllProgramManagers] = useState(false); // New state to track if fetching all Program Managers
  const [adminDetails, setAdminDetails] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // New state for sorting configuration

  const navigate = useNavigate();
  const location = useLocation();
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);
  const dispatch = useDispatch();
  console.log("Admin dash running");
  useEffect(() => {
    if (location.state) {
      if (location.state.showActive !== undefined) {
        setShowActive(location.state.showActive);
      }
      if (location.state.allProgramManagers !== undefined) {
        setAllProgramManagers(location.state.allProgramManagers);
      }
    }
  }, [location.state]);
  
  //FETCH SUPER ADMIN DETAILS.
  const fetchAdminDetails = async () => {
    // console.log('running***********')
    try {
      if (role == "Super Admin") {
        const response = await axios.get(
          "https://incubator.drishticps.org/api/superadmins/me",
          {
            withCredentials: true, // Ensures cookies (including http-only) are sent
          }
        );
        setAdminDetails(response.data);
      } else {
        const response = await axios.get(
          "https://incubator.drishticps.org/api/admins/me",
          {
            withCredentials: true, // Ensures cookies (including http-only) are sent
          }
        );
        // console.log('response data:',response);
        setAdminDetails(response.data); // Store the fetched details in state
      }
    } catch (error) {
      console.error(
        "Error fetching super admin details:",
        error.response || error
      );
    }
  };
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let sortedData = [...programManagers];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredProgramManagers(
      sortedData.filter((pm) => pm.isActive === showActive)
    );
  }, [sortConfig, programManagers, showActive]);
  
  //GETTING PROGRAM MANAGERS
  const fetchProgramManagers = async () => {
    try {
      console.log("Fetching program manager********************");
      // Axios config with withCredentials: true to include the cookie
      const config = {
        withCredentials: true, // Ensures the HTTP-only cookie with the token is sent
      };

      // Set the correct URL based on conditions
      let url =
        "https://incubator.drishticps.org/api/admins/me/programmanagers";
      if (allProgramManagers) {
        url = showActive
          ? "https://incubator.drishticps.org/api/programmanagers/active"
          : "https://incubator.drishticps.org/api/programmanagers/inactive";
      }

      // Make the request to the appropriate URL
      const response = await axios.get(url, config);

      // Handle successful response
      if (response.status === 200) {
        setProgramManagers(response.data);
        setFilteredProgramManagers(
          response.data.filter((pm) => pm.isActive === showActive)
        );
      } else {
        console.error("Failed to fetch program managers");
      }
    } catch (error) {
      console.error("Error fetching program managers:", error);
    }
  };

  useEffect(() => {
    if (getUserId) {
      if (role == "Super Admin") {
        fetchAdminDetails();
        fetchProgramManagers();
      } else if (role == "Admin") {
        fetchAdminDetails();
        fetchProgramManagers();
      } else {
        navigate("/homepage");
      }
    } else {
      navigate("/login");
    }
  }, [showActive, allProgramManagers]);

//Hello

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    const filtered = programManagers
      .filter((pm) => {
        return (
          pm.adminName
            .toLowerCase()
            .includes(event.target.value.toLowerCase()) ||
          pm.adminPhone
            .toLowerCase()
            .includes(event.target.value.toLowerCase()) ||
          pm.username
            .toLowerCase()
            .includes(event.target.value.toLowerCase()) ||
          pm.email.toLowerCase().includes(event.target.value.toLowerCase())
        );
      })
      .filter((pm) => pm.isActive === showActive);
    setFilteredProgramManagers(filtered);
    setCurrentPage(0); // Reset to first page when search query changes
  };

  const handleMenuClick = (event, admin) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdmin(admin);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAdmin(null);
  };

  const handleViewDetails = (adminId) => {
    setProgramManagerId(adminId);
    setShowViewModal(true);
    handleMenuClose();
  };

  const handleEdit = (adminId) => {
    setProgramManagerId(adminId);
    setShowEditModal(true);
    handleMenuClose();
  };

  const handleDisable = async (adminId) => {
    if (
      window.confirm("Are you sure you want to disable this Program Manager?")
    ) {
      try {
        //  const token = localStorage.getItem("token");
        /*  const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };*/
        const response = await axios.put(
          `https://incubator.drishticps.org/api/programmanagers/${adminId}/disable`,
          {},
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          alert("Program Manager disabled successfully");
          fetchProgramManagers(); // Refresh the list after disabling
        } else {
          alert("Failed to disable Program Manager. Please try again.");
        }
      } catch (error) {
        console.error("Error disabling Program Manager:", error);
        if (error.response && error.response.status === 404) {
          alert("Program Manager not found.");
        } else {
          alert("Error disabling Program Manager. Please try again.");
        }
      }
    }
    handleMenuClose();
  };

  const handleEnable = async (adminId) => {
    if (
      window.confirm("Are you sure you want to enable this Program Manager?")
    ) {
      try {
        /*  const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };*/
        const response = await axios.put(
          `https://incubator.drishticps.org/api/programmanagers/${adminId}/enable`,
          {},
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          alert("Program Manager enabled successfully");
          fetchProgramManagers(); // Refresh the list after enabling
        } else {
          alert("Failed to enable Program Manager. Please try again.");
        }
      } catch (error) {
        console.error("Error enabling Program Manager:", error);
        if (error.response && error.response.status === 404) {
          alert("Program Manager not found.");
        } else {
          alert("Error enabling Program Manager. Please try again.");
        }
      }
    }
    handleMenuClose();
  };

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectedAll(checked);
    if (checked) {
      const allIds = filteredProgramManagers.map((pm) => pm._id);
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

  const exportTableToCSV = () => {
    const headers = [
      "Name Of The Admin",
      "Mobile Number",
      "User Name",
      "E-Mail",
    ];

    // Check if any program manager is selected
    const rows = selectedIds.length
      ? filteredProgramManagers
          .filter((pm) => selectedIds.includes(pm._id))
          .map((pm) => [pm.adminName, pm.adminPhone, pm.username, pm.email])
      : filteredProgramManagers.map((pm) => [
          pm.adminName,
          pm.adminPhone,
          pm.username,
          pm.email,
        ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    rows.forEach((rowArray) => {
      let row = rowArray.join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "program_manager_ids.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSuccessModal = () => {
    setShowModal(false);
    setShowSuccessModal(true);
    fetchProgramManagers(); // Refresh program managers list after adding a new one
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleEditSuccessModal = () => {
    setShowEditModal(false);
    fetchProgramManagers(); // Refresh program managers list after editing a program manager
  };
  /*
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };*/
  const handleLogout = async () => {
    try {
      if (role == "Super Admin") {
        const response = await axios.post(
          "https://incubator.drishticps.org/api/logout/superAdmin",
          {},
          { withCredentials: true }
        );

        setAdminDetails(null);
        dispatch(superAdminAction.logoutUser());
        navigate("/login");
      } else {
        const response = await axios.post(
          `https://incubator.drishticps.org/api/logout/admin/${adminDetails._id}`,
          {},
          { withCredentials: true }
        );

        // Clear the user data from React state
        // setUser(null);
        //  console.log('RESPONSE:',response);
        // Redirect to login or homepage
        setAdminDetails(null);
        dispatch(superAdminAction.logoutUser());
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
    navigate("/login");
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(0); // Reset to the first page when rows per page changes
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(filteredProgramManagers.length / rowsPerPage) - 1;
    setCurrentPage((prevPage) => Math.min(prevPage + 1, maxPage));
  };

  const paginatedData = filteredProgramManagers.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  return (
    <div className="dashboard admindash-dashboard">
      {/* <aside className="sidebar admindash-sidebar">
        <div className="logo-container admindash-logo-container">
          <div className="logo admindash-logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className="nav-container admindash-nav-container">
          <nav className="nav admindash-nav">
            <ul>
              <li
                className="nav-item admindash-nav-item"
                style={{ marginTop: "80px" }}
                onClick={() => setShowActive(true)}
              >
                <FaUserCircle className="nav-icon admindash-nav-icon" /> Active
                Program manager
              </li>
              <li
                className="nav-item admindash-nav-item"
                onClick={() => setShowActive(false)}
              >
                <FaRocket className="nav-icon admindash-nav-icon" /> Inactive
                Program manager
              </li>
            </ul>
          </nav>
        </div>
      </aside> */}

      <aside className="sidebar admindash-sidebar">
        <div className="logo-container admindash-logo-container">
          <div className="logo admindash-logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className="nav-container admindash-nav-container">
          <nav className="nav admindash-nav">
            <ul>
              {/* Home Page Button */}
              <li
                className="nav-item admindash-nav-item"
                style={{ marginTop: "80px" }}
                onClick={() => {
                  if (role === "Super Admin") {
                    navigate("/cards");
                  } else {
                    navigate("/admincards");
                  }
                }}
              >
                <FaUserCircle className="nav-icon admindash-nav-icon" /> Home
                Page
              </li>
              <li
                className="nav-item admindash-nav-item"
                onClick={() => setShowActive(true)}
              >
                <FaUserCircle className="nav-icon admindash-nav-icon" /> Active
                Program Manager
              </li>
              <li
                className="nav-item admindash-nav-item"
                onClick={() => setShowActive(false)}
              >
                <FaRocket className="nav-icon admindash-nav-icon" /> Inactive
                Program Manager
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="main-content admindash-main-content">
        <header className="header admindash-header">
          <span
            className="founder admindash-founder"
            style={{ fontSize: "24px" }}
          >
            Admin
          </span>
          <div className="profile-section admindash-profile-section">
            <div className="user-info admindash-user-info">
              <span className="user-initials admindash-user-initials">
                <img src={loginLogo} alt="Login" style={{ width: "40px" }} />
              </span>
              <div className="user-details admindash-user-details">
                <span className="user-name admindash-user-name">
                  {adminDetails.name}{" "}
                </span>
                <span className="user-email admindash-user-email">
                  {adminDetails.email}
                </span>
              </div>
              <button
                className="logout-button admindash-logout-button"
                onClick={handleLogout}
                style={{ marginLeft: "25px", padding: "8px" }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="content admindash-content">
          <div className="content-header admindash-content-header">
            <h3>List of Program Manager</h3>
            <input
              type="text"
              placeholder="Search here"
              className="search-bar admindash-search-bar"
              style={{ height: "35px" }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button
              className="add-founder-button admindash-add-founder-button"
              onClick={handleOpenModal}
            >
              Create Program Manager ID
            </button>
          </div>
          <div className="admin-list admindash-admin-list">
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
                  <th onClick={() => handleSort("adminName")}>
                    Name Of The Admin{" "}
                    <FaSort className="sorticon admindash-sorticon" />
                  </th>
                  <th>
                    Mobile Number{" "}
                    {/* <FaSort className="sorticon admindash-sorticon" /> */}
                  </th>
                  <th>
                    User Name
                    {/* <FaSort className="sorticon admindash-sorticon" /> */}
                  </th>
                  <th>
                    E-Mail
                    {/* <FaSort className="sorticon admindash-sorticon" /> */}
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((pm) => (
                  <tr key={pm._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected(pm._id)}
                        onChange={(event) => handleSelectOne(event, pm._id)}
                      />
                    </td>
                    <td>{pm.adminName}</td>
                    <td>{pm.adminPhone}</td>
                    <td>{pm.username}</td>
                    <td>{pm.email}</td>
                    <td>
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMenuClick(event, pm);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(
                          anchorEl &&
                            selectedAdmin &&
                            selectedAdmin._id === pm._id
                        )}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleViewDetails(pm._id)}>
                          View Details
                        </MenuItem>
                        <MenuItem onClick={() => handleEdit(pm._id)}>
                          Edit
                        </MenuItem>
                        {showActive ? (
                          <MenuItem onClick={() => handleDisable(pm._id)}>
                            Disable
                          </MenuItem>
                        ) : (
                          <MenuItem onClick={() => handleEnable(pm._id)}>
                            Enable
                          </MenuItem>
                        )}
                      </Menu>
                    </td>
                  </tr>
                ))}
                {filteredProgramManagers.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center admindash-text-center"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src="/founders/not.png"
                          alt="No Organization"
                          style={{
                            width: "50px",
                            marginRight: "10px",
                            textAlign: "left",
                          }}
                        />
                        <p style={{ margin: 0 }}>
                          No program manager added yet
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="table-footer admindash-table-footer">
              <button
                className="export-button admindash-export-button"
                onClick={exportTableToCSV}
              >
                <FaFileExport className="icon admindash-icon" /> Export Table
              </button>
              <div className="pagination admindash-pagination">
                <button
                  className="pagination-button admindash-pagination-button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                >
                  {"<"}
                </button>
                <span className="pagination-info admindash-pagination-info">
                  {currentPage + 1} of{" "}
                  {Math.ceil(filteredProgramManagers.length / rowsPerPage)}
                </span>
                <button
                  className="pagination-button admindash-pagination-button"
                  onClick={handleNextPage}
                  disabled={
                    currentPage >=
                    Math.ceil(filteredProgramManagers.length / rowsPerPage) - 1
                  }
                >
                  {">"}
                </button>
                <div className="rows-per-page admindash-rows-per-page">
                  <span>Rows per page</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
        <AddProgramManagerModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSuccess={handleSuccessModal}
        />
        <EditProgramManagerModal
          showModal={showEditModal}
          handleClose={handleCloseEditModal}
          programManagerId={programManagerId}
          handleSuccess={handleEditSuccessModal}
        />
        <ViewProgramManagerModal
          showModal={showViewModal}
          handleClose={() => setShowViewModal(false)}
          programManagerId={programManagerId}
        />
        <SuccessModal
          showSuccessModal={showSuccessModal}
          handleClose={handleCloseSuccessModal}
        />
      </main>
    </div>
  );
};

export default Admindash;
