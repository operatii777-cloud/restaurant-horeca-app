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
  | 'REGISTRU_JURNAL'  // PHASE S8.9 - Added
  | 'RAPORT_GESTIUNE'
  | 'AVIZ'
  | 'PROCES_VERBAL'
  | 'RETUR'
  | 'RAPORT_Z'
  | 'RAPORT_X'
  | 'RAPORT_LUNAR';

// PHASE S4.3 - All 13 document types defined
// PHASE S8.9 - Added REGISTRU_JURNAL (14 types total)

export type TipizatStatus = 'DRAFT' | 'VALIDATED' | 'SIGNED' | 'LOCKED' | 'ARCHIVED' | 'RECEIVED' | 'VARIANCE_CHECK' | 'CANCELLED' | 'EMITTED' | 'PARTIALLY_PAID' | 'PAID';

export interface TipizatBase {
  id: number;
  type: TipizatType;
  series: string;
  number: string;
  locationId: number;
  locationName: string;
  warehouseId?: number | null;
  secondaryWarehouseId?: number | null; // PHASE S6.2 - Gestiune secundară
  date: string; // ISO 8601
  receiptDate?: string | null; // PHASE S6.2 - Data fizică primire
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
  transportCompany?: string | null; // PHASE S6.2 - Companie transport
  responsiblePerson?: string | null; // PHASE S6.2 - Operator primire
}

export interface TipizatLine {
  id?: number;
  lineNumber: number;
  productId?: number | null;
  productName: string;
  productCode?: string | null;
  productDescription?: string | null; // PHASE S6.2 - Descriere produs
  unit: string;
  unitId?: number | null; // PHASE S6.2 - FK measurement_units
  unitConversionFactor?: number | null; // PHASE S6.2 - Factor conversie unități
  quantity: number; // PHASE S6.2 - Cantitate principală (pentru backward compatibility)
  quantityInvoiced?: number | null; // PHASE S6.2 - Cantitate pe factură
  quantityReceived?: number | null; // PHASE S6.2 - Cantitate primită (fizic)
  quantityDifference?: number | null; // PHASE S6.2 - Diferență (auto-calculat)
  quantityVarianceType?: 'normal' | 'excess' | 'deficit' | null; // PHASE S6.2 - Tip varianță
  unitPrice: number;
  discountPercentage?: number | null; // PHASE S6.2 - Discount %
  discountAmount?: number | null; // PHASE S6.2 - Discount amount
  totalAmountAfterDiscount?: number | null; // PHASE S6.2 - Total după discount
  vatRate: number;
  totalWithoutVat: number;
  totalVat: number;
  totalWithVat: number;
  batchNumber?: string | null;
  expiryDate?: string | null;
  lineStatus?: 'draft' | 'received' | 'variance' | 'rejected' | null; // PHASE S6.2 - Status linie
  rejectionReason?: string | null; // PHASE S6.2 - Motiv respingere
  receivedAt?: string | null; // PHASE S6.2 - Data primire linie
  productCategoryId?: number | null; // PHASE S6.3 - FK product categories
  isPromotional?: boolean | null; // PHASE S6.3 - Item promotional
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
  companyCity?: string | null; // PHASE S6.3 - Oraș
  companyPostalCode?: string | null; // PHASE S6.3 - Cod poștal
  companyCountry?: string | null; // PHASE S6.3 - Țară (ISO 3166-1)
  companyPhone?: string | null;
  companyEmail?: string | null;
  fiscalCode: string;
  regCom?: string | null; // PHASE S6.3 - Reg. Com.
  representative?: string | null; // PHASE S6.3 - Reprezentant
  bankAccount?: string | null; // PHASE S6.3 - IBAN
}

