import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ColDef,
  CellClickedEvent,
  RowDoubleClickedEvent,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { TableFilter } from '@/shared/components/TableFilter';
import { InlineAlert } from '@/shared/components/InlineAlert';
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
import './StockIngredientsTab.css';

interface StockIngredientsTabProps {
  onSummary: (patch: Partial<StockSummary>) => void;
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const isTrue = (value: unknown) => value === true || value === 1 || value === '1';

const formatNumber = (value?: number | null) =>
  value === null || value === undefined ? '-' : Number(value).toLocaleString('ro-RO', { maximumFractionDigits: 2 });

export const StockIngredientsTab = ({ onSummary, onFeedback }: StockIngredientsTabProps) => {
  const { data, loading, error, refetch } = useApiQuery<Ingredient[]>('/api/ingredients');
  const ingredients = useMemo<IngredientStockItem[]>(() => (Array.isArray(data) ? data : []), [data]);

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
    [ingredients],
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
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
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
        width: 140,
        valueFormatter: ({ value }) => formatNumber(Number(value)),
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
        valueGetter: ({ data }: { data?: IngredientStockItem | null }) => data?.stock_status ?? '—',
        cellRenderer: ({ value }: ICellRendererParams<IngredientStockItem>) => {
          if (!value) return '—';
          const label = value === 'out' ? 'Epuizat' : value === 'low' ? 'Scăzut' : value === 'critical' ? 'Critic' : 'OK';
          return `<span class="stock-ingredients__badge stock-ingredients__badge--${value}">${label}</span>`;
        },
      },
      {
        headerName: 'Acțiuni',
        colId: 'actions',
        width: 200,
        pinned: 'right',
        cellRenderer: () =>
          `<div class="stock-ingredients__row-actions">
            <button data-action="edit">✏️ Editare</button>
            <button data-action="adjust">⚖️ Ajustează</button>
            <button data-action="details">🔍 Detalii</button>
          </div>`,
      },
    ],
    [],
  );

  const handleSelectionChange = useCallback((rows: IngredientStockItem[]) => {
    setSelectedIngredients(rows);
  }, []);

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

  const handleBulkUpdate = useCallback(() => {
    if (!selectedIngredients.length) {
      onFeedback('Selectează ingredientele pe care dorești să le actualizezi în masă.', 'info');
      return;
    }
    setBulkOpen(true);
  }, [selectedIngredients, onFeedback]);

  const refreshData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleAutoPopulate = useCallback(async () => {
    try {
      const response = await httpClient.post('/api/stock/auto-populate');
      const message = response.data?.message || 'Stocurile au fost populate automat.';
      onFeedback(message, 'success');
      await refreshData();
    } catch (error) {
      console.error('❌ Eroare la auto-populate:', error);
      const message = error instanceof Error ? error.message : 'Nu s-a putut rula auto-populate.';
      onFeedback(message, 'error');
    }
  }, [onFeedback, refreshData]);

  const handleCheckUpdate = useCallback(async () => {
    try {
      const response = await httpClient.post('/api/stock/check-update');
      const message = response.data?.message || 'Verificarea stocurilor a fost finalizată.';
      onFeedback(message, 'success');
      await refreshData();
    } catch (error) {
      console.error('❌ Eroare la check-update:', error);
      const message = error instanceof Error ? error.message : 'Nu s-a putut verifica stocul.';
      onFeedback(message, 'error');
    }
  }, [onFeedback, refreshData]);

  const handleShowLowStock = useCallback(async () => {
    try {
      const response = await httpClient.get('/api/stock/low-stock');
      const alerts: LowStockAlert[] = response.data?.low_stock_products ?? [];
      setLowStockAlerts(alerts);
      setLowStockDrawerOpen(true);
      if (alerts.length) {
        onFeedback(`S-au identificat ${alerts.length} produse cu stoc scăzut.`, 'info');
      } else {
        onFeedback('Nu există produse finite cu stoc sub prag.', 'success');
      }
    } catch (error) {
      console.error('❌ Eroare la preluarea alertelor de stoc:', error);
      const message = error instanceof Error ? error.message : 'Nu s-a putut obține lista de alerte.';
      onFeedback(message, 'error');
    }
  }, [onFeedback]);

  const handleShowExpiring = useCallback(async () => {
    try {
      const response = await httpClient.get('/api/admin/inventory/expiring');
      const items = response.data?.expiring_items ?? [];
      setExpiringAlerts(items);
      setExpiringDrawerOpen(true);
      if (items.length) {
        onFeedback(`S-au identificat ${items.length} ingrediente care expiră în curând.`, 'info');
      } else {
        onFeedback('Nu există ingrediente care expiră în următoarele 30 de zile.', 'success');
      }
    } catch (error) {
      console.error('❌ Eroare la preluarea alertelor de expirări:', error);
      const message = error instanceof Error ? error.message : 'Nu s-a putut obține lista de expirări.';
      onFeedback(message, 'error');
    }
  }, [onFeedback]);

  const handleHideIngredients = useCallback(async () => {
    if (!selectedIngredients.length) {
      onFeedback('Selectează ingredientele pe care dorești să le marchezi ca ascunse.', 'info');
      return;
    }
    try {
      await Promise.all(selectedIngredients.map((item) => httpClient.patch(`/api/ingredients/${item.id}/hide`)));
      onFeedback(`Ingredientele selectate au fost marcate ca neinventariabile.`, 'success');
      setSelectedIngredients([]);
      await refreshData();
    } catch (error) {
      console.error('❌ Eroare la ascunderea ingredientelor:', error);
      const message = error instanceof Error ? error.message : 'Nu s-a putut finaliza acțiunea.';
      onFeedback(message, 'error');
    }
  }, [selectedIngredients, onFeedback, refreshData]);

  const handleRestoreIngredients = useCallback(async () => {
    if (!selectedIngredients.length) {
      onFeedback('Selectează ingredientele pe care dorești să le restaurezi.', 'info');
      return;
    }
    try {
      await Promise.all(selectedIngredients.map((item) => httpClient.patch(`/api/ingredients/${item.id}/restore`)));
      onFeedback(`Ingredientele selectate au fost restaurate în gestiune.`, 'success');
      setSelectedIngredients([]);
      await refreshData();
    } catch (error) {
      console.error('❌ Eroare la restaurarea ingredientelor:', error);
      const message = error instanceof Error ? error.message : 'Nu s-a putut finaliza acțiunea.';
      onFeedback(message, 'error');
    }
  }, [selectedIngredients, onFeedback, refreshData]);

  const handleExportReport = useCallback(
    async (format: 'excel' | 'pdf', type: 'stock_overview' | 'low_stock' | 'expiring' | 'batches' | 'invoices') => {
      try {
        const url = `/api/admin/inventory/export/${format}?type=${type}`;
        const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
        const fullUrl = `${baseUrl}${url}`;

        if (format === 'excel') {
          const link = document.createElement('a');
          link.href = fullUrl;
          link.download = `raport_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          onFeedback(`Raport Excel "${type}" a fost generat cu succes.`, 'success');
        } else if (format === 'pdf') {
          window.open(fullUrl, '_blank');
          onFeedback(`Raport PDF "${type}" a fost generat cu succes.`, 'success');
        }
      } catch (error) {
        console.error(`❌ Eroare la exportul raportului ${format} (${type}):`, error);
        const message = error instanceof Error ? error.message : 'Nu s-a putut genera raportul.';
        onFeedback(message, 'error');
      }
    },
    [onFeedback],
  );

  return (
    <div className="stock-ingredients">
      <div className="stock-ingredients__toolbar">
        <TableFilter
          value={quickFilter}
          onChange={(value) => setQuickFilter(value)}
          placeholder="Caută ingredient după nume, categorie sau furnizor"
          aria-label="Filtru rapid ingrediente"
        />
        <div className="stock-ingredients__toolbar-actions">
          <button type="button" className="btn btn-ghost" onClick={refreshData}>
            ⟳ Reîmprospătează
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleAutoPopulate}>
            🤖 Populează automat
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleCheckUpdate}>
            🔄 Verifică & actualizează
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleShowLowStock}>
            ⚠️ Stoc scăzut
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleShowExpiring}>
            ⏰ Expirări
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setRiskAlertsDrawerOpen(true)}>
            ⚠️ Alerte Risc
          </button>
          <div className="stock-ingredients__export-dropdown">
            <button type="button" className="btn btn-ghost" title="Export rapoarte">
              📊 Export
            </button>
            <div className="stock-ingredients__export-menu">
              <div className="stock-ingredients__export-section">
                <span>Excel</span>
                <button type="button" onClick={() => handleExportReport('excel', 'stock_overview')}>
                  📄 Stoc General
                </button>
                <button type="button" onClick={() => handleExportReport('excel', 'low_stock')}>
                  ⚠️ Stoc Scăzut
                </button>
                <button type="button" onClick={() => handleExportReport('excel', 'expiring')}>
                  ⏰ Expirări (30 zile)
                </button>
                <button type="button" onClick={() => handleExportReport('excel', 'batches')}>
                  📦 Toate Loturile
                </button>
                <button type="button" onClick={() => handleExportReport('excel', 'invoices')}>
                  🧾 Facturi Importate
                </button>
              </div>
              <div className="stock-ingredients__export-section">
                <span>PDF</span>
                <button type="button" onClick={() => handleExportReport('pdf', 'stock_overview')}>
                  📄 Stoc General
                </button>
                <button type="button" onClick={() => handleExportReport('pdf', 'low_stock')}>
                  ⚠️ Stoc Scăzut
                </button>
                <button type="button" onClick={() => handleExportReport('pdf', 'expiring')}>
                  ⏰ Expirări (30 zile)
                </button>
              </div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleBulkUpdate} disabled={!selectedIngredients.length}>
            📦 Actualizare în masă
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleHideIngredients} disabled={!selectedIngredients.length}>
            👻 Marchează neinventariabil
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleRestoreIngredients} disabled={!selectedIngredients.length}>
            ✅ Restaurează selecția
          </button>
          <button type="button" className="btn btn-primary" onClick={handleAddIngredient}>
            ➕ Adaugă ingredient
          </button>
        </div>
      </div>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      <DataGrid<IngredientStockItem>
        columnDefs={columnDefs}
        rowData={decoratedIngredients}
        loading={loading}
        quickFilterText={quickFilter}
        rowSelection="multiple"
        height="60vh"
        agGridProps={{
          onCellClicked: handleCellClicked,
          onRowDoubleClicked: handleRowDoubleClicked,
          getRowId: (params) => (params.data?.id ? params.data.id.toString() : ''),
        }}
        onSelectedRowsChange={handleSelectionChange}
      />

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
    </div>
  );
};
