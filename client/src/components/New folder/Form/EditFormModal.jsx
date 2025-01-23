import React, { useState, useEffect } from "react";
import "./EditFormModal.css";

const EditFormModal = ({ closeModal, form, editForm }) => {
  const [formData, setFormData] = useState({
    title: form.title,
    category: form.category,
    // label: form.label,
    // status: form.status, // Commented out status
  });

  useEffect(() => {
    if (form) {
      setFormData(form);
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedForm = {
      ...formData,
      lastModified: new Date().toLocaleDateString(),
    };

    try {
      const response = await fetch(
        `https://incubator.drishticps.org/api/forms/${form._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedForm),
        }
      );

      if (response.ok) {
        const form = await response.json();
        editForm(form);
        closeModal();
      } else {
        console.error("Failed to save form");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="modal-overlay-editformmodal">
      <div className="modal-content-editformmodal">
        <div className="modal-header-editformmodal">
          <h3>Edit Form</h3>
          <button className="close-button-editformmodal" onClick={closeModal}>
            ×
          </button>
        </div>
        <form className="modal-form-editformmodal" onSubmit={handleSubmit}>
          <div className="form-group-editformmodal">
            <label htmlFor="title" className="modal-label-editformmodal">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group-editformmodal">
            <label htmlFor="category" className="modal-label-editformmodal">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Application">Application</option>
              <option value="Evaluation">Evaluation</option>
              <option value="Mentoring">Mentoring</option>
              <option value="Startup">Startup</option>
              <option value="Fellowship">Fellowship</option>
              <option value="Survey">Survey</option>
              <option value="Learning">Learning</option>
              <option value="Funding">Funding</option>
            </select>
          </div>
          {/* <div className="form-group-editformmodal">
            <label htmlFor="label" className="modal-label-editformmodal">
              Label *
            </label>
            <select
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              required
            >
              <option value="REGULAR">Regular</option>
              <option value="URGENT">Urgent</option>
              <option value="IMPORTANT">Important</option>
            </select>
          </div> */}
          <div className="modal-footer-editformmodal">
            <button type="submit" className="submit-button-editformmodal">
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-button-editformmodal"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFormModal;
