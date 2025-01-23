import React from 'react';
import { FaLinkedin, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import './ShareModal.css';
 
const ShareModal = ({ shareableLink, copyLinkToClipboard, closeShareModal }) => {
  return (
    <div className="modal-backgroundsharemodal">
      <div className="share-modalsharemodal">
        <div className="share-modal-headersharemodal">
          <h2 style={{fontSize:"22px"}}>Share Form</h2>
          <button className="close-icon-buttonsharemodal" onClick={closeShareModal}>×</button>
        </div>
        <p className='textinlinksharemodal'>Use the link below to share the form:</p>  
        <div className="link-containersharemodal">
          <input type="text" value={shareableLink} readOnly />
          <button className="copy-link-buttonsharemodal" onClick={copyLinkToClipboard}>  
            <span className="link-iconsharemodal">&#128279;</span> Copy Link
          </button>
        </div>
        <div className="social-share-buttonssharemodal">
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareableLink}`} target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={34} />
          </a>
          <a href={`https://wa.me/?text=${shareableLink}`} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp size={34} />
          </a>
          <a href={`mailto:?subject=Check this form&body=${shareableLink}`} target="_blank" rel="noopener noreferrer">
            <FaEnvelope size={34} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;


 