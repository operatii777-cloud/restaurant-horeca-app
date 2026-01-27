import { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { SideDrawer } from '@/shared/components/SideDrawer';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import type { Order, OrderItem } from '@/types/orders';
import { calculateOrderTotal, formatTimestamp, parseOrderItems } from '@/modules/orders/utils/orderHelpers';
import './OrderDetailsDrawer.css';

interface OrderDetailsDrawerProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onOrderUpdated: () => Promise<void> | void;
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrderDetailsDrawer = ({ open, order, onClose, onOrderUpdated, onFeedback }: OrderDetailsDrawerProps) => {
  const items = useMemo<OrderItem[]>(() => {
    if (!order) return [];
    return parseOrderItems(order.items);
  }, [order]);

  const orderTotal = useMemo(() => (order ? calculateOrderTotal(order) : 0), [order]);

  const handleMarkAsPaid = useCallback(async () => {
    if (!order) return;
    const confirmed = window.confirm(`Comanda #${order.id} va fi marcată ca achitată. Continui?`);
    if (!confirmed) {
      return;
    }

    try {
      await httpClient.post('/api/visits/close', {
        tableNumber: order.table_number ?? null,
        clientIdentifier: order.client_identifier ?? '',
      });
      onFeedback(`Comanda #${order.id} a fost marcată ca achitată.`, 'success');
      await onOrderUpdated();
      onClose();
    } catch (error) {
      console.error('Eroare la marcarea comenzii ca achitată:', error);
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (error instanceof Error ? error.message : 'Nu s-a putut marca comanda ca achitată.');
      onFeedback(message, 'error');
    }
  }, [onClose, onFeedback, onOrderUpdated, order]);

  if (!order) {
    return null;
  }

  const isPaid = Number(order.is_paid) === 1;
  const isCancelled = order.status === 'cancelled';

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      width={620}
      title={`Detalii Comandă #${order.id}`}
      description={`Masă: ${order.table_number ?? '—'} • Client: ${order.client_identifier ?? 'Anonim'}`}
      footer={
        <div className="order-details-drawer__footer">
          {!isPaid && !isCancelled ? (
            <button type="button" className="btn btn-primary" onClick={handleMarkAsPaid}>
              💰 Marchează achitată
            </button>
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Închide
          </button>
        </div>
      }
    >
      <div className="order-details-drawer__content">
        <section className="order-details-card">
          <h3>Informații generale</h3>
          <div className="order-details-card__grid">
            <div>
              <span>Tip:</span>
              <strong>
                {order.type === 'here' ? 'La masă' : order.type === 'takeout' ? 'La pachet' : 'Livrare'}
              </strong>
            </div>
            <div>
              <span>Status:</span>
              <strong>
                <span
                  className={classNames('order-status-badge', `order-status-badge--${order.status}`)}
                  aria-label={`Status ${order.status}`}
                >
                  {order.status.toUpperCase()}
                </span>
              </strong>
            </div>
            <div>
              <span>Achitată:</span>
              <strong>{isPaid ? 'Da' : 'Nu'}</strong>
            </div>
            <div>
              <span>Creată la:</span>
              <strong>{formatTimestamp(order.timestamp)}</strong>
            </div>
            {order.paid_timestamp ? (
              <div>
                <span>Plătită la:</span>
                <strong>{formatTimestamp(order.paid_timestamp)}</strong>
              </div>
            ) : null}
            {order.delivered_timestamp ? (
              <div>
                <span>Livrată la:</span>
                <strong>{formatTimestamp(order.delivered_timestamp)}</strong>
              </div>
            ) : null}
            {order.cancelled_timestamp ? (
              <div>
                <span>Anulată la:</span>
                <strong>{formatTimestamp(order.cancelled_timestamp)}</strong>
              </div>
            ) : null}
          </div>
        </section>

        <section className="order-details-card">
          <h3>Produse comandate</h3>
          {items.length === 0 ? (
            <InlineAlert variant="info" message="Nu există produse înregistrate pentru această comandă." />
          ) : (
            <div className="order-details-items">
              {items.map((item) => (
                <div key={item.itemId} className="order-item-row">
                  <div className="order-item-row__info">
                    <span className="order-item-row__name">
                      {item.quantity}x {item.name ?? 'Produs'}{' '}
                      {item.isFree ? <span className="order-item-row__free">GRATUIT</span> : null}
                    </span>
                    <span className="order-item-row__meta">
                      Stație: {item.station ?? '—'} | Status: {item.status.toUpperCase()}
                    </span>
                    {item.customizations.length > 0 ? (
                      <ul className="order-item-row__customizations">
                        {item.customizations.map((custom, index) => (
                          <li key={`${item.itemId}-custom-${index}`}>
                            + {custom.option_name} ({custom.extra_price.toFixed(2)} RON)
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="order-item-row__price">
                    {(item.finalPrice * item.quantity).toFixed(2)} RON
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="order-details-total">
            <span>Total comandă</span>
            <strong>{orderTotal.toFixed(2)} RON</strong>
          </div>
        </section>

        {(order.food_notes || order.drink_notes || order.general_notes || order.cancelled_reason) && (
          <section className="order-details-card">
            <h3>Note și mențiuni</h3>
            {order.food_notes ? <p>🍽️ Mâncare: {order.food_notes}</p> : null}
            {order.drink_notes ? <p>🥤 Băuturi: {order.drink_notes}</p> : null}
            {order.general_notes ? <p>📝 Generale: {order.general_notes}</p> : null}
            {order.cancelled_reason ? <InlineAlert variant="warning" message={`Motiv anulare: ${order.cancelled_reason}`} /> : null}
          </section>
        )}
      </div>
    </SideDrawer>
  );
};

