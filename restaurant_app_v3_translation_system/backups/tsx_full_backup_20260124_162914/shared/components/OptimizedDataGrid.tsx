/**
 * OPTIMIZED DATA GRID
 * Versiune optimizată a DataGrid cu React.memo și useMemo
 * Windows-style: clean, minimal, performant
 */

import React, { memo, useMemo } from 'react';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './DataGrid';
import { TableSkeleton } from './SkeletonLoader';

type OptimizedDataGridProps<TData = any> = DataGridProps<TData> & {
  enableOptimization?: boolean;
};

/**
 * Optimized DataGrid - Memoized pentru a preveni re-render-uri inutile
 */
export const OptimizedDataGrid = memo(<TData = any>({
  columnDefs,
  rowData,
  loading,
  enableOptimization = true,
  ...props
}: OptimizedDataGridProps<TData>) => {
  // Memoize columnDefs dacă nu se schimbă
  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);

  // Memoize rowData dacă nu se schimbă
  const memoizedRowData = useMemo(() => {
    if (!rowData) return null;
    // Deep clone pentru a evita referințe mutate
    return JSON.parse(JSON.stringify(rowData));
  }, [rowData]);

  if (loading) {
    return <TableSkeleton rows={5} columns={memoizedColumnDefs.length} />;
  }

  return (
    <DataGrid<TData>
      columnDefs={memoizedColumnDefs}
      rowData={memoizedRowData}
      loading={loading}
      {...props}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison pentru optimizare
  if (!nextProps.enableOptimization) {
    return false; // Re-render dacă optimizarea e dezactivată
  }

  // Compară doar proprietățile importante
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.rowData === nextProps.rowData &&
    prevProps.columnDefs === nextProps.columnDefs &&
    prevProps.height === nextProps.height &&
    prevProps.rowSelection === nextProps.rowSelection
  );
}) as <TData = any>(props: OptimizedDataGridProps<TData>) => JSX.Element;

OptimizedDataGrid.displayName = 'OptimizedDataGrid';


