/**
 * PHASE S4.2 - Bon Consum Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface BonConsumLine extends TipizatLine {
  ingredientId: number;
  departmentId?: number | null;
  departmentName?: string | null;
  reason?: string | null;
  batchId?: number | null; // PHASE S6.3 - FK batches
  stockMovementId?: number | null; // PHASE S6.3 - Auto-generate
}

export interface BonConsumDocument extends TipizatBase {
  type: 'BON_CONSUM';
  
  // PHASE S6.3 - Gestiuni
  fromWarehouseId?: number | null; // PHASE S6.3 - Gestiune sursă (ex: Depozit)
  fromWarehouseName?: string | null; // PHASE S6.3 - Nume gestiune sursă
  toWarehouseId?: number | null; // PHASE S6.3 - Gestiune destinație (ex: Bucătărie)
  toWarehouseName?: string | null; // PHASE S6.3 - Nume gestiune destinație
  
  // PHASE S6.3 - Motiv consum
  consumptionReason?: 'kitchen_use' | 'spoilage' | 'sample' | 'staff_meal' | 'promotion' | 'waste' | 'other' | null;
  departmentId?: number | null;
  departmentName?: string | null;
  reason?: string | null; // PHASE S6.3 - Motiv text (dacă other)
  
  // PHASE S6.3 - Aprobare
  approvedBy?: number | null; // PHASE S6.3 - User ID aprobare
  approvedByName?: string | null; // PHASE S6.3 - Nume aprobare
  approvedAt?: string | null; // PHASE S6.3 - Data aprobare
  
  // PHASE S6.3 - Recepție
  receivedBy?: number | null; // PHASE S6.3 - User ID recepție
  receivedByName?: string | null; // PHASE S6.3 - Nume recepție (ex: Bucătar Șef)
  receivedAt?: string | null; // PHASE S6.3 - Data recepție
  
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

