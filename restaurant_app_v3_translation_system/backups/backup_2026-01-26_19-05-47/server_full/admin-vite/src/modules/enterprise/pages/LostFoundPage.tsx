// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataGrid } from '@/shared/components/DataGrid';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './LostFoundPage.css';

interface LostFoundItem {
  id: number;
  description: string;
  location_found?: string;
  found_at: string;
  found_by?: number;
  status: string;
  returned_at?: string;
  returned_to?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

interface LostFoundStats {
  total_items: number;
  stored_items: number;
  returned_items: number;
  discarded_items: number;
  today_items: number;
}

const LOCATIONS = [
  'Sală Principală',
  'Terasă',
  'Bar',
  'Toaletă',
  'Parcare',
  'Intrare',
  'Altele'
];

export const LostFoundPage = () => {
//   const { t } = useTranslation();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [stats, setStats] = useState<LostFoundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('STORED');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [addForm, setAddForm] = useState({
    description: '',
    location_found: '',
    found_at: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  const [returnTo, setReturnTo] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        httpClient.get('/api/lostfound/items', { params: { status: statusFilter } }),
        httpClient.get('/api/lostfound/stats')
      ]);

      setItems(itemsRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea datelor' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!addForm.description) {
      setFeedback({ type: 'error', message: 'Descrierea este obligatorie!' });
      return;
    }

    try {
      await httpClient.post('/api/lostfound/items', addForm);
      setFeedback({ type: 'success', message: 'Obiect adăugat cu succes!' });
      setShowAddModal(false);
      setAddForm({ description: '', location_found: '', found_at: new Date().toISOString().slice(0, 16), notes: '' });
      loadData();
    } catch (error: any) {
      console.error('Error adding item:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la adăugare' });
    }
  };

  const handleReturn = async () => {
    if (!selectedItem || !returnTo) {
      setFeedback({ type: 'error', message: 'Completează toate câmpurile!' });
      return;
    }

    try {
      await httpClient.post(`/api/lostfound/items/${selectedItem.id}/return`, { returned_to: returnTo });
      setFeedback({ type: 'success', message: 'Obiect returnat cu succes!' });
      setShowReturnModal(false);
      setReturnTo('');
      setSelectedItem(null);
      loadData();
    } catch (error: any) {
      console.error('Error returning item:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la returnare' });
    }
  };

  const handleDiscard = async (id: number) => {
    if (!confirm('Marchezi acest obiect ca fiind aruncat?')) return;

    try {
      await httpClient.post(`/api/lostfound/items/"Id"/discard`);
      setFeedback({ type: 'success', message: 'Obiect marcat ca aruncat!' });
      loadData();
    } catch (error: any) {
      console.error('Error discarding item:', error);
      setFeedback({ type: 'error', message: 'Eroare la ștergere' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'STORED': return <Badge bg="warning">"Depozitat"</Badge>;
      case 'RETURNED': return <Badge bg="success">Returnat</Badge>;
      case 'DISCARDED': return <Badge bg="secondary">Aruncat</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: "Description", headerName: 'Descriere', flex: 1 },
    { field: 'location_found', headerName: 'Locație', width: 150 },
    {
      field: 'found_at',
      headerName: 'Găsit La',
      width: 180,
      valueFormatter: (params: any) => new Date(params.value).toLocaleString('ro-RO')
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => getStatusBadge(params.value)
    },
    {
      field: 'actions',
      headerName: 'Acțiuni',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="d-flex gap-2">
          {params.data.status === 'STORED' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  setSelectedItem(params.data);
                  setShowReturnModal(true);
                }}
                title="Returnează"
              >
                <i className="fas fa-undo"></i>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDiscard(params.data.id)}
                title="Aruncă"
              >
                <i className="fas fa-trash"></i>
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="lostfound-page">
      <PageHeader
        title="🔍 Lost & Found"
        description="Gestionare obiecte găsite și pierdute"
        actions={[
          {
            label: 'Adaugă Obiect Găsit',
            variant: 'primary',
            onClick: () => setShowAddModal(true)
          },
          {
            label: 'Reîmprospătează',
            variant: 'secondary',
            onClick: loadData
          }
        ]}
      />

      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'danger' : 'success'} dismissible onClose={() => setFeedback(null)} className="mt-3">
          {feedback.message}
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className="mb-0">{stats.today_items}</h3>
                <p className="text-muted mb-0">"Astăzi"</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-warning">
              <Card.Body>
                <h3 className="mb-0 text-warning">{stats.stored_items}</h3>
                <p className="text-muted mb-0">"Depozitate"</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-success">
              <Card.Body>
                <h3 className="mb-0 text-success">{stats.returned_items}</h3>
                <p className="text-muted mb-0">Returnate</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className="mb-0">{stats.discarded_items}</h3>
                <p className="text-muted mb-0">Aruncate</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filter */}
      <Card className="mt-4">
        <Card.Body>
          <Form.Label>Status</Form.Label>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">"Toate"</option>
            <option value="STORED">"Depozitate"</option>
            <option value="RETURNED">Returnate</option>
            <option value="DISCARDED">Aruncate</option>
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Items Grid */}
      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">"obiecte gasite"</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <DataGrid columnDefs={columnDefs} rowData={items} height="60vh" />
          )}
        </Card.Body>
      </Card>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-plus me-2"></i>"obiect gasit nou"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Descriere Obiect *</Form.Label>
              <Form.Control
                type="text"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                placeholder="Ex: Portofel negru din piele"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>"locatie gasire"</Form.Label>
              <Form.Select
                value={addForm.location_found}
                onChange={(e) => setAddForm({ ...addForm, location_found: e.target.value })}
              >
                <option value="">"Selectează..."</option>
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data/Ora Găsirii</Form.Label>
              <Form.Control
                type="datetime-local"
                value={addForm.found_at}
                onChange={(e) => setAddForm({ ...addForm, found_at: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>"Observații"</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                placeholder="detalii suplimentare"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>"Anulează"</Button>
          <Button variant="primary" onClick={handleAdd}>
            <i className="fas fa-save me-2"></i>Salvează
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Return Item Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-undo me-2"></i>Returnare Obiect</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <Alert variant="info">
                <strong>Obiect:</strong> {selectedItem.description}
              </Alert>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Returnat Către *</Form.Label>
                  <Form.Control
                    type="text"
                    value={returnTo}
                    onChange={(e) => setReturnTo(e.target.value)}
                    placeholder="nume client"
                    autoFocus
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReturnModal(false)}>"Anulează"</Button>
          <Button variant="success" onClick={handleReturn}>
            <i className="fas fa-check me-2"></i>"confirma returnare"</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};




