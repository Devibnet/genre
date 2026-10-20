import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      default: return 'i';
    }
  };

  return (
    <div className={`toast-notification toast-${type} animated-fade-in`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>&times;</button>
    </div>
  );
};

export default Toast;
