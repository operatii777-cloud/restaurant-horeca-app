/**
 * 🎛️ AGGridWrapper - Component wrapper pentru AG Grid cu setări comune
 * 
 * Pre-configurat cu:
 * - Tema Alpine
 * - Paginare
 * - Sortare & filtrare
 * - Export CSV
 * - Resize coloane
 * - Row selection
 */

import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export function AGGridWrapper({
  rowData,
  columnDefs,
  onCellValueChanged,
  onRowClicked,
  onSelectionChanged,
  onGridReady: customOnGridReady,  // ✅ RENAMED pentru a permite custom callback
  defaultColDef,
  pagination = true,
  paginationPageSize = 50,
  rowSelection = 'multiple',
  animateRows = true,
  enableRangeSelection = false,
  enableCellTextSelection = true,
  suppressRowClickSelection = false,
  suppressSizeToFit = false,
  gridOptions = {},
  style = { height: '600px', width: '100%' },
  className = 'ag-theme-alpine',
  ...rest
}) {
  // Default column configuration
  const defaultColDefMemo = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    editable: false,
    floatingFilter: true,
    ...defaultColDef,
  }), [defaultColDef]);

  // Grid ready callback - COMBINAT cu custom callback
  const onGridReady = useCallback((params) => {
    // Auto-size toate coloanele (doar dacă nu este supresat)
    if (!suppressSizeToFit) {
      params.api.sizeColumnsToFit();
    }
    
    // ✅ CHEAMĂ custom callback dacă există
    if (customOnGridReady) {
      customOnGridReady(params);
    }
  }, [suppressSizeToFit, customOnGridReady]);

  // Export CSV function (poți accesa prin ref)
  const onBtExport = useCallback((gridRef) => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `export_${new Date().toISOString().split('T')[0]}.csv`,
      });
    }
  }, []);

  return (
    <div className={className} style={style}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDefMemo}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        rowSelection={rowSelection}
        animateRows={animateRows}
        enableRangeSelection={enableRangeSelection}
        enableCellTextSelection={enableCellTextSelection}
        suppressRowClickSelection={suppressRowClickSelection}
        onCellValueChanged={onCellValueChanged}
        onRowClicked={onRowClicked}
        onSelectionChanged={onSelectionChanged}
        onGridReady={onGridReady}
        gridOptions={{
          suppressHorizontalScroll: false,
          ...gridOptions,
          localeText: {
            // Traduceri în română
            page: 'Pagina',
            more: 'Mai mult',
            to: 'până la',
            of: 'din',
            next: 'Următoarea',
            last: 'Ultima',
            first: 'Prima',
            previous: 'Anterioara',
            loadingOoo: 'Se încarcă...',
            noRowsToShow: 'Nu există înregistrări',
            // Filtre
            contains: 'Conține',
            notContains: 'Nu conține',
            equals: 'Egal cu',
            notEqual: 'Diferit de',
            startsWith: 'Începe cu',
            endsWith: 'Se termină cu',
            // Sortare
            sortAscending: 'Sortare crescătoare',
            sortDescending: 'Sortare descrescătoare',
            // Altele
            pinColumn: 'Fixează coloana',
            autosizeThiscolumn: 'Redimensionează automat',
            autosizeAllColumns: 'Redimensionează toate',
            resetColumns: 'Resetează coloanele',
            copy: 'Copiază',
            copyWithHeaders: 'Copiază cu antet',
            paste: 'Lipește',
            export: 'Export',
            csvExport: 'Export CSV',
          },
        }}
        {...rest}
      />
    </div>
  );
}

export default AGGridWrapper;

