import React from 'react';
import { FaTimes, FaLinkedin, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ShareFormModal.css';

const ShareFormModal = ({ closeModal, form }) => {
  const formLink = `${window.location.origin}/shared-form-preview/${form._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formLink);
    toast.success('Link copied to clipboard!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true, 
      progress: undefined,
    });
  };

  return (
    <div className="modal-overlay-customeditformmodal">
      <div className="modal-content-customeditformmodal">
        <div className="modal-header-customeditformmodal">
          <h2>Share Form</h2>
          <FaTimes className="close-icon-customeditformmodal" onClick={closeModal} />
        </div>
        <div className="modal-body-customeditformmodal">
          <p className='textinlink-customeditformmodal'>Use the link below to share the form:</p> 
          <div className="link-container-customeditformmodal">
            <input
              type="text"
              value={formLink}
              readOnly
              className="share-link-input-customeditformmodal"
            />
            <button className="copy-link-button-customeditformmodal" onClick={handleCopyLink}>
              <span className="link-icon-customeditformmodal">&#128279;</span> Copy Link
            </button>
          </div>
          <div className="share-buttons-customeditformmodal">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${formLink}`} target="_blank" rel="noopener noreferrer" className="icon-buttoneditformmodal custom-icon-linkedineditformmodal">
              <FaLinkedin size={20} />
            </a>
            <a href={`https://wa.me/?text=${formLink}`} target="_blank" rel="noopener noreferrer" className="icon-buttoneditformmodal custom-icon-whatsappeditformmodal">
              <FaWhatsapp size={20} />
            </a>
            <a href={`mailto:?subject=Check this form&body=${formLink}`} target="_blank" rel="noopener noreferrer" className="icon-buttoneditformmodal custom-icon-emaileditformmodal">
              <FaEnvelope size={20} />
            </a>
          </div>
        </div>
      </div>
      {/* <ToastContainer /> */}
      <ToastContainer position="bottom-right" />

    </div>
  );
};

export default ShareFormModal;



 