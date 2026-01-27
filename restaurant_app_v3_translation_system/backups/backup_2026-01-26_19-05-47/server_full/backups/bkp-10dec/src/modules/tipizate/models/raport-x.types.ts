/**
 * PHASE S4.3 - Raport X (Z Report) Document Types
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
  reportDate: string;
  cashRegisterId?: number | null;
  openingAmount: number;
  closingAmount: number;
  entries: RaportXEntry[];
  totals: {
    totalSales: number;
    totalPayments: number;
    variance: number;
  };
}

