// import { useTranslation } from '@/i18n/I18nContext';
/**
 * AG Grid Global Configuration - MINIMAL EXCEL-LIKE
 * Microsoft Windows style: clean, minimal, edge-to-edge
 * Doar funcționalități esențiale - fără să stricăm ce avem
 */

import type { ColDef, GridOptions } from 'ag-grid-community';

export const agGridDefaultColDef: ColDef = {
  sortable: true,        // Sortare - esențial
  filter: true,          // Filtrare - esențial
  resizable: true,       // Redimensionare - esențial
  minWidth: 100,         // Lățime minimă
  flex: 1,               // Distribuție uniformă
  // NU adăugăm floatingFilter - minimal
  // NU adăugăm menuTabs - minimal
  // NU adăugăm suppressMenu - lăsăm default
};

export const agGridDefaultGridOptions: GridOptions = {
  // Theme - Alpine (clean, minimal)
  theme: 'legacy', // Use legacy theme to avoid conflict with CSS files
  
  // Înălțimi - Excel-like (minimal)
  rowHeight: 32,         // Excel default
  headerHeight: 48,      // Header mai înalt pentru lizibilitate
  
  // Default column definition
  defaultColDef: agGridDefaultColDef,
  
  // Overlays - minimal
  overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">Nu există date</span>',
  overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Se încarcă...</span>',
  
  // Funcționalități - MINIMAL (doar ce e necesar)
  animateRows: false,              // NU - minimal (Excel nu are animații)
  enableRangeSelection: false,     // NU - minimal
  suppressRowClickSelection: false, // Permitem click (Excel-like)
  rowSelection: 'single',          // Default - single selection
  suppressCellFocus: false,        // Permitem focus (Excel-like)
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  
  // Paginare - NU forțăm aici (fiecare componentă decide)
  // pagination: false - minimal (doar dacă e necesar)
  
  // Locale - Romanian (minimal)
  localeText: {
    noRowsToShow: 'Nu există date de afișat',
    loadingOoo: 'Se încarcă...',
  },
};

/**
 * Merge local grid options with defaults
 */
export const mergeGridOptions = (localOptions?: Partial<GridOptions>): GridOptions => {
//   const { t } = useTranslation();
  return {
    ...agGridDefaultGridOptions,
    ...localOptions,
    defaultColDef: {
      ...agGridDefaultColDef,
      ...(localOptions?.defaultColDef || {}),
    },
  };
};

