/**
 * PHASE S4.2 - Bon Consum Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface BonConsumLine extends TipizatLine {
  ingredientId: number;
  departmentId?: number | null;
  departmentName?: string | null;
  reason?: string | null;
}

export interface BonConsumDocument extends TipizatBase {
  type: 'BON_CONSUM';
  departmentId?: number | null;
  departmentName?: string | null;
  reason?: string | null;
  lines: BonConsumLine[];
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
    vatBreakdown: Array<{
      vatRate: number;
      baseAmount: number;
      vatAmount: number;
    }>;
  };
}

