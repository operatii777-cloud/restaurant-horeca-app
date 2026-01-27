// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Client Payments Report Page
 * 
 * Raport Plăți Client:
 * - Plații Efectuate
 * - Plații Pending
 * - Vârste Creanțe
 * - Clienți cu Întârzieri
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import { fetchClientPaymentsReport, type ClientPaymentReportFilters, type ClientPaymentReportData } from '../api/accountingReportsApi';
import { HelpButton } from '@/shared/components/HelpButton';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './ClientPaymentsReportPage.css';

export const ClientPaymentsReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ClientPaymentReportData | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | "Pending:" | 'overdue'>('all');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ClientPaymentReportFilters = {
        dateFrom: startDate,
        dateTo: endDate,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      const result = await fetchClientPaymentsReport(filters);
      setData(result);
    } catch (err: any) {
      console.error('ClientPaymentsReportPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, statusFilter]);

  React.useEffect(() => {
    loadReport();
  }, [loadReport]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">Plătit</Badge>;
      case "Pending:":
        return <Badge bg="warning">Pending</Badge>;
      case 'overdue':
        return <Badge bg="danger">"Întârziat"</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="client-payments-report-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>💳 Raport Plăți Client</h1>
          <p>"raport plati client platii efectuate pending varst"</p>
        </div>
        <HelpButton
          title="ajutor raport plati clienti"
          content={
            <div>
              <h5>💳 Ce este Raportul Plăți Clienți?</h5>
              <p>
                Raportul oferă o vedere completă asupra plăților clienților, inclusiv plăți efectuate, 
                plăți în așteptare și vârste creanțe pentru gestionarea eficientă a creanțelor.
              </p>
              <h5 className="mt-4">📊 Secțiuni raport</h5>
              <ul>
                <li><strong>Plăți Efectuate</strong> - Plăți completate în perioada selectată</li>
                <li><strong>"plati pending"</strong> - Plăți în așteptare (neachitate)</li>
                <li><strong>"varste creante"</strong> - Clasificare creanțe pe intervale de timp (0-30, 31-60, 61-90, 90+ zile)</li>
                <li><strong>"clienti cu intarzieri"</strong> - Clienți cu plăți restante</li>
              </ul>
              <h5 className="mt-4">🔍 Filtre disponibile</h5>
              <ul>
                <li><strong>"data de la"</strong> - Data de început a perioadei</li>
                <li><strong>"data pana la"</strong> - Data de sfârșit a perioadei</li>
                <li><strong>Status</strong> - Filtrare după status (Toate, Plătite, Pending, Restante)</li>
              </ul>
              <div className="alert alert-warning mt-4">
                <strong>⚠️ Important:</strong> Monitorizează regulat creanțele restante pentru a evita 
                pierderi financiare.
              </div>
            </div>
          }
        />
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Label>Data Start</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Data End</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">"Toate"</option>
                <option value="paid">"Plătite"</option>
                <option value="pending">Pending</option>
                <option value="overdue">"Întârziate"</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>&nbsp;</Form.Label>
              <div>
                <Button variant="primary" onClick={loadReport} disabled={loading}>
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync'} me-2`}></i>
                  {loading ? 'Se încarcă...' : 'Actualizează'}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {data && (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">"total platit"</h5>
                  <h3 className="text-success">{formatCurrency(data.summary?.totalPaid ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">"total pending"</h5>
                  <h3 className="text-warning">{formatCurrency(data.summary?.totalPending ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">"total intarziat"</h5>
                  <h3 className="text-danger">{formatCurrency(data.summary?.totalOverdue ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">Total Facturi</h5>
                  <h3>{data.summary?.totalInvoices ?? 0}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Aging Analysis */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">"varste creante"</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">"Curent"</h6>
                    <h4 className="text-success">{formatCurrency(data.aging?.current ?? 0)}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">0-30 zile</h6>
                    <h4 className="text-warning">{formatCurrency(data.aging?.days30 ?? 0)}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">31-60 zile</h6>
                    <h4 className="text-warning">{formatCurrency(data.aging?.days60 ?? 0)}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">61-90 zile</h6>
                    <h4 className="text-danger">{formatCurrency(data.aging?.days90 ?? 0)}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">Peste 90 zile</h6>
                    <h4 className="text-danger">{formatCurrency(data.aging?.over90 ?? 0)}</h4>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payments Table */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">"detalii plati"</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>"Factură"</th>
                    <th>Data</th>
                    <th>Client</th>
                    <th>CUI</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Plătit</th>
                    <th className="text-end">Rămas</th>
                    <th>"Scadență"</th>
                    <th>"zile intarziere"</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.payments && Array.isArray(data.payments) && data.payments.length > 0) ? (
                    data.payments.map((payment) => (
                      <tr key={payment.invoiceId}>
                        <td>{payment.invoiceNumber ?? '-'}</td>
                        <td>{payment.invoiceDate ? new Date(payment.invoiceDate).toLocaleDateString('ro-RO') : '-'}</td>
                        <td>{payment.clientName ?? '-'}</td>
                        <td>{payment.clientCUI ?? '-'}</td>
                        <td className="text-end">{formatCurrency(payment.totalAmount ?? 0)}</td>
                        <td className="text-end text-success">{formatCurrency(payment.amountPaid ?? 0)}</td>
                        <td className="text-end text-danger">{formatCurrency(payment.amountRemaining ?? 0)}</td>
                        <td>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('ro-RO') : '-'}</td>
                        <td className="text-center">
                          {(payment.daysOverdue ?? 0) > 0 ? (
                            <Badge bg="danger">{payment.daysOverdue}</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{getStatusBadge(payment.status ?? "Pending:")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center text-muted">"nu exista plati in perioada selectata"</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};





