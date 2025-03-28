// import React, { useState } from 'react';
// import { Modal, Button, Form } from 'react-bootstrap';

// const AddStartupModal = ({ showModal, handleClose, handleSuccess }) => {
//   const [startupName, setStartupName] = useState('');
//   const [details, setDetails] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // API call to add a startup
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('https://incubator.drishticps.org/api/startups', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ name: startupName, details })
//       });
//       if (response.ok) {
//         handleSuccess();
//         handleClose();
//       }
//     } catch (error) {
//       console.error('Failed to add startup', error);
//     }
//   };

//   return (
//     <Modal show={showModal} onHide={handleClose}>
//       <Modal.Header closeButton>
//         <Modal.Title>Add a Startup</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form onSubmit={handleSubmit}>
//           <Form.Group>
//             <Form.Label>Startup Name</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter startup name"
//               value={startupName}
//               onChange={(e) => setStartupName(e.target.value)}
//               required
//             />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Details</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               placeholder="Enter details"
//               value={details}
//               onChange={(e) => setDetails(e.target.value)}
//               required
//             />
//           </Form.Group>
//           <Button variant="primary" type="submit">
//             Add Startup
//           </Button>
//         </Form>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default AddStartupModal;

import React, { useState } from "react";
import axios from "axios";

const AddProgramManagerModal = ({ showModal, handleClose, handleSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    adminName: "",
    adminPhone: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.adminName) errors.adminName = "Admin Name is required";
    if (!formData.adminPhone) errors.adminPhone = "Admin Phone is required";
    if (!formData.username) errors.username = "Username is required";
    if (!formData.password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
        const response = await axios.post(
          "https://incubator.drishticps.org/api/programmanagers",
          formData,
          config
        );

        if (response.status === 200) {
          handleSuccess();
        } else {
          setErrors({ general: response.data.msg });
        }
      } catch (err) {
        console.error("Failed to add program manager:", err);
        setErrors({ general: "Server error" });
      }
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Program Manager</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Admin Name</label>
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
            />
            {errors.adminName && (
              <div className="error">{errors.adminName}</div>
            )}
          </div>
          <div className="form-group">
            <label>Admin Phone</label>
            <input
              type="text"
              name="adminPhone"
              value={formData.adminPhone}
              onChange={handleChange}
            />
            {errors.adminPhone && (
              <div className="error">{errors.adminPhone}</div>
            )}
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="error">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          <button type="submit" className="btn-primary">
            Add Program Manager
          </button>
          {errors.general && <div className="error">{errors.general}</div>}
        </form>
        <button onClick={handleClose} className="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddProgramManagerModal;
