import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend"; 
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaRegTrashAlt, 
  FaTimesCircle,
  FaGripVertical,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { ToastContainer, toast } from "react-toastify";
import "react-confirm-alert/src/react-confirm-alert.css";
import "react-toastify/dist/ReactToastify.css";
import "react-phone-input-2/lib/style.css";  
import PhoneInput from "react-phone-input-2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./FormBuilder.css";
import { useSelector,useDispatch } from "react-redux";
import { superAdminAction,userId,superAdminSelector } from "../../redux/reducers/superAdminReducer";

const ItemTypes = { 
  FIELD: "field",
  FORM_ELEMENT: "form-element",
};

const DraggableItem = ({ id, name, type }) => {
  const [, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { id, name, type },
  });
  return (
    <div ref={drag} className="draggable-item-formbuilder">
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
    <div ref={drop} className="drop-area-formbuilder">
      {children}
    </div>
  );
};

const DraggableFormElement = ({
  index,
  element,
  formElements, // Accept formElements as a prop change for "Show If"
  moveElement,
  toggleExpand,
  handleDelete,
  expanded,
  handleChange,
  handleOptionChange,
  handleAddOption,
  handleRemoveOption,
  // ** START CHANGE FOR "Note" element --- **
  handleContentChange,
  // ** END CHANGE FOR "Note" element --- **
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

  // --- Add new state to track conditional display ---
  const [conditionalDisplay, setConditionalDisplay] = useState({});

  // Add new state to track the selected values for "Show If"
  // const [selectedValues, setSelectedValues] = useState([]);
  // --- State to track selected values for "Show If" ---
  const [selectedValues, setSelectedValues] = useState(
    element.conditionValue || []
  ); // <-- Updated to use saved condition values

  // --- Function to handle checkbox change for "Show If" ---
  // const handleShowIfCheckboxChange = (index, value) => {
  //   const newConditionalDisplay = { ...element, showIf: value };
  //   handleChange(index, "conditionalDisplay", newConditionalDisplay);
  // };
  // --- Function to handle checkbox change for "Show If" ---
  const handleShowIfCheckboxChange = (index, value) => {
    handleChange(index, "showIf", value);
  };

  const handleMultipleSelection = (e, index) => {
    const value = e.target.value;
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
    handleChange(index, "conditionValue", [...selectedValues, value]);
  };

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="dropped-element-formbuilder"
    >
      <div className="element-header-formbuilder">
        <span className="drag-handle-formbuilder" ref={preview}>
          <FaGripVertical />
        </span>
        <span className="element-number-formbuilder">{index + 1}</span>
        {/* <span className="element-label-formbuilder">{element.name}</span> */}


        {/* *** START CHANGE FOR both labels name customize labal name on top and actual label name at bottom--- *** */}
        <div className="element-label-container-formbuilder">
          <span className="element-custom-label-formbuilder">
            {element.label || element.name} {/* Customized label */}
          </span>
          <span className="element-actual-label-formbuilder">
            {element.name} {/* Actual label */}
          </span>
        </div>
        {/* *** END CHANGE FOR both labels name customize labal name on top and actual label name at bottom--- *** */}

        <div className="element-actions-formbuilder">
          {expanded ? (
            <FaChevronUp
              className="icon-formbuilder"
              onClick={() => toggleExpand(index)}
            />
          ) : (
            <FaChevronDown
              className="icon-formbuilder" 
              onClick={() => toggleExpand(index)}
            />
          )}
          <FaRegTrashAlt
            className="icon-formbuilder delete-formbuilder"
            onClick={() => handleDelete(index)}
          />
        </div>
      </div>
      {expanded && (
        <div className="element-details-formbuilder">
          {/* ** START CHANGE FOR "Note input" --- ** */}
          {element.type === "note" ? (
            <>
              <div className="form-group-formbuilder">
                <label className="label-text-formbuilder">
                  Label (Label must be required)
                </label>
                <input
                  type="text"
                  value={element.label}
                  onChange={(e) => handleChange(index, "label", e.target.value)}
                />
              </div>
              <div className="form-group-formbuilder">
                <label>Note Content</label>
                <ReactQuill
                  value={element.content} // Use the "content" field to store the actual note content
                  onChange={(value) => handleContentChange(index, value)}
                />
              </div>

              {/* *** START CHANGE FOR add "Required" option checkbox in "Note" field--- *** */}
              <div className="form-group-formbuilder">
                <label className="checkbox-label-formbuilder">
                  <input
                    type="checkbox"
                    checked={element.required || false}
                    onChange={(e) =>
                      handleChange(index, "required", e.target.checked)
                    }
                  />
                  Required
                </label>
              </div>
              {/* *** END CHANGE FOR add "Required" option checkbox in "Note" field--- *** */}

              {/* START CHANGE FOR "Show If" functionality in "Note" */}
              <div className="form-group-formbuilder">
                <label className="checkbox-label-formbuilder">
                  <input
                    type="checkbox"
                    checked={element.showIf || false}
                    onChange={(e) =>
                      handleShowIfCheckboxChange(index, e.target.checked)
                    }
                  />
                  Show If
                </label>
              </div>
              {element.showIf && (
                <>
                  <div className="form-group-formbuilder">
                    <label>Question Below</label>
                    <select
                      value={element.conditionQuestion || ""}
                      onChange={(e) =>
                        handleChange(index, "conditionQuestion", e.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {formElements.map(
                        (el, i) =>
                          (el.type === "select" || el.type === "radio") && (
                            <option key={i} value={el.label}>
                              {el.label}
                            </option>
                          )
                      )}
                    </select>
                  </div>

                  {element.conditionQuestion && (
                    <div className="form-group-formbuilder">
                      <label>As any of the value(s) below</label>
                      <div>
                        {selectedValues.map((val, idx) => (
                          <div key={idx} className="selected-value-formbuilder">
                            {val}{" "}
                            <FaTimesCircle
                              onClick={() =>
                                setSelectedValues((prev) =>
                                  prev.filter((v) => v !== val)
                                )
                              }
                              className="remove-selected-value-icon-formbuilder" // this  CSS class for styling the icon
                            />
                          </div>
                        ))}
                      </div>
                      <select
                        onChange={(e) => handleMultipleSelection(e, index)}
                        value=""
                      >
                        <option value="">Select...</option>
                        {formElements
                          .find((el) => el.label === element.conditionQuestion)
                          ?.options.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              {/* END CHANGE FOR "Show If" functionality in "Note" */}
            </>
          ) : (
            <>
              <div className="form-group-formbuilder">
                <label className="label-text-formbuilder">
                  Label <span className="required-formbuilder"></span> (Label
                  must be required)
                </label>
                <input
                  type="text"
                  value={element.label}
                  onChange={(e) => handleChange(index, "label", e.target.value)}
                />
              </div>

              <div className="form-group-formbuilder">
                <label>Input Type</label>
                <select
                  value={element.type}
                  onChange={(e) => handleChange(index, "type", e.target.value)}
                >
                  <option value="text">Text Answer</option>
                  <option value="textarea">Long Answer</option>
                  <option value="select">Single Select</option>
                  <option value="multiselect">Multiple Select</option>
                  <option value="file">File Upload</option>
                  <option value="switch">Switch (True/False)</option>
                  <option value="slider">Slider (Marks/Ratings)</option>
                  <option value="date">Date</option>
                  <option value="rows">Multiple Rows</option>
                  <option value="email">Email</option>
                  <option value="url">Link/URL</option>
                  <option value="number">Number</option>
                  <option value="pngjpg">PNG/JPG Format</option>
                  <option value="radio">Single Select by Radio Button</option>
                  <option value="phone">Phone Number</option>{" "}
                  {/* Added phone number type */}
                </select>
              </div>

              {/*** START CHANGE FOR add "Required" option checkbox in all sidebar fields --- ***/}
              <div className="form-group-formbuilder">
                <label className="checkbox-label-formbuilder">
                  <input
                    type="checkbox"
                    checked={element.required || false}
                    onChange={(e) =>
                      handleChange(index, "required", e.target.checked)
                    }
                  />
                  Required
                </label>
              </div>
              {/*** END CHANGE FOR add "Required" option checkbox in all sidebar fields --- ***/}

              {element.type !== "select" &&
                element.type !== "multiselect" &&
                element.type !== "radio" && (
                  <div className="form-group-formbuilder">
                    <label>Placeholder</label>
                    <input
                      type="text"
                      value={element.placeholder}
                      onChange={(e) =>
                        handleChange(index, "placeholder", e.target.value)
                      }
                    />
                  </div>
                )}

              {/* START CHANGE FOR "Show If" checkbox and dropdowns */}
              <div className="form-group-formbuilder">
                <label className="checkbox-label-formbuilder">
                  <input
                    type="checkbox"
                    // checked={conditionalDisplay[index] || false}
                    checked={element.showIf || false}
                    onChange={(e) =>
                      handleShowIfCheckboxChange(index, e.target.checked)
                    }
                  />
                  Show If
                </label>
              </div>

              {/* {element.conditionalDisplay && ( */}
              {element.showIf && (
                <>
                  <div className="form-group-formbuilder">
                    <label>Question Below</label>
                    <select
                      value={element.conditionQuestion || ""}
                      onChange={(e) =>
                        handleChange(index, "conditionQuestion", e.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {formElements.map(
                        (el, i) =>
                          (el.type === "select" || el.type === "radio") && (
                            <option key={i} value={el.label}>
                              {el.label}
                            </option>
                          )
                      )}
                    </select>
                  </div>

                  {element.conditionQuestion && (
                    <div className="form-group-formbuilder">
                      <label>As any of the value(s) below</label>

                      {/* ** START CHANGE FOR input for "as any of the value(s) below" labal above dropdown --- ** */}
                      <div>
                        {selectedValues.map((val, idx) => (
                          <div key={idx} className="selected-value-formbuilder">
                            {val}{" "}
                            <FaTimesCircle
                              onClick={() =>
                                setSelectedValues((prev) =>
                                  prev.filter((v) => v !== val)
                                )
                              }
                              className="remove-selected-value-icon-formbuilder"
                            />
                          </div>
                        ))}
                      </div>
                      <select
                        onChange={(e) => handleMultipleSelection(e, index)}
                        value=""
                      >
                        <option value="">Select...</option>
                        {formElements
                          .find((el) => el.label === element.conditionQuestion)
                          ?.options.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                      {/* ** END CHANGE FOR input for "as any of the value(s) below" labal above dropdown --- ** */}
                    </div>
                  )}
                </>
              )}
              {/* END CHANGE FOR "Show If" */}

              {/* Character Limit Options - Start */}
              {element.type === "text" &&
                element.name !== "Contact Number" &&
                element.name !== "Startup team size" && (
                  <>
                    <div className="form-group-formbuilder">
                      <label>Maximum Character(s)</label>
                      <input
                        type="number"
                        value={element.maxLength}
                        onChange={(e) =>
                          handleChange(index, "maxLength", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group-formbuilder">
                      <label>Minimum Character(s)</label>
                      <input
                        type="number"
                        value={element.minLength}
                        onChange={(e) =>
                          handleChange(index, "minLength", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
              {/* Character Limit Options - End */}
              {(element.type === "select" ||
                element.type === "multiselect" ||
                element.type === "radio") && (
                <>
                  <div className="form-group-formbuilder">
                    <label>Options</label>
                    {element.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="option-group-formbuilder"
                      >
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              optionIndex,
                              e.target.value
                            )
                          }
                          className="option-input-formbuilder"
                        />
                        <button
                          type="button"
                          className="remove-option-formbuilder"
                          onClick={() => handleRemoveOption(index, optionIndex)}
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-option-formbuilder"
                      onClick={() => handleAddOption(index)}
                    >
                      Add Option
                    </button>
                  </div>
                  {element.type !== "radio" && (
                    <div className="form-group-formbuilder">
                      <label>
                        Maximum number of options that can be selected
                      </label>
                      <input
                        type="number"
                        value={element.maxSelect}
                        onChange={(e) =>
                          handleChange(index, "maxSelect", e.target.value)
                        }
                      />
                    </div>
                  )}
                  {/* <div className="form-group-formbuilder">
                    <label className="checkbox-label-formbuilder">
                      <input
                        type="checkbox"
                        checked={element.required}
                        onChange={(e) =>
                          handleChange(index, "required", e.target.checked)
                        }
                      />
                      Required22222
                    </label>
                  </div> */}
                </>
              )}
              {element.type === "file" && (
                <div className="form-group-formbuilder">
                  <label>Allowed File Type</label>
                  {element.name === "Resume (PDF Format Only)" && (
                    <input type="text" value="PDF" readOnly />
                  )}
                  {element.name ===
                    "Upload Startup Logo (In PNG/JPG Format)" && (
                    <input type="text" value="PNG, JPG" readOnly />
                  )}
                  {element.name === "File Upload" && (
                    <input type="text" value="All file types" readOnly />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const FormBuilder = () => {
  const location = useLocation();
  const {
    formElements: initialFormElements = [],
    formTitle,
    formId,
  } = location.state || {};
  const [formElements, setFormElements] = useState(
    Array.isArray(initialFormElements) ? initialFormElements : []
  );
  const [expandedElements, setExpandedElements] = useState({});
  const navigate = useNavigate();
  const dispatch=useDispatch();
  const role=useSelector(superAdminSelector);
  const getUserId=useSelector(userId);

  // useEffect(() => {
  //   if (!Array.isArray(initialFormElements)) {
  //     setFormElements([]);
  //   } else {
  //     setFormElements(initialFormElements);
  //   }
  // }, [initialFormElements]);

    /*** START  CHANGE FOR  initially already "Email" and "Name" field should be available--- ***/
// Inside useEffect where you check if Email and Name fields exist
useEffect(() => {
  if (Array.isArray(initialFormElements)) {
    // Check if "Email" and "Name" fields already exist in formElements
    const emailFieldExists = formElements.some((el) => el.name === "Email*");
    const nameFieldExists = formElements.some((el) => el.name === "Name*");

    // If "Email" and "Name" don't exist, add them to the formElements
    if (!emailFieldExists || !nameFieldExists) {
      const updatedFormElements = [...formElements];

      /*** START CHANGE FOR initially already i want to already filled with 'Email' and 'Name' field --- ***/
      // Pre-filling Email field with 'Email' label and 'Enter Your Email' placeholder
      if (!emailFieldExists) {
        updatedFormElements.push({
          id: "email",
          name: "Email*",
          type: "email",
          label: "Email",
          required: true,
          placeholder: "Enter Your Email", // Added pre-filled placeholder
        });
      }

      // Pre-filling Name field with 'Name' label and 'Enter Your Name' placeholder
      if (!nameFieldExists) {
        updatedFormElements.push({
          id: "name",
          name: "Name*",
          type: "text",
          label: "Name",
          required: true,
          placeholder: "Enter Your Name", // Added pre-filled placeholder
        });
      }
      /*** END CHANGE FOR initially already i want to already filled with 'Email' and 'Name' field --- ***/
      if(getUserId){
        if(role=="Program Manager"){
          setFormElements(updatedFormElements);
        }else if(role=="Super Admin"){
          navigate('/cards')
        }else{
          navigate('/admincards')
        }
      }else{
        navigate('/login')
      }  
    }
  }
}, [initialFormElements, formElements]);


  const handleDrop = (item) => {
    const newElement = {
      ...item,
      label: "",
      placeholder: "",
      required: false,
      options:
        item.type === "select" ||
        item.type === "multiselect" ||
        item.type === "radio"
          ? ["Option 1", "Option 2", "Option 3"]
          : [],
      maxSelect: item.type === "multiselect" ? 2 : null,
      // ** START CHANGE FOR "Note" element --- **
      content: "", // For ReactQuill content (Note)
      // ** END CHANGE FOR "Note" element --- **
    };

    if (
      item.type === "text" &&
      item.name !== "Contact Number" &&
      item.name !== "Startup team size"
    ) {
      newElement.maxLength = 50;
      newElement.minLength = 0;
    }

    setFormElements((prev) => [...prev, newElement]);
  };

  // ** START CHANGE FOR "Note" element --- **
  const handleContentChange = (index, value) => {
    const updatedElements = [...formElements];
    updatedElements[index].content = value;
    setFormElements(updatedElements);
  };
  // ** END CHANGE FOR "Note" element --- **

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
          <div className="custom-ui-formbuilder">
            <h1>Confirm to Delete</h1>
            <p>
              All collected data will be lost for this field. Are you sure you
              want to delete this Field?
            </p>
            <div className="button-group-formbuilder">
              <button
                className="delete-button-formbuilder"
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
                className="cancel-button-normal-formbuilder"
                onClick={onClose}
              >
                No
              </button>
            </div>
          </div>
        );
      },
      overlayClassName: "custom-overlay-formbuilder",
    });
  };

  const handlePreview = () => {
    const emptyLabelIndex = formElements.findIndex(
      (element) => !element.label.trim()
    );

    if (emptyLabelIndex !== -1) {
      const emptyLabelElementName = formElements[emptyLabelIndex].name;
      toast.error(`Label Not Found for ${emptyLabelElementName}`);
    } else {
      localStorage.setItem("formElements", JSON.stringify(formElements));
      navigate("/form-preview", { state: { formElements, formTitle, formId } });
    }
  };

  const handleChange = (index, field, value) => {
    const updatedElements = [...formElements];
    updatedElements[index][field] = value;
    setFormElements(updatedElements);
  };

  const handleOptionChange = (elementIndex, optionIndex, value) => {
    const updatedElements = [...formElements];
    updatedElements[elementIndex].options[optionIndex] = value;
    setFormElements(updatedElements);
  };

  const handleAddOption = (index) => {
    const updatedElements = [...formElements];
    updatedElements[index].options.push(
      `Option ${updatedElements[index].options.length + 1}`
    );
    setFormElements(updatedElements);
  };

  const handleRemoveOption = (elementIndex, optionIndex) => {
    const updatedElements = [...formElements];
    updatedElements[elementIndex].options.splice(optionIndex, 1);
    setFormElements(updatedElements);
  };

  const moveElement = (fromIndex, toIndex) => {
    const updatedElements = [...formElements];
    const [movedElement] = updatedElements.splice(fromIndex, 1);
    updatedElements.splice(toIndex, 0, movedElement);
    setFormElements(updatedElements);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="form-builder-container-formbuilder">
        <ToastContainer position="bottom-right" />
        <div className="form-builder-sidebar-formbuilder">
          <h3>Startup General</h3>
          <DraggableItem id="email" name="Email*" type="email" />
          <DraggableItem id="name" name="Name*" type="text" />
          <DraggableItem
            id="contact-number"
            name="Contact Number"
            type="phone"
          />{" "}
          {/* Changed type to phone */}
          <DraggableItem id="date-of-birth" name="Date of Birth" type="date" />
          <DraggableItem id="designation" name="Designation" type="text" />
          <DraggableItem
            id="resume"
            name="Resume (PDF Format Only)"
            type="file"
          />
          <DraggableItem
            id="qualification"
            name="Qualification (Recent One)"
            type="text"
          />
          <DraggableItem
            id="registered-office-location"
            name="Registered Office Location"
            type="text"
          />
          <DraggableItem
            id="one-liner-of-your-startup"
            name="One Liner of your startup"
            type="textarea"
          />
          <DraggableItem
            id="upload-startup-logo"
            name="Upload Startup Logo (In PNG/JPG Format)"
            type="file"
          />
          <DraggableItem
            id="startup-team-size"
            name="Startup team size"
            type="number"
          />
          <DraggableItem
            id="brief-description-of-your-startup"
            name="Brief Description of your startup"
            type="textarea"
          />
          <DraggableItem
            id="startup-website"
            name="Startup Website"
            type="url"
          />
          <DraggableItem
            id="startup-postal-address"
            name="Startup Postal Address"
            type="textarea"
          />
          <DraggableItem
            id="social-media-link"
            name="Social Media Link"
            type="url"
          />
          <DraggableItem
            id="domain-of-startup"
            name="Domain Of Startup"
            type="text"
          />
          <DraggableItem
            id="single-select"
            name="Single Select"
            type="select"
          />
          <DraggableItem
            id="multiple-select"
            name="Multiple Select"
            type="multiselect"
          />
          <DraggableItem
            id="single-select-radio"
            name="Single Select by Radio Button"
            type="radio"
          />{" "}
          {/* Add new draggable item here */}
          {/* ** START CHANGE FOR "Note" element --- ** */}
          <DraggableItem id="note" name="Note" type="note" />
          {/* ** END CHANGE FOR "Note" element --- ** */}
          <DraggableItem id="file-upload" name="File Upload" type="file" />
          <DraggableItem id="switch" name="Switch (True/False)" type="switch" />
          <DraggableItem id="date" name="Date" type="date" />
        </div>
        <div className="form-builder-content-formbuilder">
          <div className="form-builder-header-formbuilder">
            <h2>{formTitle || "test"}</h2>
            <div className="form-builder-buttons-formbuilder">
              <button
                className="form-builder-preview-button-formbuilder"
                onClick={handlePreview}
              >
                Preview
              </button>
              <button
                className="form-builder-close-button-formbuilder"
                onClick={() => navigate("/form")}
              >
                Close
              </button>
            </div>
          </div>
          <p>
            <span className="required-formbuilder-note">*</span> "Email" and
            "Name" fields are mandatory.
          </p>
          <p style={{ marginBottom: "15px" }}>
            <span className="required-formbuilder-note">*</span> Label of "Name"
            and "Email" should be always same as <b>"Name"</b> and{" "}
            <b>"Email"</b>.
          </p>
          <DropArea onDrop={handleDrop}>
            {formElements.map((element, index) => (
              <DraggableFormElement
                key={index}
                index={index}
                element={element}
                // start Pass formElements for "Show If"
                formElements={formElements}
                // end Pass formElements for "Show If"
                moveElement={moveElement}
                toggleExpand={toggleExpand}
                handleDelete={handleDelete}
                expanded={expandedElements[index]}
                handleChange={handleChange}
                handleOptionChange={handleOptionChange}
                handleAddOption={handleAddOption}
                handleRemoveOption={handleRemoveOption}
                // ** START CHANGE FOR "Note" element --- **
                handleContentChange={handleContentChange}
                // ** END CHANGE FOR "Note" element --- **
              />
            ))}
          </DropArea>
        </div>
      </div>
    </DndProvider>
  );
};

export default FormBuilder;
 




 