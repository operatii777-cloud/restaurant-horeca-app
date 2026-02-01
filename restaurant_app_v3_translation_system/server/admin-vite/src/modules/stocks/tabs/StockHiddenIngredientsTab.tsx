// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useMemo, useState } from 'react';
import type { ColDef, CellClickedEvent } from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import { IngredientDetailsDrawer } from '@/modules/ingredients/components/IngredientDetailsDrawer';
import type { Ingredient } from '@/types/ingredients';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import './StockHiddenIngredientsTab.css';

interface StockHiddenIngredientsTabProps {
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const StockHiddenIngredientsTab = ({ onFeedback }: StockHiddenIngredientsTabProps) => {
  //   const { t } = useTranslation();
  const { data, loading, error, refetch } = useApiQuery<Ingredient[]>('/api/ingredients?hidden_only=true');
  const ingredients = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [quickFilter, setQuickFilter] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsIngredient, setDetailsIngredient] = useState<Ingredient | null>(null);

  const columnDefs = useMemo<ColDef<Ingredient>[]>(
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
        field: 'current_stock' as any,
        width: 140,
      },
      {
        headerName: 'Stoc minim',
        field: 'min_stock' as any,
        width: 140,
      },
      {
        headerName: 'Acțiuni',
        colId: 'actions',
        width: 180,
        pinned: 'right',
        cellRenderer: () => (
          <div className="stock-hidden__row-actions">
            <button data-action="restore">↩️ Restaurează</button>
            <button data-action="details">🔎 Detalii</button>
          </div>
        ),
      },
    ],
    [],
  );

  const refreshData = useCallback(async () => {
    await refetch();
  }, []);

  const handleCellClicked = useCallback(
    (event: CellClickedEvent<Ingredient>) => {
      if (!event.data || event.colDef.colId !== 'actions') return;
      const domEvent = event.event;
      if (!domEvent) return;
      const action = (domEvent.target as HTMLElement | null)?.closest('button[data-action]')?.getAttribute('data-action');
      if (!action) return;

      if (action === 'restore') {
        httpClient
          .patch(`/api/ingredients/${event.data.id}/restore`)
          .then(async () => {
            onFeedback(`Ingredientul "${event.data?.name}" a fost restaurat.`, 'success');
            await refreshData();
          })
          .catch((error) => {
            console.error('❌ Eroare la restaurarea ingredientului:', error);
            const message = error instanceof Error ? error.message : 'Nu s-a putut restaura ingredientul.';
            onFeedback(message, 'error');
          });
      } else if (action === 'details') {
        setDetailsIngredient(event.data);
        setDetailsOpen(true);
      }
    },
    [onFeedback, refreshData],
  );

  return (
    <div className="stock-hidden">
      <div className="stock-hidden__toolbar">
        <input
          type="search"
          className="stock-hidden__search"
          placeholder="cauta ingredient ascuns dupa nume sau categorie"
          value={quickFilter}
          onChange={(event) => setQuickFilter(event.target.value)}
        />
        <span className="stock-hidden__count">{ingredients.length} ingrediente ascunse</span>
      </div>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      <DataGrid<Ingredient>
        columnDefs={columnDefs}
        rowData={ingredients}
        loading={loading}
        quickFilterText={quickFilter}
        height="60vh"
        agGridProps={{
          onCellClicked: handleCellClicked,
          getRowId: (params) => (params.data?.id ? params.data.id.toString() : ''),
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
    </div>
  );
};




