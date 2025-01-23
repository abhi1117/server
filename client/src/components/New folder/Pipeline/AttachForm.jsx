import React, { useState, useEffect } from "react";
import "./AttachForm.css";

const AttachForm = ({ onClose, onAttach }) => {
  const [selectedForm, setSelectedForm] = useState("");
  const [forms, setForms] = useState([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(
          "https://incubator.drishticps.org/api/forms"
        );
        const data = await response.json();
        setForms(data);
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };

    fetchForms();
  }, []);

  const handleAttach = () => {
    const selectedFormObject = forms.find((form) => form._id === selectedForm);
    onAttach(selectedFormObject);
    onClose();
  };

  return (
    <div className="modal-attachform">
      <div className="modal-content-attachform">
        <h3 className="modal-attachform-heading-text-attachform">
          Select an Application Form
        </h3>
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
        >
          <option value="" disabled>
            Select an existing form
          </option>
          {forms.map((form) => (
            <option key={form._id} value={form._id}>
              {form.title}
            </option>
          ))}
        </select>
        <div className="modal-buttons-applicationattachform">
          <button
            onClick={handleAttach}
            className="modal-attach-button-applicationattachform"
          >
            Attach
          </button>
          <button
            onClick={onClose}
            className="modal-cancel-button-applicationattachform"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachForm;
