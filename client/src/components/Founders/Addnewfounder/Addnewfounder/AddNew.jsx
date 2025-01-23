import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Box, Typography, Button } from "@mui/material";
import "./Addnewfounder.css";

const AddNew = ({ onClose }) => {
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [designation, setDesignation] = useState("");
  const [resume, setResume] = useState(null);
  const [qualification, setQualification] = useState("");
  const [stakeholderPercentage, setStakeholderPercentage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    setResume(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    navigate("/confirm");
  };

  return (
    <div className="add-new-founder-modal">
      <div className="add-new-founder-form">
        <h2>Add New Founder</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="form-column">
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label>
                Contact Number
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </label>
              <label>
                Email Id
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Date Of Birth
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="form-column">
              <label>
                Designation
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                >
                  <option value="">Select Designation</option>
                  <option value="CEO">CEO</option>
                  <option value="CTO">CTO</option>
                  <option value="CFO">CFO</option>
                </select>
              </label>
              <label className="file-upload-label">
                Resume (in PDF)
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  required
                  className="file-upload-input"
                />
              </label>
              <label>
                Qualification
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  required
                >
                  <option value="">Select Qualification</option>
                  <option value="Bachelors">Bachelors</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                </select>
              </label>
              <label>
                Stakeholder %age
                <input
                  type="number"
                  value={stakeholderPercentage}
                  onChange={(e) => setStakeholderPercentage(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="save-button">
              Save
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <Modal
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        aria-labelledby="confirmation-modal"
        aria-describedby="confirmation-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography id="confirmation-modal" variant="h6" component="h2">
            Please Confirm!
          </Typography>
          <Typography id="confirmation-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to proceed? You will not be allowed to edit the founder details again.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around' }}>
            <Button variant="contained" color="primary" onClick={handleConfirm}>
              Continue
            </Button>
            <Button variant="outlined" color="primary" onClick={() => setShowConfirmation(false)}>
              Reverify
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default AddNew;
