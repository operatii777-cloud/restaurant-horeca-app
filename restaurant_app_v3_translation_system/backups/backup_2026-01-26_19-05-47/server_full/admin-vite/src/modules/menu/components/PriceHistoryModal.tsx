// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import type { MenuProduct } from '@/types/menu';
import './PriceHistoryModal.css';

type PriceHistoryEntry = {
  id?: number;
  product_id?: number;
  old_price?: number | null;
  new_price?: number | null;
  old_vat_rate?: number | null;
  new_vat_rate?: number | null;
  changed_by?: string | null;
  changed_at: string;
};

type PriceHistoryResponse = {
  success?: boolean;
  history?: PriceHistoryEntry[];
  error?: string;
};

type PriceHistoryModalProps = {
  open: boolean;
  product?: MenuProduct | null;
  onClose: () => void;
};

export function PriceHistoryModal({ open, product, onClose }: PriceHistoryModalProps) {
//   const { t } = useTranslation();
  const [entries, setEntries] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !product?.id) {
      setEntries([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);

    httpClient
      .get<PriceHistoryResponse>(`/api/catalog/products/${product.id}/price-history`)
      .then((response) => {
        if (!isActive) {
          return;
        }
        const payload = response.data;
        if (payload.success) {
          setEntries(Array.isArray(payload.history) ? payload.history : []);
        } else {
          setError(payload.error ?? 'Nu am putut încărca istoricul prețurilor.');
          setEntries([]);
        }
      })
      .catch((requestError) => {
        if (!isActive) {
          return;
        }
        const message =
          requestError?.response?.data?.error ??
          requestError?.message ??
          'A apărut o eroare la încărcarea istoricului de preț.';
        setError(message);
        setEntries([]);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [open, product?.id]);

  const title = useMemo(() => {
    if (!product) {
      return 'Istoric preț';
    }
    return `Istoric preț · ${product.name}`;
  }, [product]);

  const hasEntries = entries.length > 0;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="lg"
      title={title}
      description="Verifici ultimele modificări de preț și cotă TVA aplicate acestui produs."
    >
      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      {loading ? (
        <div className="price-history-loading">Se încarcă istoricul…</div>
      ) : hasEntries ? (
        <div className="price-history-table-wrapper">
          <table className="price-history-table">
            <thead>
              <tr>
                <th>"data modificarii"</th>
                <th>"pret vechi"</th>
                <th>"pret nou"</th>
                <th>TVA vechi</th>
                <th>TVA nou</th>
                <th>"Operator"</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const formattedDate = new Intl.DateTimeFormat('ro-RO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }).format(new Date(entry.changed_at));

                const oldPrice = entry.old_price != null ? `${entry.old_price.toFixed(2)} RON` : '—';
                const newPrice = entry.new_price != null ? `${entry.new_price.toFixed(2)} RON` : '—';
                const oldVat = entry.old_vat_rate != null ? `${entry.old_vat_rate}%` : '—';
                const newVat = entry.new_vat_rate != null ? `${entry.new_vat_rate}%` : '—';
                const operator = entry.changed_by && entry.changed_by.trim().length > 0 ? entry.changed_by : 'admin';

                return (
                  <tr key={`${entry.id ?? entry.changed_at}-${entry.new_price ?? 'unknown'}`}>
                    <td>{formattedDate}</td>
                    <td>{oldPrice}</td>
                    <td>
                      <strong>{newPrice}</strong>
                    </td>
                    <td>{oldVat}</td>
                    <td>{newVat}</td>
                    <td>{operator}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="price-history-empty">
          <span>Nu există înregistrări pentru acest produs</span>
        </div>
      )}
    </Modal>
  );
}





