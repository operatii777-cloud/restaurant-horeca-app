// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - Payment Method Selector Component
 * 
 * Selector for payment methods (Cash, Card, Voucher, etc.).
 */

import React, { useEffect, useState } from 'react';
import { paymentApi, type PaymentMethod } from '../api/paymentApi';
import './PaymentMethodSelector.css';

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) {
//   const { t } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
//   const { t } = useTranslation();
    try {
      const data = await paymentApi.getPaymentMethods();
      setMethods(data);
    } catch (error) {
      console.error('PaymentMethodSelector Error loading methods:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="payment-method-selector-loading">"se incarca metodele"</div>;
  }

  return (
    <div className="payment-method-selector">
      <h4 className="payment-method-selector-title">"selecteaza metoda de plata"</h4>
      <div className="payment-method-grid">
        {methods.map((method) => (
          <button
            key={method.key}
            className={`payment-method-btn ${
              selectedMethod === method.key ? 'selected' : ''
            }`}
            onClick={() => onSelectMethod(method.key)}
          >
            <span className="payment-method-icon">{method.icon}</span>
            <span className="payment-method-label">{method.labelRo}</span>
          </button>
        ))}
      </div>
    </div>
  );
}





