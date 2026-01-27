// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Daily Balance Report Page
 * 
 * Raport Balanță Zilnică:
 * - Stoc inițial, intrări zilnice, consumuri zilnice, stoc final
 * - Trend ultimele 30 zile
 * - Diferențe și variance
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './DailyBalanceReportPage.css';

interface DailyBalanceItem {
  id: number;
  ingredient_id: number;
  nomenclature: string;
  unit: string;
  opening_stock: number;
  opening_value: number;
  entries_today_qty: number;
  entries_today_value: number;
  consumption_today_qty: number;
  consumption_today_value: number;
  closing_stock: number;
  closing_value: number;
  variance_qty: number;
}

interface DailyBalanceData {
  report_id: number;
  report_date: string;
  location_id: number;
  items: DailyBalanceItem[];
  totals: {
    opening_value: number;
    entries_value: number;
    consumption_value: number;
    closing_value: number;
  };
}

export const DailyBalanceReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DailyBalanceData | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [locationId, setLocationId] = useState<number | null>(1);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pentru moment, folosim endDate ca reportDate
      const response = await httpClient.post('/api/accounting/daily-balance', {
        locationId,
        reportDate: endDate
      });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error || 'Eroare la încărcarea raportului');
      }
    } catch (err: any) {
      console.error('DailyBalanceReportPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  }, [endDate, locationId]);

  React.useEffect(() => {
    if (locationId && endDate) {
      loadReport();
    }
  }, [loadReport]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="daily-balance-report-page">
      <div className="page-header">
        <h1>📅 Balanța Zilnică</h1>
        <p>"raport zilnic al stocurilor stoc initial intrari c"</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Început</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Sfârșit</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Locație</Form.Label>
                <Form.Control
                  as="select"
                  value={locationId || ''}
                  onChange={(e) => setLocationId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">"selecteaza locatia"</option>
                  <option value="1">"restaurant best center"</option>
                  <option value="2">"restaurant best mall"</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={3}>
              <div className="d-flex gap-2">
                <Button onClick={loadReport} disabled={loading} className="flex-fill">
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...</>
                  ) : (
                    <><i className="fas fa-sync-alt me-2"></i>"Reîncarcă"</>
                  )}
                </Button>
                <Button variant="outline-primary" onClick={handlePrint}>
                  <i className="fas fa-print me-2"></i>"Tipărire"</Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {data && (
        <>
          <Card className="mb-4 info-box">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <strong>Data Raport:</strong> {new Date(data.report_date).toLocaleDateString('ro-RO')}
                </Col>
                <Col md={4}>
                  <strong>"Locație:"</strong> Restaurant BEST {data.location_id === 1 ? 'Center' : 'Mall'}
                </Col>
                <Col md={4}>
                  <strong>Ora Raport:</strong> {new Date().toLocaleTimeString('ro-RO')}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5>"detalii balanta zilnica"</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="daily-balance-table">
                <thead>
                  <tr>
                    <th>"Nomenclator"</th>
                    <th className="text-center">UM</th>
                    <th className="text-end">"stoc initial"</th>
                    <th className="text-end">Valoare Inițială</th>
                    <th className="text-end">"intrari astazi"</th>
                    <th className="text-end">"valoare intrari"</th>
                    <th className="text-end">"consum astazi"</th>
                    <th className="text-end">Valoare Consum</th>
                    <th className="text-end">Stoc Final</th>
                    <th className="text-end">"valoare finala"</th>
                    <th className="text-end">Diferență</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: item.variance_qty < 0 ? '#ffebee' : item.variance_qty > 0 ? '#e8f5e9' : 'transparent'
                      }}
                    >
                      <td>{item.nomenclature}</td>
                      <td className="text-center">{item.unit}</td>
                      <td className="text-end">{formatNumber(item.opening_stock, 3)}</td>
                      <td className="text-end">{formatCurrency(item.opening_value)}</td>
                      <td className="text-end" style={{ color: '#2e7d32' }}>
                        {formatNumber(item.entries_today_qty, 3)}
                      </td>
                      <td className="text-end" style={{ color: '#2e7d32' }}>
                        {formatCurrency(item.entries_today_value)}
                      </td>
                      <td className="text-end" style={{ color: '#d32f2f' }}>
                        {formatNumber(item.consumption_today_qty, 3)}
                      </td>
                      <td className="text-end" style={{ color: '#d32f2f' }}>
                        {formatCurrency(item.consumption_today_value)}
                      </td>
                      <td className="text-end"><strong>{formatNumber(item.closing_stock, 3)}</strong></td>
                      <td className="text-end"><strong>{formatCurrency(item.closing_value)}</strong></td>
                      <td className="text-end">
                        {item.variance_qty !== 0 && (
                          <Badge bg={item.variance_qty < 0 ? 'danger' : 'success'}>
                            {item.variance_qty > 0 ? '+' : ''}{formatNumber(item.variance_qty, 3)}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <th colSpan={3} className="text-end"><strong>TOTAL:</strong></th>
                    <th className="text-end">{formatCurrency(data.totals.opening_value)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals.entries_value)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals.consumption_value)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals.closing_value)}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>
          </Card>

          <Row className="mb-4">
            <Col md={3}>
              <Card className="kpi-card bg-primary text-white">
                <Card.Body>
                  <Card.Title className="text-white">"stoc initial"</Card.Title>
                  <Card.Text className="kpi-value">{formatCurrency(data.totals.opening_value)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="kpi-card bg-success text-white">
                <Card.Body>
                  <Card.Title className="text-white">"Intrări"</Card.Title>
                  <Card.Text className="kpi-value">{formatCurrency(data.totals.entries_value)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="kpi-card bg-danger text-white">
                <Card.Body>
                  <Card.Title className="text-white">Consum</Card.Title>
                  <Card.Text className="kpi-value">{formatCurrency(data.totals.consumption_value)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="kpi-card bg-info text-white">
                <Card.Body>
                  <Card.Title className="text-white">Stoc Final</Card.Title>
                  <Card.Text className="kpi-value">{formatCurrency(data.totals.closing_value)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5>Trend Ultimele 30 Zile</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <i className="fas fa-info-circle me-2"></i>
                Graficul trend va fi disponibil după colectarea datelor pentru 30 de zile consecutive.
              </Alert>
              {/* TODO: Implementare trend chart cu date istorice */}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};





