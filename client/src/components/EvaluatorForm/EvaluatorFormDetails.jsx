import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EvaluatorFormDetails.css'; 

const EvaluatorFormDetails = () => {
  const location = useLocation();
  const { form } = location.state || {};
  const [formData, setFormData] = useState(form || {});
  const [formValues, setFormValues] = useState(() => {
    const values = {};
    form?.formElements?.forEach(element => {
      values[element.label] = '';
    });
    return values;
  }); 
  const [ratings, setRatings] = useState(() => {
    const initialRatings = {};
    form?.formElements?.forEach(element => {
      initialRatings[element.label] = 10; // Default to 10
    });
    return initialRatings;
  });
  const navigate = useNavigate();

  if (!form) {
    return <p>No form data available.</p>;
  }

  const handleInputChange = (label, value) => {
    setFormValues(prevValues => ({
      ...prevValues,
      [label]: value
    }));
  };

  const handleRatingChange = (label, value) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [label]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = {
      ratings,
      comments: formValues
    };

    const updatedFormData = {
      ...formData,
      responses: response
    };

    try {
      await axios.post('YOUR_BACKEND_API_URL', updatedFormData);
      navigate('/form');
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const handleEdit = () => {
    const formElements = Array.isArray(formData.formElements) ? formData.formElements : [];
    navigate('/evaluator-form', { state: { formElements, formTitle: formData.title } });
  };

  const handleClose = () => {
    navigate('/form');
  };

  const getRatingButtonClass = (index, rating) => {
    const isSelected = index <= rating;
    return `rating-buttonevaluatorformdetails rating-buttonevaluatorformdetails-${index} ${isSelected ? 'selectedevaluatorformdetails' : ''}`;
  };

  return (
    <div className="form-details-containerevaluatorformdetails">
      <div className="header-containerevaluatorformdetails">
        <h2>{formData.title}</h2> {/* Display the title from formData */}
        <div className="form-details-buttonsevaluatorformdetails">
          <button className="edit-buttonevaluatorformdetails" onClick={handleEdit}>Edit</button>
          <button className="close-buttonevaluatorformdetails" onClick={handleClose}>Close</button>
        </div>
      </div>
      <div className="form-content-containerevaluatorformdetails">
        <form className="form-details-formevaluatorformdetails" onSubmit={handleSubmit}>
          {formData.formElements && formData.formElements.map((element, index) => (
            <div key={index} className="form-groupevaluatorformdetails">
              <label>
                <span className="number-boxevaluatorformdetails">{index + 1}</span> {element.name} {element.required && <span className="requiredevaluatorformdetails">*</span>}
              </label>
              <div className="form-groupevaluatorformdetails">
                <label>Rating</label>
                <div className="rating-containerevaluatorformdetails">
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={getRatingButtonClass(num, ratings[element.label])}
                      onClick={() => handleRatingChange(element.label, num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                {element.label}
                {element.required && <span className="requiredevaluatorformdetails">*</span>}
              </label>
              <input
                type="text"
                placeholder={element.placeholder}
                value={formValues[element.label]}
                onChange={(e) => handleInputChange(element.label, e.target.value)}
                required={element.required}
              />
            </div>
          ))}
          <div className="form-buttonsevaluatorformdetails">
            <button type="submit" className="submit-buttonevaluatorformdetails">Submit</button> 
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluatorFormDetails;


 