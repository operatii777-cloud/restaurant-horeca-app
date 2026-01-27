// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './CoatroomPage.css';

interface CoatroomTicket {
  id: number;
  code: string;
  type: string;
  customer_name?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
  closed_at?: string;
  status: string;
  created_by?: number;
  closed_by?: number;
}

interface CoatroomStats {
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  lost_tickets: number;
  today_tickets: number;
}

const ITEM_TYPES = [
  { value: 'haină', label: '🧥 Haină' },
  { value: 'geantă', label: '👜 Geantă' },
  { value: 'umbrelă', label: '☂️ Umbrelă' },
  { value: 'rucsac', label: '🎒 Rucsac' },
  { value: 'valiză', label: '🧳 Valiză' },
  { value: 'altele', label: '📦 Altele' },
];

export const CoatroomPage = () => {
//   const { t } = useTranslation();
  const [tickets, setTickets] = useState<CoatroomTicket[]>([]);
  const [stats, setStats] = useState<CoatroomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<CoatroomTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [checkinForm, setCheckinForm] = useState({
    type: 'haină',
    customer_name: '',
    notes: ''
  });

  const [checkoutCode, setCheckoutCode] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        httpClient.get('/api/coatroom/tickets', { params: { status: statusFilter } }),
        httpClient.get('/api/coatroom/stats')
      ]);

      setTickets(ticketsRes.data?.data || []);
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

  const handleCheckin = async () => {
    if (!checkinForm.type) {
      setFeedback({ type: 'error', message: 'Tipul obiectului este obligatoriu!' });
      return;
    }

    try {
      const response = await httpClient.post('/api/coatroom/checkin', checkinForm);
      setFeedback({ type: 'success', message: `Tichet creat: ${response.data.data.code}` });
      setShowCheckinModal(false);
      setCheckinForm({ type: 'haină', customer_name: '', notes: '' });
      loadData();
    } catch (error: any) {
      console.error('Error check-in:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la check-in' });
    }
  };

  const handleCheckout = async () => {
    if (!checkoutCode) {
      setFeedback({ type: 'error', message: 'Codul tichetului este obligatoriu!' });
      return;
    }

    try {
      await httpClient.post('/api/coatroom/checkout', { code: checkoutCode });
      setFeedback({ type: 'success', message: 'Check-out realizat cu succes!' });
      setShowCheckoutModal(false);
      setCheckoutCode('');
      loadData();
    } catch (error: any) {
      console.error('Error check-out:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la check-out' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge bg="success">Activ</Badge>;
      case 'CLOSED': return <Badge bg="secondary">"Închis"</Badge>;
      case 'LOST': return <Badge bg="danger">Pierdut</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="coatroom-page">
      <PageHeader
        title='🧥 garderoba & valet'
        description="Gestionare tichete garderobă și valet parking"
        actions={[
          {
            label: 'Check-in Nou',
            variant: 'primary',
            onClick: () => setShowCheckinModal(true)
          },
          {
            label: 'Check-out',
            variant: 'warning',
            onClick: () => setShowCheckoutModal(true)
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
                <h3 className="mb-0">{stats.today_tickets}</h3>
                <p className="text-muted mb-0">"Astăzi"</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-success">
              <Card.Body>
                <h3 className="mb-0 text-success">{stats.open_tickets}</h3>
                <p className="text-muted mb-0">Active</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-secondary">
              <Card.Body>
                <h3 className="mb-0">{stats.closed_tickets}</h3>
                <p className="text-muted mb-0">"Închise"</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-danger">
              <Card.Body>
                <h3 className="mb-0 text-danger">{stats.lost_tickets}</h3>
                <p className="text-muted mb-0">Pierdute</p>
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
            <option value="OPEN">Active</option>
            <option value="CLOSED">"Închise"</option>
            <option value="LOST">Pierdute</option>
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Tickets Table */}
      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">"tichete garderoba"</h5>
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
                  <th>Client</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>"Observații"</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">"nu exista tichete"</td>
                  </tr>
                ) : (
                  tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td><code className="ticket-code">{ticket.code}</code></td>
                      <td>{ticket.type}</td>
                      <td>{ticket.customer_name || '—'}</td>
                      <td>{new Date(ticket.created_at).toLocaleString('ro-RO')}</td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>{ticket.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Check-in Modal */}
      <Modal show={showCheckinModal} onHide={() => setShowCheckinModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-plus me-2"></i>Check-in Tichet Nou</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tip Obiect *</Form.Label>
              <Form.Select
                value={checkinForm.type}
                onChange={(e) => setCheckinForm({ ...checkinForm, type: e.target.value })}
              >
                {ITEM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nume Client (opțional)</Form.Label>
              <Form.Control
                type="text"
                value={checkinForm.customer_name}
                onChange={(e) => setCheckinForm({ ...checkinForm, customer_name: e.target.value })}
                placeholder="ex popescu ion"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>"Observații"</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={checkinForm.notes}
                onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                placeholder="ex haina neagra marime l"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckinModal(false)}>"Anulează"</Button>
          <Button variant="success" onClick={handleCheckin}>
            <i className="fas fa-check me-2"></i>"creeaza tichet"</Button>
        </Modal.Footer>
      </Modal>

      {/* Check-out Modal */}
      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-sign-out-alt me-2"></i>Check-out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cod Tichet *</Form.Label>
              <Form.Control
                type="text"
                value={checkoutCode}
                onChange={(e) => setCheckoutCode(e.target.value.toUpperCase())}
                placeholder="Ex: C-20251203-0001"
                autoFocus
              />
              <Form.Text className="text-muted">"introdu codul de pe tichet"</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>"Anulează"</Button>
          <Button variant="warning" onClick={handleCheckout}>
            <i className="fas fa-check me-2"></i>Check-out
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};




