import React, { useState, useEffect } from "react";
import "./EvaluatorDashboardEditFormModal.css";

const EvaluatorDashboardEditFormModal = ({ closeModal, form, updateForm }) => {
  const [formData, setFormData] = useState({
    title: "",
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
    if (!form || !form._id) {
      console.error("Form to edit is not defined or does not have an _id");
      return;
    }

    const updatedForm = {
      ...formData,
      lastModified: new Date().toLocaleDateString(),
    };

    try {
      const response = await fetch(
        `https://incubator.drishticps.org/api/evaluationForms/${form._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedForm),
        }
      );

      if (response.ok) {
        const updatedForm = await response.json();
        updateForm(updatedForm);
        closeModal();
      } else {
        console.error("Failed to update form");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="modal-overlayevaluatordashboardeditformmodal">
      <div className="modal-contentevaluatordashboardeditformmodal">
        <div className="modal-headerevaluatordashboardeditformmodal">
          <h2>Edit the Evaluator Form</h2>
          <button
            className="close-buttonevaluatordashboardeditformmodal"
            onClick={closeModal}
          >
            ×
          </button>
        </div>
        <form
          className="modal-formevaluatordashboardeditformmodal"
          onSubmit={handleSubmit}
        >
          <div className="form-groupevaluatordashboardeditformmodal">
            <label
              htmlFor="title"
              className="modal-labelevaluatordashboardeditformmodal"
            >
              Title *
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
          <div className="modal-footerevaluatordashboardeditformmodal">
            <button
              type="submit"
              className="submit-buttonevaluatordashboardeditformmodal"
            >
              Update
            </button>
            <button
              type="button"
              className="cancel-buttonevaluatordashboardeditformmodal"
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

export default EvaluatorDashboardEditFormModal;
