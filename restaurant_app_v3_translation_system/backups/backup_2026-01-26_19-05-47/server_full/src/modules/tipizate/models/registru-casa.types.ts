/**
 * PHASE S4.3 - Registru de Casă Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase } from './tipizate.types';

export interface RegistruCasaEntry {
  id?: number;
  entryNumber: number;
  entryDate: string; // PHASE S6.3 - Data intrării
  entryTime?: string | null; // PHASE S6.3 - Ora intrării (HH:mm:ss)
  date: string; // Backward compatibility
  
  // PHASE S6.3 - Tipologie
  entryType?: 'opening_balance' | 'sales' | 'customer_payment' | 'refund' | 'withdrawal' | 'deposit' | 'expense' | 'float_adjustment' | 'closing_balance' | null; // PHASE S6.3 - Tip intrare
  
  // PHASE S6.3 - Referință
  referenceDocument?: string | null; // PHASE S6.3 - Referință document (ex: "FAC-2026-001", "RZ-2026-01")
  referenceType?: string | null; // PHASE S6.3 - Tip referință
  referenceDocumentId?: number | null; // Backward compatibility
  referenceDocumentType?: string | null; // Backward compatibility
  
  // PHASE S6.3 - Descriere
  description: string;
  
  // PHASE S6.3 - Amount
  amount?: number | null; // PHASE S6.3 - Sumă (pozitivă = încasare, negativă = plată)
  income?: number | null; // Backward compatibility
  expense?: number | null; // Backward compatibility
  balance: number; // Sold după intrare
  
  // PHASE S6.3 - Reconciliere
  reconciledWithRaportZ?: boolean | null; // PHASE S6.3 - Reconciliat cu Raport Z
  raportZId?: number | null; // PHASE S6.3 - FK raport_z_headers (dacă e vânzare)
  
  // PHASE S6.3 - Responsabil
  paymentMethod?: string | null;
  enteredBy?: number | null; // PHASE S6.3 - User ID intrare
  enteredByName?: string | null; // PHASE S6.3 - Nume intrare
  verifiedBy?: number | null; // PHASE S6.3 - User ID verificare
  verifiedByName?: string | null; // PHASE S6.3 - Nume verificare
  
  // PHASE S6.3 - Metadata
  entryTimestamp?: string | null; // PHASE S6.3 - Timestamp intrare
  verifiedAt?: string | null; // PHASE S6.3 - Data verificare
}

export interface RegistruCasaDocument extends TipizatBase {
  type: 'REGISTRU_CASA';
  
  // PHASE S6.3 - Perioada
  registruMonth?: number | null; // PHASE S6.3 - Luna (1-12)
  registruYear?: number | null; // PHASE S6.3 - Anul (2026)
  startDate: string;
  endDate: string;
  
  // PHASE S6.3 - Locație
  cashDrawerId?: number | null; // PHASE S6.3 - FK cash_drawers
  
  // PHASE S6.3 - Balanțe
  openingBalance: number; // Stoc inițial
  totalReceipts?: number | null; // PHASE S6.3 - Total încasări
  totalPayments?: number | null; // PHASE S6.3 - Total plăți
  closingBalance: number;
  
  // PHASE S6.3 - Control
  expectedClosing?: number | null; // PHASE S6.3 - Închidere așteptată (Sold Teoretic)
  actualClosing?: number | null; // PHASE S6.3 - Închidere reală (Sold Fizic Numărat)
  difference?: number | null; // PHASE S6.3 - Diferență
  concordancePercentage?: number | null; // PHASE S6.3 - % Concordanță (100% = perfect)
  
  // PHASE S6.3 - Ajustări & Varianțe
  adjustments?: number | null; // PHASE S6.3 - Ajustări & Varianțe
  
  // PHASE S6.3 - Reconciliere cu Rapoarte Z
  reconciledRaportZCount?: number | null; // PHASE S6.3 - Număr rapoarte Z reconciliate
  reconciledRaportZIds?: number[] | null; // PHASE S6.3 - ID-uri rapoarte Z reconciliate
  
  // PHASE S6.3 - Semnături digitale
  signedBy?: number | null; // PHASE S6.3 - User ID semnătură (Operator POS)
  signedByName?: string | null; // PHASE S6.3 - Nume semnătură
  signedAt?: string | null; // PHASE S6.3 - Data semnătură
  verifiedBy?: number | null; // PHASE S6.3 - User ID verificare (Manager)
  verifiedByName?: string | null; // PHASE S6.3 - Nume verificare
  verifiedAt?: string | null; // PHASE S6.3 - Data verificare
  signatureHash?: string | null; // PHASE S6.3 - Hash semnătură digitală (SHA256)
  certificateThumbprint?: string | null; // PHASE S6.3 - Certificat digital (RSA 2048-bit)
  
  // PHASE S6.3 - Status
  status?: 'draft' | 'completed' | 'verified' | 'archived' | null; // PHASE S6.3 - Status registru
  
  entries: RegistruCasaEntry[];
  totals: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
}

