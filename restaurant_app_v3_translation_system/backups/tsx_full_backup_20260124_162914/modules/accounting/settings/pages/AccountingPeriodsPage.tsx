// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/httpClient';
import './AccountingPeriodsPage.css';

interface AccountingPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed' | 'locked';
  fiscal_year: number;
  created_at: string;
  closed_at?: string;
}

export const AccountingPeriodsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AccountingPeriod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    fiscal_year: new Date().getFullYear(),
    status: 'open' as const
  });

  const queryClient = useQueryClient();

  // Fetch periods
  const { data: periods, isLoading, error } = useQuery<AccountingPeriod[]>({
    queryKey: ['accounting-periods'],
    queryFn: async () => {
      const response = await httpClient.get('/api/accounting/periods');
      return response.data;
    }
  });

  // Create/Update period
  const mutation = useMutation({
    mutationFn: async (data: Partial<AccountingPeriod>) => {
      if (editingPeriod) {
        return httpClient.put(`/api/accounting/periods/${editingPeriod.id}`, data);
      } else {
        return httpClient.post('/api/accounting/periods', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] });
      setShowModal(false);
      setEditingPeriod(null);
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        fiscal_year: new Date().getFullYear(),
        status: 'open'
      });
    }
  });

  // Close period
  const closePeriodMutation = useMutation({
    mutationFn: async (id: number) => {
      return httpClient.post(`/api/accounting/periods/"Id"/close`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-periods'] });
    }
  });

  const handleEdit = (period: AccountingPeriod) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      start_date: period.start_date,
      end_date: period.end_date,
      fiscal_year: period.fiscal_year,
      status: period.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleClosePeriod = (id: number) => {
    if (window.confirm('Sigur doriți să închideți această perioadă contabilă? Această acțiune nu poate fi anulată.')) {
      closePeriodMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Container fluid className="accounting-periods-page">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">"se incarca"</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="accounting-periods-page">
      <Row className="mb-4">
        <Col>
          <h2>📅 Perioade Contabile</h2>
          <p className="text-muted">"gestionati perioadele contabile pentru raportare s"</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus me-2"></i>"perioada noua"</Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Eroare la încărcarea perioadelor: {error instanceof Error ? error.message : 'Eroare necunoscută'}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Nume</th>
                <th>An Fiscal</th>
                <th>Data Început</th>
                <th>Data Sfârșit</th>
                <th>Status</th>
                <th>"Acțiuni"</th>
              </tr>
            </thead>
            <tbody>
              {periods && periods.length > 0 ? (
                periods.map((period) => (
                  <tr key={period.id}>
                    <td>{period.name}</td>
                    <td>{period.fiscal_year}</td>
                    <td>{new Date(period.start_date).toLocaleDateString('ro-RO')}</td>
                    <td>{new Date(period.end_date).toLocaleDateString('ro-RO')}</td>
                    <td>
                      <span className={`badge ${
                        period.status === 'open' ? 'bg-success' :
                        period.status === 'closed' ? 'bg-warning' :
                        'bg-secondary'
                      }`}>
                        {period.status === 'open' ? 'Deschis' :
                         period.status === 'closed' ? 'Închis' :
                         'Blocat'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(period)}
                        disabled={period.status === 'locked'}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      {period.status === 'open' && (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleClosePeriod(period.id)}
                        >
                          <i className="fas fa-lock"></i>"Închide"</Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">"nu exista perioade contabile definite"</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal pentru creare/editare */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingPeriod(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPeriod ? 'Editează Perioada' : 'Perioadă Contabilă Nouă'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nume Perioadă *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder={t('$([ex_q1_2026_ianuarie_2026] -replace "\[|\]")')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>An Fiscal *</Form.Label>
              <Form.Control
                type="number"
                value={formData.fiscal_year}
                onChange={(e) => setFormData({ ...formData, fiscal_year: parseInt(e.target.value) })}
                required
                min={2020}
                max={2100}
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Data Început *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Data Sfârșit *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                disabled={editingPeriod?.status === 'locked'}
              >
                <option value="open">"Deschis"</option>
                <option value="closed">"Închis"</option>
                <option value="locked" disabled>Blocat (nu poate fi modificat)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingPeriod(null); }}>"Anulează"</Button>
            <Button variant="primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Se salvează...' : editingPeriod ? 'Actualizează' : 'Creează'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};





