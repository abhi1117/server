import React, { useState, useEffect } from "react";
import "./EditColumnsModal.css";

const EditColumnsModal = ({ show, handleClose, columns, handleSave }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);

  // This useEffect will ensure all columns are set up properly when the modal is opened
  useEffect(() => {
    // Set all columns, not just visible ones, the first time the modal is opened
    // setSelectedColumns(columns.map(col => col.name));  // Map all columns by name, not just visible ones  // All columns selected by default
    setSelectedColumns([]); // No columns selected by default
  }, [columns]);

  const handleCheckboxChange = (columnName) => {
    if (selectedColumns.includes(columnName)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== columnName));
    } else {
      setSelectedColumns([...selectedColumns, columnName]);
    }
  };

  const saveChanges = () => {
    handleSave(selectedColumns);
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay-editcolumnsmodal">
      <div className="modal-content-editcolumnsmodal">
      <div className="modal-header-editcolumnsmodal">
          <h3>Edit Table Columns</h3>
          <button className="close-button-editcolumnsmodal" onClick={handleClose}>×</button>
        </div>        <div className="modal-body-editcolumnsmodal">
          {columns.map((column) => (
            <div
              key={column.name}
              className="checkbox-wrapper-editcolumnsmodal"
            >
              <input
                type="checkbox"
                checked={selectedColumns.includes(column.name)}
                onChange={() => handleCheckboxChange(column.name)}
              />
              {/* {column.label} */}
              <span className="checkbox-label-editcolumnsmodal">
                {column.label}
              </span>{" "}
              {/* Added class for label */}
            </div>
          ))}
        </div>
        <div className="modal-footer-editcolumnsmodal">
          <button
            className="footer-save-changes-button-editcolumnsmodal"
            onClick={saveChanges}
          >
            Save Changes
          </button>
          <button
            className="footer-close-button-editcolumnsmodal"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditColumnsModal;
