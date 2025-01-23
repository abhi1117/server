import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaChevronDown, FaChevronUp, FaRegTrashAlt, FaTimesCircle, FaGripVertical } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import { ToastContainer, toast } from 'react-toastify';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-toastify/dist/ReactToastify.css';
import './EvaluatorForm.css';

const ItemTypes = {
  FIELD: 'field',
  FORM_ELEMENT: 'form-element',
};

const DraggableItem = ({ id, name, type }) => {
  const [, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { id, name, type },
  });
  return (
    <div ref={drag} className="draggable-item-evaluatorform">
      {name}
    </div>
  );
};

const DropArea = ({ onDrop, children }) => {
  const [, drop] = useDrop({
    accept: ItemTypes.FIELD,
    drop: (item) => onDrop(item),
  });
  return (
    <div ref={drop} className="drop-area-evaluatorform">
      {children}
    </div>
  );
};

const DraggableFormElement = ({
  index,
  element,
  moveElement,
  toggleExpand,
  handleDelete,
  expanded,
  handleChange,
  handleRatingChange
}) => {
  const [, ref, preview] = useDrag({
    type: ItemTypes.FORM_ELEMENT,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.FORM_ELEMENT,
    hover: (item) => {
      if (item.index !== index) {
        moveElement(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="dropped-element-evaluatorform">
      <div className="element-header-evaluatorform">
        <span className="drag-handle-evaluatorform" ref={preview}><FaGripVertical /></span>
        <span className="element-number-evaluatorform">{index + 1}</span>
        <span className="element-label-evaluatorform">{element.staticName}</span>
        <div className="element-actions-evaluatorform">
          {expanded ? (
            <FaChevronUp className="icon-evaluatorform" onClick={() => toggleExpand(index)} />
          ) : (
            <FaChevronDown className="icon-evaluatorform" onClick={() => toggleExpand(index)} /> 
          )}
          <FaRegTrashAlt className="icon-evaluatorform delete-evaluatorform" onClick={() => handleDelete(index)} />
        </div>
      </div>
      {expanded && (
        <div className="element-details-evaluatorform">
          <div className="form-group-evaluatorform">
            <label className="label-text-evaluatorform">Label <span className="required-evaluatorform">*</span> (Should be unique)</label>
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleChange(index, 'label', e.target.value)}
              placeholder="Enter label here"
            />
          </div>
          {element.type === 'text' && element.staticName === 'Name of the startup' && (
            <>
              <div className="form-group-evaluatorform">
                <label className="label-text-evaluatorform">Placeholder</label>
                <input
                  type="text"
                  value={element.placeholder}
                  onChange={(e) => handleChange(index, 'placeholder', e.target.value)}
                  placeholder="Enter placeholder here"
                />
              </div>
              <div className="form-group-evaluatorform">
                <label className="label-text-evaluatorform">Maximum Character(s)</label>
                <input
                  type="number"
                  value={element.maxCharacters}
                  onChange={(e) => handleChange(index, 'maxCharacters', e.target.value)}
                  placeholder="Enter maximum characters"
                />
              </div>
              <div className="form-group-evaluatorform">
                <label className="label-text-evaluatorform">Minimum Character(s)</label>
                <input
                  type="number"
                  value={element.minCharacters}
                  onChange={(e) => handleChange(index, 'minCharacters', e.target.value)}
                  placeholder="Enter minimum characters"
                />
              </div>
            </>
          )}
          {element.type === 'question' && (
            <div className="form-group-evaluatorform">
              <label>Rating</label>
              <RatingComponent
                rating={element.rating}
                onRatingChange={(ratingIndex) => handleRatingChange(index, ratingIndex)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RatingComponent = ({ rating, onRatingChange }) => (
  <div className="rating-scale-evaluatorform">
    {rating.map((rate, index) => (
      <span
        key={index}
        className={`rating-item-evaluatorform rating-${rate.value}-evaluatorform`}
        onClick={() => onRatingChange(index)}
        style={{ backgroundColor: rate.selected ? '#000' : '' }}
      >
        {rate.value}
      </span>
    ))}
  </div>
);

const EvaluatorForm = () => {
  const location = useLocation();
  const { formElements: initialFormElements = [], formTitle, formId } = location.state || {};
  const [formElements, setFormElements] = useState(Array.isArray(initialFormElements) ? initialFormElements : []);
  const [expandedElements, setExpandedElements] = useState({});
  const navigate = useNavigate();

  const handleDrop = (item) => {
    const newElement = {
      ...item,
      label: '',
      type: item.type,
      placeholder: '',
      staticName: item.name,
      rating: (item.type === 'rating' || item.type === 'question') ? Array.from({ length: 10 }, (_, i) => ({ value: 10 - i, selected: false })) : []
    };
    if (item.type === 'text' && item.name === 'Name of the startup') {
      newElement.maxCharacters = 50;
      newElement.minCharacters = 0;
    }
    setFormElements((prev) => [...prev, newElement]);
  };

  const toggleExpand = (index) => {
    setExpandedElements((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleDelete = (index) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui-evaluatorform">
            <h2 style={{ fontSize: '24px', textAlign: 'center' }}>Confirm to Delete</h2>
            <p style={{ textAlign: 'center' }}>All collected data will be lost for this field. Are you sure you want to delete this question?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                className="delete-button-yes-evaluatorform"
                // style={{
                //   backgroundColor: '#dc3545',
                //   color: '#fff',
                //   border: 'none',
                //   padding: '10px 20px',
                //   borderRadius: '4px',
                //   cursor: 'pointer',
                // }}
                onClick={() => {
                  setFormElements((prev) => prev.filter((_, i) => i !== index));
                  setExpandedElements((prev) => {
                    const newExpanded = { ...prev };
                    delete newExpanded[index];
                    return newExpanded;
                  });
                  onClose();
                }}
              >
                Yes, Delete it!
              </button>
              <button
              // className="cancel-button-no-evaluatorform1"
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={onClose}
              >
                No
              </button>
            </div>
          </div>
        );
      },
      overlayClassName: "custom-overlay-evaluatorform",
    });
  };

  const handleChange = (index, field, value) => {
    const updatedElements = [...formElements];
    updatedElements[index][field] = value;
    setFormElements(updatedElements);
  };

  const handleRatingChange = (elementIndex, ratingIndex) => {
    const updatedElements = [...formElements];
    const updatedRating = updatedElements[elementIndex].rating.map((rate, index) => ({
      ...rate,
      selected: index === ratingIndex
    }));
    updatedElements[elementIndex].rating = updatedRating;
    setFormElements(updatedElements);
  };

  const handlePreview = () => {
    const emptyLabelIndex = formElements.findIndex(element => !element.label.trim());
    
    if (emptyLabelIndex !== -1) {
      const emptyLabelElementName = formElements[emptyLabelIndex].staticName;
      toast.error(`Label Not Found for ${emptyLabelElementName}`);
    } else {
      localStorage.setItem('formElements', JSON.stringify(formElements));
      navigate('/evaluator-form-preview', { state: { formElements, formTitle, formId } });
    }
  };

  const moveElement = (fromIndex, toIndex) => {
    const updatedElements = [...formElements];
    const [movedElement] = updatedElements.splice(fromIndex, 1);
    updatedElements.splice(toIndex, 0, movedElement);
    setFormElements(updatedElements);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="form-builder-container-evaluatorform">
        <ToastContainer position="bottom-right" />
        <div className="form-builder-sidebar-evaluatorform">
          <h3>Question Type</h3>
          <DraggableItem id="name-of-the-startup" name="Name of the startup" type="text" />
          <DraggableItem id="question" name="Question" type="question" />
        </div>
        <div className="form-builder-content-evaluatorform">
          <div className="form-builder-header-evaluatorform">
            <h2>{formTitle || `Evaluation Form for ${formId ? formId : 'Startup'}`}</h2>
            <div className="form-builder-buttons-evaluatorform">
              <button className="form-builder-preview-button-evaluatorform" onClick={handlePreview}>Preview</button>
              <button className="form-builder-close-button-evaluatorform" onClick={() => navigate('/evaluator-dashboard')}>Close</button>
            </div>
          </div>
          <DropArea onDrop={handleDrop}>
            {formElements.map((element, index) => (
              <DraggableFormElement
                key={index}
                index={index}
                element={element}
                moveElement={moveElement}
                toggleExpand={toggleExpand}
                handleDelete={handleDelete}
                expanded={expandedElements[index]}
                handleChange={handleChange}
                handleRatingChange={handleRatingChange}
              />
            ))}
          </DropArea>
        </div>
      </div>
    </DndProvider>
  );
};

export default EvaluatorForm;


 