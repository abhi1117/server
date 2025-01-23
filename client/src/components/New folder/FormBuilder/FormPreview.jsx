import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill"; // ** START CHANGE FOR "Note input" --- Import ReactQuill **
import "react-quill/dist/quill.snow.css"; // ** Ensure to include the styling for ReactQuill **
import "react-toastify/dist/ReactToastify.css";
import "./FormPreview.css";

const FormPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formElements, formTitle, formId } = location.state || {
    formElements: [],
    formTitle: "",
  };

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
        // <-- Added condition here
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
                  {/* <label>
                    <span className="form-preview-label-numberformpreview">
                      {index + 1}
                    </span>
                    {element.label}
                    {element.required && (
                      <span className="requiredformpreview">*</span>
                    )}
                  </label> */}
                  {/* START CHANGE FOR "Show If" condition --- */}
                  {/* START CHANGE FOR "Show If" condition with multiple values --- */}
                  {element.conditionQuestion &&
                    Array.isArray(element.conditionValue) &&
                    element.conditionValue.some(
                      (val) => values[element.conditionQuestion] === val
                    ) && (
                      <>
                        {/* *** START CHANGE FOR adding red star mark to required fields --- *** */}
                        <label>
                          <span className="form-preview-label-numberformpreview">
                            {index + 1}
                          </span>
                          {element.label}
                          {element.required && (
                            <span className="requiredformpreview">*</span>
                          )}
                        </label>
                        {/* *** END CHANGE FOR adding red star mark to required fields --- *** */}

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
                            <div
                              key={idx}
                              className="multiselect-option-formpreview"
                            >
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
                        ) : element.type === "note" ? ( // ** START CHANGE FOR "Note input" --- **
                          <ReactQuill
                            value={values[element.label]}
                            onChange={(value) =>
                              setFieldValue(element.label, value)
                            }
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
                        {element.label !== "Contact Number" &&
                          element.label !== "Startup team size" &&
                          (element.maxLength || element.minLength) && (
                            <div className="character-limit-formpreview">
                              {element.maxLength &&
                                `${
                                  element.maxLength -
                                  (values[element.label]?.length || 0)
                                } characters remaining`}
                              {element.minLength &&
                                (values[element.label]?.length || 0) <
                                  element.minLength &&
                                ` (Min: ${element.minLength} characters)`}
                            </div>
                          )}
                      </>
                    )}
                  {/* END CHANGE FOR "Show If" condition --- */}

                  {/* If there's no "Show If" condition, display as normal */}
                  {!element.conditionQuestion && (
                    <>
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
                          <div
                            key={idx}
                            className="multiselect-option-formpreview"
                          >
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
                      ) : element.type === "note" ? ( // ** START CHANGE FOR "Note input" --- **
                        <ReactQuill
                          value={values[element.label]}
                          onChange={(value) =>
                            setFieldValue(element.label, value)
                          }
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
                      {element.label !== "Contact Number" &&
                        element.label !== "Startup team size" &&
                        (element.maxLength || element.minLength) && (
                          <div className="character-limit-formpreview">
                            {element.maxLength &&
                              `${
                                element.maxLength -
                                (values[element.label]?.length || 0)
                              } characters remaining`}
                            {element.minLength &&
                              (values[element.label]?.length || 0) <
                                element.minLength &&
                              ` (Min: ${element.minLength} characters)`}
                          </div>
                        )}
                    </>
                  )}
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
