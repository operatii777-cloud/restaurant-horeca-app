/**
 * PHASE S4.3 - Proces Verbal Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export type ProcesVerbalType = 'DIFFERENCE' | 'LOSS' | 'DAMAGE' | 'THEFT' | 'OTHER';

export interface ProcesVerbalLine extends TipizatLine {
  ingredientId: number;
  reason: string;
  responsiblePersonId?: number | null;
  responsiblePersonName?: string | null;
}

export interface ProcesVerbalDocument extends TipizatBase {
  type: 'PROCES_VERBAL';
  procesVerbalType: ProcesVerbalType;
  locationId: number;
  locationName: string;
  reason: string;
  responsiblePersonId?: number | null;
  responsiblePersonName?: string | null;
  witness1Id?: number | null;
  witness1Name?: string | null;
  witness2Id?: number | null;
  witness2Name?: string | null;
  lines: ProcesVerbalLine[];
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

