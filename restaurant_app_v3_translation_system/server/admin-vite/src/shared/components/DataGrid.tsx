// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { AgGridReact as AgGridReactType, AgGridReactProps } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, SelectionChangedEvent, GridOptions } from 'ag-grid-community';
import { DEFAULT_COLUMN_DEF, getDefaultGridOptions, getRowSelectionOptions, mergeGridOptions } from '@/shared/agGrid/presets';
import './DataGrid.css';

// AG Grid v30+ doesn't require manual module registration for community features

export type DataGridProps<TData> = {
  columnDefs: ColDef<TData>[];
  rowData?: TData[] | null;
  loading?: boolean;
  quickFilterText?: string;
  height?: number | string;
  rowSelection?: 'single' | 'multiple';
  gridOptions?: GridOptions<TData>;
  agGridProps?: Partial<AgGridReactProps<TData>>;
  onSelectedRowsChange?: (selected: TData[]) => void;
  onSelectionChanged?: (selected: TData[], event: SelectionChangedEvent<TData>) => void;
  onGridReady?: (event: GridReadyEvent<TData>) => void;
};

export function DataGrid<TData = any>({
  columnDefs,
  rowData,
  loading = false,
  quickFilterText,
  height = '65vh',
  rowSelection,
  gridOptions,
  agGridProps,
  onSelectedRowsChange,
  onSelectionChanged,
  onGridReady,
}: DataGridProps<TData>) {
  const gridRef = useRef<AgGridReactType<TData>>(null);
//   const { t } = useTranslation(); // ✅ Hook apelat la nivelul componentei

  const rowSelectionConfig = getRowSelectionOptions(rowSelection);
  const defaultOptions = getDefaultGridOptions<TData>();
  // Don't set theme in gridOptions - use className instead (ag-theme-alpine)
  // AG Grid v34+ requires theme to be "legacy" or a Theming API object
  const mergedGridOptions = mergeGridOptions(
    gridOptions,
    defaultOptions
  );

  useEffect(() => {
    if (!gridRef.current) return;
    const api = gridRef.current.api;
    if (!api) return;

    // Use new AG Grid v32+ API instead of deprecated showLoadingOverlay
    if (loading) {
      api.setGridOption('loading', true);
    } else {
      api.setGridOption('loading', false);
      if (!rowData || rowData.length === 0) {
        api.showNoRowsOverlay();
      } else {
        api.hideOverlay();
      }
    }
  }, [loading, rowData]);

  useEffect(() => {
    if (!gridRef.current) return;
    if (!gridRef.current.api) return;
    gridRef.current.api.setGridOption('quickFilterText', quickFilterText ?? '');
  }, [quickFilterText]);

  const handleSelectionChanged = (event: SelectionChangedEvent<TData>) => {
    const selected = event.api.getSelectedRows();
    console.log('DataGrid Selection changed, selected rows:', selected.length, selected);

    if (onSelectedRowsChange) {
      onSelectedRowsChange(selected);
    }

    if (onSelectionChanged) {
      onSelectionChanged(selected, event);
    }

    if (agGridProps?.onSelectionChanged) {
      agGridProps.onSelectionChanged(event);
    }
  };

  const handleGridReady = (event: GridReadyEvent<TData>) => {
    console.log('DataGrid Grid ready:', {
      rowCount: event.api.getDisplayedRowCount(),
      columnCount: event.api.getColumnDefs()?.length || 0,
      height: height,
    });
    // Force size calculation
    setTimeout(() => {
      event.api.sizeColumnsToFit();
    }, 100);
    onGridReady?.(event);
    agGridProps?.onGridReady?.(event);
  };

  return (
    <div className="data-grid ag-theme-alpine" style={{ height, margin: 0, padding: 0, width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AgGridReact<TData>
        ref={gridRef}
        theme="legacy"
        columnDefs={columnDefs}
        rowData={rowData ?? []}
        defaultColDef={DEFAULT_COLUMN_DEF as ColDef<TData>}
        animateRows={false} // Minimal - Excel nu are animații
        suppressDragLeaveHidesColumns
        suppressCellFocus={false} // Excel-like - permitem focus
        rowSelection={rowSelectionConfig}
        onSelectionChanged={handleSelectionChanged}
        onGridReady={handleGridReady}
        gridOptions={mergedGridOptions}
        domLayout="normal"
        // Paginare - doar dacă e specificat în props (minimal)
        {...agGridProps}
      />
    </div>
  );
}



