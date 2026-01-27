import { useEffect, useMemo, useState, useCallback } from 'react';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { StatCard } from '@/shared/components/StatCard';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { TableFilter } from '@/shared/components/TableFilter';
import { MiniBarChart } from '@/shared/components/charts/MiniBarChart';
import { MiniDonutChart } from '@/shared/components/charts/MiniDonutChart';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { Ingredient } from '@/types/ingredients';
import type { IngredientBatch } from '@/types/inventory';
import { LotEditorModal } from '@/modules/lots/components/LotEditorModal';
import { useIngredientBatches } from '@/modules/lots/hooks/useIngredientBatches';
import './LotsPage.css';

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('ro-RO') : '-';

const formatQty = (value?: number) =>
  value === null || value === undefined ? '-' : value.toLocaleString('ro-RO', { maximumFractionDigits: 2 });

const palette = ['#2563eb', '#38bdf8', '#f97316', '#22c55e', '#6366f1', '#ec4899'];

export const LotsPage = () => {
  const [quickFilter, setQuickFilter] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [lotModalOpen, setLotModalOpen] = useState(false);

  const {
    data: ingredientsData,
    loading: ingredientsLoading,
    error: ingredientsError,
    refetch: refetchIngredients,
  } = useApiQuery<Ingredient[]>('/api/ingredients');

  useEffect(() => {
    if (ingredientsData && ingredientsData.length > 0 && selectedIngredientId === null) {
      setSelectedIngredientId(ingredientsData[0].id);
    }
  }, [ingredientsData, selectedIngredientId]);

  const ingredientColumns = useMemo<ColDef<Ingredient>[]>(
    () => [
      { field: 'name', headerName: 'Ingredient', minWidth: 200, pinned: 'left' },
      { field: 'category', headerName: 'Categorie', minWidth: 160 },
      {
        field: 'current_stock',
        headerName: 'Stoc',
        width: 120,
        valueFormatter: ({ value }) => formatQty(Number(value)),
      },
      {
        field: 'min_stock',
        headerName: 'Minim',
        width: 110,
        valueFormatter: ({ value }) => formatQty(Number(value)),
      },
    ],
    [],
  );

  const {
    batches,
    loading: lotsLoading,
    error: lotsError,
    selectedBatchId,
    setSelectedBatchId,
    refresh: refreshLots,
  } = useIngredientBatches(selectedIngredientId);

  const lotColumns = useMemo<ColDef<IngredientBatch>[]>(
    () => [
      { field: 'batch_number', headerName: 'Lot', minWidth: 150, pinned: 'left' },
      {
        field: 'purchase_date',
        headerName: 'Recepționat',
        width: 150,
        valueFormatter: ({ value }) => formatDate(value as string),
      },
      {
        field: 'expiry_date',
        headerName: 'Expiră',
        width: 150,
        valueFormatter: ({ value }) => formatDate(value as string),
      },
      {
        field: 'quantity',
        headerName: 'Cantitate inițială',
        width: 170,
        valueFormatter: ({ value }) => formatQty(Number(value)),
      },
      {
        field: 'remaining_quantity',
        headerName: 'Cantitate rămasă',
        width: 170,
        valueFormatter: ({ value }) => formatQty(Number(value)),
      },
      { field: 'supplier', headerName: 'Furnizor', minWidth: 160 },
      { field: 'invoice_number', headerName: 'Factură', minWidth: 140 },
    ],
    [],
  );

  const selectedIngredient = useMemo(
    () => ingredientsData?.find((item) => item.id === selectedIngredientId) ?? null,
    [ingredientsData, selectedIngredientId],
  );

  const totalIngredients = ingredientsData?.length ?? 0;
  const belowMinStock = useMemo(
    () =>
      (ingredientsData ?? []).filter((item) => {
        const current = Number(item.current_stock ?? 0);
        const min = Number(item.min_stock ?? 0);
        return current <= min;
      }).length,
    [ingredientsData],
  );

  const activeLots = batches.length;
  const expiringSoon = useMemo(
    () =>
      batches.filter((lot) => {
        if (!lot.expiry_date) return false;
        const diff = new Date(lot.expiry_date).getTime() - Date.now();
        return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 5;
      }).length,
    [batches],
  );

  const receivingTrend = useMemo(() => {
    if (!batches.length) return [];
    const order = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
    const map = new Map<string, number>();

    batches.forEach((lot) => {
      if (!lot.purchase_date) return;
      const weekday = new Date(lot.purchase_date).toLocaleDateString('ro-RO', { weekday: 'short' });
      map.set(weekday, (map.get(weekday) ?? 0) + Number(lot.quantity ?? 0));
    });

    return order
      .filter((day) => map.has(day))
      .map((day) => ({ label: day, value: Number(map.get(day)?.toFixed(2) ?? 0) }));
  }, [batches]);

  const supplierDistribution = useMemo(() => {
    if (!batches.length) return [];
    const map = new Map<string, number>();
    batches.forEach((lot) => {
      if (!lot.supplier) return;
      map.set(lot.supplier, (map.get(lot.supplier) ?? 0) + 1);
    });

    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;

    return entries.map(([name, count], index) => ({
      name,
      value: Number(((count / total) * 100).toFixed(1)),
      raw: count,
      color: palette[index % palette.length],
    }));
  }, [batches]);

  const handleIngredientSelection = (selected: Ingredient[]) => {
    if (selected.length) {
      setSelectedIngredientId(selected[0].id);
    }
  };

  const handleIngredientGridReady = (event: GridReadyEvent<Ingredient>) => {
    if (!event.api) return;
    if (selectedIngredientId) {
      event.api.forEachNode((node) => {
        if (node.data?.id === selectedIngredientId) {
          node.setSelected(true);
        }
      });
    } else {
      const firstRow = event.api.getDisplayedRowAtIndex(0);
      if (firstRow?.data?.id) {
        firstRow.setSelected(true);
        setSelectedIngredientId(firstRow.data.id);
      }
    }
  };

  const handleAddLot = useCallback(() => {
    if (!selectedIngredientId) return;
    setLotModalOpen(true);
  }, [selectedIngredientId]);

  const handleLotSelection = useCallback(
    (selected: IngredientBatch[]) => {
      const lotId = selected[0]?.id ?? null;
      setSelectedBatchId(lotId);
    },
    [setSelectedBatchId],
  );

  const handleLotGridReady = useCallback(
    (event: GridReadyEvent<IngredientBatch>) => {
      if (!event.api) return;
      if (selectedBatchId) {
        event.api.forEachNode((node) => {
          if (node.data?.id === selectedBatchId) {
            node.setSelected(true);
          }
        });
      } else {
        const firstRow = event.api.getDisplayedRowAtIndex(0);
        if (firstRow?.data?.id) {
          firstRow.setSelected(true);
          setSelectedBatchId(firstRow.data.id);
        }
      }
    },
    [selectedBatchId, setSelectedBatchId],
  );

  const ingredientsReady = !ingredientsLoading && (ingredientsData !== null || ingredientsError !== null);
  const lotsFetchCompleted = selectedIngredientId === null ? true : !lotsLoading;
  const isPageReady = ingredientsReady && lotsFetchCompleted;

  return (
    <div className="lots-page" data-page-ready={isPageReady ? 'true' : 'false'}>
      <section className="lots-hero">
        <div className="lots-hero__info">
          <div className="lots-hero__labels">
            <span className="lots-chip lots-chip--primary">FIFO & trasabilitate ANSVSA</span>
            <span className="lots-chip">Integrat cu recepții digitale</span>
            <span className="lots-chip">Documente HACCP atașate</span>
          </div>
          <h2>Loturi și recepții – control complet pe lanțul rece</h2>
          <p>
            Monitorizează recepțiile, temperaturile și documentele asociate fiecărui ingredient. Afișăm loturile active,
            serviciile de stoc FIFO și te ajutăm să identifici rapid expirările din următoarele zile.
          </p>
        </div>

        <div className="lots-hero__stats">
          <StatCard
            title="Ingrediente urmărite"
            helper="Înregistrate în gestiune"
            value={`${totalIngredients}`}
            trendLabel="Sub minim"
            trendValue={`${belowMinStock}`}
            trendDirection={belowMinStock > 0 ? 'down' : 'up'}
            icon={<span>📦</span>}
          />

          <StatCard
            title="Loturi active"
            helper={selectedIngredient ? `Ingredient curent: ${selectedIngredient.name}` : 'Selectează un ingredient'}
            value={`${activeLots}`}
            trendLabel="Expiră ≤5 zile"
            trendValue={`${expiringSoon}`}
            trendDirection={expiringSoon > 0 ? 'down' : 'up'}
            icon={<span>⏱️</span>}
          />

          <StatCard
            title="Documente atașate"
            helper="NIR + certificări furnizor"
            value={`${Math.max(activeLots - 1, 0)} documente`}
            trendLabel="Necesită validare"
            trendValue={expiringSoon > 0 ? `${expiringSoon}` : '0'}
            trendDirection={expiringSoon > 0 ? 'flat' : 'up'}
            icon={<span>📑</span>}
            footer={
              <button type="button" className="lots-link-button">
                Deschide manager documente →
              </button>
            }
          />
        </div>

        <div className="lots-hero__analytics">
          <div className="lots-analytics-card">
            <header>
              <span className="lots-analytics-title">Recepții per zi (cantitate totală)</span>
              <span className="lots-analytics-helper">kg / zi</span>
            </header>
            <MiniBarChart data={receivingTrend.length ? receivingTrend : [{ label: 'N/A', value: 0 }]} />
          </div>

          <div className="lots-analytics-card">
            <header>
              <span className="lots-analytics-title">Principalii furnizori</span>
              <span className="lots-analytics-helper">% din loturile ingredientului selectat</span>
            </header>
            <MiniDonutChart
              data={
                supplierDistribution.length
                  ? supplierDistribution.map((item) => ({ name: item.name, value: item.value, color: item.color }))
                  : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]
              }
            />
            <ul className="lots-legend">
              {supplierDistribution.length === 0 ? (
                <li>
                  <span style={{ backgroundColor: '#94a3b8' }} aria-hidden="true" />
                  <span>Fără date disponibile</span>
                  <strong>100%</strong>
                </li>
              ) : (
                supplierDistribution.map((item) => (
                  <li key={item.name}>
                    <span style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <span>{item.name}</span>
                    <strong>
                      {item.value}%
                      <small>{item.raw} loturi</small>
                    </strong>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="lots-toolbar" aria-label="Filtre loturi">
        <div className="lots-toolbar__left">
          <TableFilter
            value={quickFilter}
            onChange={setQuickFilter}
            placeholder="Caută ingredient după nume, categorie, furnizor sau cod trasabilitate"
            aria-label="Filtru rapid loturi"
          />
          <label className="lots-toggle">
            <input type="checkbox" /> Afișează doar ingrediente sub minim
          </label>
        </div>
        <div className="lots-toolbar__actions">
          <button type="button" className="lots-btn lots-btn--ghost" onClick={() => refetchIngredients()}>
            ⟳ Reîmprospătează ingrediente
          </button>
          <button type="button" className="lots-btn lots-btn--ghost" onClick={() => refreshLots()}>
            ⟳ Reîmprospătează loturi
          </button>
          <button type="button" className="lots-btn lots-btn--primary" onClick={handleAddLot} disabled={!selectedIngredientId}>
            ➕ Creează recepție
          </button>
        </div>
      </section>

      <div className="lots-grid">
        <section className="lots-grid__panel">
          <header>
            <div>
              <h3>Ingrediente urmărite</h3>
              <p>{`${totalIngredients} ingrediente · ${belowMinStock} sub minimul de siguranță`}</p>
            </div>
            <button type="button" className="lots-btn lots-btn--outline">
              Export listă ingrediente
            </button>
          </header>

          {ingredientsError ? <InlineAlert type="error" message={ingredientsError} /> : null}

          <DataGrid<Ingredient>
            columnDefs={ingredientColumns}
            rowData={ingredientsData ?? []}
            loading={ingredientsLoading}
            quickFilterText={quickFilter}
            rowSelection="single"
            height="62vh"
            onSelectedRowsChange={handleIngredientSelection}
            onGridReady={handleIngredientGridReady}
            gridOptions={{
              rowHeight: 48,
              headerHeight: 44,
              getRowId: (params) => (params.data?.id ? params.data.id.toString() : ''),
            }}
          />
        </section>

        <section className="lots-grid__panel">
          <header>
            <div>
              <h3>Loturi active & documente</h3>
              <p>
                {selectedIngredient
                  ? `Ingredient selectat: ${selectedIngredient.name}`
                  : 'Selectează un ingredient din lista din stânga.'}
              </p>
            </div>
            <div className="lots-grid__panel-actions">
              <button type="button" className="lots-btn lots-btn--outline">
                Export loturi CSV
              </button>
              <button type="button" className="lots-btn lots-btn--outline">
                Atașează document
              </button>
            </div>
          </header>

          {lotsError ? <InlineAlert type="error" message={lotsError} /> : null}
          {!selectedIngredientId && !lotsLoading ? (
            <InlineAlert type="info" message="Selectează un ingredient pentru a vedea loturile." />
          ) : null}

          <DataGrid<IngredientBatch>
            columnDefs={lotColumns}
            rowData={batches}
            loading={lotsLoading}
            height="62vh"
            rowSelection="single"
            onSelectedRowsChange={handleLotSelection}
            onGridReady={handleLotGridReady}
            gridOptions={{
              rowHeight: 50,
              headerHeight: 44,
              getRowId: (params) => (params.data?.id ? params.data.id.toString() : ''),
            }}
          />
        </section>
      </div>

      <section className="lots-secondary">
        <article className="lots-secondary__card">
          <header>
            <span>Checklist recepție</span>
            <button type="button" className="lots-link-button">
              Deschide șablon HACCP →
            </button>
          </header>
          <ul>
            <li>
              <strong>Temperatură corectă</strong>
              <span>3 loturi în verificare</span>
            </li>
            <li>
              <strong>Documente veterinare</strong>
              <span>2 documente expiră în 7 zile</span>
            </li>
            <li>
              <strong>Trasabilitate completă</strong>
              <span>Loturi mapate 100%</span>
            </li>
          </ul>
        </article>

        <article className="lots-secondary__card">
          <header>
            <span>Automatizări recepții</span>
            <button type="button" className="lots-link-button">
              Configurează alerte →
            </button>
          </header>
          <ul>
            <li>
              <strong>Alerte expirare</strong>
              <span>Notificare email + SMS</span>
            </li>
            <li>
              <strong>Integrare furnizor</strong>
              <span>Upload facturi PDF automat</span>
            </li>
            <li>
              <strong>Sync cu contabilitate</strong>
              <span>Export zilnic 02:00</span>
            </li>
          </ul>
        </article>
      </section>
      <LotEditorModal
        open={lotModalOpen}
        ingredientId={selectedIngredientId}
        ingredientName={selectedIngredient?.name}
        onClose={() => setLotModalOpen(false)}
        onSaved={() => {
          refreshLots();
          refetchIngredients();
        }}
      />
    </div>
  );
};
