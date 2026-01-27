// import { useTranslation } from '@/i18n/I18nContext';
/**
 * StockIngredientsTab - Catalog Ingrediente
 * STANDARD: Folosește ExcelPageLayout STANDARD (boogiT-like)
 * Compact: padding 16, gap 12, contrast garantat prin CSS vars
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ColDef,
  CellClickedEvent,
  RowDoubleClickedEvent,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { TableFilter } from '@/shared/components/TableFilter';
import { GridActionsMenu, type GridAction } from '@/shared/components/grid/GridActionsMenu';
import { LoadingState } from '@/shared/components/states/LoadingState';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { DataGrid } from '@/shared/components/DataGrid';
import { ExcelPageLayout } from '@/shared/components/page/ExcelPageLayout';
import { httpClient } from '@/shared/api/httpClient';
import { IngredientEditorModal } from '@/modules/ingredients/components/IngredientEditorModal';
import { IngredientBulkUpdateModal } from '@/modules/ingredients/components/IngredientBulkUpdateModal';
import { IngredientDetailsDrawer } from '@/modules/ingredients/components/IngredientDetailsDrawer';
import { StockAdjustModal } from '@/modules/stocks/components/StockAdjustModal';
import { LowStockDrawer } from '@/modules/stocks/components/LowStockDrawer';
import { ExpiringStockDrawer } from '@/modules/stocks/components/ExpiringStockDrawer';
import { RiskAlertsDrawer } from '@/modules/stocks/components/RiskAlertsDrawer';
import type { Ingredient } from '@/types/ingredients';
import type { IngredientStockItem, LowStockAlert, StockSummary } from '@/types/stocks';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

interface StockIngredientsTabProps {
  onSummary: (patch: Partial<StockSummary>) => void;
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const isTrue = (value: unknown) => value === true || value === 1 || value === '1';

const formatNumber = (value?: number | null) =>
  value === null || value === undefined ? '-' : Number(value).toLocaleString('ro-RO', { maximumFractionDigits: 2 });

// Component React pentru cellRenderer - Stoc curent cu buton editare
interface StockCurrentCellProps {
  params: ICellRendererParams<IngredientStockItem>;
  onAdjust: (ingredient: IngredientStockItem) => void;
}

const StockCurrentCell: React.FC<StockCurrentCellProps> = ({ params, onAdjust }) => {
  if (!params.data) return <span>â€”</span>;
  
  const stockValue = formatNumber(Number(params.data.current_stock ?? 0));
  const unit = params.data.unit || '';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
      <span style={{ flex: 1 }}>{stockValue} {unit}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAdjust(params.data!);
        }}
        title="ajusteaza stoc"
        style={{
          padding: '4px 8px',
          fontSize: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        âœï¸
      </button>
    </div>
  );
};

export const StockIngredientsTab = ({ onSummary, onFeedback }: StockIngredientsTabProps) => {
//   const { t } = useTranslation();
  const { data, loading, error, refetch } = useApiQuery<Ingredient[]>('/api/ingredients');
  const ingredients = useMemo<IngredientStockItem[]>(() => {
    // useApiQuery extrage deja data din { success: true, data: [...] }
    // Dar verificăm dacă data este array sau obiect
    let result: Ingredient[] = [];
    if (Array.isArray(data)) {
      result = data;
    } else if (data && typeof data === 'object' && "Dată:" in data && Array.isArray((data as any).data)) {
      // Fallback: dacă data este { data: [...] }
      result = (data as any).data;
    } else if (data && typeof data === 'object' && 'ingredients' in data && Array.isArray((data as any).ingredients)) {
      // Fallback: dacă data este { ingredients: [...] }
      result = (data as any).ingredients;
    }
    console.log('StockIngredientsTab Ingredients data:', { 
      rawData: data, 
      isArray: Array.isArray(data),
      resultLength: result.length,
      firstItem: result[0]
    });
    return result as IngredientStockItem[];
  }, [data]);

  const decoratedIngredients = useMemo<IngredientStockItem[]>(() =>
    ingredients.map((ingredient) => {
      const current = Number(ingredient.current_stock ?? 0);
      const minimum = Number(ingredient.min_stock ?? 0);
      let stockStatus: IngredientStockItem['stock_status'] = ingredient.stock_status;

      if (!stockStatus) {
        if (minimum <= 0 && current > 0) {
          stockStatus = 'ok';
        } else if (current <= 0) {
          stockStatus = 'out';
        } else if (minimum > 0 && current <= minimum * 0.2) {
          stockStatus = 'critical';
        } else if (minimum > 0 && current <= minimum) {
          stockStatus = 'low';
        } else {
          stockStatus = 'ok';
        }
      }

      return {
        ...ingredient,
        stock_status: stockStatus,
      };
    }),
    'ingredients',
  );

  const [quickFilter, setQuickFilter] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientStockItem[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsIngredient, setDetailsIngredient] = useState<Ingredient | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustIngredient, setAdjustIngredient] = useState<Ingredient | null>(null);
  const [lowStockDrawerOpen, setLowStockDrawerOpen] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [expiringDrawerOpen, setExpiringDrawerOpen] = useState(false);
  const [expiringAlerts, setExpiringAlerts] = useState<any[]>([]);
  const [riskAlertsDrawerOpen, setRiskAlertsDrawerOpen] = useState(false);

  useEffect(() => {
    const total = decoratedIngredients.length;
    const hidden = decoratedIngredients.filter((item) => isTrue(item.is_hidden)).length;
    const lowStock = decoratedIngredients.filter((item) => {
      const current = Number(item.current_stock ?? 0);
      const minimum = Number(item.min_stock ?? 0);
      return minimum > 0 && current <= minimum;
    }).length;

    onSummary({
      totalIngredients: total,
      hiddenIngredients: hidden,
      activeIngredients: total - hidden,
      lowStockIngredients: lowStock,
    });
  }, [decoratedIngredients, onSummary]);

  const columnDefs = useMemo<ColDef<IngredientStockItem>[]>(
    () => [
      {
        headerName: 'Ingredient',
        field: 'name',
        minWidth: 220,
      },
      {
        headerName: 'Categorie',
        field: 'category',
        minWidth: 160,
      },
      {
        headerName: 'Unitate',
        field: 'unit',
        width: 110,
      },
      {
        headerName: 'Stoc curent',
        field: 'current_stock',
        width: 200,
        cellRenderer: (params: ICellRendererParams<IngredientStockItem>) => {
          return React.createElement(StockCurrentCell, {
            params,
            onAdjust: (ingredient) => {
              setAdjustIngredient(ingredient);
              setAdjustOpen(true);
            },
          });
        },
      },
      {
        headerName: 'Stoc minim',
        field: 'min_stock',
        width: 140,
        valueFormatter: ({ value }) => formatNumber(Number(value)),
      },
      {
        headerName: 'Cost/unitate',
        field: 'cost_per_unit',
        width: 150,
        valueFormatter: ({ value }) => (value === null || value === undefined ? '-' : `${Number(value).toFixed(2)} RON`),
      },
      {
        headerName: 'Furnizor',
        field: 'supplier',
        minWidth: 160,
      },
      {
        headerName: 'Energie (kcal)',
        field: 'energy_kcal',
        width: 140,
        valueFormatter: ({ value }: ValueFormatterParams<IngredientStockItem, number>) =>
          formatNumber(value ?? null),
      },
      {
        headerName: 'Proteine (g)',
        field: 'protein',
        width: 130,
        valueFormatter: ({ value }: ValueFormatterParams<IngredientStockItem, number>) =>
          formatNumber(value ?? null),
      },
      {
        headerName: 'Carbohidrați (g)',
        field: 'carbs',
        width: 150,
        valueFormatter: ({ value }: ValueFormatterParams<IngredientStockItem, number>) =>
          formatNumber(value ?? null),
      },
      {
        headerName: 'Grăsimi (g)',
        field: 'fat',
        width: 130,
        valueFormatter: ({ value }: ValueFormatterParams<IngredientStockItem, number>) =>
          formatNumber(value ?? null),
      },
      {
        headerName: 'Status stoc',
        field: 'stock_status',
        width: 140,
        valueGetter: ({ data }: { data?: IngredientStockItem | null }) => data?.stock_status ?? 'â€”',
        cellRenderer: ({ value }: ICellRendererParams<IngredientStockItem>) => {
          if (!value) return 'â€”';
          const label = value === 'out' ? 'Epuizat' : value === 'low' ? 'Scăzut' : value === 'critical' ? 'Critic' : 'OK';
          return `<span class="stock-ingredients__badge stock-ingredients__badge--${value}">${label}</span>`;
        },
      },
      {
        headerName: '',
        colId: 'actions',
        width: 70,
        maxWidth: 70,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<IngredientStockItem>) => {
          if (!params.data) return '';
          const actions: GridAction[] = [
            {
              label: 'Vizualizează',
              icon: '👁️',
              onClick: () => {
                setDetailsIngredient(params.data!);
                setDetailsOpen(true);
              },
            },
            {
              label: 'Editează',
              icon: '✏️',
              onClick: () => {
                setEditingIngredient(params.data!);
                setEditorOpen(true);
              },
            },
            {
              label: 'Ajustează stoc',
              icon: '⚖️',
              onClick: () => {
                setAdjustIngredient(params.data!);
                setAdjustOpen(true);
              },
            },
            {
              label: 'Șterge',
              icon: '🗑️',
              variant: 'danger',
              onClick: () => {
                if (window.confirm(`Ești sigur că vrei să ștergi ingredientul "${params.data!.name}"?`)) {
                  // TODO: Implement delete
                }
              },
            },
          ];
          return React.createElement(GridActionsMenu, { actions });
        },
      },
    ],
    [setAdjustIngredient, setAdjustOpen],
  );

  const handleCellClicked = useCallback(
    (event: CellClickedEvent<IngredientStockItem>) => {
      if (!event.data || event.colDef.colId !== 'actions') return;
      const domEvent = event.event;
      if (!domEvent) return;
      const target = (domEvent.target as HTMLElement | null)?.closest('button[data-action]');
      const action = target?.getAttribute('data-action');
      if (!action) return;

      if (action === 'edit') {
        setEditingIngredient(event.data);
        setEditorOpen(true);
      } else if (action === 'adjust') {
        setAdjustIngredient(event.data);
        setAdjustOpen(true);
      } else if (action === 'details') {
        setDetailsIngredient(event.data);
        setDetailsOpen(true);
      }
    },
    [],
  );

  const handleRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent<IngredientStockItem>) => {
      if (!event.data) return;
      setDetailsIngredient(event.data);
      setDetailsOpen(true);
    },
    [],
  );

  const handleAddIngredient = useCallback(() => {
    setEditingIngredient(null);
    setEditorOpen(true);
  }, []);

  const refreshData = useCallback(async () => {
    await refetch();
  }, []);

  // Filter categories for dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    decoratedIngredients.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ro'));
  }, [decoratedIngredients]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredIngredients = useMemo(() => {
    let filtered = decoratedIngredients;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => {
        if (filterStatus === 'active') return !isTrue(item.is_hidden);
        if (filterStatus === 'hidden') return isTrue(item.is_hidden);
        if (filterStatus === 'low') return item.stock_status === 'low' || item.stock_status === 'critical';
        if (filterStatus === 'out') return item.stock_status === 'out';
        return true;
      });
    }
    
    return filtered;
  }, [decoratedIngredients, filterCategory, filterStatus]);

  const handleClearFilters = useCallback(() => {
    setQuickFilter('');
    setFilterCategory('all');
    setFilterStatus('all');
  }, []);

  // Early returns with states
  if (loading) {
    return <LoadingState message="se incarca ingredientele" />;
  }

  if (error) {
    return <ErrorState title="Eroare" message={error} onRetry={() => refetch()} />;
  }

  if (decoratedIngredients.length === 0) {
    return (
      <EmptyState
        title="nu exista ingrediente"
        message="Adaugă primul ingredient pentru a începe."
        actionLabel="adauga ingredient"
        onAction={handleAddIngredient}
      />
    );
  }

  // Header Actions
  const headerActions = (
    <button
      type="button"
      className="excel-button excel-button--primary"
      onClick={handleAddIngredient}
    >
      <span>âž•</span>
      <span>"adauga ingredient"</span>
    </button>
  );

  // Toolbar
  const toolbar = (
    <>
      <TableFilter
        value={quickFilter}
        onChange={(value) => setQuickFilter(value)}
        placeholder="cauta ingredient categorie um"
        aria-label="cautare ingrediente"
      />
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className="excel-dropdown"
      >
        <option value="all">"toate categoriile"</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="excel-dropdown"
      >
        <option value="all">"Toate"</option>
        <option value="active">Doar active</option>
        <option value="hidden">"Ascunse"</option>
        <option value="low">"stoc scazut"</option>
        <option value="out">Epuizate</option>
      </select>
      <button
        type="button"
        className="excel-button"
        onClick={handleClearFilters}
      >
        Reset filtre
      </button>
    </>
  );

  // Footer
  const footer = (
    <>
      <div>
        Total ingrediente: <strong>{filteredIngredients.length}</strong>
        {filteredIngredients.length !== decoratedIngredients.length && (
          <span> (din {decoratedIngredients.length} total)</span>
        )}
      </div>
      <div>Restaurant App V3 powered by QrOMS</div>
    </>
  );

  return (
    <>
      <ExcelPageLayout
        title="Catalog Ingrediente"
        subtitle="gestionare completa a ingredientelor si stocurilor"
        headerActions={headerActions}
        toolbar={toolbar}
        footer={footer}
      >
        <div className="excel-grid-container" style={{ height: 'calc(100vh - 300px)', minHeight: '400px', width: '100%', position: 'relative' }}>
          {filteredIngredients.length > 0 ? (
            <DataGrid<IngredientStockItem>
              columnDefs={columnDefs}
              rowData={filteredIngredients}
              loading={false}
              quickFilterText={quickFilter}
              rowSelection="multiple"
              height="100%"
              gridOptions={{
                rowHeight: 44,
                headerHeight: 48,
                animateRows: true,
                rowSelection: {
                  mode: 'multiRow',
                  checkboxes: true,
                  headerCheckbox: true,
                  selectAll: 'filtered',
                },
              }}
              agGridProps={{
                onCellClicked: handleCellClicked,
                onRowDoubleClicked: handleRowDoubleClicked,
                getRowId: (params) => (params.data?.id ? params.data.id.toString() : ''),
                onGridReady: (event) => {
                  console.log('StockIngredientsTab Grid ready with', event.api.getDisplayedRowCount(), 'rows');
                },
              }}
              onSelectedRowsChange={(rows) => {
                setSelectedIngredients(rows);
              }}
            />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>"nu exista ingrediente care sa corespunda filtrelor"</div>
          )}
        </div>
      </ExcelPageLayout>

      {/* Modals and Drawers */}
      <IngredientEditorModal
        open={editorOpen}
        ingredient={editingIngredient}
        onClose={() => setEditorOpen(false)}
        onSaved={async () => {
          setEditorOpen(false);
          await refreshData();
        }}
      />

      <IngredientBulkUpdateModal
        open={bulkOpen}
        ingredientIds={selectedIngredients.map((item) => item.id)}
        onClose={() => setBulkOpen(false)}
        onApplied={async () => {
          setBulkOpen(false);
          setSelectedIngredients([]);
          await refreshData();
        }}
      />

      <IngredientDetailsDrawer
        open={detailsOpen}
        ingredient={detailsIngredient}
        initialTab="overview"
        onClose={() => setDetailsOpen(false)}
        onVisibilityChanged={async () => {
          await refreshData();
        }}
      />

      <StockAdjustModal
        open={adjustOpen}
        ingredient={adjustIngredient}
        onClose={() => setAdjustOpen(false)}
        onUpdated={async () => {
          setAdjustOpen(false);
          await refreshData();
        }}
      />

      <LowStockDrawer
        open={lowStockDrawerOpen}
        alerts={lowStockAlerts}
        onClose={() => setLowStockDrawerOpen(false)}
      />

      <ExpiringStockDrawer
        open={expiringDrawerOpen}
        items={expiringAlerts}
        onClose={() => setExpiringDrawerOpen(false)}
      />

      <RiskAlertsDrawer
        open={riskAlertsDrawerOpen}
        onClose={() => setRiskAlertsDrawerOpen(false)}
      />
    </>
  );
};





