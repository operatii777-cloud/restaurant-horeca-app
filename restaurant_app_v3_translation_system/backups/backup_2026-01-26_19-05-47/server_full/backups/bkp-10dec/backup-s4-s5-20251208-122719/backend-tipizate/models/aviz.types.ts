/**
 * PHASE S4.3 - Aviz de Însoțire Document Types
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface AvizLine extends TipizatLine {
  productId: number;
  destinationLocationId?: number | null;
  transportMethod?: string | null;
}

export interface AvizDocument extends TipizatBase {
  type: 'AVIZ';
  supplierId?: number | null;
  supplierName?: string | null;
  destinationLocationId?: number | null;
  destinationLocationName?: string | null;
  transportMethod?: string | null;
  transportCompany?: string | null;
  driverName?: string | null;
  vehicleNumber?: string | null;
  lines: AvizLine[];
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

