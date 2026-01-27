/**
 * PHASE S4.3 - Retur / Restituire Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export type ReturType = 'SUPPLIER' | 'CUSTOMER' | 'INTERNAL';

export interface ReturLine extends TipizatLine {
  productId: number;
  originalDocumentId?: number | null;
  originalDocumentType?: string | null;
  reason: string;
}

export interface ReturDocument extends TipizatBase {
  type: 'RETUR';
  returType: ReturType;
  supplierId?: number | null;
  supplierName?: string | null;
  clientId?: number | null;
  clientName?: string | null;
  reason: string;
  originalDocumentId?: number | null;
  originalDocumentType?: string | null;
  lines: ReturLine[];
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

