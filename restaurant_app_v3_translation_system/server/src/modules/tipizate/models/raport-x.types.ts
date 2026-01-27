/**
 * PHASE S4.3 - Raport X (Interim Daily Report) Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase } from './tipizate.types';

export interface RaportXEntry {
  id?: number;
  paymentMethod: string;
  count: number;
  amount: number;
}

export interface RaportXDocument extends TipizatBase {
  type: 'RAPORT_X';
  
  // PHASE S6.3 - Timp emisiei
  raportXTime?: string | null; // PHASE S6.3 - Ora raport (HH:mm:ss)
  raportXSequence?: number | null; // PHASE S6.3 - Secvență (1st, 2nd, 3rd X report)
  
  // PHASE S6.3 - Locație
  reportDate: string;
  cashRegisterId?: number | null;
  cashRegisterSerial?: string | null; // PHASE S6.3 - NrSerie POS
  
  // PHASE S6.3 - Perioada
  periodStartTime?: string | null; // PHASE S6.3 - Ora începere
  periodEndTime?: string | null; // PHASE S6.3 - Ora raport
  
  // PHASE S6.3 - Tranzacții
  openingAmount: number;
  closingAmount: number;
  totalSales?: number | null; // PHASE S6.3 - Total vânzări
  totalTransactions?: number | null; // PHASE S6.3 - Nr comenzi
  
  // PHASE S6.3 - Plăți
  cashReceived?: number | null; // PHASE S6.3 - Numerar primit
  cardPayments?: number | null; // PHASE S6.3 - Plăți card
  transferPayments?: number | null; // PHASE S6.3 - Plăți transfer
  checkPayments?: number | null; // PHASE S6.3 - Plăți cec
  otherPayments?: number | null; // PHASE S6.3 - Alte plăți
  
  // PHASE S6.3 - TVA
  tva9Amount?: number | null; // PHASE S6.3 - TVA 9%
  tva19Amount?: number | null; // PHASE S6.3 - TVA 19%
  
  // PHASE S6.3 - Discount
  totalDiscount?: number | null; // PHASE S6.3 - Total discount
  discountCount?: number | null; // PHASE S6.3 - Număr discount-uri
  
  // PHASE S6.3 - Return/Cancel
  returnsCount?: number | null; // PHASE S6.3 - Număr retururi
  returnsValue?: number | null; // PHASE S6.3 - Valoare retururi
  cancellationsCount?: number | null; // PHASE S6.3 - Număr anulări
  
  // PHASE S6.3 - Cumulative
  cumulativeSalesDay?: number | null; // PHASE S6.3 - Total de la început de zi
  
  // PHASE S6.3 - Metadata
  printedBy?: number | null; // PHASE S6.3 - User ID tipărire
  printedByName?: string | null; // PHASE S6.3 - Nume tipărire
  printedAt?: string | null; // PHASE S6.3 - Data tipărire
  isFinal?: boolean | null; // PHASE S6.3 - Nu e RAPORT X, ci interim (FALSE)
  
  entries: RaportXEntry[];
  totals: {
    totalSales: number;
    totalPayments: number;
    variance: number;
  };
}

