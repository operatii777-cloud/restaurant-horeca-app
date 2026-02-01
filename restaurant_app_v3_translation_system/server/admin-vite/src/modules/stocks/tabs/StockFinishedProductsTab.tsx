// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColDef, CellClickedEvent } from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import { RecipeEditorModal } from '@/modules/recipes/components/RecipeEditorModal';
import { FinishedProductModal } from '@/modules/stocks/components/FinishedProductModal';
import type { FinishedProductStock, StockSummary } from '@/types/stocks';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { RecipeProductSummary } from '@/types/recipes';
import './StockFinishedProductsTab.css';

interface StockFinishedProductsTabProps {
  onSummary: (patch: Partial<StockSummary>) => void;
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const isTrue = (value: unknown) => value === true || value === 1 || value === '1';

export const StockFinishedProductsTab = ({ onSummary, onFeedback }: StockFinishedProductsTabProps) => {
  //   const { t } = useTranslation();
  const { data, loading, error, refetch } = useApiQuery<FinishedProductStock[]>('/api/stocks/finished-products');
  const products = useMemo<FinishedProductStock[]>(() => (Array.isArray(data) ? data : []), [data]);

  const decoratedProducts = useMemo<FinishedProductStock[]>(() =>
    products.map((product) => {
      const current = Number(product.current_stock ?? 0);
      const minimum = Number(product.min_stock ?? 0);
      let stockStatus = product.stock_status;

      if (!stockStatus) {
        if (current <= 0) {
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
        ...product,
        stock_status: stockStatus,
      };
    }),
    [products],
  );

  const [quickFilter, setQuickFilter] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [recipeModalProduct, setRecipeModalProduct] = useState<RecipeProductSummary | null>(null);

  useEffect(() => {
    // Only update summary when we have actual data (not during loading/error states)
    if (!loading && !error) {
      const autoManaged = decoratedProducts.filter((item) => isTrue(item.is_auto_managed)).length;
      onSummary({
        finishedProductsWithStock: decoratedProducts.length,
        autoManagedProducts: autoManaged,
      });
    }
  }, [decoratedProducts, onSummary, loading, error]);

  const columnDefs = useMemo<ColDef<FinishedProductStock>[]>(
    () => [
      {
        headerName: 'Produs',
        field: 'product_name',
        minWidth: 220,
        valueGetter: ({ data }) => data?.product_name || data?.name || 'Produs necunoscut',
      },
      {
        headerName: 'Categorie',
        field: 'category',
        minWidth: 160,
      },
      {
        headerName: 'Preț (RON)',
        field: 'price',
        width: 140,
        valueFormatter: ({ value }) => (value === null || value === undefined ? '-' : Number(value).toFixed(2)),
      },
      {
        headerName: 'Stoc curent',
        field: 'current_stock' as any,
        width: 140,
      },
      {
        headerName: 'Stoc minim',
        field: 'min_stock' as any,
        width: 130,
      },
      {
        headerName: 'Stoc maxim',
        field: 'max_stock' as any,
        width: 130,
      },
      {
        headerName: 'Auto',
        field: 'is_auto_managed' as any,
        width: 110,
        valueFormatter: ({ value }) => (isTrue(value) ? 'Da' : 'Nu'),
      },
      {
        headerName: 'Status',
        field: 'stock_status' as any,
        width: 130,
        valueFormatter: ({ value }) =>
          value === 'out' ? 'Epuizat' : value === 'critical' ? 'Critic' : value === 'low' ? 'Scăzut' : 'OK',
      },
      {
        headerName: 'Acțiuni',
        colId: 'actions',
        width: 220,
        pinned: 'right',
        cellRenderer: () => (
          <div className="stock-finished__row-actions">
            <button data-action="edit">📝 Editare</button>
            <button data-action="recipe">📋 Rețetă</button>
            <button data-action="delete">🗑️ Șterge</button>
          </div>
        ),
      },
    ],
    [],
  );

  const refreshData = useCallback(async () => {
    await refetch();
  }, []);

  const handleAdd = useCallback(() => {
    setEditingProductId(null);
    setEditorOpen(true);
  }, []);

  const handleCellClicked = useCallback(
    (event: CellClickedEvent<FinishedProductStock>) => {
      if (!event.data || event.colDef.colId !== 'actions') return;
      const domEvent = event.event;
      if (!domEvent) return;
      const target = (domEvent.target as HTMLElement | null)?.closest('button[data-action]');
      const action = target?.getAttribute('data-action');
      if (!action) return;

      if (action === 'edit') {
        setEditingProductId(event.data.product_id);
        setEditorOpen(true);
      } else if (action === 'recipe') {
        setRecipeModalProduct({
          product_id: event.data.product_id,
          product_name: event.data.product_name ?? event.data.name ?? 'Produs fără nume',
          product_category: event.data.category ?? 'Nespecificat',
          recipe_count: Number((event.data as { recipe_count?: number }).recipe_count ?? 0),
        });
      } else if (action === "delete") {
        if (confirm('Sigur dorești să ștergi stocul configurat pentru acest produs finit?')) {
          httpClient
            .delete(`/api/stock/finished-products/${event.data.product_id}`)
            .then(async () => {
              onFeedback('Stocul produsului finit a fost eliminat.', 'success');
              await refreshData();
            })
            .catch((error) => {
              console.error('❌ Eroare la ștergerea produsului finit:', error);
              const message = error instanceof Error ? error.message : 'Nu s-a putut șterge stocul produsului.';
              onFeedback(message, 'error');
            });
        }
      }
    },
    [onFeedback, refreshData],
  );

  return (
    <div className="stock-finished">
      <div className="stock-finished__toolbar">
        <div className="stock-finished__toolbar-left">
          <input
            type="search"
            className="stock-finished__search"
            placeholder="cauta produs dupa nume sau categorie"
            value={quickFilter}
            onChange={(event) => setQuickFilter(event.target.value)}
          />
        </div>
        <div className="stock-finished__toolbar-actions">
          <button type="button" className="btn btn-ghost" onClick={refreshData}>
            🔄 Reîmprospătează
          </button>
          <button type="button" className="btn btn-primary" onClick={handleAdd}>
            ➕ Adaugă produs finit
          </button>
        </div>
      </div>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      <DataGrid<FinishedProductStock>
        columnDefs={columnDefs}
        rowData={decoratedProducts}
        loading={loading}
        quickFilterText={quickFilter}
        height="60vh"
        agGridProps={{
          onCellClicked: handleCellClicked,
          getRowId: (params) => (params.data?.product_id ? params.data.product_id.toString() : ''),
        }}
      />

      <FinishedProductModal
        open={editorOpen}
        productId={editingProductId}
        onClose={() => setEditorOpen(false)}
        onSaved={async () => {
          setEditorOpen(false);
          await refreshData();
        }}
      />

      <RecipeEditorModal
        open={recipeModalProduct !== null}
        product={recipeModalProduct}
        onClose={() => setRecipeModalProduct(null)}
        onSaved={async (message) => {
          onFeedback(message, 'success');
          setRecipeModalProduct(null);
          await refreshData();
        }}
      />
    </div>
  );
};




