import React from "react";
import { Button, Modal, Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import './ConfirmationDialog.css';

const ConfirmationDialog = ({ open, handleConfirm, handleReverify }) => {
  return (
    <Modal open={open} onClose={handleReverify}>
      <Box className="modal-backdrop">
        <Box className="modal-content" width={"24%"}>
          <FontAwesomeIcon icon={faCircleExclamation} size="2x" color="#D62D20" style={{marginBottom: "15px"}}/>
          <Typography variant="h6" component="h2" gutterBottom style={{ textAlign: "center", fontWeight:"700"}}>
            Please Confirm!
          </Typography>
          <Typography variant="body1" style={{color:"grey", fontSize:"13.5px"}}>
            Are you sure you want to proceed? You will not be allowed to edit the founder details again.
          </Typography>
          <div className="form-buttons">
            <Button
              onClick={handleConfirm}
              className="confirm-button"
              variant="contained"
                          color="primary"
                          style={{borderRadius:"6px",fontSize:"13px",width:"auto"}}
            >
              Continue
            </Button>
            <Button
              onClick={handleReverify}
              className="reverify-button"
                          variant="contained"
                          style={{color:"#1976d2", backgroundColor: "transparent",fontSize:"13px",border: "2px solid #1976d2", borderRadius:"6px", width:"auto"}}
            >
              Reverify
            </Button>
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmationDialog;
