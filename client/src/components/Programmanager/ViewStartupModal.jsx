import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const ViewStartupModal = ({ showModal, handleClose, startupId }) => {
  const [startup, setStartup] = useState({ name: "", details: "" });

  useEffect(() => {
    const fetchStartup = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://incubator.drishticps.org/api/startups/${startupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setStartup(data);
    };

    if (startupId) {
      fetchStartup();
    }
  }, [startupId]);

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>View Startup Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Name:</strong> {startup.name}
        </p>
        <p>
          <strong>Details:</strong> {startup.details}
        </p>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default ViewStartupModal;
