// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - Order Payments Hook
 * 
 * Hook for loading and managing payments for an order.
 */

import { useEffect, useState } from 'react';
import { paymentApi, type Payment } from '../api/paymentApi';

export function useOrderPayments(orderId: number | null) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    if (!orderId) {
      setPayments([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await paymentApi.getOrderPayments(orderId);
      setPayments(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la încărcarea plăților');
      console.error('useOrderPayments Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [orderId]);

  const refreshPayments = () => {
    loadPayments();
  };

  const totalPaid = payments
    .filter((p) => p.status === 'CAPTURED')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    payments,
    totalPaid,
    loading,
    error,
    refreshPayments,
  };
}



