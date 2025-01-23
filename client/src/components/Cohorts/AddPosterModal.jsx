import React, { useState } from 'react';
import './AddPosterModal.css';

const AddPosterModal = ({ onClose, onSubmit }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the selected file back to the parent component
    onSubmit(file);
  };

  return (
    <div className="modal-container-addpostermodal">
      <div className="modal-content-addpostermodal">
        <h2>Add Poster</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" name="poster" accept="image/png, image/jpeg" onChange={handleFileChange} />
          <div className="button-container-addpostermodal">
            <button type="submit" className="submit-button-addpostermodal">Submit</button>
            <button type="button" className="cancel-button-addpostermodal" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPosterModal;
