// -----------------------------
// Tipizat — Document Types
// -----------------------------

export type TipizatType =
  | "NIR"
  | "BON_CONSUM"
  | "TRANSFER"
  | "INVENTAR"
  | "WASTE"
  | "FACTURA"
  | "CHITANTA"
  | "REGISTRU_CASA"
  | "RAPORT_GESTIUNE"
  | "AVIZ"
  | "PROCES_VERBAL"
  | "RETUR"
  | "RAPORT_Z"
  | "RAPORT_X"
  | "RAPORT_LUNAR";

export type TipizatStatus =
  | "draft"
  | "saved"
  | "approved"
  | "archived"
  | "cancelled"
  | "DRAFT"
  | "VALIDATED"
  | "SIGNED";

// -----------------------------
// Common Line Type
// -----------------------------
export interface TipizatLine {
  id?: number;
  document_id?: number;
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  price?: number;
  total?: number;
  // Additional properties used in components
  lineNumber?: number;
  productName?: string;
  productCode?: string;
  unitPrice?: number;
  vatRate?: number;
  totalWithoutVat?: number;
  totalVat?: number;
  totalWithVat?: number;
  notes?: string;
}

// -----------------------------
// Common Totals
// -----------------------------
export interface TipizatTotals {
  total_lines: number;
  total_quantity: number;
  total_value: number;
}

// -----------------------------
// NIR Document
// -----------------------------
export interface NirDocument {
  id?: number;
  type: "NIR";
  series?: string;
  number?: string;
  supplier_id?: number;
  supplier_name?: string;
  document_date?: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Bon Consum
// -----------------------------
export interface BonConsumDocument {
  id?: number;
  type: "BON_CONSUM";
  location_id: number;
  date: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Transfer
// -----------------------------
export interface TransferDocument {
  id?: number;
  type: "TRANSFER";
  from_location_id: number;
  to_location_id: number;
  date: string;
  status: TipizatStatus;
  notes?: string;
  created_at?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Inventar
// -----------------------------
export interface InventarDocument {
  id?: number;
  type: "INVENTAR";
  location_id: number;
  date: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;

  lines: Array<{
    id?: number;
    document_id?: number;
    ingredient_id: number;
    ingredient_name: string;

    stock_system: number;   // ce ar trebui să fie
    stock_real: number;     // ce a găsit angajatul
    difference: number;     // diferența
    unit: string;
  }>;

  totals: {
    total_items: number;
    stock_value_system: number;
    stock_value_real: number;
    stock_value_difference: number;
  };
}

// -----------------------------
// Waste
// -----------------------------
export interface WasteDocument {
  id?: number;
  type: "WASTE";
  location_id: number;
  date: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Factura
// -----------------------------
export interface FacturaDocument {
  id?: number;
  type: "FACTURA";
  series?: string;
  number?: string;
  client_id?: number;
  client_name?: string;
  document_date?: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Chitanta
// -----------------------------
export interface ChitantaDocument {
  id?: number;
  type: "CHITANTA";
  series?: string;
  number?: string;
  client_id?: number;
  client_name?: string;
  document_date?: string;
  payment_method?: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Registru Casa
// -----------------------------
export interface RegistruCasaDocument {
  id?: number;
  type: "REGISTRU_CASA";
  date: string;
  location_id: number;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Raport Gestiune
// -----------------------------
export interface RaportGestiuneDocument {
  id?: number;
  type: "RAPORT_GESTIUNE";
  date: string;
  location_id: number;
  consumption_reason?: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Aviz
// -----------------------------
export interface AvizDocument {
  id?: number;
  type: "AVIZ";
  series?: string;
  number?: string;
  supplier_id?: number;
  supplier_name?: string;
  document_date?: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Proces Verbal
// -----------------------------
export interface ProcesVerbalDocument {
  id?: number;
  type: "PROCES_VERBAL";
  date: string;
  location_id: number;
  reason?: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Retur
// -----------------------------
export interface ReturDocument {
  id?: number;
  type: "RETUR";
  series?: string;
  number?: string;
  supplier_id?: number;
  supplier_name?: string;
  document_date?: string;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Raport Z
// -----------------------------
export interface RaportZDocument {
  id?: number;
  type: "RAPORT_Z";
  date: string;
  location_id: number;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Raport X
// -----------------------------
export interface RaportXDocument {
  id?: number;
  type: "RAPORT_X";
  date: string;
  location_id: number;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

// -----------------------------
// Raport Lunar
// -----------------------------
export interface RaportLunarDocument {
  id?: number;
  type: "RAPORT_LUNAR";
  month: number;
  year: number;
  location_id: number;
  created_at?: string;
  status: TipizatStatus;
  notes?: string;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

