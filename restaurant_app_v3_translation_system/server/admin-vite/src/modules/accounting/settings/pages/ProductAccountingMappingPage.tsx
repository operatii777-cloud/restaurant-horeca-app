// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Product Accounting Mapping Page
 * 
 * Mapare Produse → Conturi Contabile:
 * - Selectare produs
 * - Configurare conturi (stock, consumption, entry, cogs)
 * - Metodă evaluare (FIFO, LIFO, Weighted Average)
 * - Istoric modificări
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Paper, Radio, RadioGroup } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { HelpButton } from '@/shared/components/HelpButton';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './ProductAccountingMappingPage.css';

interface AccountingAccount {
  id: number;
  account_code: string;
  account_name: string;
  account_type: string;
}

interface ProductMapping {
  id?: number;
  ingredient_id: number;
  stock_account_id: number;
  consumption_account_id: number;
  entry_account_id?: number;
  cogs_account_id?: number;
  sub_account_code?: string;
  valuation_method: 'fifo' | 'lifo' | 'weighted_average';
  stock_account_code?: string;
  stock_account_name?: string;
  consumption_account_code?: string;
  consumption_account_name?: string;
  entry_account_code?: string;
  entry_account_name?: string;
  cogs_account_code?: string;
  cogs_account_name?: string;
}

interface ProductMappingHistory {
  id: number;
  old_account_code?: string;
  new_account_code: string;
  change_reason: string;
  changed_by?: number;
  changed_at: string;
}

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  category?: string;
  current_stock?: number;
  avg_price?: number;
}

export const ProductAccountingMappingPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [mapping, setMapping] = useState<ProductMapping | null>(null);
  const [history, setHistory] = useState<ProductMappingHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ProductMapping>>({
    stock_account_id: 0,
    consumption_account_id: 0,
    entry_account_id: 0,
    cogs_account_id: 0,
    sub_account_code: '',
    valuation_method: 'weighted_average',
    change_reason: ''
  });

  // Load ingredients and accounts on mount
  useEffect(() => {
    loadIngredients();
    loadAccounts();
  }, []);

  const loadIngredients = async () => {
    try {
      const response = await httpClient.get('/api/stocks/ingredients');
      console.log('ProductMapping Ingredients response:', response.data);
      
      // Suport pentru multiple formate de răspuns
      let ingredientsList = [];
      if (response.data.success && response.data.data) {
        ingredientsList = response.data.data;
      } else if (Array.isArray(response.data)) {
        ingredientsList = response.data;
      } else if (response.data.ingredients) {
        ingredientsList = response.data.ingredients;
      }
      
      console.log('ProductMapping Loaded ingredients:', ingredientsList.length);
      setIngredients(ingredientsList);
    } catch (err) {
      console.error('Error loading ingredients:', err);
      setError('Eroare la încărcarea ingredientelor: ' + (err as any).message);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await httpClient.get('/api/accounting/settings/accounts');
      if (response.data.success) {
        setAccounts(response.data.data || []);
      } else {
        // Fallback: hardcoded accounts
        setAccounts([
          { id: 1, account_code: '301', account_name: 'Materii Prime', account_type: 'asset' },
          { id: 2, account_code: '401', account_name: 'Achiziții Materii Prime', account_type: 'expense' },
          { id: 3, account_code: '602', account_name: 'Consumuri Materii Prime', account_type: 'expense' },
          { id: 4, account_code: '607', account_name: 'Cheltuieli cu Mărfurile', account_type: 'expense' }
        ]);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      // Fallback
      setAccounts([
        { id: 1, account_code: '301', account_name: 'Materii Prime', account_type: 'asset' },
        { id: 2, account_code: '401', account_name: 'Achiziții Materii Prime', account_type: 'expense' },
        { id: 3, account_code: '602', account_name: 'Consumuri Materii Prime', account_type: 'expense' },
        { id: 4, account_code: '607', account_name: 'Cheltuieli cu Mărfurile', account_type: 'expense' }
      ]);
    }
  };

  const handleIngredientChange = useCallback(async (ingredientId: number) => {
    setSelectedIngredientId(ingredientId);
    setError(null);
    setSuccess(null);
    
    const ingredient = ingredients.find(i => i.id === ingredientId);
    setSelectedIngredient(ingredient || null);
    
    // Load mapping
    try {
      const response = await httpClient.get(`/api/accounting/product-mapping/${ingredientId}`);
      if (response.data.success && response.data.data) {
        const existingMapping = response.data.data;
        setMapping(existingMapping);
        setFormData({
          stock_account_id: existingMapping.stock_account_id,
          consumption_account_id: existingMapping.consumption_account_id,
          entry_account_id: existingMapping.entry_account_id || 0,
          cogs_account_id: existingMapping.cogs_account_id || 0,
          sub_account_code: existingMapping.sub_account_code || '',
          valuation_method: existingMapping.valuation_method || 'weighted_average',
          change_reason: ''
        });
      } else {
        // No mapping exists, reset form
        setMapping(null);
        setFormData({
          stock_account_id: 0,
          consumption_account_id: 0,
          entry_account_id: 0,
          cogs_account_id: 0,
          sub_account_code: '',
          valuation_method: 'weighted_average',
          change_reason: ''
        });
      }
      
      // Load history
      const historyResponse = await httpClient.get(`/api/accounting/product-mapping/history/${ingredientId}`);
      if (historyResponse.data.success) {
        setHistory(historyResponse.data.data || []);
      }
    } catch (err: any) {
      console.error('Error loading mapping:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea mapării');
    }
  }, [ingredients]);

  const handleSave = async () => {
    if (!selectedIngredientId) {
      setError('Selectează un produs');
      return;
    }
    
    if (!formData.stock_account_id || !formData.consumption_account_id) {
      setError('Contul de stoc și contul de consum sunt obligatorii');
      return;
    }
    
    if (formData.change_reason && formData.change_reason.length < 10) {
      setError('Motivul modificării trebuie să aibă minim 10 caractere');
      return;
    }
    
    // Validate sub-account code format (XXX.XX)
    if (formData.sub_account_code && !/^\d{3}\.\d{2}$/.test(formData.sub_account_code)) {
      setError('Cod sub-cont trebuie să fie în format XXX.XX (ex: 301.01)');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await httpClient.post('/api/accounting/product-mapping/update', {
        ingredient_id: selectedIngredientId,
        stock_account_id: formData.stock_account_id,
        consumption_account_id: formData.consumption_account_id,
        entry_account_id: formData.entry_account_id || undefined,
        cogs_account_id: formData.cogs_account_id || undefined,
        sub_account_code: formData.sub_account_code || undefined,
        valuation_method: formData.valuation_method || 'weighted_average',
        change_reason: formData.change_reason || 'Modificare mapare contabilă',
        modified_by: 1 // TODO: Get from auth context
      });
      
      if (response.data.success) {
        setSuccess('Maparea a fost salvată cu succes!');
        // Reload mapping and history
        await handleIngredientChange(selectedIngredientId);
      } else {
        setError(response.data.error || 'Eroare la salvarea mapării');
      }
    } catch (err: any) {
      console.error('Error saving mapping:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la salvarea mapării');
    } finally {
      setLoading(false);
    }
  };

  const stockValue = selectedIngredient && selectedIngredient.current_stock && selectedIngredient.avg_price
    ? selectedIngredient.current_stock * selectedIngredient.avg_price
    : 0;

  return (
    <div className="product-accounting-mapping-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>🔗 Mapare Produse → Conturi Contabile</h1>
          <p>"configurare mapare ingrediente la conturi contabil"</p>
        </div>
        <HelpButton
          title="Ajutor - Mapare Produse → Conturi"
          content={
            <div>
              <h5>🔗 Ce este maparea produse → conturi?</h5>
              <p>
                Maparea produselor la conturi contabile permite asocierea fiecărui ingredient/produs 
                cu conturile contabile corespunzătoare pentru raportare financiară automată.
              </p>
              <h5 className="mt-4">📋 Tipuri de conturi pentru mapare</h5>
              <ul>
                <li><strong>Cont Stoc</strong> - Contul pentru stocuri (ex: 301 - Mărfuri)</li>
                <li><strong>Cont Consum</strong> - Contul pentru consum (ex: 607 - Cheltuieli cu mărfurile)</li>
                <li><strong>Cont Intrare</strong> - Contul pentru intrări în stoc (opțional)</li>
                <li><strong>Cont COGS</strong> - Cost of Goods Sold (Costul mărfurilor vândute)</li>
              </ul>
              <h5 className="mt-4">🔧 Metode de evaluare</h5>
              <ul>
                <li><strong>FIFO</strong> - First In, First Out (Primul intrat, primul ieșit)</li>
                <li><strong>LIFO</strong> - Last In, First Out (Ultimul intrat, primul ieșit)</li>
                <li><strong>Weighted Average</strong> - Cost mediu ponderat</li>
              </ul>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> Asigură-te că ai creat conturile contabile în pagina 
                "Conturi Contabile" înainte de a face maparea.
              </div>
            </div>
          }
        />
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label><strong>Selectează Produs/Ingredient</strong></Form.Label>
            <Form.Select
              value={selectedIngredientId || ''}
              onChange={(e) => {
                const id = e.target.value ? parseInt(e.target.value) : null;
                if (id) handleIngredientChange(id);
              }}
              style={{ color: '#000', backgroundColor: '#fff' }}
            >
              <option value="" style={{ color: '#000', backgroundColor: '#fff' }}>
                -- Selectează ingredient --
              </option>
              {ingredients.map((ing) => (
                <option 
                  key={ing.id} 
                  value={ing.id}
                  style={{ color: '#000', backgroundColor: '#fff' }}
                >
                  {ing.name} {ing.category ? `(${ing.category})` : ''}
                </option>
              ))}
            </Form.Select>
            {ingredients.length === 0 && (
              <Form.Text className="text-muted">"se incarca ingredientele"</Form.Text>
            )}
            {ingredients.length > 0 && (
              <Form.Text className="text-muted">
                {ingredients.length} ingrediente disponibile
              </Form.Text>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {selectedIngredient && (
        <>
          <Card className="mb-4">
            <Card.Header>
              <h5>"informatii produs"</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <strong>"Nume:"</strong> {selectedIngredient.name}
                </Col>
                <Col md={2}>
                  <strong>UM:</strong> {selectedIngredient.unit}
                </Col>
                <Col md={2}>
                  <strong>Categorie:</strong> {selectedIngredient.category || '-'}
                </Col>
                <Col md={2}>
                  <strong>Stoc Curent:</strong> {selectedIngredient.current_stock?.toFixed(3) || '0.000'}
                </Col>
                <Col md={3}>
                  <strong>Valoare Stoc:</strong> {stockValue.toFixed(2)} RON
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5>Mapare Conturi Contabile</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Cont Stoc *</strong></Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.stock_account_id || 0}
                      onChange={(e) => setFormData({ ...formData, stock_account_id: parseInt(e.target.value) })}
                      required
                    >
                      <option value="0">-- Selectează cont --</option>
                      {accounts.filter(a => a.account_type === 'asset').map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Cont Consum *</strong></Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.consumption_account_id || 0}
                      onChange={(e) => setFormData({ ...formData, consumption_account_id: parseInt(e.target.value) })}
                      required
                    >
                      <option value="0">-- Selectează cont --</option>
                      {accounts.filter(a => a.account_type === 'expense').map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>"cont intrari"</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.entry_account_id || 0}
                      onChange={(e) => setFormData({ ...formData, entry_account_id: parseInt(e.target.value) || undefined })}
                    >
                      <option value="0">-- Selectează cont (opțional) --</option>
                      {accounts.filter(a => a.account_type === 'expense').map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cont COGS</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.cogs_account_id || 0}
                      onChange={(e) => setFormData({ ...formData, cogs_account_id: parseInt(e.target.value) || undefined })}
                    >
                      <option value="0">-- Selectează cont (opțional) --</option>
                      {accounts.filter(a => a.account_type === 'expense').map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cod Sub-Cont (format: XXX.XX)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.sub_account_code || ''}
                      onChange={(e) => setFormData({ ...formData, sub_account_code: e.target.value })}
                      placeholder="Ex: 301.01"
                      pattern="\d{3}\.\d{2}"
                    />
                    <Form.Text className="text-muted">
                      Format: 3 cifre, punct, 2 cifre (ex: 301.01)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>"metoda evaluare"</strong></Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        id="val-fifo"
                        name="valuation_method"
                        label="FIFO (First In, First Out)"
                        value="fifo"
                        checked={formData.valuation_method === 'fifo'}
                        onChange={(e) => setFormData({ ...formData, valuation_method: e.target.value as any })}
                      />
                      <Form.Check
                        type="radio"
                        id="val-lifo"
                        name="valuation_method"
                        label="LIFO (Last In, First Out)"
                        value="lifo"
                        checked={formData.valuation_method === 'lifo'}
                        onChange={(e) => setFormData({ ...formData, valuation_method: e.target.value as any })}
                      />
                      <Form.Check
                        type="radio"
                        id="val-weighted"
                        name="valuation_method"
                        label="Weighted Average (Medie Ponderată)"
                        value="weighted_average"
                        checked={formData.valuation_method === 'weighted_average'}
                        onChange={(e) => setFormData({ ...formData, valuation_method: e.target.value as any })}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Motiv Modificare</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.change_reason || ''}
                  onChange={(e) => setFormData({ ...formData, change_reason: e.target.value })}
                  placeholder="Descrie motivul modificării mapării (minim 10 caractere)"
                />
                <Form.Text className="text-muted">
                  {formData.change_reason?.length || 0} / 10 caractere minim
                </Form.Text>
              </Form.Group>

              <Button
                variant="primary"
                onClick={handleSave}
                disabled={loading || !formData.stock_account_id || !formData.consumption_account_id}
                className="w-100"
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin me-2"></i>"se salveaza"</>
                ) : (
                  <><i className="fas fa-save me-2"></i>"salveaza modificari"</>
                )}
              </Button>
            </Card.Body>
          </Card>

          {history.length > 0 && (
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5>"istoric modificari"</h5>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? (
                      <><i className="fas fa-eye-slash me-2"></i>"Ascunde"</>
                    ) : (
                      <><i className="fas fa-eye me-2"></i>Vezi Istoric</>
                    )}
                  </Button>
                </div>
              </Card.Header>
              {showHistory && (
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Cont Vechi</th>
                        <th>Cont Nou</th>
                        <th>Motiv</th>
                        <th>Modificat De</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td>{new Date(h.changed_at).toLocaleString('ro-RO')}</td>
                          <td>{h.old_account_code || '-'}</td>
                          <td><strong>{h.new_account_code}</strong></td>
                          <td>{h.change_reason}</td>
                          <td>User #{h.changed_by || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};




