/**
 * AIAudit Page - Menu health audit via HORECA AI
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Table, Badge, ProgressBar } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { aiApi, AuditResult, AuditIssue } from '../api/aiApi';

const ISSUE_LABELS: Record<string, string> = {
  missing_allergens: 'Alergeni lipsă',
  invalid_price: 'Preț invalid',
  missing_name: 'Denumire lipsă',
  missing_description: 'Descriere lipsă',
  missing_image: 'Imagine lipsă',
  invalid_vat: 'TVA incorect',
  missing_ingredients: 'Ingrediente lipsă',
  missing_category: 'Categorie lipsă',
  duplicate_name: 'Denumire duplicat',
  invalid_cost: 'Cost invalid',
};

const SEVERITY_COLOR: Record<string, string> = {
  error: 'danger',
  warning: 'warning',
};

const HEALTH_COLOR = (score: number) => {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
};

export const AIAuditPage: React.FC = () => {
  const [products, setProducts] = useState<unknown[]>([]);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load products from API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      setProducts(json.data || json || []);
    } catch {
      console.warn('Failed to load products for AI audit');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleAudit = useCallback(async () => {
    if (products.length === 0) return setError('Nu există produse de auditat');
    setError(null);
    setLoading(true);
    try {
      const result = await aiApi.audit(products);
      setAuditResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare audit AI');
    } finally {
      setLoading(false);
    }
  }, [products]);

  const handleRepairAll = useCallback(async () => {
    if (!auditResult) return;
    setRepairing(true);
    setSuccess(null);
    let fixed = 0;
    try {
      for (const prod of products as Record<string, unknown>[]) {
        await aiApi.repair(prod);
        fixed++;
      }
      setSuccess(`${fixed} produse reparate automat`);
      // Re-audit after repair
      const newResult = await aiApi.audit(products);
      setAuditResult(newResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare reparare');
    } finally {
      setRepairing(false);
    }
  }, [products, auditResult]);

  const healthScore = auditResult?.healthScore ?? 0;

  return (
    <div className="container-fluid py-3">
      <PageHeader
        title="Audit AI Meniu HORECA"
        subtitle="Verificare sănătate meniu cu inteligență artificială"
      />

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <Card>
            <Card.Body className="text-center">
              <div className="text-muted small mb-1">Produse în meniu</div>
              <div className="fs-2 fw-bold">{products.length}</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <Card.Body className="text-center">
              <div className="text-muted small mb-1">Scor sănătate meniu</div>
              {auditResult ? (
                <>
                  <div className={`fs-2 fw-bold text-${HEALTH_COLOR(healthScore)}`}>
                    {healthScore.toFixed(0)}%
                  </div>
                  <ProgressBar
                    now={healthScore}
                    variant={HEALTH_COLOR(healthScore)}
                    className="mt-1"
                  />
                </>
              ) : (
                <div className="text-muted">—</div>
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <Card.Body className="text-center">
              <div className="text-muted small mb-1">Probleme detectate</div>
              <div className={`fs-2 fw-bold text-${auditResult && auditResult.issues.length > 0 ? 'danger' : 'success'}`}>
                {auditResult ? auditResult.issues.length : '—'}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3">
        <Button variant="primary" onClick={handleAudit} disabled={loading || products.length === 0}>
          {loading ? <><Spinner size="sm" className="me-2" />Analiză...</> : <><i className="fas fa-stethoscope me-2" />Rulează Audit AI</>}
        </Button>
        {auditResult && auditResult.issues.length > 0 && (
          <Button variant="success" onClick={handleRepairAll} disabled={repairing}>
            {repairing ? <><Spinner size="sm" className="me-2" />Reparare...</> : <><i className="fas fa-wrench me-2" />Repară Automat Toate</>}
          </Button>
        )}
        <Button variant="outline-secondary" onClick={loadProducts} disabled={loading}>
          <i className="fas fa-sync me-2" />Reîncarcă produse
        </Button>
      </div>

      {auditResult && auditResult.issues.length === 0 && (
        <Alert variant="success">
          <i className="fas fa-check-circle me-2" />
          <strong>Meniu perfect!</strong> Nu s-au găsit probleme. Scor: {healthScore}%
        </Alert>
      )}

      {auditResult && auditResult.issues.length > 0 && (
        <Card>
          <Card.Header>
            <i className="fas fa-exclamation-circle me-2 text-danger" />
            Probleme detectate ({auditResult.issues.length})
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover size="sm" responsive>
              <thead>
                <tr>
                  <th>Produs ID</th>
                  <th>Tip problemă</th>
                  <th>Severitate</th>
                </tr>
              </thead>
              <tbody>
                {auditResult.issues.map((issue: AuditIssue, i: number) => (
                  <tr key={i}>
                    <td>{issue.productId ?? '—'}</td>
                    <td>{ISSUE_LABELS[issue.type] || issue.type}</td>
                    <td>
                      <Badge bg={SEVERITY_COLOR[issue.severity] || 'secondary'}>
                        {issue.severity}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AIAuditPage;
