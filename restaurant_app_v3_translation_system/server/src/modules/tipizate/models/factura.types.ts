/**
 * PHASE S4.3 - Factură Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 * PHASE S8.9 - ANAF Compliance Enhancement - Romanian Fiscal Legislation (Order 208/2022)
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface FacturaLine extends TipizatLine {
  productId: number;
  orderId?: number | null; // Dacă factura provine dintr-o comandă
}

export interface FacturaDocument extends TipizatBase {
  type: 'FACTURA';
  
  // PHASE S6.3 - Client (extins complet) + PHASE S8.9 additions
  clientId?: number | null;
  clientName: string;
  clientCUI?: string | null;
  clientRegCom?: string | null; // PHASE S8.9 - Reg. Com. client (ANAF required for B2B)
  clientAddress?: string | null;
  clientCity?: string | null; // PHASE S6.3 - Oraș client
  clientPostalCode?: string | null; // PHASE S6.3 - Cod poștal client
  clientCountry?: string | null; // PHASE S6.3 - Țară client (ISO 3166-1)
  clientPhone?: string | null; // PHASE S6.3 - Telefon client
  clientEmail?: string | null; // PHASE S6.3 - Email client
  clientRepresentative?: string | null; // PHASE S6.3 - Reprezentant client
  clientType?: 'juridic' | 'fizic' | null; // PHASE S6.3 - Tip client
  clientStatus?: 'regular' | 'vip' | 'inactive' | null; // PHASE S6.3 - Status client
  clientBankAccount?: string | null; // PHASE S8.9 - IBAN client (for B2B invoices)
  clientBankName?: string | null; // PHASE S8.9 - Nume bancă client
  
  // PHASE S6.3 - Tip Factură & Tip Vânzare
  facturaType?: 'normal' | 'simplified' | 'proforma' | null; // PHASE S6.3 - Tip factură
  saleType?: 'b2b' | 'b2c' | 'b2b2c' | null; // PHASE S6.3 - Tip vânzare
  
  // PHASE S8.9 - Document References (ANAF Order 208/2022)
  avizNumber?: string | null; // PHASE S8.9 - Nr. aviz de însoțire
  avizSeries?: string | null; // PHASE S8.9 - Serie aviz
  avizDate?: string | null; // PHASE S8.9 - Data aviz (ISO 8601)
  avizId?: number | null; // PHASE S8.9 - FK aviz documents table
  invoiceRef?: string | null; // PHASE S8.9 - Referință factură (pentru note de credit)
  invoiceRefSeries?: string | null; // PHASE S8.9 - Serie factură referință
  invoiceRefDate?: string | null; // PHASE S8.9 - Data factură referință
  
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
  
  // PHASE S8.9 - VAT & Fiscal Compliance
  reverseChargeApplicable?: boolean | null; // PHASE S8.9 - Taxare inversă (pentru UE)
  vatExemptionReason?: string | null; // PHASE S8.9 - Motiv scutire TVA
  intracomTransactionId?: string | null; // PHASE S8.9 - ID tranzacție intracomunitară
  
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

