/**
 * PHASE S4.2 - Tipizate Enterprise Types
 * Base types for all tipizate documents
 */

export type TipizatType =
  | 'NIR'
  | 'BON_CONSUM'
  | 'TRANSFER'
  | 'INVENTAR'
  | 'FACTURA'
  | 'CHITANTA'
  | 'REGISTRU_CASA'
  | 'RAPORT_GESTIUNE'
  | 'AVIZ'
  | 'PROCES_VERBAL'
  | 'RETUR'
  | 'RAPORT_Z'
  | 'RAPORT_X'
  | 'RAPORT_LUNAR';

// PHASE S4.3 - All 13 document types defined

export type TipizatStatus = 'DRAFT' | 'VALIDATED' | 'SIGNED' | 'LOCKED' | 'ARCHIVED';

export interface TipizatBase {
  id: number;
  type: TipizatType;
  series: string;
  number: string;
  locationId: number;
  locationName: string;
  warehouseId?: number | null;
  date: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
  status: TipizatStatus;
  createdByUserId: number;
  createdByName?: string;
  validatedByUserId?: number | null;
  validatedByName?: string | null;
  signedByUserId?: number | null;
  signedByName?: string | null;
  signedAt?: string | null;
  lockedByUserId?: number | null;
  lockedByName?: string | null;
  lockedAt?: string | null;
  archivedAt?: string | null;
  fiscalDocumentId?: number | null; // legătură cu fiscalizare, unde e cazul
  version: number;
  notes?: string | null;
}

export interface TipizatLine {
  id?: number;
  lineNumber: number;
  productId?: number | null;
  productName: string;
  productCode?: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  totalWithoutVat: number;
  totalVat: number;
  totalWithVat: number;
  batchNumber?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
}

export interface TipizatTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
  vatBreakdown: Array<{
    vatRate: number;
    baseAmount: number;
    vatAmount: number;
  }>;
}

export interface FiscalHeader {
  companyName: string;
  companyCUI: string;
  companyAddress: string;
  companyPhone?: string | null;
  companyEmail?: string | null;
  fiscalCode: string;
}

