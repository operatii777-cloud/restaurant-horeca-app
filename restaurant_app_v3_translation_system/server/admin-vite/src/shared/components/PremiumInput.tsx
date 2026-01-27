/**
 * PREMIUM INPUT COMPONENT
 * Industry-leading input component with perfect accessibility
 * Inspired by: Stripe, Linear, Vercel, Shadcn UI
 */

import React from 'react';

export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="premium-input-wrapper">
      {label && (
        <label htmlFor={inputId} className="premium-input-label">
          {label}
          {props.required && <span className="premium-input-required" aria-label="required">*</span>}
        </label>
      )}
      <div className="premium-input-container">
        {leftIcon && <span className="premium-input-icon-left">{leftIcon}</span>}
        <input
          id={inputId}
          className={`input premium-input ${error ? 'premium-input-error' : ''} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        />
        {rightIcon && <span className="premium-input-icon-right">{rightIcon}</span>}
      </div>
      {error && (
        <div id={errorId} className="premium-input-error-message" role="alert">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div id={helperId} className="premium-input-helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
};

