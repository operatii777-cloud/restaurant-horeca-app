/**
 * PHASE S4.2 - Waste Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface WasteLine extends TipizatLine {
  ingredientId: number;
  reason?: string | null;
  wasteType?: string | null; // Backward compatibility
  batchId?: number | null; // PHASE S6.3 - FK batches
  expiryDate?: string | null; // PHASE S6.3 - Data expirare
  discoveryDate?: string | null; // PHASE S6.3 - Data descoperire
  visualCondition?: string | null; // PHASE S6.3 - Stare vizuală (ex: "Mucegai verde")
  temperatureReading?: number | null; // PHASE S6.3 - Temperatură (frigorific)
  notes?: string | null; // PHASE S6.3 - Note linie
}

export interface WasteDocument extends TipizatBase {
  type: 'WASTE';
  
  // PHASE S6.3 - Tipologie
  wasteType?: 'expiration' | 'spoilage' | 'evaporation' | 'unsold_food' | 'dop' | 'natural_loss' | 'theft' | 'accident' | null; // PHASE S6.3 - Tip pierdere
  wasteReasonDetails?: string | null; // PHASE S6.3 - Detalii motiv
  reason?: string | null; // Backward compatibility
  
  // PHASE S6.3 - Responsabili
  locationId: number;
  departmentId?: number | null;
  departmentName?: string | null;
  reportedBy?: number | null; // PHASE S6.3 - User ID raportare
  reportedByName?: string | null; // PHASE S6.3 - Nume raportare
  approvedBy?: number | null; // PHASE S6.3 - User ID aprobare
  approvedByName?: string | null; // PHASE S6.3 - Nume aprobare
  approvedAt?: string | null; // PHASE S6.3 - Data aprobare
  
  // PHASE S6.3 - Totaluri
  totalQuantity?: number | null; // PHASE S6.3 - Cantitate totală pierdută
  totalValue?: number | null; // PHASE S6.3 - Valoare totală
  totalItems?: number | null; // PHASE S6.3 - Număr total articole
  
  // PHASE S6.3 - Impactul financiar
  estimatedLoss?: number | null; // PHASE S6.3 - Pierdere estimată
  insuranceClaim?: boolean | null; // PHASE S6.3 - Reclamație asigurare
  
  lines: WasteLine[];
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

