/**
 * PHASE S12 - POS API Client
 * 
 * HTTP API client for POS operations.
 */

import axios from 'axios';
import type { CanonicalOrder } from '../../../types/order';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface CreateOrderPayload {
  type: 'dine_in' | 'takeout' | 'delivery' | 'drive_thru';
  table?: number | string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  items: Array<{
    product_id: number;
    qty: number;
    unit_price: number;
    notes?: string;
    options?: Array<{ label: string; value?: string }>;
  }>;
  notes?: {
    general?: string;
    kitchen?: string;
    bar?: string;
  };
}

export const posApi = {
  /**
   * Get active orders
   */
  async getActiveOrders(): Promise<CanonicalOrder[]> {
    const response = await axios.get(`${API_BASE}/orders/active`);
    return response.data;
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<CanonicalOrder> {
    const response = await axios.get(`${API_BASE}/orders/${orderId}`);
    return response.data;
  },

  /**
   * Create new order
   */
  async createOrder(payload: CreateOrderPayload): Promise<CanonicalOrder> {
    const response = await axios.post(`${API_BASE}/orders`, payload);
    return response.data;
  },

  /**
   * Update order
   */
  async updateOrder(orderId: number, payload: Partial<CreateOrderPayload>): Promise<CanonicalOrder> {
    const response = await axios.put(`${API_BASE}/orders/${orderId}`, payload);
    return response.data;
  },

  /**
   * Get order recap (summary)
   */
  async getOrderRecap(orderId: number): Promise<{
    order: CanonicalOrder;
    totals: {
      subtotal: number;
      discount: number;
      vat: number;
      total: number;
      currency: string;
    };
  }> {
    const response = await axios.get(`${API_BASE}/pos/orders/${orderId}/recap`);
    return response.data;
  },

  /**
   * Fiscalize order
   */
  async fiscalizeOrder(orderId: number): Promise<{
    success: boolean;
    fiscalReceiptNumber: string;
    fiscalReceiptDate: string;
    error?: string;
  }> {
    try {
      const response = await axios.post(`${API_BASE}/pos/fiscalizeOrder`, { orderId });
      return {
        success: true,
        fiscalReceiptNumber: response.data.fiscalReceiptNumber || response.data.receipt_number || '',
        fiscalReceiptDate: response.data.fiscalReceiptDate || response.data.receipt_date || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[posApi] Fiscalization error:', error);
      throw {
        success: false,
        error: error.response?.data?.error || error.message || 'Eroare la fiscalizare',
        code: error.response?.data?.code || 'FISCAL_ERROR',
        fiscalReceiptNumber: '',
        fiscalReceiptDate: '',
      };
    }
  },

  /**
   * Fiscalize order + generate e-Factura
   */
  async fiscalizeAndEFactura(orderId: number): Promise<{
    fiscalReceipt: any;
    eFactura: any;
  }> {
    // Step 1: Fiscalize order
    const fiscalResponse = await axios.post(`${API_BASE}/admin/pos/fiscalize`, { orderId });
    
    // Step 2: Generate e-Factura
    const efacturaResponse = await axios.post(`${API_BASE}/e-factura`, { orderId });
    
    return {
      fiscalReceipt: fiscalResponse.data,
      eFactura: efacturaResponse.data,
    };
  },

  /**
   * Consume stock for order
   */
  async consumeStock(orderId: number): Promise<{ success: boolean }> {
    const response = await axios.post(`${API_BASE}/orders/${orderId}/consume-stock`);
    return response.data;
  },

  /**
   * Send payment for order
   */
  async sendPayment(orderId: number, payment: {
    method: 'cash' | 'card' | 'voucher' | 'other';
    amount: number;
    metadata?: {
      reference?: string;
      last4?: string;
      [key: string]: any;
    };
  }): Promise<CanonicalOrder> {
    const response = await axios.post(`${API_BASE}/pos/sendPayment`, {
      orderId,
      method: payment.method,
      amount: payment.amount,
      metadata: payment.metadata,
    });
    return response.data;
  },

  /**
   * Load payments for order
   */
  async loadPayments(orderId: number): Promise<Array<{
    id: string;
    method: string;
    amount: number;
    createdAt: string;
    metadata?: any;
  }>> {
    const response = await axios.get(`${API_BASE}/orders/${orderId}/payments`);
    return response.data?.payments || response.data || [];
  },

  /**
   * Print receipt
   */
  async printReceipt(orderId: number, type: 'fiscal' | 'note' | 'invoice_copy'): Promise<void> {
    if (type === 'fiscal') {
      // Get fiscal receipt for order and print it
      await axios.post(`${API_BASE}/fiscal/receipt/${orderId}/print`);
    } else {
      // For note/invoice_copy, use tipizate endpoint
      await axios.post(`${API_BASE}/pos/orders/${orderId}/print-receipt`, { type });
    }
  },
};

