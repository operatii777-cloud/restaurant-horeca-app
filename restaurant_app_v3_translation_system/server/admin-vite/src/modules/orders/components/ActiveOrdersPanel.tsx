import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type {
  CellClickedEvent,
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { StatCard } from '@/shared/components/StatCard';
import type { Order, OrderFilter, OrderVisit } from '@/types/orders';
import {
  calculateOrderTotal,
  formatCurrency,
  formatOrderType,
  formatTimestamp,
  groupOrdersByVisit,
  parseOrderItems,
  summariseOrders,
} from '@/modules/orders/utils/orderHelpers';
import './ActiveOrdersPanel.css';

type QuickRange = 'today' | 'yesterday' | 'week' | 'month' | 'all';
type ViewMode = 'grid' | 'cards';

type ActiveOrdersPanelProps = {
  orders: Order[];
  loading: boolean;
  filtersDraft: OrderFilter;
  onFilterDraftChange: (next: Partial<OrderFilter>) => void;
  onApplyFilters: (next?: OrderFilter) => void;
  onResetFilters: () => void;
  onRefresh: () => Promise<void> | void;
  onExport: () => Promise<void>;
  onSelectOrder: (order: Order) => void;
  onMarkVisitPaid: (tableNumber: number | null, clientIdentifier: string | null) => Promise<void>;
};

const VIEW_MODE_STORAGE_KEY = 'admin_v4_orders_view_mode';

function aggregateVisitItems(visit: OrderVisit, defaultProductName: string) {
  const map = new Map<string, { name: string; quantity: number; total: number }>();

  visit.allItems.forEach((item) => {
    const key = item.name ?? item.itemId;
    if (!map.has(key)) {
      map.set(key, {
        name: item.name ?? defaultProductName,
        quantity: item.quantity ?? 0,
        total: (item.finalPrice ?? item.price ?? 0) * (item.quantity ?? 0),
      });
      return;
    }

    const current = map.get(key)!;
    current.quantity += item.quantity ?? 0;
    current.total += (item.finalPrice ?? item.price ?? 0) * (item.quantity ?? 0);
  });

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function buildQuickRange(range: QuickRange): { startDate: string | null; endDate: string | null } {
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
  } else if (range === 'all') {
    return { startDate: null, endDate: null };
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export const ActiveOrdersPanel = ({
  orders,
  loading,
  filtersDraft,
  onFilterDraftChange,
  onApplyFilters,
  onResetFilters,
  onRefresh,
  onExport,
  onSelectOrder,
  onMarkVisitPaid,
}: ActiveOrdersPanelProps) => {
  const { t } = useTranslation();
  const [activeRange, setActiveRange] = useState<QuickRange | null>(null);
  const [exporting, setExporting] = useState(false);
  const [processingVisit, setProcessingVisit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') {
      return 'grid';
    }
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === 'cards' ? 'cards' : 'grid';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const activeOrders = useMemo(() => orders.filter((order) => order.status !== 'cancelled'), [orders]);

  const visits = useMemo(() => groupOrdersByVisit(activeOrders), [activeOrders]);

  const summary = useMemo(() => summariseOrders(activeOrders), [activeOrders]);

  const columnDefs = useMemo<ColDef<Order>[]>(() => {
    return [
      {
        headerName: 'ID',
        field: 'id',
        width: 110,
        sortable: true,
      },
      {
        headerName: t('orders.table'),
        field: 'table_number',
        width: 120,
        valueFormatter: ({ value, data }: ValueFormatterParams<Order, Order['table_number']>) => {
          if (!data) return '';
          if (value === null || value === undefined) {
            return data.type === 'takeout' ? t('orders.types.takeout') : '—';
          }
          return `${t('orders.table')} ${value}`;
        },
      },
      {
        headerName: t('orders.client'),
        field: 'client_identifier',
        minWidth: 150,
        flex: 1,
        valueFormatter: ({ value }: ValueFormatterParams<Order, Order['client_identifier']>) => value || t('orders.anonymous'),
      },
      {
        headerName: t('orders.type'),
        field: 'type',
        width: 130,
        valueFormatter: ({ value }: ValueFormatterParams<Order, Order['type']>) =>
          formatOrderType(value ?? 'here'),
      },
      {
        headerName: t('orders.createdAt'),
        field: 'timestamp',
        width: 190,
        valueFormatter: ({ value }: ValueFormatterParams<Order, Order['timestamp']>) =>
          value ? formatTimestamp(String(value)) : '—',
      },
      {
        headerName: t('common.status'),
        field: 'status',
        width: 140,
        cellRenderer: ({ value }: ICellRendererParams<Order>) => {
          const status = String(value || '').toLowerCase();
          return `<span class="order-status-badge order-status-badge--${status}">${status.toUpperCase()}</span>`;
        },
      },
      {
        headerName: t('orders.paid'),
        field: 'is_paid',
        width: 120,
        valueFormatter: ({ value }: ValueFormatterParams<Order, Order['is_paid']>) =>
          Number(value ?? 0) === 1 ? t('common.yes') : t('common.no'),
        cellClassRules: {
          'text-success': (params) => Number(params.value) === 1,
          'text-danger': (params) => Number(params.value) === 0,
        },
      },
      {
        headerName: t('orders.total'),
        field: 'total',
        width: 140,
        type: 'rightAligned',
        valueGetter: ({ data }: ValueGetterParams<Order, number>) => (data ? calculateOrderTotal(data) : 0),
        valueFormatter: ({ value }: ValueFormatterParams<Order, number>) => `${Number(value ?? 0).toFixed(2)} RON`,
      },
      {
        headerName: t('common.products'),
        field: 'items',
        flex: 1.2,
        minWidth: 240,
        valueFormatter: ({ data }: ValueFormatterParams<Order, Order['items']>) => {
          if (!data) return '';
          const items = parseOrderItems(data.items);
          if (!items.length) return '—';
          return items
            .slice(0, 3)
            .map((item) => `${item.quantity}x ${item.name ?? t('common.product')}`)
            .join(', ');
        },
      },
      {
        headerName: t('common.actions'),
        colId: 'actions',
        width: 150,
        pinned: 'right',
        cellRenderer: ({ data }: ICellRendererParams<Order>) => {
          if (!data) return '';
          const isPaid = Number(data.is_paid) === 1;
          return `
            <div class="orders-grid__row-actions">
              <button type="button" data-action="details" title="${t('actions.viewDetails')}">👁️</button>
              ${!isPaid ? `<button type="button" data-action="mark-paid" title="${t('orders.markAsPaid')}">💰</button>` : ''}
            </div>
          `;
        },
      },
    ];
  }, [t]);

  const handleGridCellClicked = useCallback(
    (event: CellClickedEvent<Order>) => {
      if (!event.data) {
        return;
      }

      if (event.colDef.colId === 'actions') {
        const target = event.event?.target as HTMLElement | undefined;
        if (!target) return;
        const button = target.closest('button[data-action]') as HTMLButtonElement | null;
        if (!button) return;
        const action = button.dataset.action;
        if (action === 'details') {
          onSelectOrder(event.data);
        } else if (action === 'mark-paid') {
          void onMarkVisitPaid(event.data.table_number ?? null, event.data.client_identifier ?? null);
        }
        return;
      }

      onSelectOrder(event.data);
    },
    [onMarkVisitPaid, onSelectOrder],
  );

  const handleQuickRange = useCallback(
    (range: QuickRange) => {
      const next = buildQuickRange(range);
      setActiveRange(range);
      const nextFilters: OrderFilter = {
        ...filtersDraft,
        startDate: next.startDate,
        endDate: next.endDate,
      };
      onFilterDraftChange(nextFilters);
      onApplyFilters(nextFilters);
    },
    [filtersDraft, onApplyFilters, onFilterDraftChange],
  );

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      await onExport();
    } finally {
      setExporting(false);
    }
  }, [onExport]);

  const handleMarkVisit = useCallback(
    async (visit: OrderVisit) => {
      setProcessingVisit(visit.key);
      try {
        await onMarkVisitPaid(visit.tableNumber, visit.clientIdentifier ?? null);
      } finally {
        setProcessingVisit(null);
      }
    },
    [onMarkVisitPaid],
  );

  return (
    <div className="orders-active-panel">
      <div className="orders-filters">
        <div className="orders-filters__row">
          <div className="orders-filters__status">
            <span>{t('common.status')}</span>
            <div className="orders-filters__status-buttons">
              {(
                [
                  { key: 'all', label: t('common.all') },
                  { key: 'unpaid', label: t('orders.filters.unpaid') },
                  { key: 'paid', label: t('orders.filters.paid') },
                ] as Array<{ key: OrderFilter['status']; label: string }>
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={classNames('btn btn-chip', { 'is-active': filtersDraft.status === item.key })}
                  onClick={() => {
                    onFilterDraftChange({ status: item.key });
                    onApplyFilters({ ...filtersDraft, status: item.key });
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="orders-filters__range">
            <label htmlFor="orders-start-date">{t('common.from')}</label>
            <input
              id="orders-start-date"
              type="date"
              value={filtersDraft.startDate ?? ''}
              onChange={(event) => onFilterDraftChange({ startDate: event.target.value || null })}
            />
            <label htmlFor="orders-end-date">{t('common.to')}</label>
            <input
              id="orders-end-date"
              type="date"
              value={filtersDraft.endDate ?? ''}
              onChange={(event) => onFilterDraftChange({ endDate: event.target.value || null })}
            />
          </div>

          <div className="orders-filters__quick">
            {(['today', 'yesterday', 'week', 'month', 'all'] as QuickRange[]).map((range) => (
              <button
                key={range}
                type="button"
                className={classNames('btn btn-ghost', { 'is-active': activeRange === range })}
                onClick={() => handleQuickRange(range)}
              >
                {range === 'today'
                  ? t('common.dateRanges.today')
                  : range === 'yesterday'
                    ? t('common.dateRanges.yesterday')
                    : range === 'week'
                      ? t('common.dateRanges.lastWeek')
                      : range === 'month'
                        ? t('common.dateRanges.lastMonth')
                        : t('common.all')}
              </button>
            ))}
          </div>
        </div>

        <div className="orders-filters__actions">
          <button type="button" className="btn btn-primary" onClick={() => onApplyFilters()}>{t('actions.applyFilters')}</button>
          <button type="button" className="btn btn-ghost" onClick={onResetFilters}>{t('actions.reset')}</button>
          <button type="button" className="btn btn-ghost" onClick={() => onRefresh()}>{t('actions.refresh')}</button>
          <button type="button" className="btn btn-ghost" onClick={handleExport} disabled={exporting}>
            {exporting ? t('common.exporting') : t('actions.exportCSV')}
          </button>
          <div className="orders-filters__view-toggle" role="group" aria-label={t('orders.viewMode')}>
            <button
              type="button"
              className={classNames('btn btn-chip', { 'is-active': viewMode === 'grid' })}
              onClick={() => setViewMode('grid')}
            >
              {t('orders.views.table')}
            </button>
            <button
              type="button"
              className={classNames('btn btn-chip', { 'is-active': viewMode === 'cards' })}
              onClick={() => setViewMode('cards')}
            >
              {t('orders.views.visits')}
            </button>
          </div>
        </div>
      </div>

      <div className="orders-summary">
        <StatCard
          title={t('orders.summary.totalOrders')}
          helper={t('orders.summary.resultsForFilter')}
          value={`${summary.totalOrders}`}
          icon={<span>📦</span>}
        />
        <StatCard
          title={t('orders.summary.totalValue')}
          helper={t('orders.summary.ordersSum')}
          value={formatCurrency(summary.totalAmount)}
          icon={<span>💰</span>}
        />
        <StatCard
          title={t('orders.summary.unpaid')}
          helper={`${summary.unpaidOrders} ${t('orders.orders')}`}
          value={formatCurrency(summary.unpaidValue)}
          trendDirection={summary.unpaidOrders > 0 ? 'up' : 'flat'}
          trendLabel={summary.unpaidOrders > 0 ? t('orders.summary.requiresAction') : 'OK'}
          icon={<span>⚠️</span>}
        />
        <StatCard
          title={t('orders.summary.paid')}
          helper={`${summary.paidOrders} ${t('orders.orders')}`}
          value={formatCurrency(summary.paidValue)}
          icon={<span>✅</span>}
        />
      </div>

      {viewMode === 'grid' ? (
        <DataGrid<Order>
          columnDefs={columnDefs}
          rowData={activeOrders}
          loading={loading}
          height="62vh"
          agGridProps={{
            rowSelection: { mode: 'singleRow', enableClickSelection: false },
            getRowId: (params) => (params.data ? String(params.data.id) : ''),
            onCellClicked: handleGridCellClicked,
          }}
        />
      ) : null}

      {viewMode === 'cards' ? (
        <div className="orders-visits">
          {!loading && visits.length === 0 ? (
            <InlineAlert variant="info" message={t('orders.noOrdersForFilter')} />
          ) : null}
          {loading ? <p>{t('common.loading')}</p> : null}
          {!loading && visits.length > 0 ? (
            <div className="orders-visits__grid">
              {visits.map((visit) => {
                const items = aggregateVisitItems(visit, t('common.product'));
                const firstOrder = visit.orders[0];
                return (
                  <article
                    key={visit.key}
                    className={classNames('order-visit-card', { 'order-visit-card--paid': visit.isPaid })}
                  >
                    <header className="order-visit-card__header">
                      <div>
                        <h3>
                          {visit.tableNumber !== null ? `${t('orders.table')} ${visit.tableNumber}` : t('orders.types.takeout')} ·{' '}
                          {visit.clientIdentifier ?? t('orders.anonymous')}
                        </h3>
                        <p>{formatOrderType(firstOrder?.type ?? 'here')}</p>
                      </div>
                      <span className={classNames('order-status-badge', visit.isPaid ? 'order-status-badge--paid' : 'order-status-badge--pending')}>
                        {visit.isPaid ? t('orders.status.paid') : t('orders.status.unpaid')}
                      </span>
                    </header>

                    <div className="order-visit-card__times">
                      <span>{t('orders.firstOrder')}: {visit.firstTimestamp ? formatTimestamp(visit.firstTimestamp) : '—'}</span>
                      <span>{t('orders.lastOrder')}: {visit.lastTimestamp ? formatTimestamp(visit.lastTimestamp) : '—'}</span>
                    </div>

                    <div className="order-visit-card__items">
                      <ul>
                        {items.slice(0, 6).map((item) => (
                          <li key={`${visit.key}-${item.name}`}>
                            <span>{item.quantity}x {item.name}</span>
                            <span>{formatCurrency(item.total)}</span>
                          </li>
                        ))}
                      </ul>
                      {items.length > 6 ? (
                        <small>+ {items.length - 6} {t('orders.additionalProducts')}</small>
                      ) : null}
                    </div>

                    {(visit.notes.food || visit.notes.drink || visit.notes.general) && (
                      <div className="order-visit-card__notes">
                        {visit.notes.food ? <p>🍽️ {visit.notes.food}</p> : null}
                        {visit.notes.drink ? <p>🥤 {visit.notes.drink}</p> : null}
                        {visit.notes.general ? <p>📝 {visit.notes.general}</p> : null}
                      </div>
                    )}

                    <footer className="order-visit-card__footer">
                      <div className="order-visit-card__total">
                        <span>{t('orders.visitTotal')}</span>
                        <strong>{formatCurrency(visit.totalAmount)}</strong>
                      </div>
                      <div className="order-visit-card__actions">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => onSelectOrder(firstOrder)}
                          disabled={!firstOrder}
                        >
                          👁️ {t('common.details')}
                        </button>
                        {!visit.isPaid ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleMarkVisit(visit)}
                            disabled={processingVisit === visit.key}
                          >
                            {processingVisit === visit.key ? t('common.processing') : `💰 ${t('orders.markAsPaid')}`}
                          </button>
                        ) : null}
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};





