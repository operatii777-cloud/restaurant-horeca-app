// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS API Client
 * 
 * HTTP API client for POS operations.
 */

import axios from 'axios';
import type { CanonicalOrder } from '@/types/order';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface CreateOrderPayload {
  type: 'dine_in' | 'takeout' | "Delivery" | 'drive_thru';
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
      console.error('posApi Fiscalization error:', error);
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
   * 
   * NOTE: Uses /api/admin/pos/pay endpoint (same as Kiosk) for consistency
   */
  async sendPayment(orderId: number, payment: {
    method: 'cash' | 'card' | 'voucher' | 'protocol' | 'degustare' | 'other';
    amount: number;
    metadata?: {
      reference?: string;
      last4?: string;
      [key: string]: any;
    };
  }): Promise<CanonicalOrder> {
    const response = await axios.post(`${API_BASE}/admin/pos/pay`, {
      order_id: orderId,
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

  /**
   * Get order for POS (legacy function from posApi.js)
   * Maps to getOrder but returns the old format with mapOrderApiToStore
   */
  async getOrderForPos(orderId: number): Promise<{
    order: any;
    payments: any[];
    fiscalReceipt: any;
  }> {
    try {
      const r = await fetch(`/api/admin/pos/order/${Number(orderId)}`);
      if (r.ok) {
        const data = await r.json();
        // Import mapOrderApiToStore dynamically to avoid circular dependencies
        const { mapOrderApiToStore } = await import('../posMapper');
        return {
          order: mapOrderApiToStore(data),
          payments: data?.payments || [],
          fiscalReceipt: Array.isArray(data?.fiscal_receipts) ? data.fiscal_receipts[0] : null,
        };
      }
    } catch {}
    // Fallback mock
    const { mapOrderApiToStore } = await import('../posMapper');
    return {
      order: mapOrderApiToStore({
        id: Number(orderId),
        table_number: 5,
        total: 42.5,
        items: [],
        is_paid: 0,
        has_fiscal_receipt: 0,
      }),
      payments: [],
      fiscalReceipt: null,
    };
  },
};

// Legacy named exports for compatibility with posApi.js imports
export async function getOrderForPos(orderId: number) {
  return posApi.getOrderForPos(orderId);
}

export async function sendPayment(orderId: number, payment: { type?: string; amount?: number }) {
  return posApi.sendPayment(orderId, {
    method: (payment?.type as any) || 'cash',
    amount: payment?.amount || 0,
  });
}

export async function fiscalizeOrder(orderId: number, payment: any = {}) {
  return posApi.fiscalizeOrder(orderId);
}

// Default export for compatibility with default imports
export default posApi;



