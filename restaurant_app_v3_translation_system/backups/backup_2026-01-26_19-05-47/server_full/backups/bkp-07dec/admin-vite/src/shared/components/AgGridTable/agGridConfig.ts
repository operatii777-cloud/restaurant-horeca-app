/**
 * AG Grid Global Configuration
 * Standardizare configurație pentru toate tabelele AG Grid din aplicație
 */

import { ColDef, GridOptions } from 'ag-grid-community';

export const agGridDefaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 100,
  flex: 0,
};

export const agGridDefaultGridOptions: GridOptions = {
  // Theme
  theme: 'ag-theme-alpine-dark',
  
  // Pagination
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [10, 20, 50, 100],
  
  // Row & Header heights
  rowHeight: 40,
  headerHeight: 50,
  
  // Default column definition
  defaultColDef: agGridDefaultColDef,
  
  // Overlays
  overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">Nu există date</span>',
  overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Se încarcă...</span>',
  
  // Other defaults
  animateRows: true,
  enableRangeSelection: true,
  suppressRowClickSelection: false,
  rowSelection: 'single',
  
  // Locale
  localeText: {
    // Customize Romanian locale if needed
    noRowsToShow: 'Nu există date de afișat',
    loadingOoo: 'Se încarcă...',
    page: 'Pagina',
    more: 'Mai multe',
    to: 'la',
    of: 'din',
    next: 'Următoarea',
    last: 'Ultima',
    first: 'Prima',
    previous: 'Anterior',
  },
};

/**
 * Merge local grid options with defaults
 */
export const mergeGridOptions = (localOptions?: Partial<GridOptions>): GridOptions => {
  return {
    ...agGridDefaultGridOptions,
    ...localOptions,
    defaultColDef: {
      ...agGridDefaultColDef,
      ...(localOptions?.defaultColDef || {}),
    },
  };
};

