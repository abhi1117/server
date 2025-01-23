import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EvaluatorFormPreview.css";
import { useSelector, useDispatch } from "react-redux";
import {
  userId,
  superAdminSelector,
} from "../../redux/reducers/superAdminReducer";

const RatingComponent = ({ rating, onRatingChange }) => (
  <div className="rating-scaleevaluatorformpreview">
    {rating.map((rate, index) => (
      <span
        key={index}
        className={`rating-itemevaluatorformpreview rating-${rate.value}evaluatorformpreview`}
        onClick={() => onRatingChange(index)}
        style={{ backgroundColor: rate.selected ? "#000" : "" }}
      >
        {rate.value}
      </span>
    ))}
  </div>
);

const EvaluatorFormPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formElements = [], formTitle, formId } = location.state || {};
  const [formValues, setFormValues] = useState(() => {
    const values = {};
    formElements.forEach((element) => {
      values[element.label] =
        element.type === "question" ? element.rating : element.value || "";
    });
    return values;
  });

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

  const handleRatingChange = (label, ratingIndex) => {
    const updatedRatings = formValues[label].map((rate, index) => ({
      ...rate,
      selected: index === ratingIndex,
    }));
    setFormValues({
      ...formValues,
      [label]: updatedRatings,
    });
  };

  const handleInputChange = (label, value) => {
    const element = formElements.find((e) => e.label === label);
    if (
      element &&
      element.type !== "question" &&
      value.length <= element.maxCharacters
    ) {
      setFormValues({
        ...formValues,
        [label]: value,
      });
    }
  };

  const handleSave = async () => {
    const formData = {
      id: formId || new Date().getTime().toString(),
      title: formTitle,
      fields: formElements.map((element) => ({
        ...element,
        rating: formValues[element.label],
      })),
      lastModified: new Date().toISOString(),
    };

    try {
      const checkResponse = await fetch(
        `https://incubator.drishticps.org/api/evaluationForms/form-structure/${formId}`,
        { credentials: "include" }
      );
      let method;
      let url;

      if (checkResponse.ok) {
        method = "PUT";
        url = `https://incubator.drishticps.org/api/evaluationForms/form-structure/${formId}`;
      } else if (checkResponse.status === 404) {
        method = "POST";
        url =
          "https://incubator.drishticps.org/api/evaluationForms/form-structure";
      } else {
        throw new Error("Error checking form existence");
      }

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast.success("Form saved successfully");
      setTimeout(() => {
        navigate("/evaluator-dashboard");
      }, 2000);
    } catch (error) {
      toast.error(`Error saving form structure: ${error.message}`);
    }
  };

  // Render only if role is Program Manager
  if (role !== "Program Manager") {
    return null;
  }

  return (
    <div className="form-preview-containerevaluatorformpreview">
      <ToastContainer position="bottom-right" />
      <div className="form-preview-headerevaluatorformpreview">
        <h2>{formTitle}</h2>
        <div className="form-preview-buttonsevaluatorformpreview">
          <button
            className="form-preview-save-buttonevaluatorformpreview"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="form-preview-edit-buttonevaluatorformpreview"
            onClick={() =>
              navigate("/evaluator-form", {
                state: { formElements, formTitle, formId },
              })
            }
          >
            Edit
          </button>
          <button
            className="form-preview-close-buttonevaluatorformpreview"
            onClick={() => navigate("/evaluator-dashboard")}
          >
            Close
          </button>
        </div>
      </div>
      <div className="form-preview-boxevaluatorformpreview">
        <form>
          {formElements.map((element, index) => (
            <div key={index} className="form-groupevaluatorformpreview">
              <div className="label-containerevaluatorformpreview">
                <label className="form-preview-label-numberevaluatorformpreview">
                  {index + 1}
                </label>
                <label>
                  {element.label}
                  {element.required && (
                    <span className="requiredevaluatorformpreview">*</span>
                  )}
                </label>
              </div>
              {element.type === "question" ? (
                <RatingComponent
                  rating={formValues[element.label]}
                  onRatingChange={(ratingIndex) =>
                    handleRatingChange(element.label, ratingIndex)
                  }
                />
              ) : (
                <>
                  <input
                    type="text"
                    placeholder={element.placeholder}
                    value={formValues[element.label] || ""}
                    onChange={(e) =>
                      handleInputChange(element.label, e.target.value)
                    }
                  />
                  {(element.maxCharacters || element.minCharacters) &&
                    element.type !== "question" && (
                      <div className="character-limit-evaluatorformpreview">
                        {element.maxCharacters &&
                          `${
                            element.maxCharacters -
                            (formValues[element.label]?.length || 0)
                          } characters remaining`}
                        {element.minCharacters &&
                          (formValues[element.label]?.length || 0) <
                            element.minCharacters &&
                          ` (Min: ${element.minCharacters} characters)`}
                      </div>
                    )}
                </>
              )}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
};

export default EvaluatorFormPreview;
