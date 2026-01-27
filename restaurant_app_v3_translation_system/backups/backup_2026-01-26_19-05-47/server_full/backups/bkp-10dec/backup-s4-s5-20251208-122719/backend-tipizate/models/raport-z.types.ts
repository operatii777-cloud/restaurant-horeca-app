/**
 * PHASE S4.3 - Raport Z (Daily Report) Document Types
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
  reportDate: string;
  cashRegisterId?: number | null;
  openingAmount: number;
  closingAmount: number;
  entries: RaportZEntry[];
  totals: {
    totalSales: number;
    totalPayments: number;
    totalVat: number;
    variance: number;
  };
}

