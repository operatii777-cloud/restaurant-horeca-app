/**
 * PHASE S4.3 - Raport Lunar Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase } from './tipizate.types';

export interface RaportLunarEntry {
  id?: number;
  date: string;
  documentType: string;
  documentNumber: string;
  amount: number;
  vatAmount: number;
}

export interface RaportLunarDailyBreakdown {
  id?: number;
  dayDate: string; // PHASE S6.3 - Data zilei
  dailySales: number; // PHASE S6.3 - Vânzări zilnice
  dailyTransactions: number; // PHASE S6.3 - Tranzacții zilnice
  raportZId?: number | null; // PHASE S6.3 - FK raport_z_headers
}

export interface RaportLunarDocument extends TipizatBase {
  type: 'RAPORT_LUNAR';
  
  // PHASE S6.3 - Perioada
  month: number; // 1-12
  year: number; // 2026
  
  // PHASE S6.3 - Agregare
  totalDaysReported?: number | null; // PHASE S6.3 - Zile cu rapoarte
  totalTransactions?: number | null; // PHASE S6.3 - Total tranzacții
  totalSales?: number | null; // PHASE S6.3 - Total vânzări
  
  // PHASE S6.3 - Detalii plăți
  cashTotal?: number | null; // PHASE S6.3 - Total numerar
  cardTotal?: number | null; // PHASE S6.3 - Total card
  transferTotal?: number | null; // PHASE S6.3 - Total transfer
  otherPaymentsTotal?: number | null; // PHASE S6.3 - Alte plăți
  
  // PHASE S6.3 - TVA
  tva9Total?: number | null; // PHASE S6.3 - TVA 9% total
  tva19Total?: number | null; // PHASE S6.3 - TVA 19% total
  
  // PHASE S6.3 - Discount
  totalDiscounts?: number | null; // PHASE S6.3 - Total discount-uri
  totalReturns?: number | null; // PHASE S6.3 - Total retururi
  
  // PHASE S6.3 - Comparații
  vsPreviousMonthPercentage?: number | null; // PHASE S6.3 - % vs luna anterioară (+15%, -20%)
  vsSameMonthLastYear?: number | null; // PHASE S6.3 - % vs aceeași lună anul trecut
  
  // PHASE S6.3 - Statistici
  avgDailySales?: number | null; // PHASE S6.3 - Vânzări zilnic medii
  avgTicket?: number | null; // PHASE S6.3 - Tichet mediu
  
  // PHASE S6.3 - Export
  exportStatus?: 'draft' | 'exported' | 'submitted' | null; // PHASE S6.3 - Status export
  exportFormat?: 'saga_csv' | 'winmentor' | 'saft' | null; // PHASE S6.3 - Format export
  exportedAt?: string | null; // PHASE S6.3 - Data export
  
  // PHASE S6.3 - Metadata
  generatedBy?: number | null; // PHASE S6.3 - User ID generare
  generatedByName?: string | null; // PHASE S6.3 - Nume generare
  generatedAt?: string | null; // PHASE S6.3 - Data generare
  
  // PHASE S6.3 - Breakdown zilnic
  dailyBreakdown?: RaportLunarDailyBreakdown[] | null; // PHASE S6.3 - Breakdown pe zile
  
  entries: RaportLunarEntry[];
  totals: {
    totalSales: number;
    totalVat: number;
    totalDocuments: number;
    breakdownByType: Record<string, {
      count: number;
      amount: number;
      vatAmount: number;
    }>;
  };
}

