import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PublicFormPreview.css";
import { FaInfoCircle } from "react-icons/fa";

const PublicFormPreview = ({ formId, pipelineId }) => {
  // const { formId } = useParams();
  const location = useLocation(); // Hook to access the passed state from navigate
  const [formStructure, setFormStructure] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDuplicateSubmission, setIsDuplicateSubmission] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false); // For submit button loading state
  const [isDraftLoading, setIsDraftLoading] = useState(false); // For draft save loading state
  const [duplicateEmailError, setDuplicateEmailError] = useState(false); // For email duplicate check
  // Counter for numbering top-level fields
  let topLevelFieldCount = 0; // For top-level field numbering
  let conditionallyDisplayedFieldCount = 0; // For conditionally displayed field numbering
  // Function to generate the label for conditionally displayed fields
  /*** START CHANGE FOR numbering in 'Conditionally displayed field' under 'Top-level field' --- ***/
  // Helper to generate decimal numbers for conditionally displayed fields
  const generateDecimalNumber = (parentIndex, childIndex) => {
    return `${parentIndex}.${childIndex + 1}`; // Decimal format x.y
  };
  /*** END CHANGE FOR numbering in 'Conditionally displayed field' under 'Top-level field' ---**/
  /** START CHANGE FOR pre-filled form from props/state --- **/
  useEffect(() => {
    if (location.state?.email && location.state?.preFilledData) {
      // console.log("Pre-filled data from props:", location.state.preFilledData);
      setFormValues(location.state.preFilledData); // Set pre-filled data from the passed state
    }
  }, [location.state]);
  /** END CHANGE FOR pre-filled form from props/state --- **/

  ///// for final application form
  useEffect(() => {
    // console.log('Received formId:', formId); // Log the received formId
    // rest of the effect...
  }, [formId]);

  // Fetch form structure and pre-fill the form if data is passed from navigate
  useEffect(() => {
    if (!formId) {
      console.error("Form ID is undefined in PublicFormPreview");
      setIsError(true);
      return;
    }

    const fetchFormStructure = async () => {
      try {
        const response = await fetch(
          `https://incubator.drishticps.org/api/forms/general/${formId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch form structure");
        }
        const data = await response.json();
        setFormStructure(data);

        // Check if there is any pre-filled data passed from the previous page
        if (location.state?.preFilledData) {
          // console.log(
          //   "Pre-filled data from state:",
          //   location.state.preFilledData
          // );
          setFormValues(location.state.preFilledData); // Set pre-filled data from the passed state
        } else {
          // Set default empty values if no pre-filled data
          setFormValues(
            data.fields.reduce((acc, field) => {
              acc[field.label] = field.type === "multiselect" ? [] : "";
              return acc;
            }, {})
          );
        }
      } catch (error) {
        console.error("Error fetching form structure:", error);
        setIsError(true);
      }
    };
    fetchFormStructure();
  }, [formId, location.state]);

  // Fetch saved draft if exists
  const fetchDraft = async (email) => {
    try {
      const response = await fetch(
        "https://incubator.drishticps.org/api/forms/fetch-draft",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formId, pipelineId, email }),
        }
      );
      const draftData = await response.json();
      if (response.ok) {
        // Pre-fill the form with saved draft data
        setFormValues(draftData.formData);
        console.log("Draft loaded:", draftData);
      }
    } catch (error) {
      console.error("Error fetching draft:", error);
    }
  };

  const handleChange = (label, value) => {
    console.log(`Field changed: ${label}, Value: ${value}`); // Debug field changes

    // Reset duplicate email error on change
    if (label === "Email") {
      setDuplicateEmailError(false);
      checkDuplicateEmail(value);
      fetchDraft(value); // Fetch draft if user enters email
    }

    const field = formStructure.fields.find((f) => f.label === label);
    if (field && (!field.maxLength || value.length <= field.maxLength)) {
      setFormValues((prevValues) => ({
        ...prevValues,
        [label]: value,
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        [label]: field.required && value.length < field.minLength,
      }));
    }
    // Check if the email is already submitted
    if (label === "Email") {
      checkDuplicateEmail(value);
    }
  };

  // Function to check if the email is already submitted
  const checkDuplicateEmail = async (email) => {
    try {
      const response = await fetch(
        `https://incubator.drishticps.org/api/forms/check-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formId, pipelineId, email }), // Pass formId, pipelineId, and email to check
        }
      );
      const data = await response.json();
      console.log("Duplicate email check response:", data); // Debug duplicate email check
      if (data.isDuplicate) {
        setDuplicateEmailError(true);
      } else {
        setDuplicateEmailError(false); // No error for drafts
      }
    } catch (error) {
      console.error("Error checking email:", error);
    }
  };
  /** END CHANGE FOR fetch already submitted by this "Email" --- **/

  const handleCheckboxChange = (label, option) => {
    const field = formStructure.fields.find((f) => f.label === label);
    const selectedOptions = formValues[label];
    let newSelectedOptions = [];

    if (selectedOptions.includes(option)) {
      newSelectedOptions = selectedOptions.filter((item) => item !== option);
    } else if (selectedOptions.length < field.maxSelect) {
      newSelectedOptions = [...selectedOptions, option];
    }

    setFormValues((prevValues) => ({
      ...prevValues,
      [label]: newSelectedOptions,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [label]: field.required && newSelectedOptions.length === 0,
    }));
  };

  const handleFileChange = (label, file) => {
    if (file) {
      if (
        label === "Resume (PDF Format Only)" &&
        file.type !== "application/pdf"
      ) {
        alert("Please upload a PDF file.");
      } else if (
        label === "Upload Startup Logo (In PNG/JPG Format)" &&
        !["image/png", "image/jpeg"].includes(file.type)
      ) {
        alert("Please upload a PNG or JPG file.");
      } else {
        const currentDateTime = new Date().toLocaleString(); // Get the current date and time as a string

        setFiles((prevFiles) => {
          // Filter out any existing file with the same label
          const filteredFiles = prevFiles.filter((f) => f.label !== label);
          // Add the new file with the current date and time
          return [
            ...filteredFiles,
            { label, file, uploadedAt: currentDateTime },
          ];
        });
        setFormValues((prevValues) => ({
          ...prevValues,
          [label]: `${file.name} (uploaded at ${currentDateTime})`, // Include the upload time in the form values
        }));
        setErrors((prevErrors) => ({
          ...prevErrors,
          [label]: false,
        }));
      }
    }
  };

  const submitForm = async (formId, responses) => {
    console.log("Submitting form with responses:", responses); // Debug form responses

    const formData = new FormData();
    formData.append("formId", formId);
    formData.append("responses", JSON.stringify(responses));

    // Check for pipelineId before adding it
    if (pipelineId) {
      formData.append("pipelineId", pipelineId); // Add pipelineId to the request
    } else {
      console.error("pipelineId is undefined");
    }

    files.forEach((fileWrapper) => {
      console.log("Adding file to submission:", fileWrapper.file.name); // Debug file handling

      formData.append("files", fileWrapper.file); //  append files
      formData.append(`label_${fileWrapper.file.name}`, fileWrapper.label); // Append label with file
    });

    try {
      const response = await fetch(
        "https://incubator.drishticps.org/api/forms/public-form-submission",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error submitting form:", errorData.error);
        if (errorData.error === "Form is already submitted for this email.") {
          setIsDuplicateSubmission(true);
        } else {
          setIsError(true);
        }
        throw new Error(errorData.error);
      } else {
        console.log("Form submitted successfully");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsError(true); // Correct error handling
    }
  };

  // /*** START CHANGE add "Save as Draft" button ***/

  // /*** END CHANGE FOR add "Save as Draft" button --- ***/
  /*** START CHANGE FOR save files in mongoDb  after press "Save as Draft" button ***/
  const handleDraftSave = async () => {
    setIsDraftLoading(true); // Start loading for draft save
    setIsSubmitLoading(false); // Ensure submit is not loading
    // console.log("Submit loading state after draft click:", isSubmitLoading, "Draft loading state after draft click:", isDraftLoading);

    const newErrors = {};
    let hasError = false;
    let filteredValues = {};

    // Make sure 'Email' and 'Name' are mandatory
    if (!formValues["Email"]) {
      newErrors["Email"] = true;
      hasError = true;
    }

    if (!formValues["Name"]) {
      newErrors["Name"] = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setIsDraftLoading(false);

      // Show error message for missing 'Email' and 'Name' using React Toastify
      toast.error("'Email' and 'Name' fields are mandatory", {
        position: "bottom-right",
        autoClose: 3000, // Automatically close after 3 seconds
      });
      return; // Stop execution if 'Email' and 'Name' are missing
    }

    /*** START CHANGE FOR add 'This field is required' validation for min/max character limit when pressing 'Save as Draft' button--- ***/
    for (const field of formStructure.fields) {
      if (
        formValues[field.label] &&
        field.minLength &&
        formValues[field.label].length < field.minLength
      ) {
        newErrors[field.label] = true;
        hasError = true;
      } else if (formValues[field.label]) {
        // Save fields that have been filled and meet the conditions
        filteredValues[field.label] = formValues[field.label];
      }
    }

    if (hasError) {
      setErrors(newErrors);
      setIsDraftLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("formId", formId);
    formData.append("formValues", JSON.stringify(formValues));

    if (pipelineId) {
      formData.append("pipelineId", pipelineId);
    }

    // // Attach files to the formData for saving
    // files.forEach((fileWrapper) => {
    //   formData.append("files", fileWrapper.file);
    // });

    // Attach files to the formData for saving, including their label names
    files.forEach((fileWrapper) => {
      console.log(
        "Attaching file:",
        fileWrapper.file.name,
        "with label:",
        fileWrapper.label
      ); // Debug label and file
      formData.append("files", fileWrapper.file); // Append the file
      formData.append(`label_${fileWrapper.file.name}`, fileWrapper.label); // Append label with file
    });

    try {
      const response = await fetch(
        "https://incubator.drishticps.org/api/forms/save-draft",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to save draft");
      }
      // Add this log to ensure it's reaching here
      // console.log("Draft saved, showing toast...");
      /*** START CHANGE FOR toestify message ***/
      // Show toast notification when draft is saved successfully
      // toast.success("Draft saved successfully!", {
      toast.success(
        "Draft saved successfully! You can login at https://incubator.drishticps.org to continue your application.",
        {
          position: "bottom-right", // Use string directly instead of the constant
          autoClose: 3000, // Automatically close after 3 seconds
        }
      );
      /*** END CHANGE FOR toestify message --- ***/
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsDraftLoading(false); // Re-enable button after draft save is done
      // console.log("Draft loading state after save:", isDraftLoading);
    }
  };
  /*** END CHANGE FOR save files in mongoDb  after press "Save as Draft" button ***/

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true); // Start loading for submit
    setIsDraftLoading(false); // Ensure draft is not loading
    // console.log("Submit loading state after click:", isSubmitLoading, "Draft loading state after click:", isDraftLoading);

    const newErrors = {};
    let hasError = false;
    /*** START CHANGE FOR apply minimum and maximum character limit validation only if user types more than 1 character --- ***/
    for (const field of formStructure.fields) {
      // For required fields, always validate
      if (field.required) {
        if (
          !formValues[field.label] ||
          (field.type === "multiselect" &&
            formValues[field.label].length === 0) ||
          (field.minLength && formValues[field.label].length < field.minLength)
        ) {
          newErrors[field.label] = true;
          hasError = true;
        }
      } else {
        // For non-required fields, validate only if user types more than 1 character
        if (
          formValues[field.label]?.length > 0 && // If more than 0 characters are typed
          field.minLength &&
          formValues[field.label].length < field.minLength
        ) {
          newErrors[field.label] = true;
          hasError = true;
        }

        if (
          formValues[field.label]?.length > 0 && // If more than 0 characters are typed
          field.maxLength &&
          formValues[field.label].length > field.maxLength
        ) {
          newErrors[field.label] = true;
          hasError = true;
        }
      }
    }
    /*** END CHANGE FOR apply minimum and maximum character limit validation only if user types more than 1 character --- ***/
    if (hasError) {
      setErrors(newErrors);
      setIsSubmitLoading(false); // Stop loading if validation fails

      return;
    }
    // Submit the form
    console.log("Form is ready for submission. Form values:", formValues);

    try {
      await submitForm(formId, formValues);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitLoading(false); // Re-enable button after submission is done
      // console.log("Submit loading state after submission:", isSubmitLoading);
    }
  };

  const handleClearForm = () => {
    setFormValues(
      formStructure.fields.reduce((acc, field) => {
        acc[field.label] = field.type === "multiselect" ? [] : "";
        return acc;
      }, {})
    );
    setFiles([]);
    setErrors({});
  };

  if (!formStructure) {
    // console.log("Form structure is loading..."); // Debug loading state

    return <div>Loading form...</div>;
  }

  if (isDuplicateSubmission) {
    console.log("Duplicate submission detected."); // Debug duplicate submission

    return (
      <div className="response-page-publicformpreview">
        <div className="response-message-container-publicformpreview">
          <h1 className="response-title-publicformpreview">
            You've already responded
          </h1>
          <p className="response-text-publicformpreview">
            Thanks for submitting your contact info!
          </p>
          <p className="response-text-publicformpreview">
            You can only fill in this form once.
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("An error occurred in the form!"); // Debug form error

    return (
      <div className="response-page-publicformpreview">
        <div className="response-message-container-publicformpreview">
          <h1 className="response-title-publicformpreview">
            You've already responded
          </h1>
          <p className="response-text-publicformpreview">
            Thanks for submitting your information!
          </p>
          <p className="response-text-publicformpreview">
            You can only fill in this form once.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-background-publicformpreview">
      {isSubmitted ? (
        <div className="thank-you-message-fullscreen">
          <div className="thank-you-message-publicformpreview">
            <div className="icon-container-publicformpreview">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g fill="none" fillRule="evenodd">
                  <g transform="translate(1 1)" fillRule="nonzero">
                    <path
                      d="M48 6H16C11.589 6 8 9.589 8 14v32c0 4.411 3.589 8 8 8h32c4.411 0 8-3.589 8-8V14c0-4.411-3.589-8-8-8z"
                      fill="#EFF6FF"
                    />
                    <path
                      d="M56 0H8C3.589 0 0 3.589 0 8v48c0 4.411 3.589 8 8 8h48c4.411 0 8-3.589 8-8V8c0-4.411-3.589-8-8-8z"
                      fill="#EFF6FF"
                    />
                    <path
                      d="M44.293 20.293a1 1 0 00-1.414 0L24 39.172l-6.879-6.879a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l20-20a1 1 0 000-1.414z"
                      fill="#1E88E5"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <h2>Thank you for your submission!</h2>
          </div>
        </div>
      ) : (
        <div className="custom-public-form-preview-publicformpreview">
          <h2 className="custom-form-title-publicformpreview"> </h2>
          <form
            onSubmit={handleSubmit}
            className="custom-form-publicformpreview"
          >
            <div className="custom-form-row-publicformpreview">
              {formStructure.fields.map((field, index) => (
                <div
                  key={index}
                  className="custom-form-group-publicformpreview"
                >
                  {/** START CHANGE FOR  "Show If"   --- **/}
                  {(!field.conditionQuestion ||
                    (formValues[field.conditionQuestion] &&
                      field.conditionValue.includes(
                        formValues[field.conditionQuestion]
                      ))) && (
                    <>
                      <div className="number-container-publicformpreview">
                        <span className="number-circle-publicformpreview">
                          {field.conditionQuestion
                            ? generateDecimalNumber(
                                topLevelFieldCount,
                                conditionallyDisplayedFieldCount++
                              )
                            : ++topLevelFieldCount}
                        </span>
                      </div>
                      <label
                        className={`custom-form-label-publicformpreview ${
                          field.conditionQuestion
                            ? "conditionally-displayed-field"
                            : ""
                        }`}
                      >
                        {field.label}
                        {/*** START CHANGE FOR add "Required" option checkbox in all sidebar field--- ***/}
                        {field.required && (
                          <span className="required-publicformpreview">*</span>
                        )}
                        {/*** END CHANGE FOR add "Required" option checkbox in all sidebar field--- ***/}
                      </label>
                      <div className="custom-form-input-container-publicformpreview">
                        {/* Container to hold the input directly below the label */}
                        {field.type === "select" ? (
                          <select
                            className="custom-form-input-publicformpreview"
                            value={formValues[field.label]}
                            onChange={(e) =>
                              handleChange(field.label, e.target.value)
                            }
                            required={field.required}
                          >
                            <option value="">Select...</option>
                            {field.options.map((option, optionIndex) => (
                              <option key={optionIndex} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "multiselect" ? (
                          field.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="checkbox-group-publicformpreview"
                            >
                              <input
                                type="checkbox"
                                id={`${field.label}-${optionIndex}`}
                                value={option}
                                checked={formValues[field.label].includes(
                                  option
                                )}
                                onChange={() =>
                                  handleCheckboxChange(field.label, option)
                                }
                                disabled={
                                  !formValues[field.label].includes(option) &&
                                  formValues[field.label].length >=
                                    field.maxSelect
                                }
                              />
                              <label
                                htmlFor={`${field.label}-${optionIndex}`}
                                className="option-label-publicformpreview"
                                style={{ fontSize: "12px" }}
                              >
                                {option}
                              </label>
                            </div>
                          ))
                        ) : field.type === "radio" ? (
                          field.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="radio-group-publicformpreview"
                            >
                              <input
                                type="radio"
                                id={`${field.label}-${optionIndex}`}
                                name={field.label}
                                value={option}
                                checked={formValues[field.label] === option}
                                onChange={(e) =>
                                  handleChange(field.label, e.target.value)
                                }
                                required={field.required}
                              />
                              <label
                                htmlFor={`${field.label}-${optionIndex}`}
                                className="option-label-publicformpreview-radio"
                                style={{ fontSize: "14px" }}
                              >
                                {option}
                              </label>
                            </div>
                          ))
                        ) : field.type === "note" ? ( // ** START CHANGE FOR "Note ReactQuill input" --- **
                          <div className="custom-note-container-publicformpreview">
                            {" "}
                            {/* Container for ReactQuill to add spacing */}
                            <ReactQuill
                              value={formValues[field.label]}
                              onChange={(value) =>
                                handleChange(field.label, value)
                              }
                            />
                          </div> // ** END CHANGE FOR "Note ReactQuill input" --- **
                        ) : field.type === "file" ? (
                          <input
                            className="custom-form-input-publicformpreview"
                            type="file"
                            onChange={(e) =>
                              handleFileChange(field.label, e.target.files[0])
                            }
                            required={field.required}
                          />
                        ) : field.type === "phone" ? (
                          // Change applied to set the default country to India (+91)
                          <PhoneInput
                            country={"in"} // <-- Default country changed to 'in' (India)
                            value={formValues[field.label]}
                            onChange={(value) =>
                              handleChange(field.label, value)
                            }
                            inputClass="custom-form-input-publicformpreview" // Match the class name
                            required={field.required}
                          />
                        ) : (
                          <input
                            className={`custom-form-input-publicformpreview ${
                              errors[field.label]
                                ? "error-publicformpreview"
                                : ""
                            }`}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formValues[field.label]}
                            onChange={(e) =>
                              handleChange(field.label, e.target.value)
                            }
                            required={field.required}
                            maxLength={field.maxLength || undefined}
                          />
                        )}
                      </div>

                      {/* START CHANGE FOR fetch already submitted by this "Email" --- */}
                      {/* Display duplicate email error message */}
                      {field.label === "Email" && duplicateEmailError && (
                        <div className="error-message-publicformpreview">
                          <FaInfoCircle className="error-icon-publicformpreview" />{" "}
                          You have already submitted the form using this email
                          ID.
                        </div>
                      )}
                      {/* END CHANGE FOR fetch already submitted by this "Email" --- */}

                      {errors[field.label] && (
                        <div className="error-message-publicformpreview">
                          <FaInfoCircle className="error-icon-publicformpreview" />{" "}
                          This field is required
                        </div>
                      )}
                      {(field.maxLength || field.minLength) &&
                        field.label !== "Contact Number" &&
                        field.label !== "Startup team size" && (
                          <div className="character-limit-publicformpreview">
                            {field.maxLength &&
                              `${
                                field.maxLength -
                                (formValues[field.label]?.length || 0)
                              } characters remaining`}
                            {field.minLength &&
                              (formValues[field.label]?.length || 0) <
                                field.minLength &&
                              ` (Min: ${field.minLength} characters)`}
                          </div>
                        )}
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="form-buttons-publicformpreview">
              {/* Submit button */}
              <button
                type="submit"
                className="custom-form-submit-button-publicformpreviewfinalsave"
                disabled={isSubmitLoading || isDraftLoading} // Both buttons disabled when one is clicked
              >
                {isSubmitLoading ? "Submitting..." : "Submit"}{" "}
                {/* Conditionally show text */}
              </button>

              {/* Save as Draft button */}
              <button
                type="button"
                className="custom-form-save-draft-button"
                onClick={handleDraftSave}
                disabled={isSubmitLoading || isDraftLoading} // Both buttons disabled when one is clicked
              >
                {isDraftLoading ? "Saving..." : "Save as Draft"}{" "}
                {/* Conditionally show text */}
              </button>
              <button
                type="button"
                className="custom-form-clear-button-publicformpreview"
                onClick={() => handleClearForm()}
              >
                Clear Form
              </button>
            </div>
            <div className="copyright-publicformpreview">
              © Copyright 2024 | drishticps.iiti.ac.in | All Rights Reserved
            </div>
          </form>
          <ToastContainer />
        </div>
      )}
    </div>
  );
};

export default PublicFormPreview;
