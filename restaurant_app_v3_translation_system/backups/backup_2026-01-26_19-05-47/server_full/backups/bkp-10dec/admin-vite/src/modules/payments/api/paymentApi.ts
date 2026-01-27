/**
 * PHASE S12 - Payment API Client
 * 
 * HTTP API client for payment operations.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  method: string;
  provider?: string | null;
  reference?: string | null;
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  meta?: any;
}

export interface PaymentMethod {
  key: string;
  label: string;
  labelRo: string;
  needsExternalFlow: boolean;
  icon: string;
}

export interface CreatePaymentPayload {
  amount: number;
  currency?: string;
  method: string;
  provider?: string;
  reference?: string;
  meta?: any;
}

export const paymentApi = {
  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await axios.get(`${API_BASE}/payments/methods`);
    return response.data.methods;
  },

  /**
   * Get payments for an order
   */
  async getOrderPayments(orderId: number): Promise<Payment[]> {
    const response = await axios.get(`${API_BASE}/orders/${orderId}/payments`);
    return response.data.payments;
  },

  /**
   * Create a payment for an order
   */
  async createPayment(orderId: number, payload: CreatePaymentPayload): Promise<Payment> {
    const response = await axios.post(`${API_BASE}/orders/${orderId}/payments`, payload);
    return response.data.payment;
  },

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: number): Promise<Payment> {
    const response = await axios.get(`${API_BASE}/payments/${paymentId}`);
    return response.data.payment;
  },

  /**
   * Capture a payment
   */
  async capturePayment(paymentId: number): Promise<Payment> {
    const response = await axios.post(`${API_BASE}/payments/${paymentId}/capture`);
    return response.data.payment;
  },

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: number): Promise<Payment> {
    const response = await axios.post(`${API_BASE}/payments/${paymentId}/cancel`);
    return response.data.payment;
  },
};

