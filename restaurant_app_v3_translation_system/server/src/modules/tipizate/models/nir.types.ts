/**
 * PHASE S4.2 - NIR Document Types
 * PHASE S6.2 - Enhanced with Boogit-compatible fields
 */

import { TipizatBase, TipizatLine, FiscalHeader } from './tipizate.types';

export interface NirLine extends TipizatLine {
  ingredientId: number;
  lotId?: number | null;
  purchasePrice: number;
  supplierInvoiceLineId?: number | null;
}

export interface NirDocument extends TipizatBase {
  type: 'NIR';
  
  // Furnizor
  supplierId: number;
  supplierName: string;
  supplierCUI?: string | null;
  supplierAddress?: string | null; // PHASE S6.2 - Adresă furnizor
  supplierContact?: string | null; // PHASE S6.2 - Contact furnizor (tel/email)
  supplierEmail?: string | null; // PHASE S6.2 - Email furnizor
  
  // Factură Sursă
  invoiceNumber: string;
  invoiceSeries?: string | null;
  invoiceDate?: string | null;
  invoiceId?: number | null; // PHASE S6.2 - FK invoices table
  invoiceTotalAmount?: number | null; // PHASE S6.2 - Total factură (cached)
  invoiceTvaAmount?: number | null; // PHASE S6.2 - TVA factură (cached)
  invoiceTvaRate?: number | null; // PHASE S6.2 - Cota TVA factură (9 sau 19)
  invoiceStatus?: 'draft' | 'partial' | 'paid' | 'cancelled' | null; // PHASE S6.2 - Status factură
  
  // Altele
  deliveryNote?: string | null;
  fiscalHeader?: FiscalHeader | null;
  
  lines: NirLine[];
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
    vatBreakdown: Array<{
      vatRate: number;
      baseAmount: number;
      vatAmount: number;
    }>;
  };
}

