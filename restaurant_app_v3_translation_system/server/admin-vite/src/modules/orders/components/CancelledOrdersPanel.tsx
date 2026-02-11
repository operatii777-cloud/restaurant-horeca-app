// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { CancelledOrder, CancelledOrderItem, OrderFilter } from '@/types/orders';
import { formatTimestamp } from '@/modules/orders/utils/orderHelpers';
import './CancelledOrdersPanel.css';

/**
 * Parse cancelled order items - handles both array and JSON string formats
 */
function parseCancelledOrderItems(items: CancelledOrder['items'] | string | null | undefined): CancelledOrderItem[] {
  if (!items) {
    return [];
  }

  if (Array.isArray(items)) {
    return items;
  }

  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

interface CancelledOrdersPanelProps {
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_FILTERS: OrderFilter = {
  status: 'cancelled',
  startDate: null,
  endDate: null,
};

function buildQueryString(filters: OrderFilter): string {
  const params = new URLSearchParams();
  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }
  return params.toString();
}

export const CancelledOrdersPanel = ({ onFeedback }: CancelledOrdersPanelProps) => {
  //   const { t } = useTranslation();
  const [filtersDraft, setFiltersDraft] = useState<OrderFilter>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<OrderFilter>(DEFAULT_FILTERS);

  const query = useMemo(() => {
    const qs = buildQueryString(appliedFilters);
    return qs ? `/api/orders/cancelled?${qs}` : '/api/orders/cancelled';
  }, [appliedFilters]);

  const {
    data: ordersData,
    loading,
    error,
    refetch,
  } = useApiQuery<CancelledOrder[]>(query);

  useEffect(() => {
    if (!error) {
      return;
    }
    onFeedback(error, 'error');
  }, [error, onFeedback]);

  const orders = useMemo(() => (Array.isArray(ordersData) ? ordersData : []), [ordersData]);

  const totalValue = useMemo(() => {
    if (!orders.length) return 0;
    return orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  }, [orders]);

  const handleFilterDraftChange = useCallback((partial: Partial<OrderFilter>) => {
    setFiltersDraft((prev) => ({ ...prev, ...partial, status: 'cancelled' }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(() => ({ ...filtersDraft, status: 'cancelled' }));
  }, [filtersDraft]);

  const handleResetFilters = useCallback(() => {
    setFiltersDraft(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }, []);

  const handleQuickRange = useCallback((range: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'yesterday') {
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'week') {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'month') {
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'all') {
      setFiltersDraft({
        status: 'cancelled',
        startDate: null,
        endDate: null,
      });
      setAppliedFilters({
        status: 'cancelled',
        startDate: null,
        endDate: null,
      });
      return;
    }

    setFiltersDraft({
      status: 'cancelled',
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    });
    setAppliedFilters({
      status: 'cancelled',
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    });
  }, []);

  return (
    <div className="cancelled-orders-panel">
      <div className="cancelled-orders-panel__filters">
        <div className="cancelled-orders-panel__group">
          <label htmlFor="cancelled-start-date">De la</label>
          <input
            id="cancelled-start-date"
            type="date"
            value={filtersDraft.startDate ?? ''}
            onChange={(event) => handleFilterDraftChange({ startDate: event.target.value || null })}
          />
        </div>
        <div className="cancelled-orders-panel__group">
          <label htmlFor="cancelled-end-date">Până la</label>
          <input
            id="cancelled-end-date"
            type="date"
            value={filtersDraft.endDate ?? ''}
            onChange={(event) => handleFilterDraftChange({ endDate: event.target.value || null })}
          />
        </div>
        <div className="cancelled-orders-panel__quick">
          <button type="button" className="btn btn-ghost" onClick={() => handleQuickRange('today')}>Astăzi</button>
          <button type="button" className="btn btn-ghost" onClick={() => handleQuickRange('yesterday')}>
            Ieri
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => handleQuickRange('week')}>
            Ultimele 7 zile
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => handleQuickRange('month')}>Ultima lună</button>
          <button type="button" className="btn btn-ghost" onClick={() => handleQuickRange('all')}>Toate</button>
        </div>
        <div className="cancelled-orders-panel__actions">
          <button type="button" className="btn btn-primary" onClick={handleApplyFilters}>Aplică filtre</button>
          <button type="button" className="btn btn-ghost" onClick={handleResetFilters}>Resetează</button>
          <button type="button" className="btn btn-ghost" onClick={() => refetch()}>Reîmprospătează</button>
        </div>
      </div>

      {loading ? <p>Se încarcă comenzile anulate...</p> : null}
      {!loading && !orders.length ? <InlineAlert variant="info" message="Nu există comenzi anulate pentru filtrul curent." /> : null}

      {!loading && orders.length > 0 ? (

        <div className="cancelled-orders-summary">
          <span>Total comenzi anulate: <strong>{orders.length}</strong>
          </span>
          <span>Valoare totală pierdută: <strong>{totalValue.toFixed(2)} RON</strong>
          </span>
        </div>
      ) : null}


      <div className="cancelled-orders-list">
        {orders.map((order) => {
          // Parse items if they come as JSON string from backend
          const items = parseCancelledOrderItems(order.items);

          return (
            <article key={order.id} className="cancelled-order-card">
              <header className="cancelled-order-card__header">
                <h3>Comanda #{order.id}</h3>
                <span className="cancelled-order-card__badge">ANULATĂ</span>
              </header>
              <div className="cancelled-order-card__meta">
                <p>
                  <strong>Masă:</strong> {order.table_number ?? '—'}
                </p>
                <p>
                  <strong>Client:</strong> {order.client_identifier ?? 'Anonim'}
                </p>
                <p>
                  <strong>Data anulării:</strong> {formatTimestamp(order.cancelled_timestamp)}
                </p>
                {order.cancelled_reason ? (
                  <p>
                    <strong>Motiv:</strong> {order.cancelled_reason}
                  </p>
                ) : null}
                <p>
                  <strong>Valoare:</strong> {Number(order.total ?? 0).toFixed(2)} RON
                </p>
              </div>
              <div className="cancelled-order-card__items">
                <h4>Produse</h4>
                <ul>
                  {items.map((item, index) => (
                    <li key={`${order.id}-item-${index}`}>
                      {item.quantity}x {item.name}
                      {item.customizations && item.customizations.length > 0 ? (
                        <span className="cancelled-order-card__customizations">
                          {' ('}
                          {item.customizations.map((custom) => custom.option_name).join(', ')}
                          {')'}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};




