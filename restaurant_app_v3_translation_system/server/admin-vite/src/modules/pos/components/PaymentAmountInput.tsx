import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payment Amount Input Component
 * 
 * Numeric pad + quick amount buttons
 */

import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { PaymentNumericPad } from './PaymentNumericPad';
import './PaymentAmountInput.css';

interface PaymentAmountInputProps {
  value: string;
  remainingAmount: number;
  onChange: (amount: string) => void;
  onExact: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function PaymentAmountInput({
  value,
  remainingAmount,
  onChange,
  onExact,
  onClear,
  disabled = false,
}: PaymentAmountInputProps) {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value);

  const handleValueChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleExact = () => {
    const exactAmount = remainingAmount.toFixed(2);
    setLocalValue(exactAmount);
    onChange(exactAmount);
    onExact();
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onClear();
  };

  const parseAmount = (): number => {
    if (!localValue) return 0;
    const normalized = localValue.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  };

  const amount = parseAmount();
  const isValid = amount > 0 && amount <= remainingAmount;

  return (
    <div className="payment-amount-input">
      <div className="payment-amount-header">
        <label className="payment-amount-label">{t('pos.payment.amount')}</label>
        <div className="payment-amount-remaining">
          {t('pos.payment.remaining')}: <strong>{remainingAmount.toFixed(2)} RON</strong>
        </div>
      </div>

      <div className="payment-amount-display">
        <Form.Control
          type="text"
          className="payment-amount-field"
          value={localValue}
          onChange={(e) => {
            const raw = e.target.value;
            const normalized = raw.replace(',', '.');
            if (/^[0-9]*[.]?[0-9]*$/.test(normalized) || normalized === '') {
              handleValueChange(normalized);
            }
          }}
          disabled={disabled}
          placeholder="0.00"
          inputMode="decimal"
        />
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleExact}
          disabled={disabled || remainingAmount <= 0}
          className="payment-amount-exact-btn"
        >
          {t('pos.payment.exact')}
        </Button>
      </div>

      {amount > 0 && !isValid && (
        <div className="payment-amount-error">
          {amount > remainingAmount
            ? t('pos.payment.amountExceedsRemaining', { remaining: remainingAmount.toFixed(2) })
            : t('pos.payment.invalidAmount')}
        </div>
      )}

      <PaymentNumericPad
        value={localValue}
        onChange={handleValueChange}
        onClear={handleClear}
        disabled={disabled}
      />
    </div>
  );
}




