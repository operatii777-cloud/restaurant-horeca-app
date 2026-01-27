/**
 * PHASE S4.3 - Chitanță Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface ChitantaLine extends TipizatLine {
  invoiceId?: number | null; // Dacă chitanța este pentru o factură
  facturaLineId?: number | null; // PHASE S6.3 - FK factura_lines
  paymentAmount: number;
}

export interface ChitantaDocument extends TipizatBase {
  type: 'CHITANTA';
  
  // PHASE S6.3 - Timp emisiei
  chitantaTime?: string | null; // PHASE S6.3 - Ora emisiei (HH:mm:ss)
  
  // PHASE S6.3 - Status
  paymentStatus?: 'partial' | 'complete' | null; // PHASE S6.3 - Status plată
  
  // PHASE S6.3 - Conexiuni
  clientId?: number | null;
  clientName: string;
  clientCUI?: string | null; // PHASE S6.3 - CUI client
  clientPhone?: string | null; // PHASE S6.3 - Telefon client
  invoiceId?: number | null; // Dacă chitanța este pentru o factură
  invoiceNumber?: string | null;
  orderId?: number | null; // PHASE S6.3 - FK orders
  
  // PHASE S6.3 - Plată
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check';
  paymentDate: string;
  amountReceived: number; // PHASE S6.3 - Suma primită
  amountCredited?: number | null; // PHASE S6.3 - Suma creditată
  changeAmount?: number | null; // PHASE S6.3 - Rest
  
  // PHASE S6.3 - Referință plată
  paymentReference?: string | null; // PHASE S6.3 - Referință platitor (ex: TRF-20260103-001)
  transferDate?: string | null; // PHASE S6.3 - Dată transfer
  transferTime?: string | null; // PHASE S6.3 - Oră transfer
  
  // PHASE S6.3 - Conturi bancare
  bankAccountNumber?: string | null; // PHASE S6.3 - IBAN destinație
  bankName?: string | null; // PHASE S6.3 - Bancă
  
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

