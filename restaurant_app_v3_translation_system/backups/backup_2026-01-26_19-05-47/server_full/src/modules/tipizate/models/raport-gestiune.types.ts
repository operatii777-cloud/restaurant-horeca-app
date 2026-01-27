/**
 * PHASE S4.3 - Raport Gestiune Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface RaportGestiuneLine extends TipizatLine {
  ingredientId: number;
  productName?: string | null; // PHASE S6.3 - Nume produs
  
  // PHASE S6.3 - Stoc
  openingStock: number; // opening_qty
  openingValue?: number | null; // PHASE S6.3 - Valoare stoc inițial
  
  // PHASE S6.3 - Intrări
  received: number; // entries_qty
  receivedValue?: number | null; // PHASE S6.3 - Valoare intrări (entries_value)
  
  // PHASE S6.3 - Ieșiri
  consumed: number; // exits_qty (consum)
  consumedValue?: number | null; // PHASE S6.3 - Valoare ieșiri (exits_value)
  
  // PHASE S6.3 - Transfer
  transferred: number; // transferred_qty
  transferredValue?: number | null; // PHASE S6.3 - Valoare transfer
  
  // PHASE S6.3 - Waste/Pierderi
  waste?: number | null; // PHASE S6.3 - Cantitate pierderi (waste_qty)
  wasteValue?: number | null; // PHASE S6.3 - Valoare pierderi (waste_value)
  
  // PHASE S6.3 - Ajustări
  adjusted: number; // adjustments_qty
  adjustedValue?: number | null; // PHASE S6.3 - Valoare ajustări
  
  // PHASE S6.3 - Stoc final
  closingStock: number; // closing_qty
  closingValue?: number | null; // PHASE S6.3 - Valoare stoc final
  
  // PHASE S6.3 - Varianță
  varianceQty?: number | null; // PHASE S6.3 - Diferență cantitate
  varianceValue?: number | null; // PHASE S6.3 - Diferență valoare
  
  stockValue: number; // Backward compatibility
}

export interface RaportGestiuneDocument extends TipizatBase {
  type: 'RAPORT_GESTIUNE';
  
  // PHASE S6.3 - Locație & Gestiune
  warehouseId?: number | null; // PHASE S6.3 - FK warehouses
  warehouseName?: string | null; // PHASE S6.3 - Nume gestiune (ex: "Depozit Principal")
  
  // PHASE S6.3 - Perioada
  periodStart: string;
  periodEnd: string;
  
  // PHASE S6.3 - Stocuri
  openingBalance?: number | null; // PHASE S6.3 - Stoc la început perioada
  closingBalance?: number | null; // PHASE S6.3 - Stoc la sfârșit perioada
  
  // PHASE S6.3 - Mișcări
  totalEntries?: number | null; // PHASE S6.3 - Total intrări (total_entries)
  totalExits?: number | null; // PHASE S6.3 - Total ieșiri (total_exits)
  totalAdjustments?: number | null; // PHASE S6.3 - Ajustări (total_adjustments)
  totalWaste?: number | null; // PHASE S6.3 - Pierderi (total_waste)
  
  // PHASE S6.3 - Varianțe
  theoreticalBalance?: number | null; // PHASE S6.3 - Stoc teoretic
  physicalBalance?: number | null; // PHASE S6.3 - Stoc fizic
  variance?: number | null; // PHASE S6.3 - Diferență
  variancePercentage?: number | null; // PHASE S6.3 - % varianță
  
  // PHASE S6.3 - Valori
  openingValue?: number | null; // PHASE S6.3 - Valoare stoc inițial
  closingValue?: number | null; // PHASE S6.3 - Valoare stoc final
  
  // PHASE S6.3 - Status
  status?: 'draft' | 'completed' | 'certified' | null; // PHASE S6.3 - Status raport
  
  // PHASE S6.3 - Metadata
  certifiedBy?: number | null; // PHASE S6.3 - User ID certificare
  certifiedByName?: string | null; // PHASE S6.3 - Nume certificare
  certifiedAt?: string | null; // PHASE S6.3 - Data certificare
  
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

