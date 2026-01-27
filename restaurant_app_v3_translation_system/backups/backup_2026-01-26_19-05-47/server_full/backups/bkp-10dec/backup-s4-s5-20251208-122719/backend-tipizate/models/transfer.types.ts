/**
 * PHASE S4.2 - Transfer Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface TransferLine extends TipizatLine {
  ingredientId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
}

export interface TransferDocument extends TipizatBase {
  type: 'TRANSFER';
  fromLocationId: number;
  fromLocationName: string;
  fromWarehouseId: number;
  fromWarehouseName: string;
  toLocationId: number;
  toLocationName: string;
  toWarehouseId: number;
  toWarehouseName: string;
  lines: TransferLine[];
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

