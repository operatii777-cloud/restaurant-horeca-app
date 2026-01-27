/**
 * AgGridTable - Global AG Grid Wrapper Component
 * 
 * Standardizare pentru toate tabelele AG Grid din aplicație.
 * Elimină duplicarea configurației și asigură consistență.
 */

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridOptions } from 'ag-grid-community';
import { mergeGridOptions } from './agGridConfig';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './AgGridTable.css';

export interface AgGridTableProps {
  /** Column definitions */
  columnDefs: ColDef[];
  /** Row data */
  rowData: any[] | null | undefined;
  /** Loading state */
  loading?: boolean;
  /** Custom grid options (merged with defaults) */
  gridOptions?: Partial<GridOptions>;
  /** Custom CSS class */
  className?: string;
  /** Height of the grid (default: 600px) */
  height?: string | number;
  /** Width of the grid (default: 100%) */
  width?: string | number;
  /** Callback when grid is ready */
  onGridReady?: (params: any) => void;
  /** Callback when row is selected */
  onRowSelected?: (params: any) => void;
  /** Callback when cell is clicked */
  onCellClicked?: (params: any) => void;
}

export const AgGridTable: React.FC<AgGridTableProps> = ({
  columnDefs,
  rowData,
  loading = false,
  gridOptions = {},
  className = '',
  height = 600,
  width = '100%',
  onGridReady,
  onRowSelected,
  onCellClicked,
}) => {
  // Merge local options with defaults
  const mergedGridOptions = useMemo(() => {
    return mergeGridOptions({
      ...gridOptions,
      loading,
      onGridReady,
      onRowSelected,
      onCellClicked,
    });
  }, [gridOptions, loading, onGridReady, onRowSelected, onCellClicked]);

  return (
    <div 
      className={`ag-grid-table-wrapper ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width }}
    >
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData || []}
        {...mergedGridOptions}
      />
    </div>
  );
};

