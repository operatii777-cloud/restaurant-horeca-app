// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { Order, OrderFilter } from '@/types/orders';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import { OrderDetailsDrawer } from '@/modules/orders/components/OrderDetailsDrawer';
import { CancelledOrdersPanel } from '@/modules/orders/components/CancelledOrdersPanel';
import { ActiveOrdersPanel } from '@/modules/orders/components/ActiveOrdersPanel';
import { OrdersAnalyticsPanel } from '@/modules/orders/components/OrdersAnalyticsPanel';
import { TopProductsPanel } from '@/modules/orders/components/TopProductsPanel';
import { OrdersArchivePanel } from '@/modules/orders/components/OrdersArchivePanel';
import {
  rememberOrdersFilters,
  restoreOrdersFilters,
  summariseOrders,
} from '@/modules/orders/utils/orderHelpers';
import './OrdersManagementPage.css';

type OrdersTabKey = 'active' | 'cancelled' | 'analytics' | 'top-products' | 'archive';

type Feedback = {
  type: 'success' | 'error' | 'info';
  message: string;
};

const DEFAULT_FILTERS: OrderFilter = {
  status: 'all',
  startDate: null,
  endDate: null,
};

function normaliseFilters(filters: OrderFilter | null): OrderFilter {
  if (!filters) {
    return DEFAULT_FILTERS;
  }
  return {
    status: filters.status === 'cancelled' ? 'all' : filters.status,
    startDate: filters.startDate ?? null,
    endDate: filters.endDate ?? null,
  };
}

export const OrdersManagementPage = () => {
//   const { t } = useTranslation();
  const restoredFilters = useMemo(() => normaliseFilters(restoreOrdersFilters()), []);
  const [activeTab, setActiveTab] = useState<OrdersTabKey>('active');
  const [filtersDraft, setFiltersDraft] = useState<OrderFilter>(restoredFilters);
  const [appliedFilters, setAppliedFilters] = useState<OrderFilter>(restoredFilters);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pageReady, setPageReady] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    rememberOrdersFilters(appliedFilters);
  }, [appliedFilters]);

  const ordersQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set('status', appliedFilters.status);
    if (appliedFilters.startDate) {
      params.set('startDate', appliedFilters.startDate);
    }
    if (appliedFilters.endDate) {
      params.set('endDate', appliedFilters.endDate);
    }
    const qs = params.toString();
    return qs ? `/api/orders-delivery?"Qs"` : '/api/orders-delivery';
  }, [appliedFilters]);

  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useApiQuery<Order[]>(ordersQuery);

  const orders = useMemo(() => (Array.isArray(ordersData) ? ordersData : []), [ordersData]);

  useEffect(() => {
    if (!ordersLoading) {
      setPageReady(true);
    }
  }, [ordersLoading]);

  useEffect(() => {
    if (!ordersError) {
      return;
    }
    setFeedback({
      type: 'error',
      message: ordersError,
    });
  }, [ordersError]);

  const handleGlobalFeedback = useCallback((message: string, type: Feedback['type'] = 'info') => {
    setFeedback({ message, type });
  }, []);

  const handleDismissFeedback = useCallback(() => setFeedback(null), []);

  const handleFilterDraftChange = useCallback((partial: Partial<OrderFilter>) => {
    setFiltersDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleApplyFilters = useCallback((next?: OrderFilter) => {
    setFiltersDraft((prev) => {
      const base = next ?? prev;
      const payload: OrderFilter = {
        status: base.status === 'cancelled' ? 'all' : base.status,
        startDate: base.startDate ?? null,
        endDate: base.endDate ?? null,
      };
      setAppliedFilters(payload);
      return payload;
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setFiltersDraft(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }, []);

  const handleRefreshOrders = useCallback(async () => {
    await refetchOrders();
  }, [refetchOrders]);

  const handleExportOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (appliedFilters.startDate) params.set('startDate', appliedFilters.startDate);
    if (appliedFilters.endDate) params.set('endDate', appliedFilters.endDate);
    try {
      const response = await httpClient.get('/api/admin/orders/export', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileDate = new Date().toISOString().slice(0, 10);
      link.download = `orders-${fileDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      handleGlobalFeedback('Exportul comenzilor a fost generat.', 'success');
    } catch (error) {
      console.error('Eroare la exportul comenzilor:', error);
      handleGlobalFeedback('Nu s-a putut genera exportul comenzilor.', 'error');
    }
  }, [appliedFilters.endDate, appliedFilters.startDate, handleGlobalFeedback]);

  const handleSelectOrder = useCallback((order: Order | null) => {
    if (!order) {
      return;
    }
    setSelectedOrder(order);
    setDetailsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDetailsDrawerOpen(false);
  }, []);

  const handleMarkVisitPaid = useCallback(
    async (tableNumber: number | null, clientIdentifier: string | null) => {
      try {
        await httpClient.post('/api/visits/close', {
          tableNumber,
          clientIdentifier,
        });
        handleGlobalFeedback('Comanda a fost marcată ca achitată.', 'success');
        await refetchOrders();
      } catch (error) {
        console.error('Eroare la marcarea vizitei ca achitată:', error);
        const message =
          (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          (error instanceof Error ? error.message : 'Nu s-a putut marca vizita ca achitată.');
        handleGlobalFeedback(message, 'error');
      }
    },
    [handleGlobalFeedback, refetchOrders],
  );

  const summary = useMemo(() => summariseOrders(orders), [orders]);

  return (
    <div className="orders-management-page" data-page-ready={pageReady ? 'true' : 'false'}>
      <header className="orders-management-header">
        <div className="orders-management-header__intro">
          <div>
            <h1>Gestionare comenzi</h1>
            <p>Monitorizează comenzile active, plățile și analizele.</p>
          </div>
          <div className="orders-management-header__tags">
            <span>Filtrare avansată și export CSV</span>
            <span>Analitice anulări & top produse</span>
            <span>Integrare cu arhiva istoric</span>
          </div>
        </div>

        <div className="orders-management-summary">
          <div className="orders-management-summary__item">
            <span>Comenzi totale</span>
            <strong>{summary.totalOrders}</strong>
          </div>
          <div className="orders-management-summary__item">
            <span>Neachitate</span>
            <strong className={summary.unpaidOrders > 0 ? 'warning' : undefined}>{summary.unpaidOrders}</strong>
          </div>
          <div className="orders-management-summary__item">
            <span>Valoare totală</span>
            <strong>{summary.totalAmount.toFixed(2)} RON</strong>
          </div>
        </div>

        <div className="orders-management-tablist" role="tablist" aria-label="Taburi gestionare comenzi">
          {(
            [
              { key: 'active', emoji: '📋', label: 'Comenzi active' },
              { key: 'cancelled', emoji: '🛑', label: 'Comenzi anulate' },
              { key: 'analytics', emoji: '📊', label: 'Analitice anulări' },
              { key: 'top-products', emoji: '🏆', label: 'Top produse' },
              { key: 'archive', emoji: '🗃️', label: 'Arhivă comenzi' },
            ] as Array<{ key: OrdersTabKey; emoji: string; label: string }>
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={classNames('orders-management-tab', { 'is-active': activeTab === tab.key })}
              onClick={() => setActiveTab(tab.key)}
            >
              <span aria-hidden="true">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <section className="orders-management-content">
        {feedback ? (
          <InlineAlert
            title={feedback.type === 'error' ? 'Eroare' : feedback.type === 'success' ? 'Succes' : 'Informație'}
            variant={feedback.type}
            message={feedback.message}
            onClose={handleDismissFeedback}
          />
        ) : null}

        {activeTab === 'active' ? (
          <ActiveOrdersPanel
            orders={orders}
            loading={ordersLoading}
            filtersDraft={filtersDraft}
            onFilterDraftChange={handleFilterDraftChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            onRefresh={handleRefreshOrders}
            onExport={handleExportOrders}
            onSelectOrder={handleSelectOrder}
            onMarkVisitPaid={handleMarkVisitPaid}
          />
        ) : null}

        {activeTab === 'cancelled' ? <CancelledOrdersPanel onFeedback={handleGlobalFeedback} /> : null}
        {activeTab === 'analytics' ? <OrdersAnalyticsPanel onFeedback={handleGlobalFeedback} /> : null}
        {activeTab === 'top-products' ? <TopProductsPanel onFeedback={handleGlobalFeedback} /> : null}
        {activeTab === 'archive' ? <OrdersArchivePanel onFeedback={handleGlobalFeedback} /> : null}
      </section>

      <OrderDetailsDrawer
        open={detailsDrawerOpen}
        order={selectedOrder}
        onClose={handleCloseDrawer}
        onOrderUpdated={refetchOrders}
        onFeedback={handleGlobalFeedback}
      />
    </div>
  );
};




