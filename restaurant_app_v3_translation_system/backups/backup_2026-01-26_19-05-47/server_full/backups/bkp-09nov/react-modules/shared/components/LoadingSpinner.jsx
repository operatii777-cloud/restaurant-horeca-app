/**
 * ⏳ LoadingSpinner - Component pentru loading states
 */

import React from 'react';
import './LoadingSpinner.css';

export function LoadingSpinner({ message = 'Se încarcă...', size = 'medium' }) {
  return (
    <div className={`loading-spinner-container loading-spinner-${size}`}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;

