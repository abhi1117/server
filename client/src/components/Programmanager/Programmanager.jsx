import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSort, FaFileExport } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import logo from "../Public/logo.png";
import "../ProgramManager/Programmanagerdash.css";
import AddStartupModal from "./AddStartupModal";
import EditStartupModal from "./EditStartupModal";
import ViewStartupModal from "./ViewStartupModal";

const ProgramManagerDash = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPM, setSelectedPM] = useState(null);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [startupId, setStartupId] = useState(null);
  const [pmData, setPmData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const fetchStartups = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        "https://incubator.drishticps.org/api/startups",
        config
      );
      setPmData(response.data);
    } catch (error) {
      console.error("Error fetching Startups:", error);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const handleMenuClick = (event, pm) => {
    setAnchorEl(event.currentTarget);
    setSelectedPM(pm);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPM(null);
  };

  const handleViewDetails = (id) => {
    setStartupId(id);
    setShowViewModal(true);
    handleMenuClose();
  };

  const handleEdit = (id) => {
    setStartupId(id);
    setShowEditModal(true);
    handleMenuClose();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Startup?")) {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.delete(
          `https://incubator.drishticps.org/api/startups/${id}`,
          config
        );
        if (response.status === 200) {
          alert("Startup deleted successfully");
          fetchStartups(); // Refresh the list after deletion
        } else {
          alert("Failed to delete Startup. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting Startup:", error);
        alert("Error deleting Startup. Please try again.");
      }
    }
    handleMenuClose();
  };

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectedAll(checked);
    if (checked) {
      const allIds = pmData.map((pm) => pm._id);
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

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchStartups(); // Refresh list after adding a new startup
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchStartups(); // Refresh list after editing a startup
  };

  const handleViewClose = () => {
    setShowViewModal(false);
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <nav className="nav">
          <ul>
            <li className="nav-item">
              <FiMenu className="nav-icon" />
              Dashboard
            </li>
            <li className="nav-item">
              <FaUserCircle className="nav-icon" />
              Profile
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="header">
          <div className="profile-section">
            <span className="user-name">
              Program Manager <RiArrowDropDownLine />
            </span>
          </div>
          <button className="btn" onClick={handleOpenAddModal}>
            Add Startup
          </button>
        </header>
        <section className="content">
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
                <th>Name</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pmData.map((item) => (
                <tr key={item._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(item._id)}
                      onChange={(event) => handleSelectOne(event, item._id)}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.details}</td>
                  <td>
                    <IconButton
                      onClick={(event) => handleMenuClick(event, item)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(
                        anchorEl && selectedPM && selectedPM._id === item._id
                      )}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleViewDetails(item._id)}>
                        View
                      </MenuItem>
                      <MenuItem onClick={() => handleEdit(item._id)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDelete(item._id)}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <AddStartupModal
          showModal={showAddModal}
          handleClose={handleCloseAddModal}
          handleSuccess={handleAddSuccess}
        />
        <EditStartupModal
          showModal={showEditModal}
          handleClose={handleCloseEditModal}
          startupId={startupId}
          handleSuccess={handleEditSuccess}
        />
        <ViewStartupModal
          showModal={showViewModal}
          handleClose={handleViewClose}
          startupId={startupId}
        />
      </main>
    </div>
  );
};

export default ProgramManagerDash;
