/**
 * FAZA 2.D - Payments List Component
 * 
 * Display list of current payments with remove functionality
 */

import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import type { PosPayment } from '../store/posStore';
import './PaymentsList.css';

interface PaymentsListProps {
  payments: PosPayment[];
  onRemove: (paymentId: string) => void;
  disabled?: boolean;
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  voucher: 'Voucher',
  other: 'Altă metodă',
};

const METHOD_ICONS: Record<string, string> = {
  cash: '💵',
  card: '💳',
  voucher: '🎫',
  other: '💰',
};

export function PaymentsList({ payments, onRemove, disabled = false }: PaymentsListProps) {
  if (!payments || payments.length === 0) {
    return (
      <div className="payments-list-empty">
        <p className="text-muted">Nu există plăți înregistrate</p>
      </div>
    );
  }

  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="payments-list">
      <div className="payments-list-header">
        <h5 className="payments-list-title">Plăți efectuate</h5>
        <Badge bg="primary">{payments.length}</Badge>
      </div>
      <div className="payments-list-items">
        {payments.map((payment) => (
          <div key={payment.id} className="payment-item">
            <div className="payment-item-info">
              <div className="payment-item-method">
                <span className="payment-item-icon">{METHOD_ICONS[payment.type] || '💰'}</span>
                <span className="payment-item-label">{METHOD_LABELS[payment.type] || payment.type}</span>
              </div>
              {payment.timestamp && (
                <div className="payment-item-time">{formatTime(payment.timestamp)}</div>
              )}
            </div>
            <div className="payment-item-amount">
              {payment.amount.toFixed(2)} RON
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              className="payment-item-remove"
              onClick={() => onRemove(payment.id)}
              disabled={disabled}
              title="Șterge plata"
            >
              <i className="fas fa-trash"></i>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

