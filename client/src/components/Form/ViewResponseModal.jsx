// import React, { useState, useEffect } from 'react';
// import './ViewResponseModal.css';

// const ViewResponseModal = ({ formDetails, closeModal }) => {
//   const [selectedResponse, setSelectedResponse] = useState(null);

//   const handleViewDetails = (response) => {
//     setSelectedResponse(response);
//   };

//   const handleBackToResponses = () => {
//     setSelectedResponse(null);
//   };

//   const handleClickOutside = (event) => {
//     if (event.target.className === 'custom-unique-modal-overlayviewresponsemodal') {
//       closeModal();
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="custom-unique-modal-overlayviewresponsemodal">
//       <div className="custom-unique-modal-contentviewresponsemodal">
//         <div className="custom-unique-modal-headerviewresponsemodal">
//           <h2>Form Responses</h2>
//           <button className="custom-unique-close-buttonviewresponsemodal" onClick={closeModal}>&times;</button>
//         </div>
//         <div className="custom-unique-modal-bodyviewresponsemodal">
//           {selectedResponse ? (
//             <div>
//               <div className="custom-response-headerviewresponsemodal">
//                 <h4>Response Details</h4>
//                 <button className="custom-unique-buttonviewresponsemodal" onClick={handleBackToResponses}>Back to Responses</button>
//               </div>
//               <div className="custom-unique-response-detailsviewresponsemodal">
//                 {Object.keys(selectedResponse.formData).map((key) => (
//                   <div key={key} className="custom-unique-response-itemviewresponsemodal">
//                     <strong>{key}:</strong> {selectedResponse.formData[key]}
//                   </div>
//                 ))}
//                 {selectedResponse.files && selectedResponse.files.length > 0 && (
//                   <div className="custom-unique-response-itemviewresponsemodal">
//                     {/* <strong>File Name:</strong> {selectedResponse.files[0].originalName} */}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div>
//               <h4>All Responses</h4>
//               {formDetails && formDetails.length > 0 ? (
//                 <ul className="custom-unique-response-listviewresponsemodal">
//                   {formDetails.map((response, index) => (
//                     <li key={index}>
//                       <span>{response.userName || `Response ${index + 1}`}</span> {/* Display user name */}
//                       <button className="custom-unique-button-linkviewresponsemodal" onClick={() => handleViewDetails(response)}>View Details</button>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p>No responses yet.</p>
//               )}
//             </div>
//           )}
//         </div>
//         <div className="custom-unique-modal-footerviewresponsemodal">
//           <button className="custom-unique-buttonviewresponsemodal" onClick={closeModal}>Close</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewResponseModal;
