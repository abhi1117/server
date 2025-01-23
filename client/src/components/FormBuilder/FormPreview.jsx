import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import "./FormPreview.css";
import { useSelector } from "react-redux";
import {
  userId,
  superAdminSelector,
} from "../../redux/reducers/superAdminReducer";

const FormPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formElements, formTitle, formId } = location.state || {
    formElements: [],
    formTitle: "",
  };

  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);

  useEffect(() => {
    // Redirect based on role and userId
    if (!getUserId) {
      navigate("/login");
      toast.warning("Unauthorized. Please log in first.");
    } else if (role === "Admin") {
      navigate("/admincards");
      toast.warning("Only Program Manager is allowed to view this page.");
    } else if (role === "Super Admin") {
      navigate("/cards");
      toast.warning("Only Program Manager is allowed to view this page.");
    }
  }, [getUserId, role, navigate]);

  // Validation schema for form fields
  const validationSchema = Yup.object().shape(
    formElements.reduce((acc, element) => {
      let validator =
        element.type === "multiselect"
          ? Yup.array().of(Yup.string())
          : Yup.string();
      if (element.required) {
        validator = validator.required("This field is required");
      }
      if (element.type === "email") {
        validator = validator.email("Invalid email address");
      }
      if (element.type === "url") {
        validator = validator.url("Invalid URL");
      }
      if (element.type === "number") {
        validator = validator.matches(/^[0-9]+$/, "Must be only digits");
      }
      if (element.maxLength && element.label !== "Startup team size") {
        validator = validator.max(
          element.maxLength,
          `Maximum ${element.maxLength} characters`
        );
      }
      if (element.minLength) {
        validator = validator.min(
          element.minLength,
          `Minimum ${element.minLength} characters`
        );
      }
      acc[element.label] = validator;
      return acc;
    }, {})
  );

  const handleEdit = () => {
    navigate("/form-builder", { state: { formElements, formTitle, formId } });
  };

  const handleSave = async (values) => {
    for (let element of formElements) {
      if (!element.label) {
        toast.error(
          `Question ${formElements.indexOf(element) + 1}: Label Not Found`
        );
        return;
      }
    }

    const formData = {
      id: formId || new Date().getTime().toString(),
      title: formTitle,
      fields: formElements,
      lastModified: new Date().toISOString(),
      category: "Default",
      label: "Default Label",
      status: "Active",
    };

    try {
      const response = await fetch(
        `https://incubator.drishticps.org/api/forms/general/${formId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const result = await response.json();
      if (response.ok) {
        toast.success("Form saved successfully");
        setTimeout(() => {
          navigate("/form");
        }, 2000);
      } else {
        toast.error("Failed to save form");
        console.error(result);
      }
    } catch (error) {
      toast.error("Error saving form structure");
      console.error("Error:", error);
    }
  };

  // Render only if the role is "Program Manager"
  if (role !== "Program Manager") {
    return null;
  }

  return (
    <div className="form-preview-containerformpreview">
      <ToastContainer position="bottom-right" />
      <div className="form-preview-headerformpreview">
        <h2>{formTitle}</h2>
        <div className="form-preview-buttonsformpreview">
          <button
            className="form-preview-save-buttonformpreview"
            onClick={() => handleSave()}
          >
            Save
          </button>
          <button
            className="form-preview-edit-buttonformpreview"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="form-preview-close-buttonformpreview"
            onClick={() => navigate("/form")}
          >
            Close
          </button>
        </div>
      </div>
      <div className="form-preview-boxformpreview">
        <Formik
          initialValues={formElements.reduce(
            (acc, element) => ({
              ...acc,
              [element.label]: element.type === "multiselect" ? [] : "",
            }),
            {}
          )}
          validationSchema={validationSchema}
          onSubmit={handleSave}
        >
          {({ values, setFieldValue }) => (
            <Form>
              {formElements.map((element, index) => (
                <div key={index} className="form-groupformpreview">
                  <label>
                    <span className="form-preview-label-numberformpreview">
                      {index + 1}
                    </span>
                    {element.label}
                    {element.required && (
                      <span className="requiredformpreview">*</span>
                    )}
                  </label>
                  {element.type === "select" ? (
                    <Field
                      as="select"
                      name={element.label}
                      className="custom-form-inputformpreview"
                      required={element.required}
                    >
                      <option value="">Select...</option>
                      {element.options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </Field>
                  ) : element.type === "multiselect" ? (
                    element.options.map((option, idx) => (
                      <div key={idx} className="multiselect-option-formpreview">
                        <input
                          type="checkbox"
                          name={element.label}
                          value={option}
                          checked={values[element.label].includes(option)}
                          onChange={(e) => {
                            const set = new Set(values[element.label]);
                            if (set.has(option)) {
                              set.delete(option);
                            } else if (set.size < element.maxSelect) {
                              set.add(option);
                            }
                            setFieldValue(element.label, Array.from(set));
                          }}
                        />
                        <label>{option}</label>
                      </div>
                    ))
                  ) : element.type === "radio" ? (
                    element.options.map((option, idx) => (
                      <div key={idx} className="radio-option-formpreview">
                        <Field
                          type="radio"
                          name={element.label}
                          value={option}
                          className="radio-input-formpreview"
                        />
                        <label>{option}</label>
                      </div>
                    ))
                  ) : element.type === "note" ? (
                    <ReactQuill
                      value={values[element.label]}
                      onChange={(value) => setFieldValue(element.label, value)}
                    />
                  ) : (
                    <Field
                      name={element.label}
                      type={element.type}
                      placeholder={element.placeholder}
                      className="custom-form-inputformpreview"
                      maxLength={element.maxLength || undefined}
                    />
                  )}
                  <ErrorMessage
                    name={element.label}
                    component="div"
                    className="error-messageformpreview"
                  />
                </div>
              ))}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default FormPreview;
