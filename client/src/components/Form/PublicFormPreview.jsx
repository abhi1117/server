import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PublicFormPreview.css";
import { FaInfoCircle } from "react-icons/fa";

const PublicFormPreview = ({ formId, pipelineId }) => {
  const location = useLocation(); // Hook to access the passed state from navigate
  const [formStructure, setFormStructure] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // const [isError, setIsError] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false); // For submit button loading state
  const [isDraftLoading, setIsDraftLoading] = useState(false); // For draft save loading state
  const [duplicateEmailError, setDuplicateEmailError] = useState(false); // For email duplicate check

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

  // Helper function to convert a number to an alphabet (e.g., 0 -> 'a', 1 -> 'b', ...)
  const generateAlphabeticalNumber = (index) => {
    return String.fromCharCode(97 + index); // ASCII code: 'a' starts at 97
  };

  // Track numbering for top-level and first-level fields
  let topLevelFieldCount = 0; // For top-level fields (e.g., 1, 2)
  let firstLevelCounters = {}; // For first-level subfields under each top-level field
  let secondLevelCounters = {}; // For second-level subfields under each first-level subfield

  const generateHierarchicalNumber = (field, parentField) => {
    if (!field.conditionQuestion) {
      // Top-Level Field
      topLevelFieldCount++; // Increment top-level field counter
      firstLevelCounters[topLevelFieldCount] = 0; // Reset first-level counters for the new top-level field
      return `${topLevelFieldCount}`; // Return top-level numbering (e.g., 1, 2, 3)
    } else if (parentField && !parentField.conditionQuestion) {
      // First-Level Subfield
      const parentNumber = `${topLevelFieldCount}`; // Use the current top-level field count as parent
      firstLevelCounters[parentNumber] =
        (firstLevelCounters[parentNumber] || 0) + 1; // Increment the first-level counter
      const firstLevelNumber = `${parentNumber}.${firstLevelCounters[parentNumber]}`;
      secondLevelCounters[firstLevelNumber] = 0; // Reset second-level counters for the new first-level subfield
      return firstLevelNumber; // Return first-level numbering (e.g., 7.1)
    } else {
      // Second-Level Subfield
      const parentNumber = `${topLevelFieldCount}.${firstLevelCounters[topLevelFieldCount]}`; // Use current top-level and first-level field counts as parent
      secondLevelCounters[parentNumber] =
        (secondLevelCounters[parentNumber] || 0) + 1; // Increment the second-level counter
      const alphabet = generateAlphabeticalNumber(
        secondLevelCounters[parentNumber] - 1
      ); // Convert counter to alphabet (e.g., 1 -> a, 2 -> b)
      return `${parentNumber}.${alphabet}`; // Return second-level numbering (e.g., 7.1.a)
    }
  };

  // Fetch form structure and pre-fill the form if data is passed from navigate
  useEffect(() => {
    if (!formId) {
      console.error("Form ID is undefined in PublicFormPreview");
      // setIsError(true);
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
          setFormValues(location.state.preFilledData); // Set pre-filled data from the passed state
        } else {
          // Set default empty values if no pre-filled data
          setFormValues(
            data.fields.reduce((acc, field) => {
              if (field.type === "multiselect") {
                acc[field.label] = []; // Initialize multiselect as an empty array
              } else if (field.type === "radio" || field.type === "select") {
                acc[field.label] = ""; // Initialize radio/select as an empty string
              } else {
                acc[field.label] = ""; // Default to an empty string for other types
              }
              return acc;
            }, {})
          );
        }
      } catch (error) {
        console.error("Error fetching form structure:", error);
        // setIsError(true);
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

  // Function to check if the email is already submitted

  const handleChange = (label, value) => {
    // console.log(`Field changed: ${label}, Value: ${value}`); // Debug field changes

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

      // Clear dependent fields when switching a First-Level Subfield
      if (!field.conditionQuestion) {
        // console.log(`Resetting dependent fields for: ${label}`); // Debugging log
        const dependentFields = formStructure.fields.filter(
          (f) => f.conditionQuestion === label
        );

        dependentFields.forEach((dependentField) => {
          setFormValues((prevValues) => ({
            ...prevValues,
            [dependentField.label]: "", // Reset the value of the dependent field
          }));

          // Clear deeper dependent fields (Second-Level, etc.)
          const deeperDependentFields = formStructure.fields.filter(
            (f) => f.conditionQuestion === dependentField.label
          );
          deeperDependentFields.forEach((deepField) => {
            setFormValues((prevValues) => ({
              ...prevValues,
              [deepField.label]: "", // Reset deeper subfields
            }));
          });
        });
      }
    }

    // Check if the email is already submitted
    if (label === "Email") {
      checkDuplicateEmail(value);
    }
  };

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
      // console.log("Duplicate email check response:", data); // Debug duplicate email check
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
    /*** START CHANGE FOR AUTO-ADDING ROUND NUMBER ***/
    // Automatically include the round number in the submission
    // const roundNumber = location.state?.roundNumber || 1; // Default to Round 1 if not provided
    const roundNumber = location.state?.roundNumber || 1; // Default to Round 1 if not provided
    formData.append("roundNumber", roundNumber);
    console.log("Auto-including roundNumber:", roundNumber);
    /*** END CHANGE FOR AUTO-ADDING ROUND NUMBER ***/

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
      setIsSubmitted(response.ok);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error submitting form:", errorData.error);
        toast.error(errorData.error);
        throw new Error(errorData.error);
      } else {
        console.log("Form submitted successfully");
        // toast.success(response.status.ok)
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // setIsError(true); // Correct error handling
    }
  };

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

    /*** START CHANGE FOR validating only visible fields while saving as draft --- ***/
    // Filter visible fields based on conditional display logic
    const visibleFields = formStructure.fields.filter((field) => {
      return (
        !field.conditionQuestion || // Always include fields without conditionQuestion
        (formValues[field.conditionQuestion] &&
          field.conditionValue.includes(formValues[field.conditionQuestion]))
      );
    });

    /*** START CHANGE FOR add 'This field is required' validation for min/max character limit when pressing 'Save as Draft' button--- ***/
    for (const field of visibleFields) {
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

    const roundNumber = location.state?.roundNumber || 1; // Default to Round 1
    formData.append("roundNumber", roundNumber); // Append roundNumber
    console.log("Saving draft with roundNumber:", roundNumber);

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
      toast.success(
        "Draft saved successfully! You can login at https://incubator.drishticps.org/user-signin to continue your application.",
        {
          position: "bottom-right", // Use string directly instead of the constant
          autoClose: 3000, // Automatically close after 3 seconds
        }
      );
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
    console.log("Form Values before validation:", formValues);

    setIsSubmitLoading(true); // Start loading for submit
    setIsDraftLoading(false); // Ensure draft is not loading

    const newErrors = {};
    let hasError = false;

    /*** START CHANGE - Validate email before processing files ***/
    if (duplicateEmailError) {
      console.log("Duplicate email detected. Submission aborted.");
      toast.error("You have already submitted the form using this email ID.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      setIsSubmitLoading(false);
      return; // Stop execution if email is already used
    }
    /*** END CHANGE - Validate email before processing files ***/

    /*** START CHANGE FOR validating only visible fields --- ***/
    // Filter visible fields based on conditional display logic
    const visibleFields = formStructure.fields.filter((field) => {
      return (
        !field.conditionQuestion || // Always include fields without conditionQuestion
        (formValues[field.conditionQuestion] &&
          field.conditionValue.includes(formValues[field.conditionQuestion]))
      );
    });

    // Apply validation only to visible fields
    for (const field of visibleFields) {
      // For required fields, always validate
      if (field.required) {
        if (
          !formValues[field.label] || // Check if the value is empty
          (field.type === "multiselect" &&
            formValues[field.label].length === 0) || // Check for empty multiselect
          (field.minLength && formValues[field.label].length < field.minLength) // Validate min length
        ) {
          newErrors[field.label] = true;
          console.log(`Validation error for field: ${field.label}`);
          hasError = true;
        }
      }

      // For optional fields, validate length if non-empty
      if (
        formValues[field.label]?.length > 0 && // Only validate if a value exists
        field.minLength &&
        formValues[field.label].length < field.minLength
      ) {
        newErrors[field.label] = true;
        hasError = true;
      }

      if (
        formValues[field.label]?.length > 0 &&
        field.maxLength &&
        formValues[field.label].length > field.maxLength
      ) {
        newErrors[field.label] = true;
        hasError = true;
      }
    }
    /*** END CHANGE FOR validating only visible fields --- ***/

    if (hasError) {
      console.log("Validation errors found.");
      setErrors(newErrors);
      setIsSubmitLoading(false); // Stop loading if validation fails
      return;
    }

    // Submit the form
    console.log("Form is ready for submission. Form values:", formValues);

    try {
      await submitForm(formId, formValues);
      // setIsSubmitted(true);
      // Navigate to the login page after successful submission
      // navigate("/user-signin");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitLoading(false); // Re-enable button after submission is done
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
            // onSubmit={handleSubmit}
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
                        {/* <span className="number-circle-publicformpreview">
                          {field.conditionQuestion
                            ? generateDecimalNumber(
                                topLevelFieldCount,
                                conditionallyDisplayedFieldCount++
                              )
                            : ++topLevelFieldCount}
                        </span> */}

                        {/* <span className="number-circle-publicformpreview">
  {generateHierarchicalNumber(field, index)}
</span> */}

                        <span className="number-circle-publicformpreview">
                          {generateHierarchicalNumber(
                            field,
                            formStructure.fields.find(
                              (f) => f.label === field.conditionQuestion
                            )
                          )}
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
                                // required
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
            {/* <div className="form-buttons-publicformpreview"> */}
            <div
              className="form-buttons-publicformpreview"
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "20px",
                flexWrap: "wrap", // Allow buttons to wrap
              }}
            >
              {/* Save as Draft button */}
              {/* <button
                type="button"
                className="custom-form-save-draft-button"
                onClick={handleDraftSave}
                disabled={isSubmitLoading || isDraftLoading} // Both buttons disabled when one is clicked
                style={{
                  padding: "12px",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  backgroundColor: "#007bff",
                  color: "white",
                  width: "135px",
                  textAlign: "center",
                  transition: "background-color 0.3s ease",
                }}
              >
                {isDraftLoading ? "Saving..." : "Save as Draft"}{" "}
               </button> */}

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="custom-form-submit-button-publicformpreviewfinalsave"
                disabled={isSubmitLoading || isDraftLoading} // Both buttons disabled when one is clicked
                style={{
                  padding: "12px",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  backgroundColor: "#007bff",
                  color: "white",
                  width: "135px",
                  textAlign: "center",
                  transition: "background-color 0.3s ease",
                }}
              >
                {isSubmitLoading ? "Submitting..." : "Submit"}{" "}
              </button>

              <button
                type="button"
                className="custom-form-clear-button-publicformpreview"
                onClick={() => handleClearForm()}
                style={{
                  padding: "12px",
                  border: "1px solid #007bff",
                  borderRadius: "5px",
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  backgroundColor: "#ffffff",
                  color: "#007bff",
                  width: "130px",
                  textAlign: "center",
                  transition: "background-color 0.3s ease",
                }}
              >
                Clear Form
              </button>
            </div>

            <div className="copyright-publicformpreview">
              © Copyright 2025 |{" "}
              <a
                href="https://drishticps.iiti.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007bff", textDecoration: "none" }}
              >
                drishticps.iiti.ac.in
              </a>{" "}
              | All Rights Reserved
            </div>
          </form>
          <ToastContainer />
        </div>
      )}
    </div>
  );
};

export default PublicFormPreview;








// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { useParams } from "react-router-dom";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./PublicFormPreview.css";
// import { FaInfoCircle } from "react-icons/fa";

// const PublicFormPreview = ({ formId, pipelineId }) => {
//   // const { formId } = useParams();
//   const location = useLocation(); // Hook to access the passed state from navigate
//   const [formStructure, setFormStructure] = useState(null);
//   const [formValues, setFormValues] = useState({});
//   const [errors, setErrors] = useState({});
//   const [files, setFiles] = useState([]);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isDuplicateSubmission, setIsDuplicateSubmission] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const [isSubmitLoading, setIsSubmitLoading] = useState(false); // For submit button loading state
//   const [isDraftLoading, setIsDraftLoading] = useState(false); // For draft save loading state
//   const [duplicateEmailError, setDuplicateEmailError] = useState(false); // For email duplicate check
//   // Counter for numbering top-level fields
//   // let topLevelFieldCount = 0; // For top-level field numbering
//   let conditionallyDisplayedFieldCount = 0; // For conditionally displayed field numbering
//   // Function to generate the label for conditionally displayed fields
//   /*** START CHANGE FOR numbering in 'Conditionally displayed field' under 'Top-level field' --- ***/
//   // Helper to generate decimal numbers for conditionally displayed fields
//   const generateDecimalNumber = (parentIndex, childIndex) => {
//     return `${parentIndex}.${childIndex + 1}`; // Decimal format x.y
//   };
//   /*** END CHANGE FOR numbering in 'Conditionally displayed field' under 'Top-level field' ---**/
//   /** START CHANGE FOR pre-filled form from props/state --- **/
//   useEffect(() => {
//     if (location.state?.email && location.state?.preFilledData) {
//       // console.log("Pre-filled data from props:", location.state.preFilledData);
//       setFormValues(location.state.preFilledData); // Set pre-filled data from the passed state
//     }
//   }, [location.state]);
//   /** END CHANGE FOR pre-filled form from props/state --- **/

//   ///// for final application form
//   useEffect(() => {
//     // console.log('Received formId:', formId); // Log the received formId
//     // rest of the effect...
//   }, [formId]);

//   // Helper function to convert a number to an alphabet (e.g., 0 -> 'a', 1 -> 'b', ...)
//   const generateAlphabeticalNumber = (index) => {
//     return String.fromCharCode(97 + index); // ASCII code: 'a' starts at 97
//   };

//   // Track numbering for top-level and first-level fields
//   let topLevelFieldCount = 0; // For top-level fields (e.g., 1, 2)
//   let firstLevelCounters = {}; // For first-level subfields under each top-level field
//   let secondLevelCounters = {}; // For second-level subfields under each first-level subfield

//   const generateHierarchicalNumber = (field, parentField) => {
//     if (!field.conditionQuestion) {
//       // Top-Level Field
//       topLevelFieldCount++; // Increment top-level field counter
//       firstLevelCounters[topLevelFieldCount] = 0; // Reset first-level counters for the new top-level field
//       return `${topLevelFieldCount}`; // Return top-level numbering (e.g., 1, 2, 3)
//     } else if (parentField && !parentField.conditionQuestion) {
//       // First-Level Subfield
//       const parentNumber = `${topLevelFieldCount}`; // Use the current top-level field count as parent
//       firstLevelCounters[parentNumber] =
//         (firstLevelCounters[parentNumber] || 0) + 1; // Increment the first-level counter
//       const firstLevelNumber = `${parentNumber}.${firstLevelCounters[parentNumber]}`;
//       secondLevelCounters[firstLevelNumber] = 0; // Reset second-level counters for the new first-level subfield
//       return firstLevelNumber; // Return first-level numbering (e.g., 7.1)
//     } else {
//       // Second-Level Subfield
//       const parentNumber = `${topLevelFieldCount}.${firstLevelCounters[topLevelFieldCount]}`; // Use current top-level and first-level field counts as parent
//       secondLevelCounters[parentNumber] =
//         (secondLevelCounters[parentNumber] || 0) + 1; // Increment the second-level counter
//       const alphabet = generateAlphabeticalNumber(
//         secondLevelCounters[parentNumber] - 1
//       ); // Convert counter to alphabet (e.g., 1 -> a, 2 -> b)
//       return `${parentNumber}.${alphabet}`; // Return second-level numbering (e.g., 7.1.a)
//     }
//   };

//   // Fetch form structure and pre-fill the form if data is passed from navigate
//   useEffect(() => {
//     if (!formId) {
//       console.error("Form ID is undefined in PublicFormPreview");
//       setIsError(true);
//       return;
//     }

//     const fetchFormStructure = async () => {
//       try {
//         const response = await fetch(
//           `https://incubator.drishticps.org/api/forms/general/${formId}`
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch form structure");
//         }
//         const data = await response.json();
//         setFormStructure(data);

//         // Check if there is any pre-filled data passed from the previous page
//         if (location.state?.preFilledData) {
//           // console.log(
//           //   "Pre-filled data from state:",
//           //   location.state.preFilledData
//           // );
//           setFormValues(location.state.preFilledData); // Set pre-filled data from the passed state
//         } else {
//           // Set default empty values if no pre-filled data
//           setFormValues(
//             data.fields.reduce((acc, field) => {
//               if (field.type === "multiselect") {
//                 acc[field.label] = []; // Initialize multiselect as an empty array
//               } else if (field.type === "radio" || field.type === "select") {
//                 acc[field.label] = ""; // Initialize radio/select as an empty string
//               } else {
//                 acc[field.label] = ""; // Default to an empty string for other types
//               }
//               return acc;
//             }, {})
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching form structure:", error);
//         setIsError(true);
//       }
//     };
//     fetchFormStructure();
//   }, [formId, location.state]);

//   // Fetch saved draft if exists
//   const fetchDraft = async (email) => {
//     try {
//       const response = await fetch(
//         "https://incubator.drishticps.org/api/forms/fetch-draft",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ formId, pipelineId, email }),
//         }
//       );
//       const draftData = await response.json();
//       if (response.ok) {
//         // Pre-fill the form with saved draft data
//         setFormValues(draftData.formData);
//         console.log("Draft loaded:", draftData);
//       }
//     } catch (error) {
//       console.error("Error fetching draft:", error);
//     }
//   };

//   // const handleChange = (label, value) => {
//   //   console.log(`Field changed: ${label}, Value: ${value}`); // Debug field changes

//   //   // Reset duplicate email error on change
//   //   if (label === "Email") {
//   //     setDuplicateEmailError(false);
//   //     checkDuplicateEmail(value);
//   //     fetchDraft(value); // Fetch draft if user enters email
//   //   }

//   //   const field = formStructure.fields.find((f) => f.label === label);
//   //   if (field && (!field.maxLength || value.length <= field.maxLength)) {
//   //     setFormValues((prevValues) => ({
//   //       ...prevValues,
//   //       [label]: value,
//   //     }));
//   //     setErrors((prevErrors) => ({
//   //       ...prevErrors,
//   //       [label]: field.required && value.length < field.minLength,
//   //     }));
//   //   }
//   //   // Check if the email is already submitted
//   //   if (label === "Email") {
//   //     checkDuplicateEmail(value);
//   //   }
//   // };

//   // Function to check if the email is already submitted

//   const handleChange = (label, value) => {
//     // console.log(`Field changed: ${label}, Value: ${value}`); // Debug field changes

//     // Reset duplicate email error on change
//     if (label === "Email") {
//       setDuplicateEmailError(false);
//       checkDuplicateEmail(value);
//       fetchDraft(value); // Fetch draft if user enters email
//     }

//     const field = formStructure.fields.find((f) => f.label === label);

//     if (field && (!field.maxLength || value.length <= field.maxLength)) {
//       setFormValues((prevValues) => ({
//         ...prevValues,
//         [label]: value,
//       }));
//       setErrors((prevErrors) => ({
//         ...prevErrors,
//         [label]: field.required && value.length < field.minLength,
//       }));

//       // Clear dependent fields when switching a First-Level Subfield
//       if (!field.conditionQuestion) {
//         // console.log(`Resetting dependent fields for: ${label}`); // Debugging log
//         const dependentFields = formStructure.fields.filter(
//           (f) => f.conditionQuestion === label
//         );

//         dependentFields.forEach((dependentField) => {
//           setFormValues((prevValues) => ({
//             ...prevValues,
//             [dependentField.label]: "", // Reset the value of the dependent field
//           }));

//           // Clear deeper dependent fields (Second-Level, etc.)
//           const deeperDependentFields = formStructure.fields.filter(
//             (f) => f.conditionQuestion === dependentField.label
//           );
//           deeperDependentFields.forEach((deepField) => {
//             setFormValues((prevValues) => ({
//               ...prevValues,
//               [deepField.label]: "", // Reset deeper subfields
//             }));
//           });
//         });
//       }
//     }

//     // Check if the email is already submitted
//     if (label === "Email") {
//       checkDuplicateEmail(value);
//     }
//   };

//   const checkDuplicateEmail = async (email) => {
//     try {
//       const response = await fetch(
//         `https://incubator.drishticps.org/api/forms/check-email`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ formId, pipelineId, email }), // Pass formId, pipelineId, and email to check
//         }
//       );
//       const data = await response.json();
//       // console.log("Duplicate email check response:", data); // Debug duplicate email check
//       if (data.isDuplicate) {
//         setDuplicateEmailError(true);
//       } else {
//         setDuplicateEmailError(false); // No error for drafts
//       }
//     } catch (error) {
//       console.error("Error checking email:", error);
//     }
//   };
//   /** END CHANGE FOR fetch already submitted by this "Email" --- **/

//   const handleCheckboxChange = (label, option) => {
//     const field = formStructure.fields.find((f) => f.label === label);
//     const selectedOptions = formValues[label];
//     let newSelectedOptions = [];

//     if (selectedOptions.includes(option)) {
//       newSelectedOptions = selectedOptions.filter((item) => item !== option);
//     } else if (selectedOptions.length < field.maxSelect) {
//       newSelectedOptions = [...selectedOptions, option];
//     }

//     setFormValues((prevValues) => ({
//       ...prevValues,
//       [label]: newSelectedOptions,
//     }));

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [label]: field.required && newSelectedOptions.length === 0,
//     }));
//   };

//   const handleFileChange = (label, file) => {
//     if (file) {
//       if (
//         label === "Resume (PDF Format Only)" &&
//         file.type !== "application/pdf"
//       ) {
//         alert("Please upload a PDF file.");
//       } else if (
//         label === "Upload Startup Logo (In PNG/JPG Format)" &&
//         !["image/png", "image/jpeg"].includes(file.type)
//       ) {
//         alert("Please upload a PNG or JPG file.");
//       } else {
//         const currentDateTime = new Date().toLocaleString(); // Get the current date and time as a string

//         setFiles((prevFiles) => {
//           // Filter out any existing file with the same label
//           const filteredFiles = prevFiles.filter((f) => f.label !== label);
//           // Add the new file with the current date and time
//           return [
//             ...filteredFiles,
//             { label, file, uploadedAt: currentDateTime },
//           ];
//         });
//         setFormValues((prevValues) => ({
//           ...prevValues,
//           [label]: `${file.name} (uploaded at ${currentDateTime})`, // Include the upload time in the form values
//         }));
//         setErrors((prevErrors) => ({
//           ...prevErrors,
//           [label]: false,
//         }));
//       }
//     }
//   };

//   const submitForm = async (formId, responses) => {
//     console.log("Submitting form with responses:", responses); // Debug form responses

//     const formData = new FormData();
//     formData.append("formId", formId);
//     formData.append("responses", JSON.stringify(responses));

//     // Check for pipelineId before adding it
//     if (pipelineId) {
//       formData.append("pipelineId", pipelineId); // Add pipelineId to the request
//     } else {
//       console.error("pipelineId is undefined");
//     }
//     /*** START CHANGE FOR AUTO-ADDING ROUND NUMBER ***/
//     // Automatically include the round number in the submission
//     // const roundNumber = location.state?.roundNumber || 1; // Default to Round 1 if not provided
//     const roundNumber = location.state?.roundNumber || 1; // Default to Round 1 if not provided
//     formData.append("roundNumber", roundNumber);
//     console.log("Auto-including roundNumber:", roundNumber);
//     /*** END CHANGE FOR AUTO-ADDING ROUND NUMBER ***/

//     files.forEach((fileWrapper) => {
//       console.log("Adding file to submission:", fileWrapper.file.name); // Debug file handling

//       formData.append("files", fileWrapper.file); //  append files
//       formData.append(`label_${fileWrapper.file.name}`, fileWrapper.label); // Append label with file
//     });

//     try {
//       const response = await fetch(
//         "https://incubator.drishticps.org/api/forms/public-form-submission",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Error submitting form:", errorData.error);
//         if (errorData.error === "Form is already submitted for this email.") {
//           setIsDuplicateSubmission(true);
//         } else {
//           setIsError(true);
//         }
//         throw new Error(errorData.error);
//       } else {
//         console.log("Form submitted successfully");
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       setIsError(true); // Correct error handling
//     }
//   };

//   // /*** START CHANGE add "Save as Draft" button ***/

//   // /*** END CHANGE FOR add "Save as Draft" button --- ***/
//   /*** START CHANGE FOR save files in mongoDb  after press "Save as Draft" button ***/
//   const handleDraftSave = async () => {
//     setIsDraftLoading(true); // Start loading for draft save
//     setIsSubmitLoading(false); // Ensure submit is not loading
//     // console.log("Submit loading state after draft click:", isSubmitLoading, "Draft loading state after draft click:", isDraftLoading);

//     const newErrors = {};
//     let hasError = false;
//     let filteredValues = {};

//     // Make sure 'Email' and 'Name' are mandatory
//     if (!formValues["Email"]) {
//       newErrors["Email"] = true;
//       hasError = true;
//     }

//     if (!formValues["Name"]) {
//       newErrors["Name"] = true;
//       hasError = true;
//     }

//     if (hasError) {
//       setErrors(newErrors);
//       setIsDraftLoading(false);

//       // Show error message for missing 'Email' and 'Name' using React Toastify
//       toast.error("'Email' and 'Name' fields are mandatory", {
//         position: "bottom-right",
//         autoClose: 3000, // Automatically close after 3 seconds
//       });
//       return; // Stop execution if 'Email' and 'Name' are missing
//     }

//     /*** START CHANGE FOR validating only visible fields while saving as draft --- ***/
//     // Filter visible fields based on conditional display logic
//     const visibleFields = formStructure.fields.filter((field) => {
//       return (
//         !field.conditionQuestion || // Always include fields without conditionQuestion
//         (formValues[field.conditionQuestion] &&
//           field.conditionValue.includes(formValues[field.conditionQuestion]))
//       );
//     });

//     /*** START CHANGE FOR add 'This field is required' validation for min/max character limit when pressing 'Save as Draft' button--- ***/
//     for (const field of visibleFields) {
//       if (
//         formValues[field.label] &&
//         field.minLength &&
//         formValues[field.label].length < field.minLength
//       ) {
//         newErrors[field.label] = true;
//         hasError = true;
//       } else if (formValues[field.label]) {
//         // Save fields that have been filled and meet the conditions
//         filteredValues[field.label] = formValues[field.label];
//       }
//     }

//     if (hasError) {
//       setErrors(newErrors);
//       setIsDraftLoading(false);
//       return;
//     }

//     const formData = new FormData();
//     formData.append("formId", formId);
//     formData.append("formValues", JSON.stringify(formValues));

//     if (pipelineId) {
//       formData.append("pipelineId", pipelineId);
//     }

//     const roundNumber = location.state?.roundNumber || 1; // Default to Round 1
//     formData.append("roundNumber", roundNumber); // Append roundNumber
//     console.log("Saving draft with roundNumber:", roundNumber);

//     // // Attach files to the formData for saving
//     // files.forEach((fileWrapper) => {
//     //   formData.append("files", fileWrapper.file);
//     // });

//     // Attach files to the formData for saving, including their label names
//     files.forEach((fileWrapper) => {
//       console.log(
//         "Attaching file:",
//         fileWrapper.file.name,
//         "with label:",
//         fileWrapper.label
//       ); // Debug label and file
//       formData.append("files", fileWrapper.file); // Append the file
//       formData.append(`label_${fileWrapper.file.name}`, fileWrapper.label); // Append label with file
//     });

//     try {
//       const response = await fetch(
//         "https://incubator.drishticps.org/api/forms/save-draft",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );
//       if (!response.ok) {
//         throw new Error("Failed to save draft");
//       }
//       // Add this log to ensure it's reaching here
//       // console.log("Draft saved, showing toast...");
//       /*** START CHANGE FOR toestify message ***/
//       // Show toast notification when draft is saved successfully
//       // toast.success("Draft saved successfully!", {
//       toast.success(
//         "Draft saved successfully! You can login at https://incubator.drishticps.org/user-signin to continue your application.",
//         {
//           position: "bottom-right", // Use string directly instead of the constant
//           autoClose: 3000, // Automatically close after 3 seconds
//         }
//       );
//       /*** END CHANGE FOR toestify message --- ***/
//     } catch (error) {
//       console.error("Error saving draft:", error);
//     } finally {
//       setIsDraftLoading(false); // Re-enable button after draft save is done
//       // console.log("Draft loading state after save:", isDraftLoading);
//     }
//   };
//   /*** END CHANGE FOR save files in mongoDb  after press "Save as Draft" button ***/

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Form Values before validation:", formValues);

//     setIsSubmitLoading(true); // Start loading for submit
//     setIsDraftLoading(false); // Ensure draft is not loading

//     const newErrors = {};
//     let hasError = false;

//     /*** START CHANGE FOR validating only visible fields --- ***/
//     // Filter visible fields based on conditional display logic
//     const visibleFields = formStructure.fields.filter((field) => {
//       return (
//         !field.conditionQuestion || // Always include fields without conditionQuestion
//         (formValues[field.conditionQuestion] &&
//           field.conditionValue.includes(formValues[field.conditionQuestion]))
//       );
//     });

//     // Apply validation only to visible fields
//     for (const field of visibleFields) {
//       // For required fields, always validate
//       if (field.required) {
//         if (
//           !formValues[field.label] || // Check if the value is empty
//           (field.type === "multiselect" &&
//             formValues[field.label].length === 0) || // Check for empty multiselect
//           (field.minLength && formValues[field.label].length < field.minLength) // Validate min length
//         ) {
//           newErrors[field.label] = true;
//           console.log(`Validation error for field: ${field.label}`);
//           hasError = true;
//         }
//       }

//       // For optional fields, validate length if non-empty
//       if (
//         formValues[field.label]?.length > 0 && // Only validate if a value exists
//         field.minLength &&
//         formValues[field.label].length < field.minLength
//       ) {
//         newErrors[field.label] = true;
//         hasError = true;
//       }

//       if (
//         formValues[field.label]?.length > 0 &&
//         field.maxLength &&
//         formValues[field.label].length > field.maxLength
//       ) {
//         newErrors[field.label] = true;
//         hasError = true;
//       }
//     }
//     /*** END CHANGE FOR validating only visible fields --- ***/

//     if (hasError) {
//       console.log("Validation errors found.");
//       setErrors(newErrors);
//       setIsSubmitLoading(false); // Stop loading if validation fails
//       return;
//     }

//     // Submit the form
//     console.log("Form is ready for submission. Form values:", formValues);

//     try {
//       await submitForm(formId, formValues);
//       setIsSubmitted(true);
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     } finally {
//       setIsSubmitLoading(false); // Re-enable button after submission is done
//     }
//   };

//   const handleClearForm = () => {
//     setFormValues(
//       formStructure.fields.reduce((acc, field) => {
//         acc[field.label] = field.type === "multiselect" ? [] : "";
//         return acc;
//       }, {})
//     );
//     setFiles([]);
//     setErrors({});
//   };

//   if (!formStructure) {
//     // console.log("Form structure is loading..."); // Debug loading state

//     return <div>Loading form...</div>;
//   }

//   if (isDuplicateSubmission) {
//     console.log("Duplicate submission detected."); // Debug duplicate submission

//     return (
//       <div className="response-page-publicformpreview">
//         <div className="response-message-container-publicformpreview">
//           <h1 className="response-title-publicformpreview">
//             You've already responded
//           </h1>
//           <p className="response-text-publicformpreview">
//             Thanks for submitting your contact info!
//           </p>
//           <p className="response-text-publicformpreview">
//             You can only fill in this form once.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     console.error("An error occurred in the form!"); // Debug form error

//     return (
//       <div className="response-page-publicformpreview">
//         <div className="response-message-container-publicformpreview">
//           <h1 className="response-title-publicformpreview">
//             You've already responded
//           </h1>
//           <p className="response-text-publicformpreview">
//             Thanks for submitting your information!
//           </p>
//           <p className="response-text-publicformpreview">
//             You can only fill in this form once.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="custom-background-publicformpreview">
//       {isSubmitted ? (
//         <div className="thank-you-message-fullscreen">
//           <div className="thank-you-message-publicformpreview">
//             <div className="icon-container-publicformpreview">
//               <svg
//                 width="64"
//                 height="64"
//                 viewBox="0 0 64 64"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <g fill="none" fillRule="evenodd">
//                   <g transform="translate(1 1)" fillRule="nonzero">
//                     <path
//                       d="M48 6H16C11.589 6 8 9.589 8 14v32c0 4.411 3.589 8 8 8h32c4.411 0 8-3.589 8-8V14c0-4.411-3.589-8-8-8z"
//                       fill="#EFF6FF"
//                     />
//                     <path
//                       d="M56 0H8C3.589 0 0 3.589 0 8v48c0 4.411 3.589 8 8 8h48c4.411 0 8-3.589 8-8V8c0-4.411-3.589-8-8-8z"
//                       fill="#EFF6FF"
//                     />
//                     <path
//                       d="M44.293 20.293a1 1 0 00-1.414 0L24 39.172l-6.879-6.879a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l20-20a1 1 0 000-1.414z"
//                       fill="#1E88E5"
//                     />
//                   </g>
//                 </g>
//               </svg>
//             </div>
//             <h2>Thank you for your submission!</h2>
//           </div>
//         </div>
//       ) : (
//         <div className="custom-public-form-preview-publicformpreview">
//           <h2 className="custom-form-title-publicformpreview"> </h2>
//           <form
//             // onSubmit={handleSubmit}
//             className="custom-form-publicformpreview"
//           >
//             <div className="custom-form-row-publicformpreview">
//               {formStructure.fields.map((field, index) => (
//                 <div
//                   key={index}
//                   className="custom-form-group-publicformpreview"
//                 >
//                   {/** START CHANGE FOR  "Show If"   --- **/}
//                   {(!field.conditionQuestion ||
//                     (formValues[field.conditionQuestion] &&
//                       field.conditionValue.includes(
//                         formValues[field.conditionQuestion]
//                       ))) && (
//                     <>
//                       <div className="number-container-publicformpreview">
//                         {/* <span className="number-circle-publicformpreview">
//                           {field.conditionQuestion
//                             ? generateDecimalNumber(
//                                 topLevelFieldCount,
//                                 conditionallyDisplayedFieldCount++
//                               )
//                             : ++topLevelFieldCount}
//                         </span> */}

//                         {/* <span className="number-circle-publicformpreview">
//   {generateHierarchicalNumber(field, index)}
// </span> */}

//                         <span className="number-circle-publicformpreview">
//                           {generateHierarchicalNumber(
//                             field,
//                             formStructure.fields.find(
//                               (f) => f.label === field.conditionQuestion
//                             )
//                           )}
//                         </span>
//                       </div>
//                       <label
//                         className={`custom-form-label-publicformpreview ${
//                           field.conditionQuestion
//                             ? "conditionally-displayed-field"
//                             : ""
//                         }`}
//                       >
//                         {field.label}
//                         {/*** START CHANGE FOR add "Required" option checkbox in all sidebar field--- ***/}
//                         {field.required && (
//                           <span className="required-publicformpreview">*</span>
//                         )}
//                         {/*** END CHANGE FOR add "Required" option checkbox in all sidebar field--- ***/}
//                       </label>
//                       <div className="custom-form-input-container-publicformpreview">
//                         {/* Container to hold the input directly below the label */}
//                         {field.type === "select" ? (
//                           <select
//                             className="custom-form-input-publicformpreview"
//                             value={formValues[field.label]}
//                             onChange={(e) =>
//                               handleChange(field.label, e.target.value)
//                             }
//                             required={field.required}
//                           >
//                             <option value="">Select...</option>
//                             {field.options.map((option, optionIndex) => (
//                               <option key={optionIndex} value={option}>
//                                 {option}
//                               </option>
//                             ))}
//                           </select>
//                         ) : field.type === "multiselect" ? (
//                           field.options.map((option, optionIndex) => (
//                             <div
//                               key={optionIndex}
//                               className="checkbox-group-publicformpreview"
//                             >
//                               <input
//                                 // required
//                                 type="checkbox"
//                                 id={`${field.label}-${optionIndex}`}
//                                 value={option}
//                                 checked={formValues[field.label].includes(
//                                   option
//                                 )}
//                                 onChange={() =>
//                                   handleCheckboxChange(field.label, option)
//                                 }
//                                 disabled={
//                                   !formValues[field.label].includes(option) &&
//                                   formValues[field.label].length >=
//                                     field.maxSelect
//                                 }
//                               />
//                               <label
//                                 htmlFor={`${field.label}-${optionIndex}`}
//                                 className="option-label-publicformpreview"
//                                 style={{ fontSize: "12px" }}
//                               >
//                                 {option}
//                               </label>
//                             </div>
//                           ))
//                         ) : field.type === "radio" ? (
//                           field.options.map((option, optionIndex) => (
//                             <div
//                               key={optionIndex}
//                               className="radio-group-publicformpreview"
//                             >
//                               <input
//                                 type="radio"
//                                 id={`${field.label}-${optionIndex}`}
//                                 name={field.label}
//                                 value={option}
//                                 checked={formValues[field.label] === option}
//                                 onChange={(e) =>
//                                   handleChange(field.label, e.target.value)
//                                 }
//                                 required={field.required}
//                               />

//                               <label
//                                 htmlFor={`${field.label}-${optionIndex}`}
//                                 className="option-label-publicformpreview-radio"
//                                 style={{ fontSize: "14px" }}
//                               >
//                                 {option}
//                               </label>
//                             </div>
//                           ))
//                         ) : field.type === "note" ? ( // ** START CHANGE FOR "Note ReactQuill input" --- **
//                           <div className="custom-note-container-publicformpreview">
//                             {" "}
//                             {/* Container for ReactQuill to add spacing */}
//                             <ReactQuill
//                               value={formValues[field.label]}
//                               onChange={(value) =>
//                                 handleChange(field.label, value)
//                               }
//                             />
//                           </div> // ** END CHANGE FOR "Note ReactQuill input" --- **
//                         ) : field.type === "file" ? (
//                           <input
//                             className="custom-form-input-publicformpreview"
//                             type="file"
//                             onChange={(e) =>
//                               handleFileChange(field.label, e.target.files[0])
//                             }
//                             required={field.required}
//                           />
//                         ) : field.type === "phone" ? (
//                           // Change applied to set the default country to India (+91)
//                           <PhoneInput
//                             country={"in"} // <-- Default country changed to 'in' (India)
//                             value={formValues[field.label]}
//                             onChange={(value) =>
//                               handleChange(field.label, value)
//                             }
//                             inputClass="custom-form-input-publicformpreview" // Match the class name
//                             required={field.required}
//                           />
//                         ) : (
//                           <input
//                             className={`custom-form-input-publicformpreview ${
//                               errors[field.label]
//                                 ? "error-publicformpreview"
//                                 : ""
//                             }`}
//                             type={field.type}
//                             placeholder={field.placeholder}
//                             value={formValues[field.label]}
//                             onChange={(e) =>
//                               handleChange(field.label, e.target.value)
//                             }
//                             required={field.required}
//                             maxLength={field.maxLength || undefined}
//                           />
//                         )}
//                       </div>

//                       {/* START CHANGE FOR fetch already submitted by this "Email" --- */}
//                       {/* Display duplicate email error message */}
//                       {field.label === "Email" && duplicateEmailError && (
//                         <div className="error-message-publicformpreview">
//                           <FaInfoCircle className="error-icon-publicformpreview" />{" "}
//                           You have already submitted the form using this email
//                           ID.
//                         </div>
//                       )}
//                       {/* END CHANGE FOR fetch already submitted by this "Email" --- */}

//                       {errors[field.label] && (
//                         <div className="error-message-publicformpreview">
//                           <FaInfoCircle className="error-icon-publicformpreview" />{" "}
//                           This field is required
//                         </div>
//                       )}
//                       {(field.maxLength || field.minLength) &&
//                         field.label !== "Contact Number" &&
//                         field.label !== "Startup team size" && (
//                           <div className="character-limit-publicformpreview">
//                             {field.maxLength &&
//                               `${
//                                 field.maxLength -
//                                 (formValues[field.label]?.length || 0)
//                               } characters remaining`}
//                             {field.minLength &&
//                               (formValues[field.label]?.length || 0) <
//                                 field.minLength &&
//                               ` (Min: ${field.minLength} characters)`}
//                           </div>
//                         )}
//                     </>
//                   )}
//                 </div>
//               ))}
//             </div>
//             {/* <div className="form-buttons-publicformpreview"> */}
//             <div
//               className="form-buttons-publicformpreview"
//               style={{
//                 display: "flex",
//                 gap: "10px",
//                 justifyContent: "center",
//                 marginTop: "20px",
//                 flexWrap: "wrap", // Allow buttons to wrap
//               }}
//             >
//               {/* Save as Draft button */}
//               {/* <button
//                 type="button"
//                 className="custom-form-save-draft-button"
//                 onClick={handleDraftSave}
//                 disabled={isSubmitLoading || isDraftLoading} // Both buttons disabled when one is clicked
//                 style={{
//                   padding: "12px",
//                   border: "none",
//                   borderRadius: "5px",
//                   fontSize: "16px",
//                   fontFamily: "Inter, sans-serif",
//                   cursor: "pointer",
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   width: "135px",
//                   textAlign: "center",
//                   transition: "background-color 0.3s ease",
//                 }}
//               >
//                 {isDraftLoading ? "Saving..." : "Save as Draft"}{" "}
//              </button> */}

//               {/* Submit button */}
//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 className="custom-form-submit-button-publicformpreviewfinalsave"
//                 disabled={isSubmitLoading || isDraftLoading} // Both buttons disabled when one is clicked
//                 style={{
//                   padding: "12px",
//                   border: "none",
//                   borderRadius: "5px",
//                   fontSize: "16px",
//                   fontFamily: "Inter, sans-serif",
//                   cursor: "pointer",
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   width: "135px",
//                   textAlign: "center",
//                   transition: "background-color 0.3s ease",
//                 }}
//               >
//                 {isSubmitLoading ? "Submitting..." : "Submit"}{" "}
//                 {/* Conditionally show text */}
//               </button>

//               <button
//                 type="button"
//                 className="custom-form-clear-button-publicformpreview"
//                 onClick={() => handleClearForm()}
//                 style={{
//                   padding: "12px",
//                   border: "1px solid #007bff",
//                   borderRadius: "5px",
//                   fontSize: "16px",
//                   fontFamily: "Inter, sans-serif",
//                   cursor: "pointer",
//                   backgroundColor: "#ffffff",
//                   color: "#007bff",
//                   width: "130px",
//                   textAlign: "center",
//                   transition: "background-color 0.3s ease",
//                 }}
//               >
//                 Clear Form
//               </button>
//             </div>
//             {/* <div className="copyright-publicformpreview">
//               © Copyright 2025 | drishticps.iiti.ac.in | All Rights Reserved
//             </div> */}
//             <div className="copyright-publicformpreview">
//               © Copyright 2025 |{" "}
//               <a
//                 href="https://drishticps.iiti.ac.in/"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 style={{ color: "#007bff", textDecoration: "none" }}
//               >
//                 drishticps.iiti.ac.in
//               </a>{" "}
//               | All Rights Reserved
//             </div>
//           </form>
//           <ToastContainer />
//         </div>
//       )}
//     </div>
//   );
// };

// export default PublicFormPreview;
