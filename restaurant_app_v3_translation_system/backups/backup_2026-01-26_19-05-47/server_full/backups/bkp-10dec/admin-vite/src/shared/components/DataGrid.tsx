import { useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { AgGridReact as AgGridReactType, AgGridReactProps } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import type { ColDef, GridReadyEvent, SelectionChangedEvent, GridOptions } from 'ag-grid-community';
import { DEFAULT_COLUMN_DEF, getDefaultGridOptions, getRowSelectionOptions, mergeGridOptions } from '@/shared/agGrid/presets';
import './DataGrid.css';

ModuleRegistry.registerModules([AllCommunityModule]);

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

  const rowSelectionConfig = getRowSelectionOptions(rowSelection);
  const mergedGridOptions = mergeGridOptions(gridOptions as GridOptions<TData> | undefined, getDefaultGridOptions<TData>());

  useEffect(() => {
    if (!gridRef.current) return;
    const api = gridRef.current.api;
    if (!api) return;

    if (loading) {
      api.showLoadingOverlay();
    } else if (!rowData || rowData.length === 0) {
      api.showNoRowsOverlay();
    } else {
      api.hideOverlay();
    }
  }, [loading, rowData]);

  useEffect(() => {
    if (!gridRef.current) return;
    if (!gridRef.current.api) return;
    gridRef.current.api.setGridOption('quickFilterText', quickFilterText ?? '');
  }, [quickFilterText]);

  const handleSelectionChanged = (event: SelectionChangedEvent<TData>) => {
    const selected = event.api.getSelectedRows();

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
    onGridReady?.(event);
    agGridProps?.onGridReady?.(event);
  };

  return (
    <div className="data-grid ag-theme-alpine" style={{ height }}>
      <AgGridReact<TData>
        ref={gridRef}
        columnDefs={columnDefs}
        rowData={rowData ?? []}
        defaultColDef={DEFAULT_COLUMN_DEF as ColDef<TData>}
        theme="legacy"
        animateRows
        suppressDragLeaveHidesColumns
        suppressCellFocus
        rowSelection={rowSelectionConfig}
        onSelectionChanged={handleSelectionChanged}
        onGridReady={handleGridReady}
        gridOptions={mergedGridOptions}
        {...agGridProps}
      />
    </div>
  );
}
