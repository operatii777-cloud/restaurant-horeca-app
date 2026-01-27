/**
 * PHASE S4.3 - Raport Gestiune Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface RaportGestiuneLine extends TipizatLine {
  ingredientId: number;
  openingStock: number;
  received: number;
  consumed: number;
  transferred: number;
  adjusted: number;
  closingStock: number;
  stockValue: number;
}

export interface RaportGestiuneDocument extends TipizatBase {
  type: 'RAPORT_GESTIUNE';
  periodStart: string;
  periodEnd: string;
  lines: RaportGestiuneLine[];
  totals: {
    openingStockValue: number;
    receivedValue: number;
    consumedValue: number;
    transferredValue: number;
    adjustedValue: number;
    closingStockValue: number;
    variance: number;
  };
}

