import type { ColDef, GridOptions, RowSelectionOptions } from 'ag-grid-community';

export const DEFAULT_COLUMN_DEF: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  floatingFilter: true,
  minWidth: 130,
  flex: 1,
};

export const getDefaultGridOptions = <TData = unknown>(): GridOptions<TData> => ({
  rowHeight: 52,
  headerHeight: 46,
  suppressScrollOnNewData: true,
  animateRows: true,
});

const SINGLE_ROW_SELECTION: RowSelectionOptions = {
  mode: 'singleRow',
};

const MULTI_ROW_SELECTION: RowSelectionOptions = {
  mode: 'multiRow',
};

export const getRowSelectionOptions = (mode?: 'single' | 'multiple'): RowSelectionOptions | undefined => {
  if (mode === 'single') {
    return SINGLE_ROW_SELECTION;
  }
  if (mode === 'multiple') {
    return MULTI_ROW_SELECTION;
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

