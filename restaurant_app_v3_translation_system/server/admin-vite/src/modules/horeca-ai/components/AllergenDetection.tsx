/**
 * AllergenDetection - EU 14 allergen detection via HORECA AI
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { aiApi } from '../api/aiApi';

const EU14_LABELS: Record<string, string> = {
  celery: 'Țelină',
  cereals_gluten: 'Cereale/Gluten',
  crustaceans: 'Crustacee',
  eggs: 'Ouă',
  fish: 'Pește',
  lupin: 'Lupin',
  milk: 'Lapte',
  molluscs: 'Moluște',
  mustard: 'Muștar',
  nuts: 'Nuci',
  peanuts: 'Arahide',
  sesame: 'Susan',
  soybeans: 'Soia',
  sulphites: 'Sulfiți',
};

interface Props {
  initialIngredients?: string;
  productId?: number;
  onAllergensSaved?: (allergens: string[]) => void;
}

const AllergenDetection: React.FC<Props> = ({ initialIngredients = '', productId, onAllergensSaved }) => {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [detected, setDetected] = useState<string[]>([]);
  const [manual, setManual] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDetect = useCallback(async () => {
    if (!ingredients.trim()) return setError('Introduceți lista de ingrediente');
    setError(null);
    setLoading(true);
    try {
      const res = await aiApi.detectAllergens(ingredients, productId);
      setDetected(res.allergens);
      setManual(res.allergens); // pre-populate manual with AI results
      setSuccess(`${res.allergens.length} alergeni detectați`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare AI');
    } finally {
      setLoading(false);
    }
  }, [ingredients, productId]);

  const toggleManual = useCallback((allergen: string) => {
    setManual(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  }, []);

  const handleSave = useCallback(() => {
    onAllergensSaved?.(manual);
    setSuccess(`${manual.length} alergeni salvați`);
  }, [manual, onAllergensSaved]);

  const EU14 = Object.keys(EU14_LABELS);

  return (
    <Card className="mb-3">
      <Card.Header>
        <i className="fas fa-exclamation-triangle me-2 text-warning" />
        Detecție Alergeni AI (EU 14)
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

        <div className="mb-3">
          <label className="form-label fw-semibold">Ingrediente</label>
          <textarea
            className="form-control"
            rows={3}
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            placeholder="lapte, ouă, făină de grâu, unt, zahăr..."
          />
        </div>

        <Button variant="warning" onClick={handleDetect} disabled={loading || !ingredients.trim()} className="mb-3">
          {loading ? <><Spinner size="sm" className="me-2" />Analiză AI...</> : <><i className="fas fa-search me-2" />Detectează Alergeni</>}
        </Button>

        {detected.length > 0 && (
          <div className="mb-3 p-2 bg-light rounded">
            <small className="text-muted">Detectați de AI:</small>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {detected.map(a => (
                <Badge key={a} bg="warning" text="dark">{EU14_LABELS[a] || a}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fw-semibold">Alergeni (selectare manuală)</label>
          <div className="d-flex flex-wrap gap-2">
            {EU14.map(allergen => (
              <div key={allergen} className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`allergen-${allergen}`}
                  checked={manual.includes(allergen)}
                  onChange={() => toggleManual(allergen)}
                />
                <label className="form-check-label small" htmlFor={`allergen-${allergen}`}>
                  {EU14_LABELS[allergen]}
                </label>
              </div>
            ))}
          </div>
        </div>

        {manual.length > 0 && (
          <div className="mb-3">
            <Badge bg="success" className="me-1">
              <i className="fas fa-shield-alt me-1" />
              {manual.length}/14 alergeni EU declarați
            </Badge>
          </div>
        )}

        {onAllergensSaved && (
          <Button variant="success" onClick={handleSave} disabled={manual.length === 0}>
            <i className="fas fa-save me-2" />Salvează alergenii
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default AllergenDetection;
