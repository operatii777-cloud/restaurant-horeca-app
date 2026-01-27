import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert, Badge, Row, Col, Tabs, Tab, Table } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './PriceUtilitiesPage.css';

interface PriceHistory {
  id: number;
  product_id: number;
  product_name?: string;
  old_price: number | null;
  new_price: number;
  change_reason: string | null;
  change_type: string;
  changed_by: string | null;
  changed_at: string;
}

interface PriceRule {
  id?: number;
  name: string;
  rule_type: 'cost_multiplier' | 'margin_target' | 'percentage_change' | 'fixed_change' | 'formula';
  condition_json: string;
  action_json: string;
  is_active: number;
  priority: number;
}

interface BulkUpdatePreview {
  product_id: number;
  product_name: string;
  current_price: number;
  new_price: number;
  change: number;
  change_percent: number;
}

export const PriceUtilitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('bulk-update');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Bulk Update State
  const [bulkUpdateType, setBulkUpdateType] = useState<'fixed' | 'percentage' | 'formula'>('percentage');
  const [bulkUpdateValue, setBulkUpdateValue] = useState<string>('');
  const [bulkUpdateFormula, setBulkUpdateFormula] = useState<string>('cost * 2.5');
  const [bulkUpdatePreview, setBulkUpdatePreview] = useState<BulkUpdatePreview[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productFilter, setProductFilter] = useState<string>('');
  
  // Price History State
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [historyProductId, setHistoryProductId] = useState<number | null>(null);
  
  // Price Rules State
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);
  const [ruleFormData, setRuleFormData] = useState<Partial<PriceRule>>({
    name: '',
    rule_type: 'cost_multiplier',
    condition_json: '{}',
    action_json: '{}',
    is_active: 1,
    priority: 0,
  });

  const fetchPriceHistory = useCallback(async (productId?: number) => {
    try {
      const endpoint = productId 
        ? `/api/admin/prices/history/${productId}`
        : '/api/admin/prices/history';
      const response = await httpClient.get(endpoint);
      const data = response.data?.data || response.data || [];
      setPriceHistory(data);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea istoricului:', err);
      setError(err.message || 'Eroare la încărcarea istoricului');
    }
  }, []);

  const fetchPriceRules = useCallback(async () => {
    try {
      const response = await httpClient.get('/api/admin/price-rules');
      const data = response.data?.data || response.data || [];
      setPriceRules(data);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea regulilor:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      void fetchPriceHistory(historyProductId || undefined);
    } else if (activeTab === 'rules') {
      void fetchPriceRules();
    }
  }, [activeTab, historyProductId, fetchPriceHistory, fetchPriceRules]);

  const handleBulkUpdatePreview = async () => {
    if (!bulkUpdateValue && bulkUpdateType !== 'formula') {
      setFeedback({ type: 'error', message: 'Introdu valoarea pentru actualizare!' });
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.post('/api/admin/prices/bulk-update/preview', {
        type: bulkUpdateType,
        value: bulkUpdateType === 'formula' ? bulkUpdateFormula : bulkUpdateValue,
        product_ids: selectedProducts.length > 0 ? selectedProducts : null,
        filter: productFilter || null,
      });
      
      const preview = response.data?.data || response.data || [];
      setBulkUpdatePreview(preview);
      
      if (preview.length === 0) {
        setFeedback({ type: 'error', message: 'Nu s-au găsit produse pentru actualizare!' });
      }
    } catch (err: any) {
      console.error('❌ Eroare la preview:', err);
      setFeedback({ type: 'error', message: err.response?.data?.error || err.message || 'Eroare la preview' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdateApply = async () => {
    if (bulkUpdatePreview.length === 0) {
      setFeedback({ type: 'error', message: 'Nu există modificări de aplicat!' });
      return;
    }

    if (!window.confirm(`Ești sigur că vrei să actualizezi prețurile pentru ${bulkUpdatePreview.length} produse?`)) {
      return;
    }

    setLoading(true);
    try {
      await httpClient.post('/api/admin/prices/bulk-update', {
        updates: bulkUpdatePreview.map(p => ({
          product_id: p.product_id,
          new_price: p.new_price,
          reason: `Actualizare în masă: ${bulkUpdateType}`,
        })),
      });
      
      setFeedback({ type: 'success', message: `Prețurile au fost actualizate pentru ${bulkUpdatePreview.length} produse!` });
      setBulkUpdatePreview([]);
      setBulkUpdateValue('');
    } catch (err: any) {
      console.error('❌ Eroare la actualizare:', err);
      setFeedback({ type: 'error', message: err.response?.data?.error || err.message || 'Eroare la actualizare' });
    } finally {
      setLoading(false);
    }
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule?.id) {
        await httpClient.put(`/api/admin/price-rules/${editingRule.id}`, ruleFormData);
        setFeedback({ type: 'success', message: 'Regulă actualizată cu succes!' });
      } else {
        await httpClient.post('/api/admin/price-rules', ruleFormData);
        setFeedback({ type: 'success', message: 'Regulă creată cu succes!' });
      }
      setShowRuleModal(false);
      void fetchPriceRules();
    } catch (err: any) {
      console.error('❌ Eroare la salvare regulă:', err);
      setFeedback({ type: 'error', message: err.response?.data?.error || err.message || 'Eroare la salvare' });
    }
  };

  return (
    <div className="price-utilities-page">
      <PageHeader
        title="💰 Utilitare Prețuri"
        description="Gestionare în masă a prețurilor, istoric și reguli automate"
      />

      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'success' : 'danger'}
          dismissible
          onClose={() => setFeedback(null)}
          className="mb-4"
        >
          {feedback.message}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
            {/* Tab: Actualizare în Masă */}
            <Tab eventKey="bulk-update" title={<><i className="fas fa-edit me-1"></i>Actualizare în Masă</>}>
              <div className="mt-4">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tip Actualizare</Form.Label>
                      <Form.Select
                        value={bulkUpdateType}
                        onChange={(e) => setBulkUpdateType(e.target.value as any)}
                      >
                        <option value="percentage">Creștere/Reducere Procentuală</option>
                        <option value="fixed">Creștere/Reducere Valoare Fixă</option>
                        <option value="formula">Formulă (ex: cost * 2.5)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {bulkUpdateType === 'percentage' ? 'Procent (%)' : 
                         bulkUpdateType === 'fixed' ? 'Valoare (RON)' : 'Formulă'}
                      </Form.Label>
                      {bulkUpdateType === 'formula' ? (
                        <Form.Control
                          type="text"
                          value={bulkUpdateFormula}
                          onChange={(e) => setBulkUpdateFormula(e.target.value)}
                          placeholder="cost * 2.5"
                        />
                      ) : (
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={bulkUpdateValue}
                          onChange={(e) => setBulkUpdateValue(e.target.value)}
                          placeholder={bulkUpdateType === 'percentage' ? '10 (pentru +10%)' : '5.50'}
                        />
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Filtru Produse (opțional)</Form.Label>
                      <Form.Control
                        type="text"
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        placeholder="Caută după nume sau categorie"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 mb-4">
                  <Button
                    variant="primary"
                    onClick={handleBulkUpdatePreview}
                    disabled={loading}
                  >
                    <i className="fas fa-eye me-1"></i>
                    Preview Modificări
                  </Button>
                  {bulkUpdatePreview.length > 0 && (
                    <Button
                      variant="success"
                      onClick={handleBulkUpdateApply}
                      disabled={loading}
                    >
                      <i className="fas fa-check me-1"></i>
                      Aplică Modificările ({bulkUpdatePreview.length} produse)
                    </Button>
                  )}
                </div>

                {bulkUpdatePreview.length > 0 && (
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Produs</th>
                          <th>Preț Curent</th>
                          <th>Preț Nou</th>
                          <th>Schimbare</th>
                          <th>Schimbare %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkUpdatePreview.map((item) => (
                          <tr key={item.product_id}>
                            <td>{item.product_name}</td>
                            <td>{item.current_price.toFixed(2)} RON</td>
                            <td><strong>{item.new_price.toFixed(2)} RON</strong></td>
                            <td className={item.change >= 0 ? 'text-success' : 'text-danger'}>
                              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} RON
                            </td>
                            <td className={item.change_percent >= 0 ? 'text-success' : 'text-danger'}>
                              {item.change_percent >= 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Tab>

            {/* Tab: Istoric Prețuri */}
            <Tab eventKey="history" title={<><i className="fas fa-history me-1"></i>Istoric Prețuri</>}>
              <div className="mt-4">
                <Form.Group className="mb-3">
                  <Form.Label>Filtrare după Produs (opțional)</Form.Label>
                  <Form.Control
                    type="number"
                    value={historyProductId || ''}
                    onChange={(e) => setHistoryProductId(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="ID Produs (lăsă gol pentru toate)"
                  />
                </Form.Group>

                {priceHistory.length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>
                    Nu există istoric de prețuri.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Produs</th>
                          <th>Preț Vechi</th>
                          <th>Preț Nou</th>
                          <th>Tip Schimbare</th>
                          <th>Motiv</th>
                          <th>Modificat de</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceHistory.map((item) => (
                          <tr key={item.id}>
                            <td>{item.product_name || `ID: ${item.product_id}`}</td>
                            <td>{item.old_price ? `${item.old_price.toFixed(2)} RON` : '-'}</td>
                            <td><strong>{item.new_price.toFixed(2)} RON</strong></td>
                            <td>
                              <Badge bg="secondary">{item.change_type}</Badge>
                            </td>
                            <td>{item.change_reason || '-'}</td>
                            <td>{item.changed_by || 'System'}</td>
                            <td>{new Date(item.changed_at).toLocaleString('ro-RO')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Tab>

            {/* Tab: Reguli Preț */}
            <Tab eventKey="rules" title={<><i className="fas fa-cog me-1"></i>Reguli Automate</>}>
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Reguli de Actualizare Automată</h5>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingRule(null);
                      setRuleFormData({
                        name: '',
                        rule_type: 'cost_multiplier',
                        condition_json: '{}',
                        action_json: '{}',
                        is_active: 1,
                        priority: 0,
                      });
                      setShowRuleModal(true);
                    }}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Adaugă Regulă
                  </Button>
                </div>

                {priceRules.length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>
                    Nu există reguli de preț. Creează prima regulă!
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Nume</th>
                          <th>Tip</th>
                          <th>Prioritate</th>
                          <th>Status</th>
                          <th>Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceRules.map((rule) => (
                          <tr key={rule.id}>
                            <td>{rule.name}</td>
                            <td><Badge bg="info">{rule.rule_type}</Badge></td>
                            <td>{rule.priority}</td>
                            <td>
                              {rule.is_active === 1 ? (
                                <Badge bg="success">Activ</Badge>
                              ) : (
                                <Badge bg="secondary">Inactiv</Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  setEditingRule(rule);
                                  setRuleFormData(rule);
                                  setShowRuleModal(true);
                                }}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Modal pentru Reguli */}
      <Modal show={showRuleModal} onHide={() => setShowRuleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRule ? 'Editează Regulă Preț' : 'Adaugă Regulă Preț'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRuleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nume Regulă *</Form.Label>
              <Form.Control
                type="text"
                value={ruleFormData.name || ''}
                onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tip Regulă *</Form.Label>
                  <Form.Select
                    value={ruleFormData.rule_type || 'cost_multiplier'}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, rule_type: e.target.value as any })}
                  >
                    <option value="cost_multiplier">Multiplicator Cost</option>
                    <option value="margin_target">Marjă Țintă</option>
                    <option value="percentage_change">Schimbare Procentuală</option>
                    <option value="fixed_change">Schimbare Fixă</option>
                    <option value="formula">Formulă</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prioritate</Form.Label>
                  <Form.Control
                    type="number"
                    value={ruleFormData.priority || 0}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, priority: parseInt(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Regulă activă"
                checked={ruleFormData.is_active === 1}
                onChange={(e) => setRuleFormData({
                  ...ruleFormData,
                  is_active: e.target.checked ? 1 : 0
                })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRuleModal(false)}>
              Anulează
            </Button>
            <Button variant="primary" type="submit">
              {editingRule ? 'Salvează' : 'Creează'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

