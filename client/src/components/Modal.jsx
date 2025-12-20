import React from 'react';

const Modal = ({ isOpen, onClose, title, message, type }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className={`modal-content ${type}`}>
                <h3>{title}</h3>
                <p>{message}</p>
                <button className="btn" onClick={onClose} style={{ marginTop: '20px' }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;
