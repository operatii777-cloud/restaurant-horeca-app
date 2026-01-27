/**
 * ❌ ErrorAlert - Component pentru afișarea erorilor
 */

import React from 'react';
import './ErrorAlert.css';

export function ErrorAlert({ error, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <div className="error-alert">
      <div className="error-alert-header">
        <span className="error-alert-icon">⚠️</span>
        <h3 className="error-alert-title">A apărut o eroare</h3>
      </div>
      
      <div className="error-alert-body">
        <p className="error-alert-message">{error}</p>
      </div>
      
      <div className="error-alert-actions">
        {onRetry && (
          <button 
            className="error-alert-btn error-alert-btn-retry" 
            onClick={onRetry}
          >
            🔄 Încearcă din nou
          </button>
        )}
        {onDismiss && (
          <button 
            className="error-alert-btn error-alert-btn-dismiss" 
            onClick={onDismiss}
          >
            ✖️ Închide
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorAlert;

