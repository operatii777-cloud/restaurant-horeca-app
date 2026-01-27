/**
 * PHASE S4.3 - Factură Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface FacturaLine extends TipizatLine {
  productId: number;
  orderId?: number | null; // Dacă factura provine dintr-o comandă
}

export interface FacturaDocument extends TipizatBase {
  type: 'FACTURA';
  
  // PHASE S6.3 - Client (extins complet)
  clientId?: number | null;
  clientName: string;
  clientCUI?: string | null;
  clientAddress?: string | null;
  clientCity?: string | null; // PHASE S6.3 - Oraș client
  clientPostalCode?: string | null; // PHASE S6.3 - Cod poștal client
  clientCountry?: string | null; // PHASE S6.3 - Țară client (ISO 3166-1)
  clientPhone?: string | null; // PHASE S6.3 - Telefon client
  clientEmail?: string | null; // PHASE S6.3 - Email client
  clientRepresentative?: string | null; // PHASE S6.3 - Reprezentant client
  clientType?: 'juridic' | 'fizic' | null; // PHASE S6.3 - Tip client
  clientStatus?: 'regular' | 'vip' | 'inactive' | null; // PHASE S6.3 - Status client
  
  // PHASE S6.3 - Tip Factură & Tip Vânzare
  facturaType?: 'normal' | 'simplified' | 'proforma' | null; // PHASE S6.3 - Tip factură
  saleType?: 'b2b' | 'b2c' | 'b2b2c' | null; // PHASE S6.3 - Tip vânzare
  
  // PHASE S6.3 - Conturi Bancare & Plată
  paymentMethod?: 'transfer' | 'card' | 'cash' | 'check' | null;
  bankAccountNumber?: string | null; // PHASE S6.3 - IBAN emitent
  bankName?: string | null; // PHASE S6.3 - Nume bancă
  bankSwift?: string | null; // PHASE S6.3 - SWIFT code
  bankBranch?: string | null; // PHASE S6.3 - Filială bancă
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | null; // PHASE S6.3 - Status plată
  amountPaid?: number | null; // PHASE S6.3 - Sumă plătită
  amountRemaining?: number | null; // PHASE S6.3 - Sumă rămasă
  currency?: 'RON' | 'EUR' | 'USD' | null; // PHASE S6.3 - Monedă
  currencyRate?: number | null; // PHASE S6.3 - Curs de schimb
  
  // PHASE S6.3 - E-Factura ANAF
  eFacturaStatus?: 'pending' | 'submitted' | 'approved' | 'rejected' | null; // PHASE S6.3 - Status e-Factura
  eFacturaId?: string | null; // PHASE S6.3 - ID din ANAF
  eFacturaSubmittedAt?: string | null; // PHASE S6.3 - Data trimitere
  eFacturaResponse?: string | null; // PHASE S6.3 - Răspuns ANAF
  
  // Altele
  orderId?: number | null; // Dacă factura provine dintr-o comandă
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

