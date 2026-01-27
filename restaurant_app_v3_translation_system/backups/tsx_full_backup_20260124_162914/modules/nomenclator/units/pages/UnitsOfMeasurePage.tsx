// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert, Badge, Row, Col, Table } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './UnitsOfMeasurePage.css';

interface UnitOfMeasure {
  id?: number;
  name: string;
  symbol: string;
  category: "Masă:" | 'volum' | 'lungime' | "Bucăți" | 'altul';
  base_unit?: number | null;
  conversion_factor: number;
  is_active: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

const CATEGORIES = [
  { value: "Masă:", label: 'Masă', icon: '⚖️' },
  { value: 'volum', label: 'Volum', icon: '💧' },
  { value: 'lungime', label: 'Lungime', icon: '📏' },
  { value: "Bucăți", label: 'Bucăți', icon: '🔢' },
  { value: 'altul', label: 'Altul', icon: '📦' },
];

export const UnitsOfMeasurePage: React.FC = () => {
//   const { t } = useTranslation();
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [baseUnits, setBaseUnits] = useState<UnitOfMeasure[]>([]);

  const [formData, setFormData] = useState<Partial<UnitOfMeasure>>({
    name: '',
    symbol: '',
    category: "Masă:",
    base_unit: null,
    conversion_factor: 1.0,
    is_active: 1,
    sort_order: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/units-of-measure');
      const data = response.data?.data || response.data || [];
      setUnits(data);
      
      // Pentru dropdown-ul de unitate de bază, folosim doar unitățile active
      const activeUnits = data.filter((u: UnitOfMeasure) => u.is_active === 1);
      setBaseUnits(activeUnits);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea unităților:', err);
      setError(err.message || 'Eroare la încărcarea unităților');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleOpenModal = (unit?: UnitOfMeasure) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData(unit);
    } else {
      setEditingUnit(null);
      setFormData({
        name: '',
        symbol: '',
        category: "Masă:",
        base_unit: null,
        conversion_factor: 1.0,
        is_active: 1,
        sort_order: 0,
      });
    }
    setShowModal(true);
    setFeedback(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnit(null);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.symbol || !formData.category) {
      setFeedback({ type: 'error', message: 'Nume, simbol și categorie sunt obligatorii!' });
      return;
    }

    try {
      if (editingUnit?.id) {
        await httpClient.put(`/api/units-of-measure/${editingUnit.id}`, formData);
        setFeedback({ type: 'success', message: 'Unitate actualizată cu succes!' });
      } else {
        await httpClient.post('/api/units-of-measure', formData);
        setFeedback({ type: 'success', message: 'Unitate creată cu succes!' });
      }
      setTimeout(() => {
        handleCloseModal();
        void fetchData();
      }, 1000);
    } catch (err: any) {
      console.error('❌ Eroare la salvare:', err);
      setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (err.response?.data?.error || err.message || 'Eroare necunoscută') });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această unitate de măsură?')) return;

    try {
      await httpClient.delete(`/api/units-of-measure/"Id"`);
      setFeedback({ type: 'success', message: 'Unitate ștearsă cu succes!' });
      void fetchData();
    } catch (err: any) {
      console.error('❌ Eroare la ștergere:', err);
      setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (err.response?.data?.error || err.message || 'Eroare necunoscută') });
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '📦';
  };

  const filteredUnits = filterCategory
    ? units.filter(u => u.category === filterCategory)
    : units;

  const groupedUnits = filteredUnits.reduce((acc, unit) => {
    if (!acc[unit.category]) {
      acc[unit.category] = [];
    }
    acc[unit.category].push(unit);
    return acc;
  }, {} as Record<string, UnitOfMeasure[]>);

  return (
    <div className="units-of-measure-page">
      <PageHeader
        title='📏 unitati de masura'
        description="Gestionare unități de măsură și conversii între ele"
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

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-ruler me-2"></i>"lista unitati de masura"</h5>
          <div className="d-flex gap-2">
            <Form.Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: '200px' }}
              size="sm"
            >
              <option value="">"toate categoriile"</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </Form.Select>
            <Button variant="light" size="sm" onClick={() => handleOpenModal()}>
              <i className="fas fa-plus me-1"></i>"adauga unitate"</Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">"se incarca"</span>
              </div>
            </div>
          ) : error ? (
            <Alert variant="danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          ) : filteredUnits.length === 0 ? (
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>"nu exista unitati de masura adauga prima unitate"</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Simbol</th>
                    <th>Categorie</th>
                    <th>"unitate de baza"</th>
                    <th>Factor Conversie</th>
                    <th>Ordine</th>
                    <th>Status</th>
                    <th>"Acțiuni"</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits
                    .sort((a, b) => {
                      if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                      }
                      return (a.sort_order || 0) - (b.sort_order || 0);
                    })
                    .map((unit) => {
                      const baseUnit = unit.base_unit
                        ? units.find(u => u.id === unit.base_unit)
                        : null;
                      
                      return (
                        <tr key={unit.id}>
                          <td><strong>{unit.name}</strong></td>
                          <td><code>{unit.symbol}</code></td>
                          <td>
                            <Badge bg="secondary">
                              {getCategoryIcon(unit.category)} {getCategoryLabel(unit.category)}
                            </Badge>
                          </td>
                          <td>
                            {baseUnit ? (
                              <span>{baseUnit.name} ({baseUnit.symbol})</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{unit.conversion_factor}</td>
                          <td>{unit.sort_order || 0}</td>
                          <td>
                            {unit.is_active === 1 ? (
                              <Badge bg="success">Activ</Badge>
                            ) : (
                              <Badge bg="secondary">Inactiv</Badge>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleOpenModal(unit)}
                                title="Editează"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => unit.id && handleDelete(unit.id)}
                                title="Șterge"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal pentru Creare/Editare */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUnit ? 'Editează Unitate de Măsură' : 'Adaugă Unitate de Măsură'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {feedback && (
              <Alert variant={feedback.type === 'success' ? 'success' : 'danger'}>
                {feedback.message}
              </Alert>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Nume <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Kilogram"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Simbol <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.symbol || ''}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="Ex: kg"
                    required
                    maxLength={10}
                  />
                  <Form.Text className="text-muted">"simbolul trebuie sa fie unic"</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Categorie <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.category || "Masă:"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>"unitate de baza"</Form.Label>
                  <Form.Select
                    value={formData.base_unit || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      base_unit: e.target.value ? parseInt(e.target.value) : null
                    })}
                  >
                    <option value="">"fara unitate de baza"</option>
                    {baseUnits
                      .filter(u => !editingUnit || u.id !== editingUnit.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Text className="text-muted">"unitatea fata de care se face conversia"</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Factor Conversie</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.0001"
                    value={formData.conversion_factor || 1.0}
                    onChange={(e) => setFormData({
                      ...formData,
                      conversion_factor: parseFloat(e.target.value) || 1.0
                    })}
                    placeholder="1.0"
                  />
                  <Form.Text className="text-muted">
                    Factorul de conversie față de unitatea de bază (ex: 1000 pentru g → kg)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ordine Sortare</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0
                    })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="unitate activa"
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({
                  ...formData,
                  is_active: e.target.checked ? 1 : 0
                })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>"Anulează"</Button>
            <Button variant="primary" type="submit">
              {editingUnit ? 'Salvează Modificările' : 'Creează Unitate'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};




