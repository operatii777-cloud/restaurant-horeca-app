import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { ColDef } from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { StatCard } from '@/shared/components/StatCard';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { TopProduct, TopProductsResponse } from '@/types/orders';
import './TopProductsPanel.css';

type CategoryFilter = 'all' | 'alimente' | 'bauturi';

type TopProductsPanelProps = {
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
};

function buildQuickRange(range: 'today' | 'yesterday' | 'week' | 'month' | 'all') {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === 'yesterday') {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  } else if (range === 'week') {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === 'month') {
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    return { startDate: null as string | null, endDate: null as string | null };
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export const TopProductsPanel = ({ onFeedback }: TopProductsPanelProps) => {
  const [filters, setFilters] = useState<{ startDate: string | null; endDate: string | null; category: CategoryFilter }>(
    {
      startDate: null,
      endDate: null,
      category: 'all',
    },
  );
  const [activeQuick, setActiveQuick] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all' | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.category !== 'all') params.set('category', filters.category);
    const qs = params.toString();
    return qs ? `/api/admin/top-products?${qs}` : '/api/admin/top-products';
  }, [filters]);

  const { data, loading, error, refetch } = useApiQuery<TopProductsResponse>(query);

  if (error) {
    onFeedback(error, 'error');
  }

  const products = useMemo<TopProduct[]>(() => (Array.isArray(data?.products) ? data?.products ?? [] : []), [data]);

  const columnDefs = useMemo<ColDef<TopProduct>[]>(() => {
    return [
      {
        headerName: 'Produs',
        field: 'name',
        flex: 1,
        minWidth: 220,
      },
      {
        headerName: 'Categorie',
        field: 'category',
        width: 180,
      },
      {
        headerName: 'Preț',
        field: 'price',
        width: 110,
        valueFormatter: ({ value }) => `${Number(value ?? 0).toFixed(2)} RON`,
      },
      {
        headerName: 'Cantitate vândută',
        field: 'total_quantity',
        width: 160,
        type: 'rightAligned',
      },
      {
        headerName: 'Valoare totală',
        field: 'total_value',
        width: 160,
        type: 'rightAligned',
        valueFormatter: ({ value }) => `${Number(value ?? 0).toFixed(2)} RON`,
      },
    ];
  }, []);

  const handleQuickRange = useCallback(
    (range: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
      setActiveQuick(range);
      const computed = buildQuickRange(range);
      setFilters((prev) => ({
        ...prev,
        startDate: computed.startDate,
        endDate: computed.endDate,
      }));
    },
    [],
  );

  return (
    <div className="orders-top-products">
      <section className="top-products-controls">
        <div className="top-products-range">
          <div className="top-products-range__row">
            <label htmlFor="top-products-start">De la</label>
            <input
              id="top-products-start"
              type="date"
              value={filters.startDate ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, startDate: event.target.value || null }))
              }
            />
            <label htmlFor="top-products-end">Până la</label>
            <input
              id="top-products-end"
              type="date"
              value={filters.endDate ?? ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value || null }))}
            />
            <div className="top-products-range__quick">
              {(['today', 'yesterday', 'week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  className={classNames('btn btn-chip', { 'is-active': activeQuick === range })}
                  onClick={() => handleQuickRange(range)}
                >
                  {range === 'today'
                    ? 'Astăzi'
                    : range === 'yesterday'
                      ? 'Ieri'
                      : range === 'week'
                        ? 'Ultima săptămână'
                        : range === 'month'
                          ? 'Ultima lună'
                          : 'Toate'}
                </button>
              ))}
            </div>
          </div>
          <div className="top-products-category">
            <span>Categorie</span>
            <div className="top-products-category__buttons">
              {(
                [
                  { key: 'all', label: 'Toate' },
                  { key: 'alimente', label: 'Alimente' },
                  { key: 'bauturi', label: 'Băuturi' },
                ] as Array<{ key: CategoryFilter; label: string }>
              ).map((category) => (
                <button
                  key={category.key}
                  type="button"
                  className={classNames('btn btn-chip', { 'is-active': filters.category === category.key })}
                  onClick={() => setFilters((prev) => ({ ...prev, category: category.key }))}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="top-products-actions">
          <button type="button" className="btn btn-primary" onClick={() => refetch()}>
            Aplică filtre
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setFilters({ startDate: null, endDate: null, category: 'all' });
              setActiveQuick(null);
            }}
          >
            Resetează
          </button>
        </div>
      </section>

      <section className="top-products-summary">
        <StatCard
          title="Produse listate"
          helper="Ordinate descrescător după volum"
          value={`${products.length}`}
          icon={<span>🏷️</span>}
        />
        <StatCard
          title="Cantitate totală"
          helper="Interval selectat"
          value={`${data?.stats?.total_quantity ?? 0}`}
          icon={<span>📦</span>}
        />
        <StatCard
          title="Valoare totală"
          helper="Produse achitate"
          value={`${Number(data?.stats?.total_value ?? 0).toFixed(2)} RON`}
          icon={<span>💰</span>}
        />
      </section>

      {loading ? <p>Se încarcă top produsele...</p> : null}
      {!loading && !products.length ? (
        <InlineAlert variant="info" message="Nu există produse pentru filtrul selectat." />
      ) : null}

      {products.length ? (
        <DataGrid<TopProduct>
          columnDefs={columnDefs}
          rowData={products}
          loading={loading}
          height="60vh"
          agGridProps={{
            getRowId: (params) => (params.data ? String(params.data.id) : ''),
          }}
        />
      ) : null}
    </div>
  );
};
