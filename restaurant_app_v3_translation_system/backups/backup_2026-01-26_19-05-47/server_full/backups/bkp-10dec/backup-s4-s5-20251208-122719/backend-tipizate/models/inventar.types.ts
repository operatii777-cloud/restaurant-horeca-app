/**
 * PHASE S4.2 - Inventar Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export type InventoryType = 'FULL' | 'PARTIAL' | 'CYCLE';

export interface InventarLine extends TipizatLine {
  ingredientId: number;
  bookQuantity: number; // Cantitate în carte
  physicalQuantity: number; // Cantitate fizică
  difference: number; // Diferență
  differenceValue: number; // Valoare diferență
}

export interface InventarDocument extends TipizatBase {
  type: 'INVENTAR';
  inventoryType: InventoryType;
  startDate: string;
  endDate?: string | null;
  countedByUserId?: number | null;
  countedByName?: string | null;
  lines: InventarLine[];
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
    bookTotal: number;
    physicalTotal: number;
    differenceTotal: number;
    vatBreakdown: Array<{
      vatRate: number;
      baseAmount: number;
      vatAmount: number;
    }>;
  };
}

