// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { Modal } from '@/shared/components/Modal';
import { RecipeVersionCompare } from './RecipeVersionCompare';
import './RecipeVersionHistory.css';

interface RecipeVersion {
  id: number;
  recipe_id: number;
  version_number: number;
  recipe_snapshot: any;
  changed_by: string;
  changed_at: string;
  change_description?: string;
  change_reason?: string;
  cost_before: number;
  cost_after: number;
  cost_difference_percentage: number;
  is_active: boolean;
}

interface RecipeVersionHistoryProps {
  open: boolean;
  recipeId: number | null;
  onClose: () => void;
}

export function RecipeVersionHistory({ open, recipeId, onClose }: RecipeVersionHistoryProps) {
//   const { t } = useTranslation();
  const [versions, setVersions] = useState<RecipeVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<{ v1: number; v2: number } | null>(null);

  const loadVersions = useCallback(async () => {
    if (!recipeId || !open) return;

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.get(`/api/admin/recipes/${recipeId}/versions`);
      setVersions(response.data?.data || []);
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea versiunilor');
    } finally {
      setLoading(false);
    }
  }, [recipeId, open]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleCompare = (v1: number, v2: number) => {
    setSelectedVersions({ v1, v2 });
    setCompareOpen(true);
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

  const formatCost = (cost: number) => {
    return `${cost.toFixed(2)} RON`;
  };

  if (!open) return null;

  return (
    <>
      <Modal isOpen={open} title="Istoric Versiuni Rețetă" size="xl" onClose={onClose}>
        {error && <InlineAlert variant="error" title="Eroare" message={error} />}

        {loading ? (
          <div className="version-history-loading">"se incarca versiunile"</div>
        ) : versions.length === 0 ? (
          <div className="version-history-empty">
            <p>"nu exista versiuni salvate pentru aceasta reteta"</p>
            <p className="text-muted">"versiunile se creeaza automat la fiecare salvare a"</p>
          </div>
        ) : (
          <div className="version-history">
            <div className="version-history-list">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`version-item ${version.is_active ? 'active' : ''}`}
                >
                  <div className="version-header">
                    <div className="version-number">
                      <span className="version-badge">v{version.version_number}</span>
                      {version.is_active && <span className="active-badge">ACTIV</span>}
                    </div>
                    <div className="version-meta">
                      <div className="version-date">{formatDate(version.changed_at)}</div>
                      <div className="version-author">de {version.changed_by}</div>
                    </div>
                  </div>

                  {version.change_description && (
                    <div className="version-description">{version.change_description}</div>
                  )}

                  {version.change_reason && (
                    <div className="version-reason">
                      <strong>Motiv:</strong> {version.change_reason}
                    </div>
                  )}

                  <div className="version-costs">
                    <div className="cost-item">
                      <span className="cost-label">Cost:</span>
                      <span className="cost-value">{formatCost(version.cost_after)}</span>
                    </div>
                    {version.cost_difference_percentage !== 0 && (
                      <div
                        className={`cost-difference ${
                          version.cost_difference_percentage > 0 ? 'increase' : 'decrease'
                        }`}
                      >
                        {version.cost_difference_percentage > 0 ? '↑' : '↓'}' '
                        {Math.abs(version.cost_difference_percentage).toFixed(1)}%
                      </div>
                    )}
                  </div>

                  {index < versions.length - 1 && (
                    <button
                      type="button"
                      className="btn-compare"
                      onClick={() => handleCompare(version.version_number, versions[index + 1].version_number)}
                    >
                      Compară cu v{versions[index + 1].version_number}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {selectedVersions && (
        <RecipeVersionCompare
          open={compareOpen}
          recipeId={recipeId!}
          version1={selectedVersions.v1}
          version2={selectedVersions.v2}
          onClose={() => {
            setCompareOpen(false);
            setSelectedVersions(null);
          }}
        />
      )}
    </>
  );
}




