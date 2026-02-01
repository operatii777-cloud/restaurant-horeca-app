// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState, useCallback } from 'react';
import type { ColDef, GridReadyEvent, CellClickedEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import { StatCard } from '@/shared/components/StatCard';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { MiniBarChart } from '@/shared/components/charts/MiniBarChart';
import { MiniDonutChart } from '@/shared/components/charts/MiniDonutChart';
import { TableFilter } from '@/shared/components/TableFilter';
import type { Ingredient } from '@/types/ingredients';
import type { IngredientTraceRecord } from '@/types/traceability';
import { TraceOrderModal } from '@/modules/traceability/components/TraceOrderModal';
import { useTraceabilityGridData, getTraceabilityRecordStats } from '@/modules/traceability/hooks/useTraceabilityGridData';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import './TraceabilityPage.css';

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('ro-RO') : '-';

const formatQty = (value?: number) =>
  value === null || value === undefined ? '-' : value.toLocaleString('ro-RO', { maximumFractionDigits: 2 });

const palette = ['#2563eb', '#38bdf8', '#6366f1', '#f97316', '#22c55e', '#ec4899'];

export const TraceabilityPage = () => {
  //   const { t } = useTranslation();
  const [quickFilter, setQuickFilter] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const debouncedFilter = useDebouncedValue(quickFilter, 200);

  const {
    ingredients,
    filteredIngredients,
    ingredientsLoading,
    ingredientsError,
    refetchIngredients,
    stats: ingredientStats,
  } = useTraceabilityGridData(debouncedFilter);

  useEffect(() => {
    if (ingredients.length > 0 && selectedIngredientId === null) {
      setSelectedIngredientId(ingredients[0].id);
    }
  }, [ingredients, selectedIngredientId]);

  const ingredientColumns = useMemo<ColDef<Ingredient>[]>(
    () => [
      { field: 'name', headerName: 'Ingredient', minWidth: 200, pinned: 'left' },
      { field: 'category', headerName: 'Categorie', minWidth: 150 },
      { field: 'unit', headerName: 'Unitate', width: 120 },
    ],
    [],
  );

  const traceEndpoint = selectedIngredientId ? `/api/ingredients/${selectedIngredientId}/traceability` : null;

  const {
    data: traceData,
    loading: traceLoading,
    error: traceError,
    refetch: refetchTrace,
  } = useApiQuery<IngredientTraceRecord[]>(traceEndpoint);

  const traceColumns = useMemo<ColDef<IngredientTraceRecord>[]>(
    () => [
      { field: 'order_id', headerName: 'Comandă', width: 120, pinned: 'left' },
      {
        field: 'order_timestamp',
        headerName: 'Dată comandă',
        minWidth: 190,
        valueFormatter: ({ value }) => formatDateTime(value as string),
      },
      { field: 'batch_number', headerName: 'Lot', minWidth: 140 },
      {
        field: 'quantity_used',
        headerName: 'Cantitate folosită',
        minWidth: 160,
        valueFormatter: ({ value }) => formatQty(Number(value)),
      },
      { field: 'supplier', headerName: 'Furnizor', minWidth: 160 },
      { field: 'order_status', headerName: 'Status comandă', minWidth: 150 },
      {
        field: 'is_paid',
        headerName: 'Plată',
        width: 120,
        valueFormatter: ({ value }) => (value ? 'Achitată' : 'Neachitată'),
      },
      {
        headerName: 'Acțiuni',
        colId: 'actions',
        width: 140,
        pinned: 'right',
        sortable: false,
        filter: false,
        valueGetter: () => 'Detalii comandă →',
        cellClass: 'trace-grid__action-cell',
      },
    ],
    [],
  );

  const selectedIngredient = useMemo(
    () => ingredients.find((item) => item.id === selectedIngredientId) ?? null,
    [ingredients, selectedIngredientId],
  );

  const recordStats = useMemo(() => getTraceabilityRecordStats(traceData ?? []), [traceData]);
  const totalTraceRecords = recordStats.totalRecords;
  const totalQuantityUsed = recordStats.totalQuantityUsed;
  const paidOrders = recordStats.paid;

  const orderStatusDistribution = useMemo(() => {
    if (!traceData || traceData.length === 0) return [];
    const map = new Map<string, number>();
    traceData.forEach((record) => {
      if (!record.order_status) return;
      map.set(record.order_status, (map.get(record.order_status) ?? 0) + 1);
    });

    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;

    return entries.map(([name, count], index) => ({
      name,
      value: Number(((count / total) * 100).toFixed(1)),
      raw: count,
      color: palette[index % palette.length],
    }));
  }, [traceData]);

  const usageTrend = useMemo(() => {
    if (!traceData || traceData.length === 0) return [];
    const map = new Map<string, number>();

    traceData.forEach((record) => {
      if (!record.order_timestamp) return;
      const day = new Date(record.order_timestamp).toLocaleDateString('ro-RO', { weekday: 'short' });
      map.set(day, (map.get(day) ?? 0) + (record.quantity_used ?? 0));
    });

    const order = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
    return order
      .filter((day) => map.has(day))
      .map((day) => ({ label: day, value: Number((map.get(day) ?? 0).toFixed(2)) }));
  }, [traceData]);

  const paymentDistribution = useMemo(() => {
    if (!traceData || traceData.length === 0) return [];
    const paid = paidOrders;
    const unpaid = traceData.length - paid;
    return [
      { name: 'Achitate', value: traceData.length ? Number(((paid / traceData.length) * 100).toFixed(1)) : 0, raw: paid, color: '#22c55e' },
      { name: 'Neachitate', value: traceData.length ? Number(((unpaid / traceData.length) * 100).toFixed(1)) : 0, raw: unpaid, color: '#f97316' },
    ];
  }, [traceData, paidOrders]);

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

  const openOrderModal = useCallback((orderId: number | null) => {
    if (!orderId) return;
    setSelectedOrderId(orderId);
    setOrderModalOpen(true);
  }, []);

  const handleTraceCellClicked = useCallback(
    (event: CellClickedEvent<IngredientTraceRecord>) => {
      if (event.colDef.colId === 'actions' && event.data) {
        openOrderModal(event.data.order_id);
      }
    },
    'openOrderModal',
  );

  const handleTraceRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent<IngredientTraceRecord>) => {
      if (event.data) {
        openOrderModal(event.data.order_id);
      }
    },
    'openOrderModal',
  );

  const ingredientsReady = !ingredientsLoading;
  const traceFetchCompleted = traceEndpoint === null ? true : !traceLoading;
  const isPageReady = ingredientsReady && traceFetchCompleted;

  return (
    <div className="trace-page" data-page-ready={isPageReady ? 'true' : 'false'}>
      <section className="trace-hero">
        <div className="trace-hero__info">
          <div className="trace-hero__labels">
            <span className="trace-chip trace-chip--primary">Trasabilitate completă ANSVSA / ANPC</span>
            <span className="trace-chip">Order → Ingredient → Lot</span>
            <span className="trace-chip">Audit ready în &lt; 3 sec</span>
          </div>
          <h2>Trasabilitate operațională – fiecare ingredient urmărit până la livrare</h2>
          <p>
            Verifici în timp real ce lot s-a folosit pentru fiecare comandă, ce documente sunt atașate și dacă plata a
            fost procesată. Avem integrare directă cu istoricul recepțiilor și rapoarte gata de audit.
          </p>
        </div>

        <div className="trace-hero__stats">
          <StatCard
            title="Înregistrări trasabilitate"
            helper={selectedIngredient ? `Ingredient: ${selectedIngredient.name}` : 'Selectează un ingredient'}
            value={`${totalTraceRecords}`}
            trendLabel="Cantitate totală"
            trendValue={`${formatQty(totalQuantityUsed)} ${selectedIngredient?.unit ?? ''}`}
            trendDirection={totalQuantityUsed > 0 ? 'up' : 'flat'}
            icon={<span>🔗</span>}
          />

          <StatCard
            title="Comenzi achitate"
            helper="Status sincronizat cu POS și livrări"
            value={`${paidOrders}`}
            trendLabel="Neachitate"
            trendValue={`${Math.max(totalTraceRecords - paidOrders, 0)}`}
            trendDirection={totalTraceRecords - paidOrders > 0 ? 'down' : 'up'}
            icon={<span>💳</span>}
          />

          <StatCard
            title="Ingrediente monitorizate"
            helper="Trasabilitate activă & loturi mapate"
            value={`${ingredientStats.totalIngredients}`}
            trendLabel="Sub stoc de siguranță"
            trendValue={`${ingredientStats.belowSafetyStock}`}
            trendDirection={ingredientStats.belowSafetyStock > 0 ? 'down' : 'up'}
            icon={<span>🥕</span>}
            footer={
              <button type="button" className="trace-link-button">
                Deschide registrul oficial →
              </button>
            }
          />
        </div>

        <div className="trace-hero__analytics">
          <div className="trace-analytics-card">
            <header>
              <span className="trace-analytics-title">Consum per zi (cantitate trasată)</span>
              <span className="trace-analytics-helper">Unitatea ingredientului selectat</span>
            </header>
            <MiniBarChart data={usageTrend.length ? usageTrend : [{ label: 'N/A', value: 0 }]} />
          </div>

          <div className="trace-analytics-card">
            <header>
              <span className="trace-analytics-title">Distribuție status comenzi</span>
              <span className="trace-analytics-helper">% din total înregistrări</span>
            </header>
            <MiniDonutChart
              data={
                orderStatusDistribution.length
                  ? orderStatusDistribution.map((item) => ({ name: item.name, value: item.value, color: item.color }))
                  : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]
              }
            />
            <ul className="trace-legend">
              {orderStatusDistribution.length === 0 ? (
                <li>
                  <span className="trace-legend__dot trace-legend__dot--default" aria-hidden="true" />
                  <span>fără date disponibile</span>
                  <strong>100%</strong>
                </li>
              ) : (
                orderStatusDistribution.map((item, index) => (
                  <li key={`${item.name}-index`}>
                    <span
                      className={`trace-legend__dot trace-legend__dot--palette-${index % palette.length}`}
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                    <strong>
                      {item.value}%
                      <small>{item.raw} intrări</small>
                    </strong>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="trace-analytics-card">
            <header>
              <span className="trace-analytics-title">Status plată</span>
              <span className="trace-analytics-helper">% din total comenzi trasate</span>
            </header>
            <MiniDonutChart
              data={
                paymentDistribution.length
                  ? paymentDistribution.map((item) => ({ name: item.name, value: item.value, color: item.color }))
                  : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]
              }
            />
            <ul className="trace-legend">
              {paymentDistribution.length === 0 ? (
                <li>
                  <span className="trace-legend__dot trace-legend__dot--default" aria-hidden="true" />
                  <span>fără date disponibile</span>
                  <strong>100%</strong>
                </li>
              ) : (
                paymentDistribution.map((item, index) => {
                  const normalized = item.name.toLowerCase();
                  const colorClass =
                    normalized.includes('achitat') || index === 0
                      ? 'trace-legend__dot--paid'
                      : 'trace-legend__dot--unpaid';
                  return (
                    <li key={`${item.name}-index`}>
                      <span className={`trace-legend__dot ${colorClass}`} aria-hidden="true" />
                      <span>{item.name}</span>
                      <strong>
                        {item.value}%
                        <small>{item.raw} comenzi</small>
                      </strong>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="trace-toolbar" aria-label="Filtre trasabilitate">
        <div className="trace-toolbar__left">
          <TableFilter
            value={quickFilter}
            onChange={setQuickFilter}
            placeholder="Caută ingredient după nume, categorie, lot, furnizor..."
            aria-label="Filtru rapid trasabilitate"
          />
          <label className="trace-toggle">
            <input type="checkbox" />afișează doar înregistrările neachitate</label>
        </div>
        <div className="trace-toolbar__actions">
          <button type="button" className="trace-btn trace-btn--ghost" onClick={() => refetchIngredients()}>
            ⟳ Reîmprospătează ingrediente
          </button>
          <button type="button" className="trace-btn trace-btn--ghost" onClick={() => refetchTrace()}>
            ⟳ Reîmprospătează trasabilitate
          </button>
          <button type="button" className="trace-btn trace-btn--primary">
            ⬇️ Export registru oficial
          </button>
        </div>
      </section>

      <div className="trace-grid">
        <section className="trace-grid__panel">
          <header>
            <div>
              <h3>Ingrediente monitorizate</h3>
              <p>{`${ingredients.length} ingrediente · trasabilitate completă`}</p>
            </div>
            <button type="button" className="trace-btn trace-btn--outline">importă lista audit</button>
          </header>

          {ingredientsError ? <InlineAlert type="error" message={ingredientsError} /> : null}

          <DataGrid<Ingredient>
            columnDefs={ingredientColumns}
            rowData={filteredIngredients}
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

        <section className="trace-grid__panel">
          <header>
            <div>
              <h3>Consum și mapare loturi</h3>
              <p>
                {selectedIngredient
                  ? `Ingredient selectat: ${selectedIngredient.name} (${selectedIngredient.unit ?? ''})`
                  : 'Selectează un ingredient pentru a urmări consumul.'}
              </p>
            </div>
            <div className="trace-grid__panel-actions">
              <button type="button" className="trace-btn trace-btn--outline">
                Export Excel trasabilitate
              </button>
              <button type="button" className="trace-btn trace-btn--outline">generează raport PDF</button>
            </div>
          </header>

          {traceError ? <InlineAlert type="error" message={traceError} /> : null}
          {!selectedIngredientId && !traceLoading ? (
            <InlineAlert type="info" message="Selectează un ingredient pentru a vedea trasabilitatea." />
          ) : null}

          <DataGrid<IngredientTraceRecord>
            columnDefs={traceColumns}
            rowData={traceData ?? []}
            loading={traceLoading}
            height="62vh"
            gridOptions={{
              rowHeight: 50,
              headerHeight: 44,
            }}
            agGridProps={{
              onCellClicked: handleTraceCellClicked,
              onRowDoubleClicked: handleTraceRowDoubleClicked,
              getRowId: (params) => (params.data ? `${params.data.order_id}-${params.data.batch_number}` : `${Math.random()}`),
            }}
          />
        </section>
      </div>

      <TraceOrderModal
        open={orderModalOpen}
        orderId={selectedOrderId}
        onClose={() => {
          setOrderModalOpen(false);
          setSelectedOrderId(null);
        }}
      />
    </div>
  );
};



