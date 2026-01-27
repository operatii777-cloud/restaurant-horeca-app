// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Consumption Situation Report Page
 * 
 * Raport Consumuri:
 * - Consumuri Zilnic
 * - Consumuri per Angajat
 * - Raport Anomalii
 * - Consum Detaliat per Rețetă/Dieș
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Badge, Collapse } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { fetchConsumptionReport, type ConsumptionReportFilters, type ConsumptionReportData } from '../api/accountingReportsApi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './ConsumptionReportPage.css';

interface ConsumptionItem {
  id: number;
  nomenclature: string;
  unit: string;
  opening_stock: number;
  opening_value: number;
  purchases_qty: number;
  purchases_value: number;
  available_qty: number;
  available_value: number;
  consumption_qty: number;
  consumption_value: number;
  consumption_percentage: number;
  closing_stock: number;
  closing_value: number;
  consumption_dishes?: number;
  average_consumption_per_dish?: number;
  consumption_by_dishes?: Array<{
    id: number;
    dish_name: string;
    consumption_qty: number;
    consumption_value: number;
    number_of_dishes_sold: number;
    consumption_per_dish?: number;
  }>;
}

interface ConsumptionReportData {
  items: ConsumptionItem[];
  totals: {
    opening_value: number;
    purchases_value: number;
    available_value: number;
    consumption_value: number;
    closing_value: number;
  };
  average_consumption_percentage: number;
  total_dishes_sold: number;
}

export const ConsumptionReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConsumptionReportData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [locationId, setLocationId] = useState<number | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ConsumptionReportFilters = {
        locationId,
        periodStart: startDate,
        periodEnd: endDate,
      };
      const result = await fetchConsumptionReport(filters);
      setData(result);
    } catch (err: any) {
      console.error('ConsumptionReportPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, locationId]);

  React.useEffect(() => {
    loadReport();
  }, [loadReport]);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(value);
  };

  return (
    <div className="consumption-report-page">
      <div className="page-header">
        <h1>📋 Raport Consumuri</h1>
        <p>"raport consumuri consumuri zilnic per angajat rapo"</p>
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
              <Form.Label>Locație</Form.Label>
              <Form.Select
                value={locationId || ''}
                onChange={(e) => setLocationId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">"toate locatiile"</option>
                <option value="1">Restaurant 1</option>
                <option value="2">Restaurant 2</option>
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
                  <h5 className="text-muted">"valoare disponibila"</h5>
                  <h3 className="text-primary">{formatCurrency(data.totals?.available_value ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">Valoare Consum</h5>
                  <h3 className="text-danger">{formatCurrency(data.totals?.consumption_value ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">% Consum Mediu</h5>
                  <h3 className={(data.average_consumption_percentage ?? 0) > 90 ? 'text-danger' : 'text-primary'}>
                    {(data.average_consumption_percentage ?? 0).toFixed(2)}%
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">"total bucati vandute"</h5>
                  <h3>{data.total_dishes_sold ?? 0}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Consumption Table */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">"detalii consumuri"</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>"Nomenclator"</th>
                    <th className="text-end">"stoc initial"</th>
                    <th className="text-end">"Intrări"</th>
                    <th className="text-end">Disponibil</th>
                    <th className="text-end">Consum</th>
                    <th className="text-end">% Consum</th>
                    <th className="text-end">Stoc Final</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items && Array.isArray(data.items) && data.items.length > 0) ? (
                    data.items.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr>
                          <td>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => toggleRow(item.id)}
                              className="p-0"
                            >
                              <i className={`fas ${expandedRows.has(item.id) ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </Button>
                          </td>
                          <td><strong>{item.nomenclature ?? '-'}</strong></td>
                          <td className="text-end">
                            {(item.opening_stock ?? 0).toFixed(3)} {item.unit ?? ''}
                            <br />
                            <small className="text-muted">{formatCurrency(item.opening_value ?? 0)}</small>
                          </td>
                          <td className="text-end">
                            {(item.purchases_qty ?? 0).toFixed(3)} {item.unit ?? ''}
                            <br />
                            <small className="text-muted">{formatCurrency(item.purchases_value ?? 0)}</small>
                          </td>
                          <td className="text-end">
                            {(item.available_qty ?? 0).toFixed(3)} {item.unit ?? ''}
                            <br />
                            <small className="text-muted">{formatCurrency(item.available_value ?? 0)}</small>
                          </td>
                          <td className="text-end" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                            {(item.consumption_qty ?? 0).toFixed(3)} {item.unit ?? ''}
                            <br />
                            <small>{formatCurrency(item.consumption_value ?? 0)}</small>
                          </td>
                          <td className="text-end" style={{ 
                            color: (item.consumption_percentage ?? 0) > 90 ? '#d32f2f' : '#1976d2',
                            fontWeight: 'bold'
                          }}>
                            {(item.consumption_percentage ?? 0).toFixed(2)}%
                          </td>
                          <td className="text-end">
                            {(item.closing_stock ?? 0).toFixed(3)} {item.unit ?? ''}
                            <br />
                            <small className="text-muted">{formatCurrency(item.closing_value ?? 0)}</small>
                          </td>
                        </tr>

                        {/* Expanded Row - Consumption by Dishes */}
                        {expandedRows.has(item.id) && item.consumption_by_dishes && item.consumption_by_dishes.length > 0 && (
                          <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <td colSpan={8}>
                              <Collapse in={true}>
                                <div className="p-3">
                                  <h6>"consum detaliat retete si diesuri"</h6>
                                  <Table size="sm" striped>
                                    <thead>
                                      <tr>
                                        <th>Rețetă/Dieș</th>
                                        <th className="text-end">Cantitate/Buc</th>
                                        <th className="text-end">Consum/Dieș</th>
                                        <th className="text-end">"nr bucati vandute"</th>
                                        <th className="text-end">Total Consum</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.consumption_by_dishes.map((dish) => (
                                        <tr key={dish.id}>
                                          <td>{dish.dish_name ?? '-'}</td>
                                          <td className="text-end">{(dish.consumption_qty ?? 0).toFixed(3)} {item.unit ?? ''}</td>
                                          <td className="text-end">
                                            {dish.consumption_per_dish ? `${dish.consumption_per_dish.toFixed(3)} ${item.unit ?? ''}` : '-'}
                                          </td>
                                          <td className="text-end">{dish.number_of_dishes_sold ?? 0}</td>
                                          <td className="text-end">{formatCurrency(dish.consumption_value ?? 0)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </div>
                              </Collapse>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">"nu exista date de consum in perioada selectata"</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <td colSpan={2}><strong>TOTAL</strong></td>
                    <td className="text-end">
                      <strong>{formatCurrency(data.totals?.opening_value ?? 0)}</strong>
                    </td>
                    <td className="text-end">
                      <strong>{formatCurrency(data.totals?.purchases_value ?? 0)}</strong>
                    </td>
                    <td className="text-end">
                      <strong>{formatCurrency(data.totals?.available_value ?? 0)}</strong>
                    </td>
                    <td className="text-end">
                      <strong style={{ color: '#d32f2f' }}>{formatCurrency(data.totals?.consumption_value ?? 0)}</strong>
                    </td>
                    <td className="text-end">
                      <strong>{(data.average_consumption_percentage ?? 0).toFixed(2)}%</strong>
                    </td>
                    <td className="text-end">
                      <strong>{formatCurrency(data.totals?.closing_value ?? 0)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};





