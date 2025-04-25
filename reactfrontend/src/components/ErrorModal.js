import React from 'react';
import ReactDOM from 'react-dom';
import './ErrorModal.css';

const ErrorModal = ({ message, onClose }) => {
  if (!message) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Error</h2>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  , document.body);
};

export default ErrorModal;
