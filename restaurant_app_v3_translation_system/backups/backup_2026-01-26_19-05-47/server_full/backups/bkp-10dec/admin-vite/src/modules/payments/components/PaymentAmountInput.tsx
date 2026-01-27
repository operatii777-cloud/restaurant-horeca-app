/**
 * PHASE S12 - Payment Amount Input Component
 * 
 * Input for payment amount with validation.
 */

import React, { useState, useEffect } from 'react';
import './PaymentAmountInput.css';

interface PaymentAmountInputProps {
  totalAmount: number;
  alreadyPaid: number;
  defaultAmount?: number;
  onAmountChange: (amount: number) => void;
}

export function PaymentAmountInput({
  totalAmount,
  alreadyPaid,
  defaultAmount,
  onAmountChange,
}: PaymentAmountInputProps) {
  const remaining = totalAmount - alreadyPaid;
  const [amount, setAmount] = useState<string>(
    defaultAmount !== undefined ? defaultAmount.toFixed(2) : remaining.toFixed(2)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Suma trebuie să fie un număr pozitiv');
    } else if (numAmount > remaining + 0.01) {
      setError(`Suma depășește restul de plată (${remaining.toFixed(2)} RON)`);
    } else {
      setError(null);
      onAmountChange(numAmount);
    }
  }, [amount, remaining, onAmountChange]);

  const handleQuickAmount = (percent: number) => {
    const quickAmount = (remaining * percent) / 100;
    setAmount(quickAmount.toFixed(2));
  };

  return (
    <div className="payment-amount-input">
      <label className="payment-amount-label">
        Suma de plată
        <span className="payment-amount-remaining">
          (Rest: {remaining.toFixed(2)} RON)
        </span>
      </label>
      <div className="payment-amount-input-group">
        <input
          type="number"
          step="0.01"
          min="0.01"
          max={remaining + 0.01}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`payment-amount-field ${error ? 'error' : ''}`}
          placeholder="0.00"
        />
        <span className="payment-amount-currency">RON</span>
      </div>
      {error && <div className="payment-amount-error">{error}</div>}
      <div className="payment-amount-quick">
        <button
          type="button"
          className="payment-amount-quick-btn"
          onClick={() => handleQuickAmount(25)}
        >
          25%
        </button>
        <button
          type="button"
          className="payment-amount-quick-btn"
          onClick={() => handleQuickAmount(50)}
        >
          50%
        </button>
        <button
          type="button"
          className="payment-amount-quick-btn"
          onClick={() => handleQuickAmount(100)}
        >
          100%
        </button>
      </div>
    </div>
  );
}

