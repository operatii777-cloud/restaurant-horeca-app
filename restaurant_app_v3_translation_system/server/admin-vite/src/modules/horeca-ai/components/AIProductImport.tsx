/**
 * AIProductImport - File upload + product extraction via HORECA AI
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { aiApi, ExtractedProduct } from '../api/aiApi';

interface Props {
  onProductsSaved?: (products: ExtractedProduct[]) => void;
}

const AIProductImport: React.FC<Props> = ({ onProductsSaved }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string ?? '');
    reader.readAsText(file, 'utf-8');
  }, []);

  const handleExtract = useCallback(async () => {
    if (!text.trim()) return setError('Introduceți text sau încărcați un fișier');
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const extracted = await aiApi.extractProducts(text);
      setProducts(extracted);
      setSuccess(`${extracted.length} produse extrase cu succes`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la extragere');
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handleSave = useCallback(() => {
    onProductsSaved?.(products);
    setSuccess(`${products.length} produse transmise spre salvare`);
  }, [products, onProductsSaved]);

  return (
    <Card className="mb-3">
      <Card.Header>
        <i className="fas fa-robot me-2 text-primary" />
        Import Produse cu AI
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

        <div className="mb-3">
          <label className="form-label fw-semibold">Fișier meniu (txt, csv)</label>
          <input type="file" className="form-control" accept=".txt,.csv,.md" onChange={handleFileChange} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">sau lipiți textul meniului</label>
          <textarea
            className="form-control"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pizza Margherita 25 lei&#10;Pasta Carbonara 30 lei&#10;..."
          />
        </div>

        <Button variant="primary" onClick={handleExtract} disabled={loading || !text.trim()}>
          {loading ? <><Spinner size="sm" className="me-2" />Procesare AI...</> : <><i className="fas fa-magic me-2" />Extrage Produse</>}
        </Button>

        {products.length > 0 && (
          <>
            <hr />
            <h6>Produse extrase ({products.length})</h6>
            <Table striped bordered hover size="sm" className="mb-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nume produs</th>
                  <th>Preț</th>
                  <th>Monedă</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.price !== null ? p.price : <Badge bg="warning">lipsă</Badge>}</td>
                    <td>{p.currency}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button variant="success" onClick={handleSave}>
              <i className="fas fa-save me-2" />Salvează produsele
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default AIProductImport;
