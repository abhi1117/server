import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FormDetails.css";

const FormDetails = () => {
  const location = useLocation();
  const { form } = location.state || {};
  const [formData, setFormData] = useState(form || {});
  const [formValues, setFormValues] = useState(() => {
    const values = {};
    form?.formElements?.forEach((element) => {
      values[element.label] = "";
    });
    return values;
  });
  const navigate = useNavigate();

  if (!form) {
    return <p>No form data available.</p>;
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormValues({ ...formValues, [name]: files[0] });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    if (
      formValues[name] ===
      formData.formElements.find((element) => element.label === name)
        ?.placeholder
    ) {
      setFormValues({ ...formValues, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setFormValues({
        ...formValues,
        [name]:
          formData.formElements.find((element) => element.label === name)
            ?.placeholder || "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object to handle file uploads if any
    const submissionData = new FormData();
    submissionData.append("formTitle", formData.title);
    submissionData.append("formData", JSON.stringify(formValues));

    for (let key in formValues) {
      if (formValues[key] instanceof File) {
        submissionData.append(key, formValues[key]);
      }
    }

    try {
      const response = await axios.post(
        "https://incubator.drishticps.org/api/formSubmissions",
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Form submitted:", response.data);
      alert("Form submitted successfully!");
      navigate(`/form/${form.title}`, { state: { form: formData } });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting the form. Please try again.");
    }
  };

  const handleEdit = () => {
    const formElements = Array.isArray(formData.formElements)
      ? formData.formElements
      : [];
    navigate("/form-builder", {
      state: { formElements, formTitle: formData.title },
    });
  };

  const handleClose = () => {
    navigate("/form");
  };

  return (
    <div className="form-details-container-formdetails">
      <div className="header-container-formdetails">
        <h2>{formData.title}</h2> {/* Display the title from formData */}
        <div className="form-details-buttons-formdetails">
          <button className="edit-button-formdetails" onClick={handleEdit}>
            Edit
          </button>
          <button className="close-button-formdetails" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
      <div className="form-content-container-formdetails">
        <form className="form-details-form-formdetails" onSubmit={handleSubmit}>
          {formData.formElements &&
            formData.formElements.map((element, index) => (
              <div key={index} className="form-group-formdetails">
                <label>
                  <span className="number-box-formdetails">{index + 1}</span>{" "}
                  {element.label}{" "}
                  {element.required && (
                    <span className="required-formdetails">*</span>
                  )}
                </label>
                {element.type === "select" ? (
                  <select
                    name={element.label}
                    value={formValues[element.label]}
                    onChange={handleChange}
                    required={element.required}
                  >
                    <option value="">Select...</option>
                    {element.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={element.type}
                    name={element.label}
                    value={
                      element.type === "file"
                        ? undefined
                        : formValues[element.label]
                    }
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required={element.required}
                    placeholder={element.placeholder}
                    maxLength={element.maxLength}
                  />
                )}
                {element.maxLength &&
                  element.type !== "select" &&
                  element.type !== "number" && (
                    <small>
                      {element.maxLength -
                        (formValues[element.label] || "").length}{" "}
                      character(s) remaining
                    </small>
                  )}
              </div>
            ))}
          <div className="form-buttons-formdetails">
            <button type="submit" className="submit-button-formdetails">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDetails;
