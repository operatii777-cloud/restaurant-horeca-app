import { useCallback, useMemo, useState } from 'react';
import type { Ingredient } from '@/types/ingredients';
import { httpClient } from '@/shared/api/httpClient';
import { InlineAlert } from '@/shared/components/InlineAlert';
import './StockAdjustModal.css';

type Operation = 'set' | 'increase' | 'decrease';

interface StockAdjustModalProps {
  open: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
  onUpdated: () => Promise<void> | void;
}

export const StockAdjustModal = ({ open, ingredient, onClose, onUpdated }: StockAdjustModalProps) => {
  const [operation, setOperation] = useState<Operation>('set');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('Ajustare manuală');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetState = useCallback(() => {
    setOperation('set');
    setQuantity(0);
    setReason('Ajustare manuală');
    setFeedback(null);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    resetState();
    onClose();
  }, [onClose, resetState, submitting]);

  const currentStock = useMemo(() => ingredient?.current_stock ?? 0, [ingredient]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!ingredient) return;

      if (quantity < 0) {
        setFeedback({ type: 'error', message: 'Cantitatea trebuie să fie un număr pozitiv.' });
        return;
      }

      setSubmitting(true);
      setFeedback(null);

      try {
        await httpClient.post(`/api/admin/ingredients/${ingredient.id}/update-stock`, {
          quantity,
          operation,
          reason,
        });

        setFeedback({ type: 'success', message: 'Stocul a fost ajustat cu succes.' });
        await onUpdated();
        resetState();
        onClose();
      } catch (error) {
        console.error('❌ Eroare la ajustarea stocului:', error);
        const message = error instanceof Error ? error.message : 'Nu s-a putut ajusta stocul.';
        setFeedback({ type: 'error', message });
      } finally {
        setSubmitting(false);
      }
    },
    [ingredient, quantity, operation, reason, onUpdated, resetState, onClose],
  );

  if (!open || !ingredient) {
    return null;
  }

  return (
    <div className="stock-adjust-modal" role="dialog" aria-modal="true" aria-labelledby="stock-adjust-title">
      <div className="stock-adjust-modal__backdrop" onClick={handleClose} aria-hidden="true" />
      <div className="stock-adjust-modal__content">
        <header className="stock-adjust-modal__header">
          <div>
            <h2 id="stock-adjust-title">⚖️ Ajustează stocul</h2>
            <p>
              Ingredient: <strong>{ingredient.name}</strong> · Stoc curent:{' '}
              <strong>{currentStock}</strong> {ingredient.unit}
            </p>
          </div>
          <button type="button" className="stock-adjust-modal__close" onClick={handleClose} aria-label="Închide">
            ×
          </button>
        </header>

        <form className="stock-adjust-modal__form" onSubmit={handleSubmit}>
          <div className="stock-adjust-modal__field-group">
            <label className="stock-adjust-modal__label">Tip ajustare</label>
            <div className="stock-adjust-modal__radio-group">
              <label>
                <input type="radio" name="operation" value="set" checked={operation === 'set'} onChange={() => setOperation('set')} />
                Setează valoare exactă
              </label>
              <label>
                <input type="radio" name="operation" value="increase" checked={operation === 'increase'} onChange={() => setOperation('increase')} />
                Adaugă la stoc
              </label>
              <label>
                <input type="radio" name="operation" value="decrease" checked={operation === 'decrease'} onChange={() => setOperation('decrease')} />
                Scade din stoc
              </label>
            </div>
          </div>

          <label className="stock-adjust-modal__label" htmlFor="stock-adjust-quantity">
            Cantitate ({ingredient.unit})
          </label>
          <input
            id="stock-adjust-quantity"
            type="number"
            min={0}
            step="0.01"
            required
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />

          <label className="stock-adjust-modal__label" htmlFor="stock-adjust-reason">
            Motiv (opțional)
          </label>
          <input
            id="stock-adjust-reason"
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ajustare manuală"
          />

          {feedback ? (
            <InlineAlert
              variant={feedback.type}
              title={feedback.type === 'success' ? 'Succes' : 'Eroare'}
              message={feedback.message}
            />
          ) : null}

          <footer className="stock-adjust-modal__footer">
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={submitting}>
              Anulează
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Se aplică…' : 'Aplică ajustarea'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
