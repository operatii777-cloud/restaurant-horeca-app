/**
 * PHASE S4.3 - Raport Lunar Document Types
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

export interface RaportLunarDocument extends TipizatBase {
  type: 'RAPORT_LUNAR';
  month: number;
  year: number;
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

