// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - Payment Sheet Component
 * 
 * Main payment modal/drawer for processing payments.
 */

import React, { useState } from 'react';
import { paymentApi } from '../api/paymentApi';
import { useOrderPayments } from '../hooks/useOrderPayments';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentAmountInput } from './PaymentAmountInput';
import { PaymentsList } from './PaymentsList';
import './PaymentSheet.css';

interface PaymentSheetProps {
  orderId: number;
  totalAmount: number;
  onClose: () => void;
  onPaid?: () => void;
}

export function PaymentSheet({ orderId, totalAmount, onClose, onPaid }: PaymentSheetProps) {
//   const { t } = useTranslation();
  const { payments, totalPaid, refreshPayments } = useOrderPayments(orderId);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = totalAmount - totalPaid;
  const isPaid = remaining <= 0.01;

  const handleAddPayment = async () => {
    if (!selectedMethod || amount <= 0) {
      setError('Selectează metoda de plată și suma');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await paymentApi.createPayment(orderId, {
        amount,
        method: selectedMethod,
        currency: 'RON',
      });

      // Reset form
      setSelectedMethod(null);
      setAmount(remaining);

      // Refresh payments
      await refreshPayments();

      // Check if order is now paid
      if (onPaid && remaining - amount <= 0.01) {
        setTimeout(() => {
          onPaid();
        }, 500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la adăugarea plății');
      console.error('PaymentSheet Error adding payment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-sheet-overlay" onClick={onClose}>
      <div className="payment-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="payment-sheet-header">
          <h2>Plată Comandă #{orderId}</h2>
          <button className="payment-sheet-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-sheet-content">
          <div className="payment-sheet-summary">
            <div className="payment-summary-row">
              <span>"total comanda"</span>
              <strong>{totalAmount.toFixed(2)} RON</strong>
            </div>
            <div className="payment-summary-row">
              <span>"Plătit:"</span>
              <strong>{totalPaid.toFixed(2)} RON</strong>
            </div>
            <div className="payment-summary-row payment-summary-row--remaining">
              <span>"rest de plata"</span>
              <strong>{remaining.toFixed(2)} RON</strong>
            </div>
          </div>

          {isPaid ? (
            <div className="payment-sheet-paid">
              <p className="payment-sheet-paid-message">✓ Comanda este plătită complet</p>
              <button className="payment-sheet-paid-btn" onClick={onClose}>"Închide"</button>
            </div>
          ) : (
            <>
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onSelectMethod={setSelectedMethod}
              />

              {selectedMethod && (
                <PaymentAmountInput
                  totalAmount={totalAmount}
                  alreadyPaid={totalPaid}
                  defaultAmount={remaining}
                  onAmountChange={setAmount}
                />
              )}

              {error && <div className="payment-sheet-error">{error}</div>}

              <button
                className="payment-sheet-add-btn"
                onClick={handleAddPayment}
                disabled={!selectedMethod || amount <= 0 || loading}
              >
                {loading ? '⏳ Se procesează...' : 'Adaugă Plată'}
              </button>
            </>
          )}

          <PaymentsList payments={payments} onRefresh={refreshPayments} />
        </div>
      </div>
    </div>
  );
}





