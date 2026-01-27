/**
 * PHASE S4.2 - Inventar Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export type InventoryType = 'full' | 'partial' | 'cycle_count';

export interface InventarLine extends TipizatLine {
  ingredientId: number;
  productCategory?: string | null; // PHASE S6.3 - Categorie produs
  bookQuantity: number; // Cantitate în sistem (system_quantity)
  physicalQuantity: number; // Cantitate fizică numărată (counted_quantity)
  difference: number; // Diferență (variance_quantity)
  differenceValue: number; // Valoare diferență (variance_value)
  varianceType?: 'ok' | 'deficit' | 'surplus' | null; // PHASE S6.3 - Tip varianță
  varianceReasonId?: number | null; // PHASE S6.3 - FK inventory_variance_reasons
  countedBy?: number | null; // PHASE S6.3 - User care a numărat
  countDate?: string | null; // PHASE S6.3 - Data numărării
  batchId?: number | null; // PHASE S6.3 - FK batches
  expiryDate?: string | null; // PHASE S6.3 - Data expirare
  notes?: string | null; // PHASE S6.3 - Note linie
}

export interface InventarDocument extends TipizatBase {
  type: 'INVENTAR';
  
  // PHASE S6.3 - Perioada inventar
  inventoryType: InventoryType;
  periodStart?: string | null; // PHASE S6.3 - Perioada început
  periodEnd?: string | null; // PHASE S6.3 - Perioada sfârșit
  startDate: string; // Data inventarului
  endDate?: string | null;
  isYearEnd?: boolean | null; // PHASE S6.3 - Inventar de an (31 dec)
  
  // PHASE S6.3 - Statistici
  totalItemsCounted?: number | null; // PHASE S6.3 - Total articole numărate
  totalItemsSystem?: number | null; // PHASE S6.3 - Total articole în sistem
  itemsWithVariance?: number | null; // PHASE S6.3 - Articole cu varianță
  
  totalValueSystem?: number | null; // PHASE S6.3 - Valoare totală sistem
  totalValueCounted?: number | null; // PHASE S6.3 - Valoare totală numărată
  totalVariance?: number | null; // PHASE S6.3 - Varianță totală (pozitiv = surplus)
  variancePercentage?: number | null; // PHASE S6.3 - % varianță
  
  // PHASE S6.3 - Echipa
  startedBy?: number | null; // PHASE S6.3 - User ID început
  startedByName?: string | null; // PHASE S6.3 - Nume început (ex: Manager)
  startedAt?: string | null; // PHASE S6.3 - Data început
  completedBy?: number | null; // PHASE S6.3 - User ID finalizare
  completedByName?: string | null; // PHASE S6.3 - Nume finalizare
  completedAt?: string | null; // PHASE S6.3 - Data finalizare
  certifiedBy?: number | null; // PHASE S6.3 - User ID certificare
  certifiedByName?: string | null; // PHASE S6.3 - Nume certificare
  certifiedAt?: string | null; // PHASE S6.3 - Data certificare
  
  // PHASE S6.3 - Dări seama
  countedByUserId?: number | null;
  countedByName?: string | null;
  anomalies?: string | null; // PHASE S6.3 - Anomalii constatate
  notes?: string | null;
  
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

