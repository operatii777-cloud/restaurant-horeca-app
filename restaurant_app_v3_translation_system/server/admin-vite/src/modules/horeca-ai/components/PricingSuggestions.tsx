/**
 * PricingSuggestions - AI-powered price recommendations
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Alert, Spinner, Table, Badge, InputGroup, Form } from 'react-bootstrap';
import { aiApi, PriceResult } from '../api/aiApi';

interface Props {
  productName?: string;
  currentPrice?: number;
  costPrice?: number;
  onPriceSelected?: (price: number) => void;
}

const PricingSuggestions: React.FC<Props> = ({
  productName = '',
  currentPrice = 0,
  costPrice = 0,
  onPriceSelected,
}) => {
  const [name, setName] = useState(productName);
  const [price, setPrice] = useState(currentPrice);
  const [cost, setCost] = useState(costPrice);
  const [result, setResult] = useState<PriceResult | null>(null);
  const [marketPrices, setMarketPrices] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await aiApi.suggestPrice({ name, price, costPrice: cost });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare AI');
    } finally {
      setLoading(false);
    }
  }, [name, price, cost]);

  const handleMarketPrices = useCallback(async () => {
    setLoading(true);
    try {
      const mp = await aiApi.marketPrices();
      setMarketPrices(mp);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la prețuri piață');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Card className="mb-3">
      <Card.Header>
        <i className="fas fa-tags me-2 text-success" />
        Sugestii Prețuri AI
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">Produs</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Denumire produs" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Cost producție (RON)</label>
            <input type="number" className="form-control" value={cost} onChange={e => setCost(parseFloat(e.target.value) || 0)} min="0" step="0.5" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Preț actual (RON)</label>
            <input type="number" className="form-control" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} min="0" step="0.5" />
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <Button variant="primary" onClick={handleSuggest} disabled={loading}>
            {loading ? <Spinner size="sm" className="me-2" /> : <i className="fas fa-calculator me-2" />}
            Calculează preț AI
          </Button>
          <Button variant="outline-secondary" onClick={handleMarketPrices} disabled={loading}>
            <i className="fas fa-store me-2" />Prețuri piață
          </Button>
        </div>

        {result && (
          <div className="p-3 bg-light rounded mb-3">
            <h6>Rezultat AI</h6>
            <Table borderless size="sm">
              <tbody>
                <tr>
                  <td className="text-muted">Preț sugerat</td>
                  <td><strong className="text-success fs-5">{result.suggestedPrice.toFixed(2)} RON</strong></td>
                </tr>
                {result.markup && (
                  <tr>
                    <td className="text-muted">Markup</td>
                    <td><Badge bg="info">{result.markup}x</Badge></td>
                  </tr>
                )}
                <tr>
                  <td className="text-muted">Baza calcul</td>
                  <td><Badge bg="secondary">{result.basis}</Badge></td>
                </tr>
              </tbody>
            </Table>
            {onPriceSelected && (
              <Button size="sm" variant="success" onClick={() => onPriceSelected(result.suggestedPrice)}>
                <i className="fas fa-check me-1" />Aplică prețul
              </Button>
            )}
          </div>
        )}

        {marketPrices && (
          <>
            <h6>Prețuri de referință piață (RON/kg)</h6>
            <div className="row g-1">
              {Object.entries(marketPrices).map(([ingredient, refPrice]) => (
                <div key={ingredient} className="col-6 col-md-3">
                  <div className="d-flex justify-content-between border rounded p-1 small">
                    <span className="text-capitalize">{ingredient}</span>
                    <strong>{refPrice}</strong>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default PricingSuggestions;
