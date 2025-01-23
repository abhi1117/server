import React, { useState, useEffect } from "react";
import "./AddNewFormModal.css";

const AddNewFormModal = ({ closeModal, addForm, editForm, formToEdit }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Application",
    // label: 'REGULAR',
    // status: 'Published',
  });

  useEffect(() => {
    if (formToEdit) {
      setFormData(formToEdit);
    }
  }, [formToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const newForm = { ...formData, lastModified: new Date().toLocaleDateString() };
    // ** START CHANGE FOR "form post" element --- **
    const newForm = { ...formData, lastModified: new Date() };
    // ** END CHANGE FOR "form post" element --- **
    try {
      let response;
      if (formToEdit) {
        response = await fetch(
          `https://incubator.drishticps.org/api/forms/${formToEdit._id}`,
          {
            // response = await fetch(`https://mern3-9rgs.onrender.com/api/forms/${formToEdit._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newForm),
          }
        );
      } else {
        response = await fetch("https://incubator.drishticps.org/api/forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newForm),
        });
      }

      if (response.ok) {
        const form = await response.json();
        if (formToEdit) {
          editForm(form);
        } else {
          addForm(form);
        }
        closeModal();
      } else {
        console.error("Failed to save form");
        // Log the error message from the response
        const errorData = await response.json();
        console.error("Failed to save form:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="modal-overlay-addnewformmodal">
      <div className="modal-content-addnewformmodal">
        <div className="modal-header-addnewformmodal">
          <h3>{formToEdit ? "Edit Form" : "Add New Form"}</h3>
          <button className="close-button-addnewformmodal" onClick={closeModal}>
            ×
          </button>
        </div>
        <form className="modal-form-addnewformmodal" onSubmit={handleSubmit}>
          <div className="form-group-addnewformmodal">
            <label htmlFor="title" className="modal-label-addnewformmodal">
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
          <div className="form-group-addnewformmodal">
            <label htmlFor="category" className="modal-label-addnewformmodal">
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
          {/* <div className="form-group-addnewformmodal">
            <label htmlFor="label" className="modal-label-addnewformmodal">Label *</label>
            <select id="label" name="label" value={formData.label} onChange={handleChange} required>
              <option value="REGULAR">Regular</option>
              <option value="URGENT">Urgent</option>
              <option value="IMPORTANT">Important</option>
            </select>
          </div> */}
          <div className="modal-footer-addnewformmodal">
            <button type="submit" className="submit-button-addnewformmodal">
              {formToEdit ? "Save Changes" : "Submit"}
            </button>
            <button
              type="button"
              className="cancel-button-addnewformmodal"
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

export default AddNewFormModal;
