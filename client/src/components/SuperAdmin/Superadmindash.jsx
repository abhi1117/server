import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaRocket, FaUserCircle, FaSort, FaFileExport } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import logo from "../Public/logo.png";
import successIcon from "../Public/Vector.png";
import "./Superadmindash.css";
import AddOrganizationModal from "./AddOrganizationModal.jsx";
import EditOrganizationModal from "./EditOrganizationModal.jsx";
import ViewOrganizationModal from "./ViewOrganizationModal.jsx";
import loginLogo from "../Public/login.png";
import { useSelector, useDispatch } from "react-redux";
import {
  superAdminSelector,
  userToken,
  userId,
  superAdminAction,
} from "../../redux/reducers/superAdminReducer.js";

const SuccessModal = ({ showSuccessModal, handleClose }) => {
  if (!showSuccessModal) {
    return null;
  }

  return (
    <div className="modal-overlay superadmindash-modal-overlay">
      <div className="modal-content superadmindash-modal-content">
        <img
          src={successIcon}
          alt="Success"
          style={{ width: "50px", display: "block", margin: "0 auto" }}
        />
        <h2
          className="modal-title superadmindash-modal-title"
          style={{ marginTop: "15px" }}
        >
          Organization ID Added Successfully
        </h2>
        <p style={{ color: "#909090" }}>
          Organization details have been added successfully.
        </p>
        <button
          onClick={handleClose}
          style={{ width: "40px", textAlign: "center" }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

const Superadmindash = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [superAdminDetails, setSuperAdminDetails] = useState({
    email: "",
    name: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  console.log("calling super admin dash");
  const token = useSelector(userToken);
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);
  console.log("role in superadmin dash:", role);
  console.log("id in super adimin dash:", getUserId);
  //FETCH SUPER ADMIN DETAILS.
  const fetchSuperAdminDetails = async () => {
    // console.log('running***********')
    try {
      const response = await axios.get(
        "https://incubator.drishticps.org/api/superadmins/me",
        {
          withCredentials: true, // Ensures cookies (including http-only) are sent
        }
      );
      // console.log('response data:',response.data);
      setSuperAdminDetails(response.data); // Store the fetched details in state
    } catch (error) {
      console.error(
        "Error fetching super admin details:",
        error.response || error
      );
    }
  };

  const fetchOrganizations = async () => {
    try {
      //  const token = localStorage.getItem("token");
      const config = {
        withCredentials: true, // Ensures the HTTP-only cookie with the token is sent
      };
      const response = await axios.get(
        "https://incubator.drishticps.org/api/organizations",
        config
      );
      const sortedData = response.data.sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
      );
      setAdminData(sortedData);
      setFilteredData(sortedData.filter((org) => org.isActive === showActive));
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  useEffect(() => {
    if (getUserId) {
      //  console.log("role:",role);
      if (role == "Super Admin") {
        fetchSuperAdminDetails();
        fetchOrganizations();
      } else if (role == "Admin") {
        navigate("/admincards");
        return;
      } else {
        navigate("/homepage");
      }
    } else {
      navigate("/login");
    }
  }, [showActive]);

  useEffect(() => {
    if (location.state && location.state.showActive !== undefined) {
      setShowActive(location.state.showActive);
    }
  }, [location.state]);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = adminData
      .filter(
        (admin) =>
          admin.name.toLowerCase().includes(query) ||
          admin.adminName.toLowerCase().includes(query) ||
          admin.adminPhone.toLowerCase().includes(query) ||
          admin.username.toLowerCase().includes(query) ||
          admin.email.toLowerCase().includes(query)
      )
      .filter((org) => org.isActive === showActive);
    setFilteredData(filtered);
    setCurrentPage(0);
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
    setOrganizationId(adminId);
    setShowViewModal(true);
    handleMenuClose();
  };

  const handleEdit = (adminId) => {
    setOrganizationId(adminId);
    setShowEditModal(true);
    handleMenuClose();
  };

  const handleDisable = async (adminId) => {
    if (window.confirm("Are you sure you want to disable this organization?")) {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        //  console.log('id:',adminId);
        const response = await axios.put(
          `https://incubator.drishticps.org/api/disableOrganization/${adminId}`,
          {},
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          alert("Organization disabled successfully");
          fetchOrganizations();
        } else {
          alert("Failed to disable organization. Please try again.");
        }
      } catch (error) {
        console.error("Error disabling organization:", error);
        if (error.response && error.response.status === 404) {
          alert("Organization not found.");
        } else {
          alert("Error disabling organization. Please try again.");
        }
      }
    }
    handleMenuClose();
  };

  const handleEnable = async (adminId) => {
    if (window.confirm("Are you sure you want to enable this organization?")) {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.put(
          `https://incubator.drishticps.org/api/disableOrganization/enable/${adminId}`,
          {},
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          alert("Organization enabled successfully");
          fetchOrganizations();
        } else {
          alert("Failed to enable organization. Please try again.");
        }
      } catch (error) {
        console.error("Error enabling organization:", error);
        if (error.response && error.response.status === 404) {
          alert("Organization not found.");
        } else {
          alert("Error enabling organization. Please try again.");
        }
      }
    }
    handleMenuClose();
  };

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectedAll(checked);
    if (checked) {
      const allIds = filteredData.map((admin) => admin._id);
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
      "Name Of The Organization",
      "Name Of The Admin",
      "Mobile Number",
      "User Name",
      "E-Mail",
    ];
    const rows = (
      selectedIds.length > 0
        ? filteredData.filter((admin) => selectedIds.includes(admin._id))
        : filteredData
    ).map((admin) => [
      admin.name,
      admin.adminName,
      admin.adminPhone,
      admin.username,
      admin.email,
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    rows.forEach((rowArray) => {
      let row = rowArray.join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "organization_ids.csv");
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
    fetchOrganizations();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleEditSuccessModal = () => {
    setShowEditModal(false);
    fetchOrganizations();
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(0);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(filteredData.length / rowsPerPage) - 1;
    setCurrentPage((prevPage) => Math.min(prevPage + 1, maxPage));
  };

  const paginatedData = filteredData.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  /*
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  */
  const handleLogout = async () => {
    try {
      // Make a request to clear the cookie on the backend
      const response = await axios.post(
        "https://incubator.drishticps.org/api/logout/superAdmin",
        {},
        { withCredentials: true }
      );

      // Clear the user data from React state
      // setUser(null);
      console.log("RESPONSE 1:", response);
      // Redirect to login or homepage
      setSuperAdminDetails(null);
      dispatch(superAdminAction.logoutUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    navigate("/login");
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let sortedData = [...adminData];
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
    setFilteredData(sortedData.filter((org) => org.isActive === showActive));
  }, [sortConfig, adminData, showActive]);

  return (
    <div className="dashboard superadmindash-dashboard">
      <aside className="sidebar superadmindash-sidebar">
        <div className="logo-container superadmindash-logo-container">
          <div className="logo superadmindash-logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className="nav-container superadmindash-nav-container">
          <nav className="nav superadmindash-nav">
            <ul>
              {/* New Home Page Button */}
              <li
                className="nav-item superadmindash-nav-item"
                style={{ marginTop: "60px" }}
                onClick={() => navigate("/cards")}
              >
                <FaRocket className="nav-icon superadmindash-nav-icon" /> Home
                Page
              </li>
              <li
                className="nav-item superadmindash-nav-item"
                onClick={() =>
                  navigate("/SuperadminDash", { state: { showActive: true } })
                }
              >
                <FaUserCircle className="nav-icon superadmindash-nav-icon" />{" "}
                Active Organization
              </li>
              <li
                className="nav-item superadmindash-nav-item"
                onClick={() =>
                  navigate("/SuperadminDash", { state: { showActive: false } })
                }
              >
                <FaRocket className="nav-icon superadmindash-nav-icon" />{" "}
                Inactive Organization
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="main-content superadmindash-main-content">
        <header className="header superadmindash-header">
          <span
            className="founder superadmindash-founder"
            style={{ fontSize: "24px" }}
          >
            <FiMenu style={{ color: "#909090" }} /> Super Admin
          </span>

          <div className="profile-section superadmindash-profile-section">
            <div className="user-info superadmindash-user-info">
              <span className="user-initials superadmindash-user-initials">
                <img src={loginLogo} alt="Login" style={{ width: "40px" }} />
              </span>
              <div className="user-details superadmindash-user-details">
                <span className="user-name superadmindash-user-name">
                  {superAdminDetails.name}{" "}
                </span>
                <span className="user-email superadmindash-user-email">
                  {superAdminDetails.email}
                </span>
              </div>
            </div>
            <button
              className="logout-button"
              onClick={handleLogout}
              style={{ marginLeft: "20px" }}
            >
              Logout
            </button>
          </div>
        </header>
        <section className="content superadmindash-content">
          <div className="content-header superadmindash-content-header">
            <h3>List of Organization</h3>
            <input
              type="text"
              placeholder="Search here"
              className="search-bar superadmindash-search-bar"
              style={{ height: "35px" }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button
              className="add-founder-button superadmindash-add-founder-button"
              onClick={handleOpenModal}
            >
              Create Organization ID
            </button>
          </div>
          <div className="admin-list superadmindash-admin-list">
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
                  <th onClick={() => handleSort("name")}>
                    Name Of The Organization{" "}
                    <FaSort className="sorticon superadmindash-sorticon" />
                  </th>
                  <th onClick={() => handleSort("adminName")}>
                    Name Of The Admin{" "}
                    <FaSort className="sorticon superadmindash-sorticon" />
                  </th>
                  <th>
                    Mobile Number{" "}
                    {/* <FaSort className="sorticon superadmindash-sorticon" /> */}
                  </th>
                  <th>
                    User Name{" "}
                    {/* <FaSort className="sorticon superadmindash-sorticon" /> */}
                  </th>
                  <th onClick={() => handleSort("email")}>
                    E-Mail{" "}
                    {/* <FaSort className="sorticon superadmindash-sorticon" /> */}
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((admin) => (
                  <tr key={admin._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected(admin._id)}
                        onChange={(event) => handleSelectOne(event, admin._id)}
                      />
                    </td>
                    <td>{admin.name}</td>
                    <td>{admin.adminName}</td>
                    <td>{admin.adminPhone}</td>
                    <td>{admin.username}</td>
                    <td>{admin.email}</td>
                    <td>
                      <IconButton
                        onClick={(event) => handleMenuClick(event, admin)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(
                          anchorEl &&
                            selectedAdmin &&
                            selectedAdmin._id === admin._id
                        )}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleViewDetails(admin._id)}>
                          View Details
                        </MenuItem>
                        <MenuItem onClick={() => handleEdit(admin._id)}>
                          Edit
                        </MenuItem>
                        {showActive ? (
                          <MenuItem onClick={() => handleDisable(admin._id)}>
                            Disable
                          </MenuItem>
                        ) : (
                          <MenuItem onClick={() => handleEnable(admin._id)}>
                            Enable
                          </MenuItem>
                        )}
                      </Menu>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center superadmindash-text-center"
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
                        <p>No organization added yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="table-footer superadmindash-table-footer">
              <button
                className="export-button superadmindash-export-button"
                onClick={exportTableToCSV}
              >
                <FaFileExport className="icon superadmindash-icon" /> Export
                Table
              </button>
              <div className="pagination superadmindash-pagination">
                <button
                  className="pagination-button superadmindash-pagination-button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                >
                  {"<"}
                </button>
                <span className="pagination-info superadmindash-pagination-info">
                  {currentPage + 1} of{" "}
                  {Math.ceil(filteredData.length / rowsPerPage)}
                </span>
                <button
                  className="pagination-button superadmindash-pagination-button"
                  onClick={handleNextPage}
                  disabled={
                    currentPage >=
                    Math.ceil(filteredData.length / rowsPerPage) - 1
                  }
                >
                  {">"}
                </button>
                <div className="rows-per-page superadmindash-rows-per-page">
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
        <AddOrganizationModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSuccess={handleSuccessModal}
        />
        <EditOrganizationModal
          showModal={showEditModal}
          handleClose={handleCloseEditModal}
          organizationId={organizationId}
          handleSuccess={handleEditSuccessModal}
        />
        <ViewOrganizationModal
          showModal={showViewModal}
          handleClose={() => setShowViewModal(false)}
          organizationId={organizationId}
        />
        <SuccessModal
          showSuccessModal={showSuccessModal}
          handleClose={handleCloseSuccessModal}
        />
      </main>
    </div>
  );
};

export default Superadmindash;
