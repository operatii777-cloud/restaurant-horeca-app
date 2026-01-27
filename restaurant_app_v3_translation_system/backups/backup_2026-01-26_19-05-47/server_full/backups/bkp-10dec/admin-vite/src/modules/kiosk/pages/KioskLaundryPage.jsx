import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Form, Table, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { 
  Shirt, Plus, Search, RefreshCw, CheckCircle, 
  AlertCircle, XCircle, Clock, MapPin, User
} from 'lucide-react';
import './KioskLaundryPage.css';

/**
 * KioskLaundryPage - Gestiune Textile
 * Gestionare lenjerie, prosopuri, uniforme
 * Features:
 * - Check-in/Check-out textile
 * - Status tracking (READY, IN_USE, AT_LAUNDRY, DAMAGED, RETIRED)
 * - Asignare la mese sau angajați
 * - Istoric spălări
 * - Statistici
 */

const TEXTILE_TYPES = [
  { value: 'cearșaf', label: '🛏️ Cearșaf' },
  { value: 'față_masă', label: '🍽️ Față de Masă' },
  { value: 'șervețel', label: '🧻 Șervețel' },
  { value: 'prosop', label: '🧼 Prosop' },
  { value: 'uniformă', label: '👔 Uniformă' },
  { value: 'altele', label: '📦 Altele' },
];

const TEXTILE_CATEGORIES = [
  { value: 'lenjerie_masă', label: 'Lenjerie Masă' },
  { value: 'prosopuri', label: 'Prosopuri' },
  { value: 'uniforme', label: 'Uniforme' },
  { value: 'altele', label: 'Altele' },
];

const STATUS_OPTIONS = [
  { value: 'READY', label: 'Gata', color: 'success' },
  { value: 'IN_USE', label: 'În Folosință', color: 'primary' },
  { value: 'AT_LAUNDRY', label: 'La Spălătorie', color: 'warning' },
  { value: 'DAMAGED', label: 'Deteriorat', color: 'danger' },
  { value: 'RETIRED', label: 'Retras', color: 'secondary' },
];

const CONDITION_OPTIONS = [
  { value: 'GOOD', label: 'Bună', color: 'success' },
  { value: 'FAIR', label: 'Acceptabilă', color: 'warning' },
  { value: 'POOR', label: 'Slabă', color: 'warning' },
  { value: 'DAMAGED', label: 'Deteriorată', color: 'danger' },
];

export const KioskLaundryPage = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWashModal, setShowWashModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [addForm, setAddForm] = useState({
    type: 'cearșaf',
    category: 'lenjerie_masă',
    description: '',
    location: '',
    quantity: 1,
    notes: ''
  });

  const [washForm, setWashForm] = useState({
    condition_after: 'GOOD',
    notes: ''
  });

  const [assignForm, setAssignForm] = useState({
    assigned_to_table: '',
    assigned_to_employee: '',
    location: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const [itemsRes, statsRes] = await Promise.all([
        httpClient.get(`/api/laundry/items?${params.toString()}`),
        httpClient.get('/api/laundry/stats')
      ]);

      setItems(itemsRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (error) {
      console.error('Error loading laundry data:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea datelor' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!addForm.type || !addForm.category) {
      setFeedback({ type: 'error', message: 'Tip și categorie sunt obligatorii!' });
      return;
    }

    try {
      await httpClient.post('/api/laundry/items', addForm);
      setFeedback({ type: 'success', message: 'Textil adăugat cu succes!' });
      setShowAddModal(false);
      setAddForm({
        type: 'cearșaf',
        category: 'lenjerie_masă',
        description: '',
        location: '',
        quantity: 1,
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error adding item:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la adăugare' });
    }
  };

  const handleWash = async () => {
    if (!selectedItem) return;

    try {
      await httpClient.post(`/api/laundry/items/${selectedItem.id}/wash`, washForm);
      setFeedback({ type: 'success', message: 'Textil marcat ca spălat!' });
      setShowWashModal(false);
      setSelectedItem(null);
      setWashForm({ condition_after: 'GOOD', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error marking as washed:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare' });
    }
  };

  const handleAssign = async () => {
    if (!selectedItem) return;

    try {
      await httpClient.post(`/api/laundry/items/${selectedItem.id}/assign`, assignForm);
      setFeedback({ type: 'success', message: 'Textil asignat cu succes!' });
      setShowAssignModal(false);
      setSelectedItem(null);
      setAssignForm({ assigned_to_table: '', assigned_to_employee: '', location: '' });
      loadData();
    } catch (error) {
      console.error('Error assigning item:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare' });
    }
  };

  const handleUnassign = async (id) => {
    if (!confirm('Dezasignezi acest textil?')) return;

    try {
      await httpClient.post(`/api/laundry/items/${id}/unassign`);
      setFeedback({ type: 'success', message: 'Textil dezasignat!' });
      loadData();
    } catch (error) {
      console.error('Error unassigning item:', error);
      setFeedback({ type: 'error', message: 'Eroare la dezasignare' });
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return <Badge bg={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getConditionBadge = (condition) => {
    const conditionInfo = CONDITION_OPTIONS.find(c => c.value === condition) || CONDITION_OPTIONS[0];
    return <Badge bg={conditionInfo.color}>{conditionInfo.label}</Badge>;
  };

  const filteredItems = items.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.code?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="kiosk-laundry-page">
      <div className="page-header">
        <h1><Shirt size={24} className="me-2" />Gestiune Textile</h1>
        <div className="header-actions">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} className="me-1" />Adaugă Textil
          </Button>
          <Button variant="outline-secondary" onClick={loadData} disabled={loading}>
            <RefreshCw size={18} className="me-1" />Reîmprospătează
          </Button>
        </div>
      </div>

      {feedback && (
        <Alert 
          variant={feedback.type === 'error' ? 'danger' : 'success'} 
          dismissible 
          onClose={() => setFeedback(null)}
          className="mt-3"
        >
          {feedback.message}
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className="mb-0">{stats.total_items || 0}</h3>
                <p className="text-muted mb-0">Total Textile</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-success">
              <Card.Body>
                <h3 className="mb-0 text-success">{stats.ready_items || 0}</h3>
                <p className="text-muted mb-0">Gata</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-primary">
              <Card.Body>
                <h3 className="mb-0 text-primary">{stats.in_use_items || 0}</h3>
                <p className="text-muted mb-0">În Folosință</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-warning">
              <Card.Body>
                <h3 className="mb-0 text-warning">{stats.at_laundry_items || 0}</h3>
                <p className="text-muted mb-0">La Spălătorie</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mt-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Toate</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Tip</Form.Label>
              <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">Toate</option>
                {TEXTILE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Căutare</Form.Label>
              <InputGroup>
                <InputGroup.Text><Search size={16} /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Caută după cod, descriere, locație..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Items Table */}
      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Textile</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Cod</th>
                  <th>Tip</th>
                  <th>Descriere</th>
                  <th>Locație</th>
                  <th>Status</th>
                  <th>Condiție</th>
                  <th>Cantitate</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      Nu există textile
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id}>
                      <td><code className="textile-code">{item.code}</code></td>
                      <td>{TEXTILE_TYPES.find(t => t.value === item.type)?.label || item.type}</td>
                      <td>{item.description || '—'}</td>
                      <td>{item.location || '—'}</td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td>{getConditionBadge(item.condition)}</td>
                      <td>{item.quantity || 1}</td>
                      <td>
                        <div className="d-flex gap-1">
                          {item.status === 'READY' && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowAssignModal(true);
                              }}
                              title="Asignează"
                            >
                              <User size={14} />
                            </Button>
                          )}
                          {item.status === 'IN_USE' && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleUnassign(item.id)}
                              title="Dezasignează"
                            >
                              <XCircle size={14} />
                            </Button>
                          )}
                          {item.status !== 'AT_LAUNDRY' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowWashModal(true);
                              }}
                              title="Marchează ca spălat"
                            >
                              <CheckCircle size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><Plus size={18} className="me-2" />Adaugă Textil Nou</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tip *</Form.Label>
              <Form.Select
                value={addForm.type}
                onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
              >
                {TEXTILE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categorie *</Form.Label>
              <Form.Select
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
              >
                {TEXTILE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descriere</Form.Label>
              <Form.Control
                type="text"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                placeholder="Ex: Cearșaf alb, mărime standard"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Locație</Form.Label>
              <Form.Control
                type="text"
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                placeholder="Ex: Depozit, Bucătărie, Bar"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cantitate</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) || 1 })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observații</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                placeholder="Note suplimentare..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Anulează
          </Button>
          <Button variant="success" onClick={handleAdd}>
            <CheckCircle size={18} className="me-1" />Adaugă
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Wash Modal */}
      <Modal show={showWashModal} onHide={() => setShowWashModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><CheckCircle size={18} className="me-2" />Marchează ca Spălat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <p><strong>Textil:</strong> {selectedItem.code} - {selectedItem.description || selectedItem.type}</p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Condiție După Spălare *</Form.Label>
                  <Form.Select
                    value={washForm.condition_after}
                    onChange={(e) => setWashForm({ ...washForm, condition_after: e.target.value })}
                  >
                    {CONDITION_OPTIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Observații</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={washForm.notes}
                    onChange={(e) => setWashForm({ ...washForm, notes: e.target.value })}
                    placeholder="Note despre spălare..."
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWashModal(false)}>
            Anulează
          </Button>
          <Button variant="success" onClick={handleWash}>
            <CheckCircle size={18} className="me-1" />Marchează Spălat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><User size={18} className="me-2" />Asignează Textil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <p><strong>Textil:</strong> {selectedItem.code} - {selectedItem.description || selectedItem.type}</p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Asignează la Masă</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={assignForm.assigned_to_table}
                    onChange={(e) => setAssignForm({ ...assignForm, assigned_to_table: e.target.value, assigned_to_employee: '' })}
                    placeholder="Ex: 5"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>SAU Asignează la Angajat</Form.Label>
                  <Form.Control
                    type="text"
                    value={assignForm.assigned_to_employee}
                    onChange={(e) => setAssignForm({ ...assignForm, assigned_to_employee: e.target.value, assigned_to_table: '' })}
                    placeholder="Ex: Ion Popescu"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Locație</Form.Label>
                  <Form.Control
                    type="text"
                    value={assignForm.location}
                    onChange={(e) => setAssignForm({ ...assignForm, location: e.target.value })}
                    placeholder="Ex: Masa 5, Bucătărie, Bar"
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Anulează
          </Button>
          <Button variant="primary" onClick={handleAssign}>
            <CheckCircle size={18} className="me-1" />Asignează
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

