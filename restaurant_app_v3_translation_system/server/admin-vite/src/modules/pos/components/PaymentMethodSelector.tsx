import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payment Method Selector Component
 * 
 * Clean UI for selecting payment method (cash, card, voucher)
 */

import React from 'react';
import { Button } from 'react-bootstrap';
import './PaymentMethodSelector.css';

export type PaymentMethod = 'cash' | 'card' | 'voucher' | 'protocol' | 'degustare' | 'other';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();
  
  const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: string }> = [
    { id: 'cash', label: t('pos.payment.methods.cash'), icon: '💵' },
    { id: 'card', label: t('pos.payment.methods.card'), icon: '💳' },
    { id: 'voucher', label: t('pos.payment.methods.voucher'), icon: '🎫' },
    { id: 'protocol', label: t('pos.payment.methods.protocol'), icon: '📋' },
    { id: 'degustare', label: t('pos.payment.methods.degustare'), icon: '🍷' },
  ];
  
  return (
    <div className="payment-method-selector">
      <label className="payment-method-label">{t('pos.payment.method')}</label>
      <div className="payment-method-buttons">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <Button
              key={method.id}
              variant={isSelected ? 'primary' : 'outline-primary'}
              size="lg"
              className={`payment-method-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => !disabled && onChange(method.id)}
              disabled={disabled}
            >
              <span className="payment-method-icon">{method.icon}</span>
              <span className="payment-method-label-text">{method.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

