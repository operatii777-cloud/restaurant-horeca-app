/**
 * PHASE S8.9 - Registru Jurnal Document Types
 * ANAF Compliance - Registru Jurnal Vânzări/Cumpărări
 * Required by Romanian fiscal legislation (OUG 28/1999, Ordin 2861/2009)
 */

import { TipizatBase } from './tipizate.types';

export type JournalType = 'VANZARI' | 'CUMPARARI';
export type JournalEntryType = 'FACTURA' | 'NIR' | 'BON_FISCAL' | 'CHITANTA' | 'AVIZ' | 'NOTE_CREDIT' | 'NOTE_DEBIT';

export interface JournalEntry {
  lineNumber: number;
  
  // Document Info
  documentType: JournalEntryType;
  documentSeries: string;
  documentNumber: string;
  documentDate: string; // ISO 8601
  
  // Partner Info (furnizor pentru cumpărări, client pentru vânzări)
  partnerName: string;
  partnerCUI?: string | null;
  partnerRegCom?: string | null;
  partnerAddress?: string | null;
  
  // Document Totals
  baseAmount: number;          // Bază de calcul TVA (fără TVA)
  vatAmount: number;           // Valoare TVA
  totalAmount: number;         // Total cu TVA
  vatRate: number;             // Cota TVA aplicată
  
  // Optional fields
  discount?: number | null;    // Discount acordat
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check' | null;
  currency?: 'RON' | 'EUR' | 'USD' | null;
  currencyRate?: number | null;
  
  // References
  sourceDocumentId?: number | null;  // FK către document original
  notes?: string | null;
}

export interface JournalTotals {
  // Totals by VAT rate
  vatBreakdown: Array<{
    vatRate: number;
    baseAmount: number;
    vatAmount: number;
    totalAmount: number;
    numberOfEntries: number;
  }>;
  
  // Grand totals
  totalBaseAmount: number;
  totalVatAmount: number;
  totalAmount: number;
  totalEntries: number;
  
  // Payment method breakdown (pentru vânzări)
  paymentBreakdown?: Array<{
    paymentMethod: string;
    amount: number;
    numberOfTransactions: number;
  }>;
}

export interface RegistruJurnalDocument extends TipizatBase {
  type: 'REGISTRU_JURNAL';
  
  // Journal Type
  journalType: JournalType;  // VANZARI sau CUMPARARI
  
  // Period
  startDate: string;  // ISO 8601 - început perioadă
  endDate: string;    // ISO 8601 - sfârșit perioadă
  fiscalMonth?: number | null;  // Luna fiscală (1-12)
  fiscalYear?: number | null;   // An fiscal
  
  // Entries
  entries: JournalEntry[];
  
  // Totals
  totals: JournalTotals;
  
  // Additional metadata
  generatedAt?: string | null;  // ISO 8601 - când a fost generat
  generatedByUserId?: number | null;
  generatedByName?: string | null;
  
  // Approval
  approvedByUserId?: number | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  
  // Submission to accounting
  exportedToAccounting?: boolean | null;
  exportedAt?: string | null;
  exportFormat?: 'SAGA' | 'SAF-T' | 'CSV' | 'EXCEL' | null;
}
