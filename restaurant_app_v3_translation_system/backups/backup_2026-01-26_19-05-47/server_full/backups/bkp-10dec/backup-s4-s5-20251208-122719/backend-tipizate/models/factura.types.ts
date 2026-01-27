/**
 * PHASE S4.3 - Factură Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface FacturaLine extends TipizatLine {
  productId: number;
  orderId?: number | null; // Dacă factura provine dintr-o comandă
}

export interface FacturaDocument extends TipizatBase {
  type: 'FACTURA';
  clientId?: number | null;
  clientName: string;
  clientCUI?: string | null;
  clientAddress?: string | null;
  orderId?: number | null; // Dacă factura provine dintr-o comandă
  paymentMethod?: string | null;
  paymentDueDate?: string | null;
  lines: FacturaLine[];
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

