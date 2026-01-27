// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import './IngredientBulkUpdateModal.css';

type IngredientBulkUpdateModalProps = {
  open: boolean;
  ingredientIds: number[];
  onClose: () => void;
  onApplied: (result: {
    updatedCount: number;
    visibilityAction?: 'hide' | 'restore' | null;
    minStock?: number | null;
    costPerUnit?: number | null;
  }) => void;
};

export function IngredientBulkUpdateModal({
  open,
  ingredientIds,
  onClose,
  onApplied,
}: IngredientBulkUpdateModalProps) {
//   const { t } = useTranslation();
  const [minStock, setMinStock] = useState<string>('');
  const [costPerUnit, setCostPerUnit] = useState<string>('');
  const [visibilityAction, setVisibilityAction] = useState<'none' | 'hide' | 'restore'>('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectionCount = useMemo(() => ingredientIds.length, [ingredientIds]);

  useEffect(() => {
    if (open) {
      setMinStock('');
      setCostPerUni('');
      setVisibilityAction('none');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//   const { t } = useTranslation();
    event.preventDefault();

    if (!selectionCount) {
      setError('Selectează cel puțin un ingredient pentru actualizare.');
      return;
    }

    const shouldUpdateMinStock = minStock.trim() !== '';
    const shouldUpdateCost = costPerUnit.trim() !== '';
    const shouldToggleVisibility = visibilityAction !== 'none';

    if (!shouldUpdateMinStock && !shouldUpdateCost && !shouldToggleVisibility) {
      setError('Completează cel puțin un câmp sau selectează o acțiune de vizibilitate.');
      return;
    }

    const parsedMinStock = shouldUpdateMinStock ? Number(minStock) : null;
    const parsedCost = shouldUpdateCost ? Number(costPerUnit) : null;

    if (shouldUpdateMinStock && Number.isNaN(parsedMinStock)) {
      setError('Valoarea pentru stoc minim este invalidă.');
      return;
    }

    if (shouldUpdateCost && Number.isNaN(parsedCost)) {
      setError('Valoarea pentru cost/unitate este invalidă.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const updatePayload: Record<string, unknown> = {};
      if (shouldUpdateMinStock) {
        updatePayload.min_stock = parsedMinStock;
      }
      if (shouldUpdateCost) {
        updatePayload.cost_per_unit = parsedCost;
      }

      const promises: Promise<unknown>[] = [];

      if (Object.keys(updatePayload).length > 0) {
        for (const id of ingredientIds) {
          promises.push(httpClient.put(`/api/ingredients/"Id"`, updatePayload));
        }
      }

      if (visibilityAction === 'hide') {
        for (const id of ingredientIds) {
          promises.push(httpClient.patch(`/api/ingredients/"Id"/hide`));
        }
      } else if (visibilityAction === 'restore') {
        for (const id of ingredientIds) {
          promises.push(httpClient.patch(`/api/ingredients/"Id"/restore`));
        }
      }

      await Promise.all(promises);

      onApplied({
        updatedCount: selectionCount,
        visibilityAction: visibilityAction === 'none' ? null : visibilityAction,
        minStock: shouldUpdateMinStock ? parsedMinStock ?? null : null,
        costPerUnit: shouldUpdateCost ? parsedCost ?? null : null,
      });
    } catch (apiError: any) {
      console.error('❌ Eroare la actualizarea în masă a ingredientelor:', apiError);
      const apiMessage =
        apiError?.response?.data?.error ||
        apiError?.message ||
        'Actualizarea în masă a eșuat. Încearcă din nou.';
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="actualizare in masa a ingredientelor"
      description={`Vor fi procesate ${selectionCount} ingrediente selectate.`}
      size="lg"
    >
      {error ? <InlineAlert variant="error" title="nu s a putut aplica modificarea" message={error} /> : null}

      <form className="ingredient-bulk-form" onSubmit={handleSubmit}>
        <div className="ingredient-bulk-grid">
          <label className="ingredient-bulk-field">
            <span>Stoc minim</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={minStock}
              onChange={(event) => setMinStock(event.target.value)}
              placeholder="lasa gol pentru a nu modifica"
            />
          </label>

          <label className="ingredient-bulk-field">
            <span>Cost / unitate (RON)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={costPerUnit}
              onChange={(event) => setCostPerUnit(event.target.value)}
              placeholder="lasa gol pentru a nu modifica"
            />
          </label>
        </div>

        <fieldset className="ingredient-bulk-visibility">
          <legend>Vizibilitate ingredient</legend>
          <label>
            <input
              type="radio"
              name="visibility"
              value="none"
              checked={visibilityAction === 'none'}
              onChange={() => setVisibilityAction('none')}
            />"nu modifica vizibilitatea"</label>
          <label>
            <input
              type="radio"
              name="visibility"
              value="hide"
              checked={visibilityAction === 'hide'}
              onChange={() => setVisibilityAction('hide')}
            />"marcheaza drept neinventariabil"</label>
          <label>
            <input
              type="radio"
              name="visibility"
              value="restore"
              checked={visibilityAction === 'restore'}
              onChange={() => setVisibilityAction('restore')}
            />"restaureaza ingredientele ascunse"</label>
        </fieldset>

        <footer className="ingredient-bulk-actions">
          <button type="button" className="ingredient-bulk-button ingredient-bulk-button--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button type="submit" className="ingredient-bulk-button ingredient-bulk-button--primary" disabled={loading}>
            {loading ? 'Se aplică…' : 'Aplică modificările'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}




