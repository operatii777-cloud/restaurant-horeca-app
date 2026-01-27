/**
 * PHASE S4.3 - Retur / Restituire Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export type ReturType = 'SUPPLIER' | 'CUSTOMER' | 'INTERNAL';

export interface ReturLine extends TipizatLine {
  productId: number;
  originalDocumentId?: number | null;
  originalDocumentType?: string | null;
  reason: string;
  specificReason?: string | null; // PHASE S6.3 - Motiv specific linie
  batchId?: number | null; // PHASE S6.3 - FK batches
}

export interface ReturDocument extends TipizatBase {
  type: 'RETUR';
  
  returType: ReturType;
  
  // PHASE S6.3 - Referință
  facturaId?: number | null; // PHASE S6.3 - FK factura_headers
  nirId?: number | null; // PHASE S6.3 - FK nir_headers
  
  // PHASE S6.3 - Supplier
  supplierId?: number | null;
  supplierName?: string | null;
  supplierCUI?: string | null; // PHASE S6.3 - CUI furnizor
  supplierAddress?: string | null; // PHASE S6.3 - Adresă furnizor
  
  // PHASE S6.3 - Client (dacă retur către client)
  clientId?: number | null;
  clientName?: string | null;
  
  // PHASE S6.3 - Motiv retur
  returnReason?: 'quality_defect' | 'quantity_excess' | 'expired' | 'wrong_product' | 'damaged_in_transport' | 'non_conformity' | null; // PHASE S6.3 - Motiv retur
  returnReasonDetails?: string | null; // PHASE S6.3 - Detalii motiv
  reason: string; // Backward compatibility
  
  // PHASE S6.3 - Totaluri
  totalItems?: number | null; // PHASE S6.3 - Număr total articole
  totalValue?: number | null; // PHASE S6.3 - Valoare creditare
  
  // PHASE S6.3 - Transport
  transportMethod?: 'own_vehicle' | 'courier' | 'supplier_pickup' | null; // PHASE S6.3 - Metodă transport
  returnDate?: string | null; // PHASE S6.3 - Data returnării efective
  
  // PHASE S6.3 - Creditare
  creditNoteId?: number | null; // PHASE S6.3 - FK factura (notă credit)
  creditStatus?: 'pending' | 'approved' | 'applied' | null; // PHASE S6.3 - Status creditare
  creditAppliedDate?: string | null; // PHASE S6.3 - Data aplicare credit
  
  // PHASE S6.3 - Aprobare
  originalDocumentId?: number | null;
  originalDocumentType?: string | null;
  approvedBy?: number | null; // PHASE S6.3 - User ID aprobare
  approvedByName?: string | null; // PHASE S6.3 - Nume aprobare
  approvedAt?: string | null; // PHASE S6.3 - Data aprobare
  returnedAt?: string | null; // PHASE S6.3 - Data returnare efectivă
  
  lines: ReturLine[];
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

