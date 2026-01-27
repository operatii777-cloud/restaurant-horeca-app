/**
 * PHASE S4.3 - Registru de Casă Document Types
 */

import { TipizatBase } from './tipizate.types';

export interface RegistruCasaEntry {
  id?: number;
  entryNumber: number;
  date: string;
  description: string;
  income?: number | null;
  expense?: number | null;
  balance: number;
  paymentMethod?: string | null;
  referenceDocumentId?: number | null;
  referenceDocumentType?: string | null;
}

export interface RegistruCasaDocument extends TipizatBase {
  type: 'REGISTRU_CASA';
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  entries: RegistruCasaEntry[];
  totals: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
}

