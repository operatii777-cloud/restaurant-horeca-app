/**
 * PHASE S4.2 - NIR Document Types
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
  supplierId: number;
  supplierName: string;
  supplierCUI?: string | null;
  invoiceNumber: string;
  invoiceSeries?: string | null;
  invoiceDate?: string | null;
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

