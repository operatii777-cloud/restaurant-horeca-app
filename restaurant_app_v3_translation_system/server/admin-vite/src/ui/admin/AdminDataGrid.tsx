/**
 * AdminDataGrid - Wrapper standardizat pentru AG Grid
 * Boogit-like: grid ca element principal, densitate compactă
 */

import React, { useMemo } from 'react';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './AdminDataGrid.css';

export interface AdminDataGridProps<T = any> {
  columnDefs: ColDef<T>[];
  rowData: T[];
  loading?: boolean;
  quickFilterText?: string;
  rowSelection?: 'single' | 'multiple';
  onRowClicked?: (row: T) => void;
  onRowDoubleClicked?: (row: T) => void;
  onSelectedRowsChange?: (rows: T[]) => void;
  getRowId?: (params: { data: T }) => string;
  gridOptions?: GridOptions<T>;
  className?: string;
}

export const AdminDataGrid = <T,>({
  columnDefs,
  rowData,
  loading = false,
  quickFilterText,
  rowSelection,
  onRowClicked,
  onRowDoubleClicked,
  onSelectedRowsChange,
  getRowId,
  gridOptions,
  className = '',
}: AdminDataGridProps<T>) => {
  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true,
    }),
    []
  );

  const finalGridOptions = useMemo<GridOptions<T>>(
    () => ({
      rowHeight: 44, // var(--admin-grid-row-height)
      headerHeight: 48, // var(--admin-grid-header-height)
      animateRows: true,
      suppressCellFocus: true,
      ...gridOptions,
    }),
    'gridOptions'
  );

  return (
    <div className={`admin-data-grid ${className}`}>
      <AgGridReact<T>
        columnDefs={columnDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
        quickFilterText={quickFilterText}
        rowSelection={rowSelection}
        onRowClicked={(e) => {
          if (e.data) onRowClicked?.(e.data);
        }}
        onRowDoubleClicked={(e) => {
          if (e.data) onRowDoubleClicked?.(e.data);
        }}
        onSelectionChanged={(e) => {
          if (onSelectedRowsChange) {
            const selectedRows = e.api.getSelectedRows() as T[];
            onSelectedRowsChange(selectedRows);
          }
        }}
        getRowId={getRowId}
        gridOptions={finalGridOptions}
        loading={loading}
      />
    </div>
  );
};


