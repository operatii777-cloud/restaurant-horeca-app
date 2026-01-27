/**
 * PHASE S12 - Payments List Component
 * 
 * Displays list of payments for an order.
 */

import React from 'react';
import { paymentApi, type Payment } from '../api/paymentApi';
import './PaymentsList.css';

interface PaymentsListProps {
  payments: Payment[];
  onRefresh?: () => void;
}

export function PaymentsList({ payments, onRefresh }: PaymentsListProps) {
  const handleCancel = async (paymentId: number) => {
    if (!confirm('Sigur vrei să anulezi această plată?')) {
      return;
    }

    try {
      await paymentApi.cancelPayment(paymentId);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('[PaymentsList] Error cancelling payment:', error);
      alert('Eroare la anularea plății');
    }
  };

  if (payments.length === 0) {
    return (
      <div className="payments-list-empty">
        <p>Nu există plăți pentru această comandă</p>
      </div>
    );
  }

  const totalPaid = payments
    .filter((p) => p.status === 'CAPTURED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="payments-list">
      <div className="payments-list-header">
        <h4>Plăți</h4>
        <span className="payments-list-total">Total plătit: {totalPaid.toFixed(2)} RON</span>
      </div>
      <div className="payments-list-items">
        {payments.map((payment) => (
          <div key={payment.id} className="payments-list-item">
            <div className="payments-list-item-info">
              <div className="payments-list-item-method">
                {payment.method} - {payment.amount.toFixed(2)} {payment.currency}
              </div>
              <div className="payments-list-item-status">
                <span className={`payments-status-badge payments-status-badge--${payment.status.toLowerCase()}`}>
                  {payment.status}
                </span>
              </div>
            </div>
            {payment.status === 'PENDING' && (
              <button
                className="payments-list-item-cancel"
                onClick={() => handleCancel(payment.id)}
              >
                Anulează
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

