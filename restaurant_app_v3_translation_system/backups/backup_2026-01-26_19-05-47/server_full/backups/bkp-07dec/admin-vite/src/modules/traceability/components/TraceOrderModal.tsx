import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import './TraceOrderModal.css';

type TraceOrderModalProps = {
  open: boolean;
  orderId: number | null;
  onClose: () => void;
};

type TraceOrderPayload = {
  order?: {
    id: number;
    timestamp: string;
    client_identifier?: string;
    type?: string;
    total?: number;
    status?: string;
    is_paid?: number | boolean;
  };
  items?: Array<{
    product_id: number;
    name: string;
    quantity: number;
  }>;
  batches?: Array<{
    ingredient_name: string;
    batch_number: string;
    quantity_used: number;
  }>;
};

export function TraceOrderModal({ open, orderId, onClose }: TraceOrderModalProps) {
  const endpoint = open && orderId ? `/api/admin/orders/${orderId}/traceability` : null;
  const { data, loading, error } = useApiQuery<TraceOrderPayload>(endpoint);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="lg"
      title={orderId ? `Detalii comandă #${orderId}` : 'Detalii comandă'}
      description="Verifică traseul complet al comenzilor și ingredientelor folosite."
    >
      {loading ? <p className="trace-order__loading">Se încarcă detaliile...</p> : null}
      {error ? <InlineAlert type="error" message={error} /> : null}
      {!loading && data?.order ? (
        <div className="trace-order__content">
          <section>
            <h3>Informații comandă</h3>
            <ul>
              <li>
                <span>Data & ora:</span>
                <strong>{new Date(data.order.timestamp).toLocaleString('ro-RO')}</strong>
              </li>
              <li>
                <span>Client:</span>
                <strong>{data.order.client_identifier || 'Walk-in'}</strong>
              </li>
              <li>
                <span>Tip comanda:</span>
                <strong>{data.order.type}</strong>
              </li>
              <li>
                <span>Status:</span>
                <strong>{data.order.status}</strong>
              </li>
              <li>
                <span>Plată:</span>
                <strong>{data.order.is_paid ? 'Achitată' : 'Neachitată'}</strong>
              </li>
              <li>
                <span>Total:</span>
                <strong>{data.order.total ? `${data.order.total.toFixed(2)} RON` : '-'}</strong>
              </li>
            </ul>
          </section>

          <section>
            <h3>Produse comandate</h3>
            <ul className="trace-order__list">
              {data.items?.map((item) => (
                <li key={`${item.product_id}-${item.name}`}>
                  <strong>{item.name}</strong>
                  <span>{item.quantity} buc</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Ingredient → Lot utilizat</h3>
            <ul className="trace-order__list">
              {data.batches?.map((batch, index) => (
                <li key={`${batch.batch_number}-${index}`}>
                  <div>
                    <strong>{batch.ingredient_name}</strong>
                    <span>Lot: {batch.batch_number}</span>
                  </div>
                  <span>{batch.quantity_used} unități</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
