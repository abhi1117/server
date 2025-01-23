import React, { useState, useEffect } from "react";
import "./EvaluatorDashboardAddNewFormModal.css";

const EvaluatorDashboardAddNewFormModal = ({
  closeModal,
  addForm,
  formToEdit,
}) => {
  const [formData, setFormData] = useState({
    title: "",
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
    const newForm = {
      ...formData,
      lastModified: new Date().toLocaleDateString(),
    };

    try {
      let response;
      if (formToEdit) {
        response = await fetch(
          `https://incubator.drishticps.org/api/evaluationForms/${formToEdit._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newForm),
          }
        );
      } else {
        response = await fetch(
          "https://incubator.drishticps.org/api/evaluationForms",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newForm),
          }
        );
      }

      if (response.ok) {
        const form = await response.json();
        if (formToEdit) {
          addForm(form, "edit");
        } else {
          addForm(form, "add");
        }
        closeModal();
      } else {
        console.error("Failed to save form");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="modal-overlayevaluatordashboardaddnewformmodal">
      <div className="modal-contentevaluatordashboardaddnewformmodal">
        <div className="modal-headerevaluatordashboardaddnewformmodal">
          <h3>
            {formToEdit ? "Edit Evaluator Form" : "Add New Evaluator Form"}
          </h3>
          <button
            className="close-buttonevaluatordashboardaddnewformmodal"
            onClick={closeModal}
          >
            ×
          </button>
        </div>
        <form
          className="modal-formevaluatordashboardaddnewformmodal"
          onSubmit={handleSubmit}
        >
          <div className="form-groupevaluatordashboardaddnewformmodal">
            <label
              htmlFor="title"
              className="modal-labelevaluatordashboardaddnewformmodal"
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
          <div className="modal-footerevaluatordashboardaddnewformmodal">
            <button
              type="submit"
              className="submit-buttonevaluatordashboardaddnewformmodal"
            >
              {formToEdit ? "Save Changes" : "Submit"}
            </button>
            <button
              type="button"
              className="cancel-buttonevaluatordashboardaddnewformmodal"
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

export default EvaluatorDashboardAddNewFormModal;
