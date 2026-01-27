/**
 * PHASE S4.2 - Tipizate Enterprise API Types
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

export type TipizatStatus = 'DRAFT' | 'VALIDATED' | 'SIGNED' | 'LOCKED' | 'ARCHIVED';

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

export interface NirDocument {
  id: number;
  type: 'NIR';
  series: string;
  number: string;
  locationId: number;
  locationName: string;
  warehouseId?: number | null;
  date: string;
  status: TipizatStatus;
  supplierId: number;
  supplierName: string;
  supplierCUI?: string | null;
  invoiceNumber: string;
  invoiceSeries?: string | null;
  invoiceDate?: string | null;
  deliveryNote?: string | null;
  lines: TipizatLine[];
  totals: TipizatTotals;
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
  createdByName?: string;
  signedByUserId?: number | null;
  signedByName?: string | null;
  signedAt?: string | null;
  version: number;
  notes?: string | null;
}

export interface BonConsumDocument {
  id: number;
  type: 'BON_CONSUM';
  series: string;
  number: string;
  locationId: number;
  locationName: string;
  warehouseId?: number | null;
  date: string;
  status: TipizatStatus;
  departmentId?: number | null;
  departmentName?: string | null;
  reason?: string | null;
  lines: TipizatLine[];
  totals: TipizatTotals;
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
  version: number;
}

export interface TransferDocument {
  id: number;
  type: 'TRANSFER';
  series: string;
  number: string;
  fromLocationId: number;
  fromLocationName: string;
  fromWarehouseId: number;
  fromWarehouseName: string;
  toLocationId: number;
  toLocationName: string;
  toWarehouseId: number;
  toWarehouseName: string;
  date: string;
  status: TipizatStatus;
  lines: TipizatLine[];
  totals: TipizatTotals;
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
  version: number;
}

export interface InventarDocument {
  id: number;
  type: 'INVENTAR';
  series: string;
  number: string;
  locationId: number;
  locationName: string;
  warehouseId?: number | null;
  date: string;
  status: TipizatStatus;
  inventoryType: 'FULL' | 'PARTIAL' | 'CYCLE';
  startDate: string;
  endDate?: string | null;
  lines: TipizatLine[];
  totals: TipizatTotals & {
    bookTotal: number;
    physicalTotal: number;
    differenceTotal: number;
  };
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
  version: number;
}

