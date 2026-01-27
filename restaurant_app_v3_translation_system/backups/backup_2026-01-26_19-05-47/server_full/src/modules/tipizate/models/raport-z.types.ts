/**
 * PHASE S4.3 - Raport Z (Daily Closing Report) Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase } from './tipizate.types';

export interface RaportZEntry {
  id?: number;
  paymentMethod: string;
  count: number;
  amount: number;
}

export interface RaportZDocument extends TipizatBase {
  type: 'RAPORT_Z';
  
  // PHASE S6.3 - Timp emisiei
  raportZTime?: string | null; // PHASE S6.3 - Ora raport (23:59 - 00:00)
  
  // PHASE S6.3 - Locație
  reportDate: string;
  cashRegisterId?: number | null;
  cashRegisterSerial?: string | null; // PHASE S6.3 - NrSerie POS
  
  // PHASE S6.3 - Tranzacții zilei
  openingAmount: number;
  closingAmount: number;
  totalSales?: number | null; // PHASE S6.3 - Total vânzări
  totalTransactions?: number | null; // PHASE S6.3 - Număr tranzacții
  
  // PHASE S6.3 - Plăți complete
  cashReceived?: number | null; // PHASE S6.3 - Numerar primit
  cardPayments?: number | null; // PHASE S6.3 - Plăți card
  transferPayments?: number | null; // PHASE S6.3 - Plăți transfer
  checkPayments?: number | null; // PHASE S6.3 - Plăți cec
  voucherPayments?: number | null; // PHASE S6.3 - Plăți voucher
  
  // PHASE S6.3 - Discount & Returns
  totalDiscount?: number | null; // PHASE S6.3 - Total discount
  totalReturns?: number | null; // PHASE S6.3 - Total retururi
  totalCancellations?: number | null; // PHASE S6.3 - Total anulări
  
  // PHASE S6.3 - TVA Detail
  salesNetAmount?: number | null; // PHASE S6.3 - Vânzări nete
  tva9Base?: number | null; // PHASE S6.3 - Baza TVA 9%
  tva9Amount?: number | null; // PHASE S6.3 - TVA 9%
  tva19Base?: number | null; // PHASE S6.3 - Baza TVA 19%
  tva19Amount?: number | null; // PHASE S6.3 - TVA 19%
  totalVat?: number | null; // PHASE S6.3 - Total TVA
  
  // PHASE S6.3 - Vânzări per categorie
  foodSales?: number | null; // PHASE S6.3 - Vânzări mâncare
  beveragesSales?: number | null; // PHASE S6.3 - Vânzări băuturi
  otherSales?: number | null; // PHASE S6.3 - Alte vânzări
  
  // PHASE S6.3 - Secvență numerică
  firstReceiptNumber?: number | null; // PHASE S6.3 - Primul bon fiscal
  lastReceiptNumber?: number | null; // PHASE S6.3 - Ultimul bon fiscal
  sequentialCounter?: number | null; // PHASE S6.3 - Contor secvențial
  
  // PHASE S6.3 - Numerar control
  expectedCash?: number | null; // PHASE S6.3 - Bani așteptați
  actualCashCounted?: number | null; // PHASE S6.3 - Bani numărați
  cashDifference?: number | null; // PHASE S6.3 - Diferență
  
  // PHASE S6.3 - Semnături digitale
  signedBy?: number | null; // PHASE S6.3 - Operator POS
  signedByName?: string | null; // PHASE S6.3 - Nume operator
  signedAt?: string | null; // PHASE S6.3 - Data semnătură
  managerApprovedBy?: number | null; // PHASE S6.3 - Manager aprobare
  managerApprovedByName?: string | null; // PHASE S6.3 - Nume manager
  managerApprovedAt?: string | null; // PHASE S6.3 - Data aprobare manager
  
  // PHASE S6.3 - E-Fiscalitate
  eReceiptStatus?: 'pending' | 'submitted' | 'approved' | 'failed' | null; // PHASE S6.3 - Status e-receiptă
  eReceiptXml?: string | null; // PHASE S6.3 - UBL XML
  anafSubmissionId?: string | null; // PHASE S6.3 - ID trimitere ANAF
  anafResponse?: string | null; // PHASE S6.3 - Răspuns ANAF
  
  // PHASE S6.3 - Status
  status?: 'draft' | 'finalized' | 'locked' | 'archived' | null; // PHASE S6.3 - Status raport
  isLocked?: boolean | null; // PHASE S6.3 - Nu se mai poate edita
  
  // PHASE S6.3 - Metadata
  notes?: string | null; // PHASE S6.3 - Note
  finalizedAt?: string | null; // PHASE S6.3 - Data finalizare
  lockedAt?: string | null; // PHASE S6.3 - Data blocare
  
  entries: RaportZEntry[];
  totals: {
    totalSales: number;
    totalPayments: number;
    totalVat: number;
    variance: number;
  };
}

