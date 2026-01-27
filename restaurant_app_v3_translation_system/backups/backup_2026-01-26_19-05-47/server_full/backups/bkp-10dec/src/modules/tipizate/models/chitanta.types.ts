/**
 * PHASE S4.3 - Chitanță Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface ChitantaLine extends TipizatLine {
  invoiceId?: number | null; // Dacă chitanța este pentru o factură
  paymentAmount: number;
}

export interface ChitantaDocument extends TipizatBase {
  type: 'CHITANTA';
  clientId?: number | null;
  clientName: string;
  invoiceId?: number | null; // Dacă chitanța este pentru o factură
  invoiceNumber?: string | null;
  paymentMethod: string;
  paymentDate: string;
  lines: ChitantaLine[];
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

