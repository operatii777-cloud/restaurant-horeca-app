// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Row, Col, Modal, Form, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './HostessMapPage.css';

interface Table {
  id: number;
  table_number: string;
  capacity: number;
  location: string;
  is_active: number;
  status: string;
  session_id?: number;
  started_at?: string;
  covers?: number;
  server_id?: number;
  server_name?: string;
  session_notes?: string;
}

interface TableStats {
  total_tables: number;
  active_tables: number;
  occupied_tables: number;
  total_covers: number;
}

export const HostessMapPage = () => {
//   const { t } = useTranslation();
  const [tables, setTables] = useState<Table[]>([]);
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [sessionForm, setSessionForm] = useState({
    server_id: '',
    covers: '2',
    notes: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tablesRes, statsRes] = await Promise.all([
        httpClient.get('/api/hostess/tables', { params: { zone: zoneFilter, status: statusFilter } }),
        httpClient.get('/api/hostess/stats')
      ]);

      setTables(tablesRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea datelor' });
    } finally {
      setLoading(false);
    }
  }, [zoneFilter, statusFilter]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleStartSession = async () => {
    if (!selectedTable) return;

    try {
      await httpClient.post('/api/hostess/sessions/start', {
        table_id: selectedTable.id,
        server_id: sessionForm.server_id ? parseInt(sessionForm.server_id) : null,
        covers: parseInt(sessionForm.covers),
        notes: sessionForm.notes
      });

      setFeedback({ type: 'success', message: 'Sesiune deschisă cu succes!' });
      setShowSessionModal(false);
      setSessionForm({ server_id: '', covers: '2', notes: '' });
      loadData();
    } catch (error: any) {
      console.error('Error starting session:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la deschiderea sesiunii' });
    }
  };

  const handleCloseSession = async (sessionId: number) => {
    if (!confirm('Închizi sesiunea acestei mese?')) return;

    try {
      await httpClient.post(`/api/hostess/sessions/${sessionId}/close`);
      setFeedback({ type: 'success', message: 'Sesiune închisă!' });
      loadData();
    } catch (error: any) {
      console.error('Error closing session:', error);
      setFeedback({ type: 'error', message: 'Eroare la închiderea sesiunii' });
    }
  };

  const getStatusBadge = (table: Table) => {
    if (table.session_id) {
      return <Badge bg="danger">OCUPATĂ</Badge>;
    }
    return <Badge bg="success">LIBERĂ</Badge>;
  };

  const zones = Array.from(new Set(tables.map(t => t.location).filter(Boolean)));

  return (
    <div className="hostess-map-page">
      <PageHeader
        title="🗺️ Hostess Map"
        description="Hartă mese și gestionare sesiuni pentru hostess/recepție"
        actions={[
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
                <h3 className="mb-0">{stats.total_tables}</h3>
                <p className="text-muted mb-0">Total Mese</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-success">
              <Card.Body>
                <h3 className="mb-0 text-success">{stats.total_tables - stats.occupied_tables}</h3>
                <p className="text-muted mb-0">Mese Libere</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-danger">
              <Card.Body>
                <h3 className="mb-0 text-danger">{stats.occupied_tables}</h3>
                <p className="text-muted mb-0">"mese ocupate"</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-info">
              <Card.Body>
                <h3 className="mb-0 text-info">{stats.total_covers}</h3>
                <p className="text-muted mb-0">"total clienti"</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mt-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Label>"Zonă"</Form.Label>
              <Form.Select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}>
                <option value="">"toate zonele"</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">"Toate"</option>
                <option value="active">Doar active</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tables Grid */}
      <Row className="mt-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">Nu există mese configurate</p>
          </div>
        ) : (
          tables.map(table => (
            <Col key={table.id} md={4} lg={3} className="mb-4">
              <Card className={`table-card ${table.session_id ? 'occupied' : 'free'}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{table.table_number}</h5>
                    {getStatusBadge(table)}
                  </div>
                  <p className="text-muted mb-1">
                    <i className="fas fa-map-marker-alt me-2"></i>{table.location || 'N/A'}
                  </p>
                  <p className="text-muted mb-2">
                    <i className="fas fa-users me-2"></i>{table.capacity} locuri
                  </p>

                  {table.session_id ? (
                    <>
                      <hr />
                      <p className="mb-1"><strong>"Clienți:"</strong> {table.covers || 0}</p>
                      {table.server_name && (
                        <p className="mb-1"><strong>"Ospătar:"</strong> {table.server_name}</p>
                      )}
                      <p className="mb-2"><strong>"de la"</strong> {new Date(table.started_at!).toLocaleTimeString('ro-RO')}</p>
                      <Button
                        variant="warning"
                        size="sm"
                        className="w-100"
                        onClick={() => handleCloseSession(table.session_id!)}
                      >
                        <i className="fas fa-times me-2"></i>"inchide sesiune"</Button>
                    </>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      className="w-100 mt-2"
                      onClick={() => {
                        setSelectedTable(table);
                        setShowSessionModal(true);
                      }}
                    >
                      <i className="fas fa-plus me-2"></i>"deschide sesiune"</Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Start Session Modal */}
      <Modal show={showSessionModal} onHide={() => setShowSessionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Deschide Sesiune - {selectedTable?.table_number}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Număr Clienți *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={sessionForm.covers}
                onChange={(e) => setSessionForm({ ...sessionForm, covers: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ID Ospătar (opțional)</Form.Label>
              <Form.Control
                type="number"
                value={sessionForm.server_id}
                onChange={(e) => setSessionForm({ ...sessionForm, server_id: e.target.value })}
                placeholder="lasa gol daca nu e alocat"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>"Observații"</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSessionModal(false)}>"Anulează"</Button>
          <Button variant="success" onClick={handleStartSession}>
            <i className="fas fa-check me-2"></i>"deschide sesiune"</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};




