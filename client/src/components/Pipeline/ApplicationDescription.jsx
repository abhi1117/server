import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./ApplicationDescription.css";

const ApplicationDescription = ({
  onClose,
  onSubmit,
  description: existingDescription,
  pipelineId,
  selectedRound,
}) => {
  const [description, setDescription] = useState(existingDescription || "");
  // console.log('Application Desc Running')
  // Function to strip HTML tags from the description
  const stripHtmlTags = (html) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || "";
  };
  /*** START CHANGE FOR handling Description in modal --- ***/

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }], // Headings
      ["bold", "italic", "underline"], // Formatting options
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      [{ indent: "-1" }, { indent: "+1" }], // Indentation
      [{ align: [] }], // Text alignment
      [{ script: "sub" }, { script: "super" }], // Subscript & Superscript
      ["link"], // Insert links
      [{ color: [] }, { background: [] }], //  Text Color & Background Color
      ["clean"], // Remove formatting
    ],
  };

  // Explicitly defining allowed formats to ensure "link" is supported
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "indent",
    "align",
    "script",
    "link", //  Ensure "link" is explicitly included
    "color", // Text Color
    "background", // Background Color
  ];

  const handleSubmit = async () => {
    try {
      let response;
      if (existingDescription) {
        response = await axios.put(
          `https://incubator.drishticps.org/api/pipelines/${pipelineId}/rounds/${selectedRound}/description`,
          { description },
          { withCredentials: true }
        );
      } else {
        response = await axios.post(
          `https://incubator.drishticps.org/api/pipelines/${pipelineId}/rounds/${selectedRound}/description`,
          { description },
          { withCredentials: true }
        );
      }
      if (response.status === 200 || response.status === 201) {
        onSubmit(description);
        onClose();
      } else {
        console.error("Failed to save description:", response.data.error);
      }
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };
  /*** END CHANGE FOR handling Description in modal --- ***/

  useEffect(() => {
    if (existingDescription) {
      setDescription(existingDescription);
    }
  }, [existingDescription]);

  return (
    <div className="modal-background-applicationdescription">
      <div className="modal-content-applicationdescription">
        <h3 className="modal-description-heading-text-applicationdescription">
          Description
        </h3>
        <ReactQuill
          value={description}
          onChange={setDescription}
          placeholder="Enter your description here"
          modules={modules} //  Use the updated toolbar
          formats={formats} // Ensure link, text color & background color are applied correctly
        />
        <div className="modal-buttons-applicationdescription">
          <button
            onClick={handleSubmit}
            className="modal-submit-button-applicationdescription"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="modal-cancel-button-applicationdescription"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDescription;






// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import "./ApplicationDescription.css";

// const ApplicationDescription = ({
//   onClose,
//   onSubmit,
//   description: existingDescription,
//   pipelineId,
//   selectedRound,
// }) => {
//   const [description, setDescription] = useState(existingDescription || "");
//   // console.log('Application Desc Running')
//   // Function to strip HTML tags from the description
//   const stripHtmlTags = (html) => {
//     const tempElement = document.createElement("div");
//     tempElement.innerHTML = html;
//     return tempElement.textContent || tempElement.innerText || "";
//   };
//   /*** START CHANGE FOR handling Description in modal --- ***/

//   // ✅ Enable indentation & alignment in the toolbar
//   // const modules = {
//   //   toolbar: [
//   //     [{ header: [1, 2, false] }], // Headings
//   //     ["bold", "italic", "underline"], // Formatting options
//   //     [{ list: "ordered" }, { list: "bullet" }], // Lists
//   //     [{ indent: "-1" }, { indent: "+1" }], // ✅ Indent Left (-1), Right (+1)
//   //     [{ align: [] }], // Text alignment options
//   //     ["link"], // Insert links
//   //     ["clean"], // Remove formatting
//   //   ],
//   // };

//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, false] }], // Headings
//       ["bold", "italic", "underline"], // Formatting options
//       [{ list: "ordered" }, { list: "bullet" }], // Lists
//       [{ indent: "-1" }, { indent: "+1" }], // Indentation
//       [{ align: [] }], // Text alignment
//       [{ script: "sub" }, { script: "super" }], // ✅ Subscript & Superscript
//       ["link"], // Insert links
//       ["clean"], // Remove formatting
//     ],
//   };

//   const handleSubmit = async () => {
//     try {
//       let response;
//       if (existingDescription) {
//         response = await axios.put(
//           `https://incubator.drishticps.org/api/pipelines/${pipelineId}/rounds/${selectedRound}/description`,
//           { description },
//           { withCredentials: true }
//         );
//       } else {
//         response = await axios.post(
//           `https://incubator.drishticps.org/api/pipelines/${pipelineId}/rounds/${selectedRound}/description`,
//           { description },
//           { withCredentials: true }
//         );
//       }
//       if (response.status === 200 || response.status === 201) {
//         onSubmit(description);
//         onClose();
//       } else {
//         console.error("Failed to save description:", response.data.error);
//       }
//     } catch (error) {
//       console.error("Error saving description:", error);
//     }
//   };
//   /*** END CHANGE FOR handling Description in modal --- ***/

//   useEffect(() => {
//     if (existingDescription) {
//       setDescription(existingDescription);
//     }
//   }, [existingDescription]);

//   return (
//     <div className="modal-background-applicationdescription">
//       <div className="modal-content-applicationdescription">
//         <h3 className="modal-description-heading-text-applicationdescription">
//           Description
//         </h3>
//         <ReactQuill
//           value={description}
//           onChange={setDescription}
//           placeholder="Enter your description here"
//           modules={modules} // ✅ Use the updated toolbar
//         />
//         <div className="modal-buttons-applicationdescription">
//           <button
//             onClick={handleSubmit}
//             className="modal-submit-button-applicationdescription"
//           >
//             Submit
//           </button>
//           <button
//             onClick={onClose}
//             className="modal-cancel-button-applicationdescription"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApplicationDescription;
