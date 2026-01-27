/**
 * PHASE S11 - Invoice Types
 * 
 * Types for e-Factura UBL (ANAF) invoices.
 * Used by all e-Factura React modules.
 */

export type EFacturaStatus =
  | 'PENDING_GENERATION'     // așteaptă generare
  | 'GENERATED'              // UBL creat, ne-trimis la ANAF
  | 'PENDING_SUBMIT'         // în coada ANAF
  | 'SUBMITTED'              // trimis, așteaptă răspuns
  | 'ACCEPTED'               // acceptat de ANAF
  | 'REJECTED'               // respins de ANAF
  | 'ERROR'                  // eroare tehnică
  | 'CANCELLED';             // anulată manual

export type InvoiceDocumentType = 'INVOICE' | 'PROFORMA' | 'CREDIT_NOTE' | 'OTHER';

export interface EFacturaInvoice {
  id: number;
  invoiceNumber: string;
  orderId?: number | null;
  tipizateId?: number | null;
  tipizateType?: string | null;
  documentType: InvoiceDocumentType;
  customerName: string;
  customerVatId?: string | null;
  totalAmount: number;
  currency: string;
  status: EFacturaStatus;
  anafMessage?: string | null;
  anafLastStatusCode?: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  // flags / meta
  hasPdf?: boolean;
  hasXml?: boolean;
  ublXml?: string | null;
}

export interface EFacturaFilter {
  status?: EFacturaStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  search?: string; // nr factură, client, CUI
  source?: 'orders' | 'tipizate' | 'all';
}

export interface EFacturaStats {
  totalInvoices: number;
  acceptedCount: number;
  rejectedCount: number;
  errorCount: number;
  pendingCount: number;
  totalAmountAccepted: number;
  totalAmountRejected: number;
  queueCount: number;
  period: {
    dateFrom: string;
    dateTo: string;
  };
}

export interface EFacturaChartData {
  date: string;
  accepted: number;
  rejected: number;
  error: number;
  totalAmount: number;
}

