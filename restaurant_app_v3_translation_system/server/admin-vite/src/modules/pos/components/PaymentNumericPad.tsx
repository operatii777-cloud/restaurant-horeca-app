// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payment Numeric Pad Component
 * 
 * Numeric pad for entering payment amounts
 */

import React from 'react';
import { Button } from 'react-bootstrap';
import './PaymentNumericPad.css';

interface PaymentNumericPadProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export function PaymentNumericPad({
  value,
  onChange,
  onClear,
  disabled = false,
}: PaymentNumericPadProps) {
//   const { t } = useTranslation();
  const safeValue = value || '';

  const handleDigit = (digit: string) => {
//   const { t } = useTranslation();
    if (disabled) return;
    let next = safeValue;
    if (next === '0') {
      next = '';
    }
    const dotIndex = next.indexOf('.');
    if (dotIndex !== -1) {
      const decimals = next.length - dotIndex - 1;
      if (decimals >= 2) {
        return; // Max 2 decimals
      }
    }
    onChange(next + digit);
  };

  const handleDot = () => {
    if (disabled) return;
    if (!safeValue) {
      onChange('0.');
      return;
    }
    if (!safeValue.includes('.')) {
      onChange(safeValue + '.');
    }
  };

  const handleBackspace = () => {
    if (disabled || !safeValue) return;
    onChange(safeValue.slice(0, -1));
  };

  return (
    <div className="payment-numeric-pad">
      <div className="payment-numeric-pad-grid">
        {DIGITS.slice(0, 9).map((digit) => (
          <Button
            key={digit}
            variant="outline-secondary"
            className="payment-numeric-btn"
            onClick={() => handleDigit(digit)}
            disabled={disabled}
          >
            {digit}
          </Button>
        ))}
        <Button
          variant="outline-secondary"
          className="payment-numeric-btn"
          onClick={() => handleDigi[0]}
          disabled={disabled}
        >
          0
        </Button>
        <Button
          variant="outline-secondary"
          className="payment-numeric-btn"
          onClick={handleDot}
          disabled={disabled}
        >
          .
        </Button>
        <Button
          variant="outline-secondary"
          className="payment-numeric-btn"
          onClick={handleBackspace}
          disabled={disabled}
        >
          ←
        </Button>
      </div>
      <Button
        variant="outline-danger"
        className="payment-numeric-clear"
        onClick={onClear}
        disabled={disabled}
      >
        C – Șterge tot
      </Button>
    </div>
  );
}

