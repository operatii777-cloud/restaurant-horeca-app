// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Advanced Stock Dashboard Page
 * Complete dashboard with Stock Prediction, Inventory Alerts, Revenue Margin Chart
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Badge, Alert, Collapse, Form } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';

interface InventoryStats {
  total_inventories: number;
  total_value: number;
  total_positive: number;
  total_negative: number;
  average_variance: number;
  critical_alerts: number;
  warning_alerts: number;
}

interface InventoryTrend {
  date: string;
  total_value: number;
  positive: number;
  negative: number;
}

interface TopVariance {
  ingredient_name: string;
  variance: number;
  expected: number;
  actual: number;
  location: string;
}

interface InventoryLocation {
  location_name: string;
  total_inventories: number;
  total_value: number;
  total_positive: number;
  total_negative: number;
  critical_alerts: number;
  warning_alerts: number;
}

interface StockPrediction {
  ingredient_name: string;
  current_stock: number;
  predicted_consumption: number;
  days_until_out: number;
  recommendation: 'restock' | 'monitor' | 'ok';
}

export const AdvancedStockDashboardPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [trends, setTrends] = useState<InventoryTrend[]>([]);
  const [topVariances, setTopVariances] = useState<TopVariance[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [predictions, setPredictions] = useState<StockPrediction[]>([]);
  const [showPredictionCard, setShowPredictionCard] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    loadData();
  }, [startDate, endDate, selectedLocation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, variancesRes, locationsRes, predictionsRes] = await Promise.all([
        httpClient.get('/api/admin/inventory/dashboard/stats', {
          params: { start_date: startDate, end_date: endDate }
        }),
        httpClient.get('/api/admin/inventory/dashboard/trends', {
          params: { start_date: startDate, end_date: endDate }
        }),
        httpClient.get('/api/admin/inventory/dashboard/top-variances', {
          params: { location: selectedLocation !== 'all' ? selectedLocation : undefined }
        }),
        httpClient.get('/api/admin/inventory/dashboard/locations', {
          params: { start_date: startDate, end_date: endDate }
        }),
        httpClient.get('/api/admin/inventory/dashboard/predictions').catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setTrends(trendsRes.data?.data || []);
      setTopVariances(variancesRes.data?.data || []);
      setLocations(locationsRes.data?.data || []);
      setPredictions(predictionsRes.data?.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendChartData = () => {
    return {
      labels: trends.map(t => new Date(t.date).toLocaleDateString('ro-RO')),
      datasets: [
        {
          label: 'Valoare Totală',
          data: trends.map(t => t.total_value),
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
        },
        {
          label: 'Ajustări Pozitive',
          data: trends.map(t => t.positive),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
        },
        {
          label: 'Ajustări Negative',
          data: trends.map(t => t.negative),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="advanced-stock-dashboard">
      <PageHeader
        title='stocks-dashboard.dashboard_avansat_stocuri'
        description="Analiză detaliată a stocurilor, predicții și alerte"
        actions={[
          {
            label: '↻ Reîncarcă',
            variant: 'secondary',
            onClick: () => loadData(),
          },
        ]}
      />

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
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">'stocks-dashboard.toate_locatiile'</option>
                {locations.map(loc => (
                  <option key={loc.location_name} value={loc.location_name}>
                    {loc.location_name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Total Inventare</h6>
              <h4>{stats?.total_inventories || 0}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Valoare Totală</h6>
              <h4 className="text-success">
                {(stats?.total_value || 0).toFixed(2)} RON
              </h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Alerte Critice</h6>
              <h4 className="text-danger">{stats?.critical_alerts || 0}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Alerte Warning</h6>
              <h4 className="text-warning">{stats?.warning_alerts || 0}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stock Prediction Card (Collapsible) */}
      <Card className="mb-4">
        <Card.Header
          className="collapsible-card-header"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowPredictionCard(!showPredictionCard)}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-chart-line me-2"></i>'stocks-dashboard.predictii_stoc'</h5>
            <i className={`fas fa-chevron-${showPredictionCard ? 'up' : 'down'}`}></i>
          </div>
        </Card.Header>
        <Collapse in={showPredictionCard}>
          <div>
            <Card.Body>
              {predictions.length === 0 ? (
                <Alert variant="info">'stocks-dashboard.nu_exista_predictii_disponibile'</Alert>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Stoc Curent</th>
                      <th>'stocks-dashboard.consum_prevazut'</th>
                      <th>'stocks-dashboard.zile_pana_la_epuizare'</th>
                      <th>Recomandare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((pred, idx) => (
                      <tr key={idx}>
                        <td>{pred.ingredient_name}</td>
                        <td>{pred.current_stock.toFixed(2)}</td>
                        <td>{pred.predicted_consumption.toFixed(2)}</td>
                        <td>{pred.days_until_out}</td>
                        <td>
                          <Badge bg={
                            pred.recommendation === 'restock' ? 'danger' :
                            pred.recommendation === 'monitor' ? 'warning' : 'success'
                          }>
                            {pred.recommendation === 'restock' ? 'Reaprovizionare' :
                             pred.recommendation === 'monitor' ? 'Monitorizare' : 'OK'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </div>
        </Collapse>
      </Card>

      {/* Trends Chart */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">'stocks-dashboard.evolutie_inventar'</h5>
        </Card.Header>
        <Card.Body>
          {trends.length === 0 ? (
            <Alert variant="info">Nu există date pentru perioada selectată</Alert>
          ) : (
            <div style={{ height: '400px' }}>
              <Line data={getTrendChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Top Variances */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">'stocks-dashboard.top_variante'</h5>
        </Card.Header>
        <Card.Body>
          {topVariances.length === 0 ? (
            <Alert variant="info">'stocks-dashboard.nu_exista_variante'</Alert>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Locație</th>
                  <th>Așteptat</th>
                  <th>Actual</th>
                  <th>Varianță %</th>
                </tr>
              </thead>
              <tbody>
                {topVariances.slice(0, 20).map((v, idx) => (
                  <tr key={idx}>
                    <td>{v.ingredient_name}</td>
                    <td>{v.location}</td>
                    <td>{v.expected.toFixed(2)}</td>
                    <td>{v.actual.toFixed(2)}</td>
                    <td>
                      <Badge bg={v.variance > 10 ? 'danger' : v.variance > 5 ? 'warning' : 'info'}>
                        {v.variance.toFixed(2)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Inventory Alerts per Location */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">'stocks-dashboard.alerte_per_locatie'</h5>
        </Card.Header>
        <Card.Body>
          {locations.length === 0 ? (
            <Alert variant="info">'stocks-dashboard.nu_exista_date_pentru_locatii'</Alert>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Locație</th>
                  <th>Total Inventare</th>
                  <th>Valoare Totală</th>
                  <th>Alerte Critice</th>
                  <th>Alerte Warning</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc, idx) => (
                  <tr key={idx}>
                    <td><strong>{loc.location_name}</strong></td>
                    <td>{loc.total_inventories}</td>
                    <td>{loc.total_value.toFixed(2)} RON</td>
                    <td>
                      <Badge bg="danger">{loc.critical_alerts}</Badge>
                    </td>
                    <td>
                      <Badge bg="warning">{loc.warning_alerts}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};



