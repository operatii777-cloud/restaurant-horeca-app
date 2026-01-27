// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Accounting Reports API
 * 
 * API client pentru rapoarte contabilitate:
 * - VAT Report (TVA de Plată, TVA Deductibil, Reconciliare)
 * - Client Payments Report (Plații Efectuate, Pending, Vârste Creanțe)
 * - Suppliers Report (Datorii, Evaluare, Prețuri Medii)
 */

import { httpClient } from '@/shared/api/httpClient';

export interface VatReportFilters {
  dateFrom?: string;
  dateTo?: string;
  locationId?: number;
}

export interface VatReportData {
  period: {
    from: string | null;
    to: string | null;
  };
  vatToPay: {
    total: number;
    vat9: { base: number; amount: number };
    vat19: { base: number; amount: number };
    vat24: { base: number; amount: number };
  };
  vatDeductible: {
    total: number;
    vat9: { base: number; amount: number };
    vat19: { base: number; amount: number };
    vat24: { base: number; amount: number };
  };
  reconciliation: {
    netVatToPay: number;
    status: 'ok' | 'warning' | 'error';
  };
  breakdown: Array<{
    date: string;
    documentType: string;
    documentNumber: string;
    vatRate: number;
    baseAmount: number;
    vatAmount: number;
    type: 'sale' | 'purchase';
  }>;
}

export interface ClientPaymentReportFilters {
  dateFrom?: string;
  dateTo?: string;
  clientId?: number;
  status?: 'paid' | "Pending:" | 'overdue';
}

export interface ClientPaymentReportData {
  period: {
    from: string | null;
    to: string | null;
  };
  summary: {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    totalInvoices: number;
  };
  payments: Array<{
    invoiceId: number;
    invoiceNumber: string;
    invoiceDate: string;
    clientName: string;
    clientCUI: string;
    totalAmount: number;
    amountPaid: number;
    amountRemaining: number;
    dueDate: string;
    daysOverdue: number;
    status: 'paid' | "Pending:" | 'overdue';
  }>;
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
  };
}

export interface SupplierReportFilters {
  dateFrom?: string;
  dateTo?: string;
  supplierId?: number;
}

export interface SupplierReportData {
  period: {
    from: string | null;
    to: string | null;
  };
  summary: {
    totalSuppliers: number;
    totalDebt: number;
    averagePrice: number;
  };
  suppliers: Array<{
    supplierId: number;
    supplierName: string;
    supplierCUI: string;
    totalDebt: number;
    invoicesCount: number;
    averagePrice: number;
    lastOrderDate: string;
    rating: number;
  }>;
  priceAnalysis: Array<{
    productId: number;
    productName: string;
    supplierId: number;
    supplierName: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    priceVariance: number;
  }>;
}

/**
 * Fetch VAT report
 */
export async function fetchVatReport(
  filters: VatReportFilters
): Promise<VatReportData> {
  const response = await httpClient.get('/api/accounting/reports/vat', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      locationId: filters.locationId,
    },
  });
  return response.data;
}

/**
 * Fetch client payments report
 */
export async function fetchClientPaymentsReport(
  filters: ClientPaymentReportFilters
): Promise<ClientPaymentReportData> {
  const response = await httpClient.get('/api/accounting/reports/client-payments', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      clientId: filters.clientId,
      status: filters.status,
    },
  });
  return response.data;
}

/**
 * Fetch suppliers report
 */
export async function fetchSuppliersReport(
  filters: SupplierReportFilters
): Promise<SupplierReportData> {
  const response = await httpClient.get('/api/accounting/reports/suppliers', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      supplierId: filters.supplierId,
    },
  });
  return response.data;
}

/**
 * Export VAT report to Excel/PDF
 */
export async function exportVatReport(
  filters: VatReportFilters,
  format: 'excel' | 'pdf'
): Promise<Blob> {
  const response = await httpClient.get('/api/accounting/reports/vat/export', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      locationId: filters.locationId,
      format,
    },
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Consumption Situation Report
 */
export interface ConsumptionReportFilters {
  locationId?: number | null;
  periodStart: string;
  periodEnd: string;
}

export interface ConsumptionReportData {
  items: Array<{
    id: number;
    nomenclature: string;
    unit: string;
    opening_stock: number;
    opening_value: number;
    purchases_qty: number;
    purchases_value: number;
    available_qty: number;
    available_value: number;
    consumption_qty: number;
    consumption_value: number;
    consumption_percentage: number;
    closing_stock: number;
    closing_value: number;
    consumption_dishes?: number;
    average_consumption_per_dish?: number;
    consumption_by_dishes?: Array<{
      id: number;
      dish_name: string;
      consumption_qty: number;
      consumption_value: number;
      number_of_dishes_sold: number;
      consumption_per_dish?: number;
    }>;
  }>;
  totals: {
    opening_value: number;
    purchases_value: number;
    available_value: number;
    consumption_value: number;
    closing_value: number;
  };
  average_consumption_percentage: number;
  total_dishes_sold: number;
}

export async function fetchConsumptionReport(
  filters: ConsumptionReportFilters
): Promise<ConsumptionReportData> {
  const response = await httpClient.post('/api/accounting/consumption-situation', {
    locationId: filters.locationId,
    periodStart: filters.periodStart,
    periodEnd: filters.periodEnd,
  });
  // Backend returnează { success: true, data: {...} }
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  return response.data;
}

/**
 * Entries by VAT and Accounting Account Report
 */
export interface EntriesByVatFilters {
  locationId?: number | null;
  periodStart: string;
  periodEnd: string;
}

export interface EntriesByVatData {
  vat_summary: Array<{
    id: number;
    vat_percentage: number;
    total_base_value: number;
    total_vat_value: number;
    total_with_vat: number;
  }>;
  entries_by_account: Array<{
    id: number;
    account_code: string;
    account_name: string;
    total_base_value: number;
    total_vat_value: number;
    total_with_vat: number;
    document_count: number;
    entries?: Array<{
      id: number;
      nomenclature: string;
      quantity_entered: number;
      average_cost_per_unit: number;
      base_value: number;
      vat_percentage: number;
      vat_value: number;
      total_value: number;
      document_type: string;
      document_number: string;
      document_date: string;
      supplier_name?: string;
    }>;
  }>;
  totals: {
    total_base_value: number;
    total_vat_value: number;
    total_with_vat: number;
  };
}

export async function fetchEntriesByVatReport(
  filters: EntriesByVatFilters
): Promise<EntriesByVatData> {
  const response = await httpClient.post('/api/accounting/entries-by-vat', {
    locationId: filters.locationId,
    periodStart: filters.periodStart,
    periodEnd: filters.periodEnd,
  });
  // Backend returnează { success: true, data: {...} }
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  return response.data;
}

