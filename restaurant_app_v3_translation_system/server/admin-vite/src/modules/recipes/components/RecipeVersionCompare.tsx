// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { Modal } from '@/shared/components/Modal';
import './RecipeVersionCompare.css';

interface RecipeVersionCompareProps {
  open: boolean;
  recipeId: number;
  version1: number;
  version2: number;
  onClose: () => void;
}

interface ComparisonData {
  version1: {
    number: number;
    changed_at: string;
    changed_by: string;
    cost: { total: number; per_serving: number };
    ingredients_count: number;
  };
  version2: {
    number: number;
    changed_at: string;
    changed_by: string;
    cost: { total: number; per_serving: number };
    ingredients_count: number;
  };
  differences: {
    cost: {
      before: number;
      after: number;
      difference: number;
      percentage: number;
    };
    ingredients: {
      added: Array<{ ingredient_id: number; ingredient_name: string; quantity: number; unit: string }>;
      removed: Array<{ ingredient_id: number; ingredient_name: string; quantity: number; unit: string }>;
      modified: Array<{
        ingredient_id: number;
        ingredient_name: string;
        old: { quantity: number; unit: string; waste_percentage: number };
        new: { quantity: number; unit: string; waste_percentage: number };
      }>;
    };
  };
}

export function RecipeVersionCompare({
  open,
  recipeId,
  version1,
  version2,
  onClose,
}: RecipeVersionCompareProps) {
//   const { t } = useTranslation();
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !recipeId) return;

    setLoading(true);
    setError(null);

    httpClient
      .get(`/api/admin/recipes/${recipeId}/versions/compare/${version1}/${version2}`)
      .then((response) => {
        setComparison(response.data?.data || null);
      })
      .catch((err: any) => {
        setError(err.message || 'Eroare la compararea versiunilor');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, recipeId, version1, version2]);

  const formatCost = (cost: number) => {
//   const { t } = useTranslation();
    return `${cost.toFixed(2)} RON`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      title={`Comparare Versiuni: v${version1} vs v${version2}`}
      size="xl"
      onClose={onClose}
    >
      {error && <InlineAlert variant="error" title="Eroare" message={error} />}

      {loading ? (
        <div className="version-compare-loading">"se compara versiunile"</div>
      ) : !comparison ? (
        <div className="version-compare-empty">"nu s au putut compara versiunile"</div>
      ) : (
        <div className="version-compare">
          {/* Version Info */}
          <div className="compare-versions-info">
            <div className="version-info-box">
              <h4>Versiunea {comparison.version1.number}</h4>
              <p className="text-muted">{formatDate(comparison.version1.changed_at)}</p>
              <p className="text-muted">de {comparison.version1.changed_by}</p>
              <p className="cost-info">{formatCost(comparison.version1.cost.total)}</p>
              <p className="ingredients-count">{comparison.version1.ingredients_count} ingrediente</p>
            </div>
            <div className="version-info-box">
              <h4>Versiunea {comparison.version2.number}</h4>
              <p className="text-muted">{formatDate(comparison.version2.changed_at)}</p>
              <p className="text-muted">de {comparison.version2.changed_by}</p>
              <p className="cost-info">{formatCost(comparison.version2.cost.total)}</p>
              <p className="ingredients-count">{comparison.version2.ingredients_count} ingrediente</p>
            </div>
          </div>

          {/* Cost Difference */}
          <div className="compare-section">
            <h3>"diferente cost"</h3>
            <div className="cost-comparison">
              <div className="cost-item">
                <span className="cost-label">Cost anterior:</span>
                <span className="cost-value">{formatCost(comparison.differences.cost.before)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Cost nou:</span>
                <span className="cost-value">{formatCost(comparison.differences.cost.after)}</span>
              </div>
              <div
                className={`cost-difference ${
                  comparison.differences.cost.difference > 0 ? 'increase' : 'decrease'
                }`}
              >
                <span className="cost-label">"Diferență:"</span>
                <span className="cost-value">
                  {comparison.differences.cost.difference > 0 ? '+' : ''}
                  {formatCost(comparison.differences.cost.difference)} (
                  {comparison.differences.cost.percentage > 0 ? '+' : ''}
                  {comparison.differences.cost.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Ingredients Differences */}
          <div className="compare-section">
            <h3>"diferente ingrediente"</h3>

            {comparison.differences.ingredients.added.length > 0 && (
              <div className="ingredients-diff added">
                <h4>➕ Ingrediente Adăugate ({comparison.differences.ingredients.added.length})</h4>
                <ul>
                  {comparison.differences.ingredients.added.map((ing) => (
                    <li key={ing.ingredient_id}>
                      <strong>{ing.ingredient_name}</strong>: {ing.quantity} {ing.unit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {comparison.differences.ingredients.removed.length > 0 && (
              <div className="ingredients-diff removed">
                <h4>➖ Ingrediente Eliminate ({comparison.differences.ingredients.removed.length})</h4>
                <ul>
                  {comparison.differences.ingredients.removed.map((ing) => (
                    <li key={ing.ingredient_id}>
                      <strong>{ing.ingredient_name}</strong>: {ing.quantity} {ing.unit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {comparison.differences.ingredients.modified.length > 0 && (
              <div className="ingredients-diff modified">
                <h4>✏️ Ingrediente Modificate ({comparison.differences.ingredients.modified.length})</h4>
                <ul>
                  {comparison.differences.ingredients.modified.map((ing) => (
                    <li key={ing.ingredient_id}>
                      <strong>{ing.ingredient_name}</strong>:
                      <div className="modification-details">
                        <span className="old-value">
                          {ing.old.quantity} {ing.old.unit} (waste: {ing.old.waste_percentage}%)
                        </span>
                        <span className="arrow">→</span>
                        <span className="new-value">
                          {ing.new.quantity} {ing.new.unit} (waste: {ing.new.waste_percentage}%)
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {comparison.differences.ingredients.added.length === 0 &&
              comparison.differences.ingredients.removed.length === 0 &&
              comparison.differences.ingredients.modified.length === 0 && (
                <p className="text-muted">"nu exista diferente in ingrediente intre aceste ve"</p>
              )}
          </div>
        </div>
      )}
    </Modal>
  );
}




