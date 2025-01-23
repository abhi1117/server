import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SharedFormPreview.css";
import { FaInfoCircle } from "react-icons/fa";

const SharedFormPreview = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        console.log(`Fetching form data for formId: ${formId}`);
        const response = await axios.get(
          `https://incubator.drishticps.org/api/evaluationForms/form-structure/${formId}`
        );
        console.log("Form data fetched successfully:", response.data);
        setForm(response.data);
        setFormData(
          response.data.fields.reduce((acc, field) => {
            acc[field.label] = "";
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    fetchForm();
  }, [formId]);

  const handleChange = (label, value) => {
    const field = form.fields.find((f) => f.label === label);
    // Highlighted: Removed character limit check for 'Question' field
    if (
      field &&
      field.type !== "question" &&
      value.length <= field.maxCharacters
    ) {
      setFormData((prevValues) => ({
        ...prevValues,
        [label]: value,
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        [label]: value.length < field.minCharacters,
      }));
    }
  };

  const handleRatingChange = (label, value) => {
    setFormData((prevValues) => ({
      ...prevValues,
      [label]: Number(value),
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [label]: false,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    let hasError = false;

    for (const field of form.fields) {
      if (
        !formData[field.label] ||
        formData[field.label].length < field.minCharacters
      ) {
        newErrors[field.label] = true;
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      toast.error(
        "Please fill all required fields and meet minimum character requirements"
      );
      return;
    }

    const submissionData = {
      title: form.title,
      fields: form.fields.map((field) => {
        const value = formData[field.label] || "";
        if (field.type === "question") {
          return { ...field, rating: Number(value) };
        }
        return { ...field, value };
      }),
    };

    console.log("Submitting data:", submissionData);

    try {
      const response = await axios.post(
        "https://incubator.drishticps.org/api/evaluationForms/shared-evaluator-form",
        submissionData
      );
      console.log("Response from server:", response.data);
      toast.success("Form submitted successfully");
    } catch (error) {
      console.error("Error submitting form:", error.response.data);
      toast.error("Failed to submit form");
    }
  };

  if (!form) {
    return <div>Loading...</div>;
  }

  return (
    <div className="custom-backgroundformsharedformpreview">
      <div className="custom-shared-form-preview-containerformsharedformpreview">
        <ToastContainer position="bottom-right" />
        <h2 className="custom-form-titleformsharedformpreview">{form.title}</h2>
        <form
          onSubmit={handleSubmit}
          className="custom-formformsharedformpreview"
        >
          <div className="custom-form-rowformsharedformpreview">
            {form.fields.map((field, index) => (
              <div
                key={index}
                className="custom-form-groupformsharedformpreview"
              >
                <label className="custom-form-labelformsharedformpreview">
                  {field.label}
                  {field.required && (
                    <span className="custom-requiredformsharedformpreview">
                      *
                    </span>
                  )}
                </label>
                {field.type === "text" ? (
                  <>
                    <input
                      className={`custom-form-inputformsharedformpreview ${
                        errors[field.label] ? "errorformsharedformpreview" : ""
                      }`}
                      type="text"
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.label] || ""}
                      onChange={(e) =>
                        handleChange(field.label, e.target.value)
                      }
                    />
                    {(field.maxCharacters || field.minCharacters) &&
                      field.type !== "question" && ( // Highlighted: Exclude 'Question' field from displaying character limits
                        <div className="character-limit-sharedformpreview">
                          {field.maxCharacters &&
                            `${
                              field.maxCharacters -
                              (formData[field.label]?.length || 0)
                            } characters remaining`}
                          {field.minCharacters &&
                            (formData[field.label]?.length || 0) <
                              field.minCharacters &&
                            ` (Min: ${field.minCharacters} characters)`}
                        </div>
                      )}
                  </>
                ) : field.type === "question" ? (
                  <div className="custom-rating-scaleformsharedformpreview">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((rate) => (
                      <label
                        key={rate}
                        className="custom-rating-itemformsharedformpreview"
                      >
                        <input
                          type="radio"
                          name={`rating-${index}`}
                          value={rate}
                          checked={formData[field.label] === rate}
                          onChange={() => handleRatingChange(field.label, rate)}
                        />
                        <span className="custom-rating-labelformsharedformpreview">
                          {rate}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
                {errors[field.label] && (
                  <div className="error-messageformsharedformpreview">
                    <FaInfoCircle className="error-iconformsharedformpreview" />{" "}
                    This field is required
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="form-buttonssharedformpreview">
            <button
              type="submit"
              className="custom-form-submit-buttonformsharedformpreview"
            >
              Save
            </button>
            <button
              type="button"
              className="custom-form-cancel-buttonformsharedformpreview"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharedFormPreview;
