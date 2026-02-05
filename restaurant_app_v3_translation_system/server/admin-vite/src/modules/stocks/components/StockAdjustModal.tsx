// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

// Funcție helper pentru conversie unități
function convertUnit(quantity: number, fromUnit: string, toUnit: string): number {
  if (!quantity || !fromUnit || !toUnit || fromUnit === toUnit) return quantity;

  // Conversii pentru greutăți (kg ↔ gr)
  if ((fromUnit === 'kg' && toUnit === 'gr') || (fromUnit === 'gr' && toUnit === 'kg')) {
    return fromUnit === 'kg' ? quantity * 1000 : quantity / 1000;
  }

  // Conversii pentru volume (l ↔ ml)
  if ((fromUnit === 'l' && toUnit === 'ml') || (fromUnit === 'ml' && toUnit === 'l')) {
    return fromUnit === 'l' ? quantity * 1000 : quantity / 1000;
  }

  return quantity;
}

// Detectează unități compatibile pentru un ingredient
function getCompatibleUnits(ingredientUnit: string): string[] {
  if (ingredientUnit === 'kg') return ['kg', 'gr'];
  if (ingredientUnit === 'gr') return ['gr', 'kg'];
  if (ingredientUnit === 'l') return ['l', 'ml'];
  if (ingredientUnit === 'ml') return ['ml', 'l'];
  return [ingredientUnit]; // buc sau alte unități fără conversie
}

export const StockAdjustModal = ({ open, ingredient, onClose, onUpdated }: StockAdjustModalProps) => {
  //   const { t } = useTranslation();
  const [operation, setOperation] = useState<Operation>('set');
  const [quantity, setQuantity] = useState<number>(0);
  const [inputUnit, setInputUnit] = useState<string>('');
  const [reason, setReason] = useState('Ajustare manuală');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetState = useCallback(() => {
    setOperation('set');
    setQuantity(0);
    setInputUnit(ingredient?.unit || 'buc');
    setReason('Ajustare manuală');
    setFeedback(null);
  }, [ingredient]);

  // Actualizează inputUnit când se schimbă ingredientul
  useEffect(() => {
    if (ingredient?.unit) {
      setInputUnit(ingredient.unit);
    }
  }, [ingredient]);

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
        const response = await httpClient.post(`/api/admin/ingredients/${ingredient.id}/update-stock`, {
          quantity,
          operation,
          reason,
          input_unit: inputUnit, // Trimite unitatea introdusă
        });

        // Afișează mesaj de succes cu informații despre conversie dacă există
        let successMessage = 'Stocul a fost ajustat cu succes.';
        if (response.data?.conversion) {
          successMessage = `Stocul a fost ajustat: ${response.data.conversion.input} → ${response.data.conversion.converted}`;
        }

        setFeedback({ type: 'success', message: successMessage });
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
              Ingredient: <strong>{ingredient.name}</strong> · Stoc curent:' '
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
                <input type="radio" name="operation" value="set" checked={operation === 'set'} onChange={() => setOperation('set')} />seteaza valoare exacta</label>
              <label>
                <input type="radio" name="operation" value="increase" checked={operation === 'increase'} onChange={() => setOperation('increase')} />adauga la stoc</label>
              <label>
                <input type="radio" name="operation" value="decrease" checked={operation === 'decrease'} onChange={() => setOperation('decrease')} />scade din stoc</label>
            </div>
          </div>

          <div className="stock-adjust-modal__field-group">
            <label className="stock-adjust-modal__label" htmlFor="stock-adjust-quantity">
              Cantitate
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                id="stock-adjust-quantity"
                type="number"
                min={0}
                step="0.01"
                required
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                style={{ flex: '1 1 auto', fontSize: '24px', padding: '12px', minWidth: '200px', height: '50px' }}
              />
              <select
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  cursor: 'pointer',
                }}
              >
                {getCompatibleUnits(ingredient.unit).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            {inputUnit !== ingredient.unit && quantity > 0 && (
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                = {convertUnit(quantity, inputUnit, ingredient.unit).toFixed(2)} {ingredient.unit}
              </div>
            )}
          </div>

          <label className="stock-adjust-modal__label" htmlFor="stock-adjust-reason">
            Motiv (opțional)
          </label>
          <input
            id="stock-adjust-reason"
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="ajustare manuala"
          />

          {feedback ? (
            <InlineAlert
              variant={feedback.type}
              title={feedback.type === 'success' ? 'Succes' : 'Eroare'}
              message={feedback.message}
            />
          ) : null}

          <footer className="stock-adjust-modal__footer">
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={submitting}>Anulează</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Se aplică…' : 'Aplică ajustarea'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};



