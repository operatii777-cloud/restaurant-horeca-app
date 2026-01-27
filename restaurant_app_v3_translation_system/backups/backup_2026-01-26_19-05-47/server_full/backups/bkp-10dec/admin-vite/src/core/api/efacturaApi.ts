/**
 * PHASE S11 - e-Factura API Client
 * 
 * HTTP API client for e-Factura operations.
 * Uses S8 backend endpoints.
 */

import axios from 'axios';
import type { EFacturaInvoice, EFacturaFilter, EFacturaStats, EFacturaChartData } from '../../types/invoice';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface EFacturaListResponse {
  items: EFacturaInvoice[];
  total: number;
  page: number;
  pageSize: number;
}

export const efacturaApi = {
  /**
   * Get invoices list with filters
   */
  async getInvoices(
    filter: EFacturaFilter = {},
    page = 1,
    pageSize = 50
  ): Promise<EFacturaListResponse> {
    const response = await axios.get(`${API_BASE}/e-factura`, {
      params: { ...filter, page, pageSize },
    });
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  async getInvoice(id: number): Promise<EFacturaInvoice> {
    const response = await axios.get(`${API_BASE}/e-factura/${id}`);
    return response.data;
  },

  /**
   * Get invoice UBL XML
   */
  async getInvoiceXml(id: number): Promise<string> {
    const response = await axios.get(`${API_BASE}/e-factura/${id}/xml`, {
      responseType: 'text',
    });
    return response.data;
  },

  /**
   * Get invoice PDF
   */
  async getInvoicePdf(id: number): Promise<Blob> {
    const response = await axios.get(`${API_BASE}/e-factura/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Retry invoice submission to ANAF
   */
  async retryInvoice(id: number): Promise<void> {
    await axios.post(`${API_BASE}/e-factura/${id}/retry`);
  },

  /**
   * Cancel invoice
   */
  async cancelInvoice(id: number): Promise<void> {
    await axios.post(`${API_BASE}/e-factura/${id}/cancel`);
  },

  /**
   * Refresh invoice status from ANAF
   */
  async refreshStatus(id: number): Promise<EFacturaInvoice> {
    const response = await axios.post(`${API_BASE}/e-factura/${id}/refresh-status`);
    return response.data;
  },

  /**
   * Create e-Factura for order
   */
  async createForOrder(orderId: number): Promise<EFacturaInvoice> {
    const response = await axios.post(`${API_BASE}/e-factura`, { orderId });
    return response.data;
  },

  /**
   * Create e-Factura for tipizate
   */
  async createForTipizate(docType: string, docId: number): Promise<EFacturaInvoice> {
    const response = await axios.post(`${API_BASE}/e-factura`, {
      tipizateType: docType,
      tipizateId: docId,
    });
    return response.data;
  },

  /**
   * Get e-Factura statistics
   */
  async getStats(dateFrom?: string, dateTo?: string): Promise<EFacturaStats> {
    const response = await axios.get(`${API_BASE}/e-factura/stats`, {
      params: { dateFrom, dateTo },
    });
    return response.data;
  },

  /**
   * Get chart data for e-Factura
   */
  async getChartData(dateFrom?: string, dateTo?: string): Promise<EFacturaChartData[]> {
    const response = await axios.get(`${API_BASE}/e-factura/charts`, {
      params: { dateFrom, dateTo },
    });
    return response.data;
  },
};

