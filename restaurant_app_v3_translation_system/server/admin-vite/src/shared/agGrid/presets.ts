import type { ColDef, GridOptions, RowSelectionOptions } from 'ag-grid-community';

/**
 * DEFAULT_COLUMN_DEF - Minimal AG Grid configuration (Excel-like)
 * Microsoft Windows style: clean, minimal, edge-to-edge
 * Doar funcționalități esențiale - fără exagerări
 */
export const DEFAULT_COLUMN_DEF: ColDef = {
  sortable: true,        // Sortare - esențial
  filter: true,          // Filtrare - esențial
  resizable: true,       // Redimensionare coloane - esențial
  minWidth: 100,         // Lățime minimă
  flex: 1,               // Distribuție uniformă
  // NU adăugăm floatingFilter - minimal
  // NU adăugăm menuTabs - minimal
  // NU adăugăm suppressMenu - lăsăm default
};

/**
 * getDefaultGridOptions - Minimal AG Grid configuration (Excel-like)
 * Microsoft Windows style: clean, minimal, edge-to-edge
 * Doar ce e necesar - fără să stricăm funcționalitatea existentă
 */
export const getDefaultGridOptions = <TData = unknown>(): GridOptions<TData> => ({
  // Înălțimi - Excel-like (minimal) - MAI ÎNALTE pentru lizibilitate
  rowHeight: 36,         // Excel default row height (mărit pentru lizibilitate)
  headerHeight: 48,      // Header mai înalt pentru lizibilitate
  
  // Comportament de bază
  suppressScrollOnNewData: true,
  animateRows: false,    // Minimal - fără animații (Excel nu are)
  
  // Paginare - minimal (doar dacă e necesar)
  // NU forțăm pagination aici - fiecare componentă decide
  
  // Funcționalități - minimal
  suppressCellFocus: false,        // Permitem focus (Excel-like)
  // AG Grid v32.2+ - suppressRowClickSelection deprecated, use rowSelection.enableClickSelection
  // AG Grid v32.2+ - enableRangeSelection deprecated, use cellSelection
  suppressDragLeaveHidesColumns: true, // Comportament normal
  
  // NU adăugăm rowStyle aici - minimal
});

const SINGLE_ROW_SELECTION: RowSelectionOptions = {
  mode: 'singleRow',
  enableClickSelection: true, // ✅ Permite selecție la click
};

const MULTI_ROW_SELECTION: RowSelectionOptions = {
  mode: 'multiRow',
  enableClickSelection: true, // ✅ v32.2+ replacement for suppressRowClickSelection
};

const MULTI_ROW_SELECTION_NO_CLICK: RowSelectionOptions = {
  mode: 'multiRow',
  enableClickSelection: false, // ✅ v32.2+ replacement for suppressRowClickSelection=true
};

export const getRowSelectionOptions = (
  mode?: 'single' | 'multiple',
  enableClickSelection: boolean = true
): RowSelectionOptions | undefined => {
  if (mode === 'single') {
    return SINGLE_ROW_SELECTION;
  }
  if (mode === 'multiple') {
    return enableClickSelection ? MULTI_ROW_SELECTION : MULTI_ROW_SELECTION_NO_CLICK;
  }
  return undefined;
};

export const mergeGridOptions = <TData = unknown>(
  overrides?: GridOptions<TData>,
  base: GridOptions<TData> = getDefaultGridOptions<TData>(),
): GridOptions<TData> => ({
  ...base,
  ...overrides,
});

