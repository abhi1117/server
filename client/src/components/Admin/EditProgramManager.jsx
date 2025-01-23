// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './EditProgramManager.css';

// const EditProgramManagerModal = ({ showModal, handleClose, programManagerId, handleSuccess }) => {
//   const [organizationName, setOrganizationName] = useState('');
//   const [adminName, setAdminName] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');

//   useEffect(() => {
//     if (programManagerId) {
//       const fetchProgramManagerDetails = async () => {
//         try {
//           const token = localStorage.getItem('token');
//           const config = {
//             headers: {
//               'Authorization': `Bearer ${token}`
//             }
//           };
//           const response = await axios.get(`https://incubator.drishticps.org/api/programmanagers/${programManagerId}`, config);
//           const data = response.data;
//           setOrganizationName(data.name);
//           setAdminName(data.adminName);
//           setPhoneNumber(data.adminPhone);
//           setUsername(data.username);
//           setEmail(data.email);
//         } catch (error) {
//           console.error('Error fetching program manager details:', error);
//         }
//       };
//       fetchProgramManagerDetails();
//     }
//   }, [programManagerId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const updatedData = {
//       name: organizationName,
//       adminName,
//       adminPhone: phoneNumber,
//       username,
//       email,
//     };

//     try {
//       const token = localStorage.getItem('token');
//       const config = {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       };
//       const response = await axios.put(`https://incubator.drishticps.org/api/programmanagers/${programManagerId}`, updatedData, config);
//       if (response.status === 200) {
//         handleSuccess();
//       } else {
//         console.error('Failed to update program manager');
//         alert('Failed to update program manager. Please try again.');
//       }
//     } catch (error) {
//       console.error('Failed to update program manager:', error);
//       alert('Failed to update program manager. Please try again.');
//     }
//   };

//   const handleOverlayClick = (event) => {
//     if (event.target === event.currentTarget) {
//       handleClose();
//     }
//   };

//   if (!showModal) {
//     return null;
//   }

//   return (
//     <div className="modal-overlay EditProgramManagerModal-modal-overlay" onClick={handleOverlayClick}>
//       <div className="modal-content EditProgramManagerModal-modal-content">
//         <h2 className="modal-title EditProgramManagerModal-modal-title">Edit Program Manager ID</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="organizationName">Name of the Program Manager</label>
//             <input
//               type="text"
//               id="organizationName"
//               placeholder="Enter organization name"
//               value={organizationName}
//               onChange={(e) => setOrganizationName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="adminName">Name of the Admin</label>
//             <input
//               type="text"
//               id="adminName"
//               placeholder="Enter admin name"
//               value={adminName}
//               onChange={(e) => setAdminName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="phoneNumber">Phone Number</label>
//             <input
//               type="tel"
//               id="phoneNumber"
//               placeholder="Enter admin mobile"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="username">User Name</label>
//             <input
//               type="text"
//               id="username"
//               placeholder="Enter username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="email">Email Id</label>
//             <input
//               type="email"
//               id="email"
//               placeholder="Enter email id"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="EditProgramManagerModal-button-group">
//             <button type="submit" className="btn-primary EditProgramManagerModal-btn-primary">Update ID</button>
//             <button onClick={handleClose} className="EditProgramManagerModal-modal-close">Close</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditProgramManagerModal;

// regular 22
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './EditProgramManager.css';

// const EditProgramManagerModal = ({ showModal, handleClose, programManagerId, handleSuccess }) => {
//   const [organizationName, setOrganizationName] = useState('');
//   const [adminName, setAdminName] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');

//   useEffect(() => {
//     if (programManagerId) {
//       const fetchProgramManagerDetails = async () => {
//         try {
//           const token = localStorage.getItem('token');
//           const config = {
//             headers: {
//               'Authorization': `Bearer ${token}`
//             }
//           };
//           const response = await axios.get(`https://incubator.drishticps.org/api/programmanagers/${programManagerId}`, config);
//           const data = response.data;
//           setOrganizationName(data.name);
//           setAdminName(data.adminName);
//           setPhoneNumber(data.adminPhone);
//           setUsername(data.username);
//           setEmail(data.email);
//         } catch (error) {
//           console.error('Error fetching program manager details:', error);
//         }
//       };
//       fetchProgramManagerDetails();
//     }
//   }, [programManagerId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const updatedData = {
//       name: organizationName,
//       adminName,
//       adminPhone: phoneNumber,
//       username,
//       email,
//     };

//     try {
//       const token = localStorage.getItem('token');
//       const config = {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       };
//       const response = await axios.put(`https://incubator.drishticps.org/api/programmanagers/${programManagerId}`, updatedData, config);
//       if (response.status === 200) {
//         handleSuccess();
//       } else {
//         console.error('Failed to update program manager');
//         alert('Failed to update program manager. Please try again.');
//       }
//     } catch (error) {
//       console.error('Failed to update program manager:', error);
//       alert('Failed to update program manager. Please try again.');
//     }
//   };

//   const handleOverlayClick = (event) => {
//     if (event.target === event.currentTarget) {
//       handleClose();
//     }
//   };

//   if (!showModal) {
//     return null;
//   }

//   return (
//     <div className="modal-overlay EditProgramManagerModal-modal-overlay" onClick={handleOverlayClick}>
//       <div className="modal-content EditProgramManagerModal-modal-content">
//         <h2 className="modal-title EditProgramManagerModal-modal-title">Edit Program Manager ID</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="organizationName">Name of the Program Manager</label>
//             <input
//               type="text"
//               id="organizationName"
//               placeholder="Enter organization name"
//               value={organizationName}
//               onChange={(e) => setOrganizationName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="adminName">Name of the Admin</label>
//             <input
//               type="text"
//               id="adminName"
//               placeholder="Enter admin name"
//               value={adminName}
//               onChange={(e) => setAdminName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="phoneNumber">Phone Number</label>
//             <input
//               type="tel"
//               id="phoneNumber"
//               placeholder="Enter admin mobile"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="username">User Name</label>
//             <input
//               type="text"
//               id="username"
//               placeholder="Enter username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group EditProgramManagerModal-form-group">
//             <label htmlFor="email">Email Id</label>
//             <input
//               type="email"
//               id="email"
//               placeholder="Enter email id"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="button-group EditProgramManagerModal-button-group">
//             <button type="submit" className="btn-primary EditProgramManagerModal-btn-primary">Update ID</button>
//             <button type="button" onClick={handleClose} className="modal-close EditProgramManagerModal-modal-close">Cancel</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditProgramManagerModal;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditProgramManager.css";

const EditProgramManagerModal = ({
  showModal,
  handleClose,
  programManagerId,
  handleSuccess,
}) => {
  const [adminName, setAdminName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isHovering, setIsHovering] = useState(false); // State to handle hover effect

  useEffect(() => {
    if (programManagerId) {
      const fetchProgramManagerDetails = async () => {
        try {
          //    const token = localStorage.getItem("token");
          /*  const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };*/
          const response = await axios.get(
            `https://incubator.drishticps.org/api/programmanagers/${programManagerId}`,
            {
              withCredentials: true,
            }
          );
          const data = response.data;
          setAdminName(data.adminName);
          setPhoneNumber(data.adminPhone);
          setUsername(data.username);
          setEmail(data.email);
        } catch (error) {
          console.error("Error fetching program manager details:", error);
        }
      };
      fetchProgramManagerDetails();
    }
  }, [programManagerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      adminName,
      adminPhone: phoneNumber,
      username,
      email,
    };

    try {
      //const token = localStorage.getItem("token");
      /* const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };*/
      const response = await axios.put(
        `https://incubator.drishticps.org/api/programmanagers/${programManagerId}`,
        updatedData,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        handleSuccess();
      } else {
        console.error("Failed to update program manager");
        alert("Failed to update program manager. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update program manager:", error);
      alert("Failed to update program manager. Please try again.");
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="modal-overlay EditProgramManagerModal-modal-overlay">
      <div className="EditProgramManagerModal-modal-content">
        <h2 className="modal-title EditProgramManagerModal-modal-title">
          Edit Program Manager ID
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group EditProgramManagerModal-form-group">
            <label htmlFor="adminName">Name of the Admin</label>
            <input
              type="text"
              id="adminName"
              placeholder="Enter admin name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>
          <div className="form-group EditProgramManagerModal-form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="Enter admin mobile"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group EditProgramManagerModal-form-group">
            <label htmlFor="username">User Name</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group EditProgramManagerModal-form-group">
            <label htmlFor="email">Email Id</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="button-group EditProgramManagerModal-button-group">
            <button
              type="submit"
              className="btn-primary EditProgramManagerModal-btn-primary"
            >
              Update ID
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary-EditOrganizationModal-cancel"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{
                backgroundColor: isHovering ? "#e6f7ff" : "white",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProgramManagerModal;
