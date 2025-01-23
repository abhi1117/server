import React from 'react';

// Define the SuccessModal component
const SuccessModal = ({ showSuccessModal, handleClose }) => {
  // If the modal should not be shown, return null to avoid rendering
  if (!showSuccessModal) {
    return null;
  }

  // Define the modal content
  return (
    <div className="modal-overlay" onClick={handleClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/path/to/success-icon.png" alt="Success" style={{ width: '50px', marginBottom: '20px' }} />
        <h2 className="modal-title">Program Manager Added Successfully</h2>
        <p style={{ color: "#909090", marginBottom: '20px' }}>Program Manager details have been added successfully.</p>
        <button onClick={handleClose} className="btn-primary" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>OK</button>
      </div>
    </div>
  );
};

export default SuccessModal;
