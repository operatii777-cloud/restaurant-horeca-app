/**
 * PHASE S5.3 - Tipizate Config Engine
 * Central configuration for all tipizate documents
 */

import { TipizatType } from '../api/types';

export interface TipizatField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'autocomplete';
  required?: boolean;
  width?: number;
  options?: string[];
}

export interface TipizatColumn {
  field: string;
  headerName: string;
  type?: 'text' | 'number' | 'currency' | 'uom' | 'ingredient';
  editable?: boolean;
  width?: number;
}

export interface TipizatSchema {
  type: TipizatType;
  name: string;
  header: TipizatField[];
  columns: TipizatColumn[];
  totals: string[];
}

export const TIPIZATE_SCHEMAS: Record<TipizatType, TipizatSchema> = {
  NIR: {
    type: 'NIR',
    name: 'NIR',
    header: [
      { name: 'supplierName', label: 'Furnizor', type: 'autocomplete', required: true },
      { name: 'invoiceNumber', label: 'Număr Factură', type: 'text', required: true },
      { name: 'date', label: 'Data Document', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
      { name: 'locationName', label: 'Locație', type: 'autocomplete', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Produs', type: 'ingredient', editable: true, width: 200 },
      { field: 'unit', headerName: 'UM', type: 'uom', editable: true, width: 80 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Preț', type: 'currency', editable: true, width: 120 },
      { field: 'vatRate', headerName: 'TVA%', type: 'number', editable: true, width: 80 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'vatAmount', 'total'],
  },
  BON_CONSUM: {
    type: 'BON_CONSUM',
    name: 'Bon Consum',
    header: [
      { name: 'locationName', label: 'Locație', type: 'autocomplete', required: true },
      { name: 'date', label: 'Data', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Ingredient', type: 'ingredient', editable: true, width: 200 },
      { field: 'unit', headerName: 'UM', type: 'uom', editable: true, width: 80 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Cost', type: 'currency', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'total'],
  },
  TRANSFER: {
    type: 'TRANSFER',
    name: 'Transfer Gestiuni',
    header: [
      { name: 'fromLocationName', label: 'De la Locație', type: 'autocomplete', required: true },
      { name: 'toLocationName', label: 'Către Locație', type: 'autocomplete', required: true },
      { name: 'date', label: 'Data', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Produs', type: 'ingredient', editable: true, width: 200 },
      { field: 'unit', headerName: 'UM', type: 'uom', editable: true, width: 80 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'batchNumber', headerName: 'Lot', type: 'text', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'total'],
  },
  INVENTAR: {
    type: 'INVENTAR',
    name: 'Inventar',
    header: [
      { name: 'locationName', label: 'Locație', type: 'autocomplete', required: true },
      { name: 'warehouseId', label: 'Gestiune', type: 'autocomplete', required: true },
      { name: 'date', label: 'Data', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Produs', type: 'ingredient', editable: true, width: 200 },
      { field: 'unit', headerName: 'UM', type: 'uom', editable: true, width: 80 },
      { field: 'quantity', headerName: 'Cantitate Reală', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Preț', type: 'currency', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'total'],
  },
  FACTURA: {
    type: 'FACTURA',
    name: 'Factură',
    header: [
      { name: 'clientName', label: 'Client', type: 'autocomplete', required: true },
      { name: 'date', label: 'Data', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
      { name: 'paymentMethod', label: 'Metodă Plată', type: 'select', options: ['Cash', 'Card', 'Transfer'], required: false },
    ],
    columns: [
      { field: 'productName', headerName: 'Produs', type: 'text', editable: true, width: 200 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Preț', type: 'currency', editable: true, width: 120 },
      { field: 'vatRate', headerName: 'TVA%', type: 'number', editable: true, width: 80 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'vatAmount', 'total'],
  },
  CHITANTA: {
    type: 'CHITANTA',
    name: 'Chitanță',
    header: [
      { name: 'clientName', label: 'Client', type: 'autocomplete', required: true },
      { name: 'paymentDate', label: 'Data Plății', type: 'date', required: true },
      { name: 'paymentMethod', label: 'Metodă Plată', type: 'select', options: ['Cash', 'Card', 'Transfer'], required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Descriere', type: 'text', editable: true, width: 200 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Sumă', type: 'currency', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'total'],
  },
  REGISTRU_CASA: {
    type: 'REGISTRU_CASA',
    name: 'Registru de Casă',
    header: [
      { name: 'startDate', label: 'Data Început', type: 'date', required: true },
      { name: 'endDate', label: 'Data Sfârșit', type: 'date', required: true },
      { name: 'openingBalance', label: 'Sold Inițial', type: 'number', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Descriere', type: 'text', editable: true, width: 200 },
      { field: 'quantity', headerName: 'Încasări', type: 'currency', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Plăți', type: 'currency', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Sold', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['totalIncome', 'totalExpenses', 'netBalance'],
  },
  RAPORT_GESTIUNE: {
    type: 'RAPORT_GESTIUNE',
    name: 'Raport Gestiune',
    header: [
      { name: 'periodStart', label: 'Perioada Început', type: 'date', required: true },
      { name: 'periodEnd', label: 'Perioada Sfârșit', type: 'date', required: true },
      { name: 'locationName', label: 'Locație', type: 'autocomplete', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Ingredient', type: 'ingredient', editable: true, width: 200 },
      { field: 'quantity', headerName: 'Stoc Inițial', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Stoc Final', type: 'number', editable: true, width: 120 },
      { field: 'vatRate', headerName: 'Diferență', type: 'number', editable: false, width: 120 },
      { field: 'totalWithVat', headerName: 'Valoare', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['openingStockValue', 'closingStockValue', 'variance'],
  },
  RAPORT_X: {
    type: 'RAPORT_X',
    name: 'Raport X',
    header: [
      { name: 'reportDate', label: 'Data Raport', type: 'date', required: true },
      { name: 'openingAmount', label: 'Suma Inițială', type: 'number', required: true },
      { name: 'closingAmount', label: 'Suma Finală', type: 'number', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Metodă Plată', type: 'text', editable: true, width: 200 },
      { field: 'quantity', headerName: 'Număr Tranzacții', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Sumă', type: 'currency', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['totalSales', 'totalPayments', 'variance'],
  },
  RAPORT_Z: {
    type: 'RAPORT_Z',
    name: 'Raport Z',
    header: [
      { name: 'reportDate', label: 'Data Raport', type: 'date', required: true },
      { name: 'openingAmount', label: 'Suma Inițială', type: 'number', required: true },
      { name: 'closingAmount', label: 'Suma Finală', type: 'number', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Metodă Plată', type: 'text', editable: true, width: 200 },
      { field: 'quantity', headerName: 'Număr Tranzacții', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Sumă', type: 'currency', editable: true, width: 120 },
      { field: 'vatRate', headerName: 'TVA', type: 'currency', editable: false, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['totalSales', 'totalPayments', 'totalVat', 'variance'],
  },
  RAPORT_LUNAR: {
    type: 'RAPORT_LUNAR',
    name: 'Raport Lunar',
    header: [
      { name: 'month', label: 'Luna', type: 'number', required: true },
      { name: 'year', label: 'Anul', type: 'number', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Tip Document', type: 'text', editable: true, width: 200 },
      { field: 'quantity', headerName: 'Număr Documente', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Sumă', type: 'currency', editable: true, width: 120 },
      { field: 'vatRate', headerName: 'TVA', type: 'currency', editable: false, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['totalSales', 'totalVat', 'totalDocuments'],
  },
  AVIZ: {
    type: 'AVIZ',
    name: 'Aviz de Însoțire',
    header: [
      { name: 'locationName', label: 'Locație', type: 'autocomplete', required: true },
      { name: 'destinationLocationName', label: 'Destinație', type: 'autocomplete', required: false },
      { name: 'date', label: 'Data', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Produs', type: 'ingredient', editable: true, width: 200 },
      { field: 'unit', headerName: 'UM', type: 'uom', editable: true, width: 80 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'batchNumber', headerName: 'Lot', type: 'text', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'total'],
  },
  PROCES_VERBAL: {
    type: 'PROCES_VERBAL',
    name: 'Proces Verbal',
    header: [
      { name: 'locationName', label: 'Locație', type: 'autocomplete', required: true },
      { name: 'procesVerbalType', label: 'Tip', type: 'select', options: ['DIFFERENCE', 'LOSS', 'DAMAGE', 'THEFT', 'OTHER'], required: true },
      { name: 'reason', label: 'Motiv', type: 'text', required: true },
      { name: 'date', label: 'Data', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Produs', type: 'ingredient', editable: true, width: 200 },
      { field: 'unit', headerName: 'UM', type: 'uom', editable: true, width: 80 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Valoare', type: 'currency', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'total'],
  },
  RETUR: {
    type: 'RETUR',
    name: 'Restituire',
    header: [
      { name: 'returType', label: 'Tip Retur', type: 'select', options: ['SUPPLIER', 'CUSTOMER', 'INTERNAL'], required: true },
      { name: 'supplierName', label: 'Furnizor/Client', type: 'autocomplete', required: false },
      { name: 'reason', label: 'Motiv', type: 'text', required: true },
      { name: 'date', label: 'Data', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
    ],
    columns: [
      { field: 'productName', headerName: 'Produs', type: 'ingredient', editable: true, width: 200 },
      { field: 'unit', headerName: 'UM', type: 'uom', editable: true, width: 80 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'unitPrice', headerName: 'Preț', type: 'currency', editable: true, width: 120 },
      { field: 'totalWithVat', headerName: 'Total', type: 'currency', editable: false, width: 140 },
    ],
    totals: ['subtotal', 'total'],
  },
  WASTE: {
    type: 'WASTE',
    name: 'Deșeu',
    header: [
      { name: 'locationName', label: 'Locație', type: 'autocomplete', required: true },
      { name: 'date', label: 'Data', type: 'date', required: true },
      { name: 'series', label: 'Serie', type: 'text', required: true },
      { name: 'number', label: 'Număr', type: 'text', required: true },
      { name: 'reason', label: 'Motiv', type: 'text', required: true },
      { name: 'notes', label: 'Note', type: 'text' },
    ],
    columns: [
      { field: 'ingredient_name', headerName: 'Ingredient', type: 'ingredient', editable: true, width: 200 },
      { field: 'unit', headerName: 'UM', type: 'uom', editable: true, width: 80 },
      { field: 'quantity', headerName: 'Cantitate', type: 'number', editable: true, width: 120 },
      { field: 'reason', headerName: 'Motiv', type: 'text', editable: true, width: 150 },
    ],
    totals: ['total_quantity'],
  },
};

export const schemaFor = (type: TipizatType): TipizatSchema | undefined => TIPIZATE_SCHEMAS[type];
export const headerFor = (type: TipizatType): TipizatField[] => TIPIZATE_SCHEMAS[type]?.header || [];
export const columnsFor = (type: TipizatType): TipizatColumn[] => TIPIZATE_SCHEMAS[type]?.columns || [];
export const totalsFor = (type: TipizatType): string[] => TIPIZATE_SCHEMAS[type]?.totals || [];
export const nameFor = (type: TipizatType): string => TIPIZATE_SCHEMAS[type]?.name || 'Document necunoscut';







