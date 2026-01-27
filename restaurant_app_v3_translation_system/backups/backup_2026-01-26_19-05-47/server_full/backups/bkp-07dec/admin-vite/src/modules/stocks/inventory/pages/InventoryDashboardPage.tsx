import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Row, Col, Button, Form } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './InventoryDashboardPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface InventoryStats {
  totalInventories: number;
  totalValue: number;
  totalPositive: number;
  totalNegative: number;
  averageVariance: number;
  criticalAlerts: number;
  warningAlerts: number;
}

interface InventoryTrend {
  date: string;
  total_value: number;
  positive: number;
  negative: number;
}

interface TopVarianceItem {
  ingredient_name: string;
  variance: number;
  expected: number;
  actual: number;
  location: string;
}

interface LocationStats {
  location_name: string;
  total_inventories: number;
  total_value: number;
  total_positive: number;
  total_negative: number;
  critical_alerts: number;
  warning_alerts: number;
}

export const InventoryDashboardPage = () => {
  const [stats, setStats] = useState<InventoryStats>({
    totalInventories: 0,
    totalValue: 0,
    totalPositive: 0,
    totalNegative: 0,
    averageVariance: 0,
    criticalAlerts: 0,
    warningAlerts: 0,
  });
  const [trends, setTrends] = useState<InventoryTrend[]>([]);
  const [topVariances, setTopVariances] = useState<TopVarianceItem[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, selectedLocation]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Load stats
      const statsResponse = await httpClient.get('/api/admin/inventory/dashboard/stats', {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });
      if (statsResponse.data) {
        setStats({
          totalInventories: statsResponse.data.total_inventories || 0,
          totalValue: statsResponse.data.total_value || 0,
          totalPositive: statsResponse.data.total_positive || 0,
          totalNegative: statsResponse.data.total_negative || 0,
          averageVariance: statsResponse.data.average_variance || 0,
          criticalAlerts: statsResponse.data.critical_alerts || 0,
          warningAlerts: statsResponse.data.warning_alerts || 0,
        });
      }

      // Load trends
      const trendsResponse = await httpClient.get('/api/admin/inventory/dashboard/trends', {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });
      if (trendsResponse.data?.success) {
        setTrends(trendsResponse.data.data || []);
      }

      // Load top variances
      const variancesResponse = await httpClient.get('/api/admin/inventory/dashboard/top-variances', {
        params: {
          location: selectedLocation || undefined,
        },
      });
      if (variancesResponse.data?.success) {
        setTopVariances(variancesResponse.data.data || []);
      }

      // Load location stats (multi-location)
      const locationsResponse = await httpClient.get('/api/admin/inventory/dashboard/locations', {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });
      if (locationsResponse.data?.success) {
        setLocationStats(locationsResponse.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea datelor dashboard:', error);
      // Fallback pentru development
      setStats({
        totalInventories: 12,
        totalValue: 125000,
        totalPositive: 15000,
        totalNegative: -5000,
        averageVariance: 2.5,
        criticalAlerts: 3,
        warningAlerts: 8,
      });
      setTrends([
        { date: '2025-01-01', total_value: 120000, positive: 10000, negative: -3000 },
        { date: '2025-01-08', total_value: 125000, positive: 12000, negative: -4000 },
        { date: '2025-01-15', total_value: 130000, positive: 15000, negative: -5000 },
      ]);
      setTopVariances([
        {
          ingredient_name: 'Mozzarella',
          variance: 15.5,
          expected: 100,
          actual: 115.5,
          location: 'Bucătărie Principală',
        },
      ]);
      setLocationStats([
        {
          location_name: 'Bucătărie Principală',
          total_inventories: 8,
          total_value: 85000,
          total_positive: 12000,
          total_negative: -3000,
          critical_alerts: 2,
          warning_alerts: 5,
        },
        {
          location_name: 'Bar',
          total_inventories: 4,
          total_value: 40000,
          total_positive: 3000,
          total_negative: -2000,
          critical_alerts: 1,
          warning_alerts: 3,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const trendChartData = {
    labels: trends.map((t) => new Date(t.date).toLocaleDateString('ro-RO')),
    datasets: [
      {
        label: 'Valoare Totală',
        data: trends.map((t) => t.total_value),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Plus',
        data: trends.map((t) => t.positive),
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Minus',
        data: trends.map((t) => t.negative),
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evoluție Inventare (Ultimele 30 zile)',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Valoare (RON)',
        },
      },
    },
  };

  const varianceChartData = {
    labels: topVariances.slice(0, 10).map((v) => v.ingredient_name),
    datasets: [
      {
        label: 'Varianță (%)',
        data: topVariances.slice(0, 10).map((v) => v.variance),
        backgroundColor: topVariances.slice(0, 10).map((v) =>
          v.variance > 10 ? 'rgba(220, 53, 69, 0.8)' : v.variance > 5 ? 'rgba(255, 193, 7, 0.8)' : 'rgba(40, 167, 69, 0.8)',
        ),
      },
    ],
  };

  const varianceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 10 Varianțe (Ingrediente)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Varianță (%)',
        },
      },
    },
  };

  return (
    <div className="inventory-dashboard-page">
      <h2 className="mb-4">Inventory Dashboard</h2>

      {/* Filtre Date și Locație */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Label>Data Început</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Data Sfârșit</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Locație (Multi-Locație)</Form.Label>
              <Form.Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">Toate Locațiile</option>
                {locationStats.map((loc) => (
                  <option key={loc.location_name} value={loc.location_name}>
                    {loc.location_name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" onClick={loadDashboardData} disabled={loading}>
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-1`}></i>
                Reîmprospătează
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Statistici */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white bg-primary">
            <Card.Body>
              <h4>{stats.totalInventories}</h4>
              <small>Total Inventare</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-info">
            <Card.Body>
              <h4>{stats.totalValue.toFixed(2)} RON</h4>
              <small>Valoare Totală</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-success">
            <Card.Body>
              <h4>{stats.totalPositive.toFixed(2)} RON</h4>
              <small>Total Plus</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-danger">
            <Card.Body>
              <h4>{stats.totalNegative.toFixed(2)} RON</h4>
              <small>Total Minus</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-white bg-warning">
            <Card.Body>
              <h4>{stats.averageVariance.toFixed(2)}%</h4>
              <small>Varianță Medie</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-danger">
            <Card.Body>
              <h4>{stats.criticalAlerts}</h4>
              <small>Alerte Critice</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' }}>
            <Card.Body>
              <h4>{stats.warningAlerts}</h4>
              <small>Alerte Avertisment</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Grafice */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5>
                <i className="fas fa-chart-line me-1"></i>Evoluție Inventare
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Line data={trendChartData} options={trendChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5>
                <i className="fas fa-chart-bar me-1"></i>Top Varianțe
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar data={varianceChartData} options={varianceChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Multi-Location Stats */}
      {locationStats.length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header>
            <h5>
              <i className="fas fa-map-marker-alt me-1"></i>Statistici Multi-Locație
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th>Locație</th>
                    <th>Inventare</th>
                    <th>Valoare Totală</th>
                    <th>Plus</th>
                    <th>Minus</th>
                    <th>Alerte Critice</th>
                    <th>Alerte Avertisment</th>
                  </tr>
                </thead>
                <tbody>
                  {locationStats.map((loc, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{loc.location_name}</strong>
                      </td>
                      <td>{loc.total_inventories}</td>
                      <td>{loc.total_value.toFixed(2)} RON</td>
                      <td className="text-success">{loc.total_positive.toFixed(2)} RON</td>
                      <td className="text-danger">{loc.total_negative.toFixed(2)} RON</td>
                      <td>
                        <span className="badge bg-danger">{loc.critical_alerts}</span>
                      </td>
                      <td>
                        <span className="badge bg-warning">{loc.warning_alerts}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Tabel Top Varianțe */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5>
            <i className="fas fa-list me-1"></i>Top Varianțe - Detalii
            {selectedLocation && <span className="ms-2 text-muted">({selectedLocation})</span>}
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover size="sm">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Locație</th>
                  <th>Așteptat</th>
                  <th>Real</th>
                  <th>Varianță (%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...
                    </td>
                  </tr>
                ) : topVariances.length > 0 ? (
                  topVariances.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ingredient_name}</td>
                      <td>{item.location}</td>
                      <td>{item.expected.toFixed(2)}</td>
                      <td>{item.actual.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            item.variance > 10 ? 'danger' : item.variance > 5 ? 'warning' : 'success'
                          }`}
                        >
                          {item.variance.toFixed(2)}%
                        </span>
                      </td>
                      <td>
                        {item.variance > 10
                          ? 'Critic'
                          : item.variance > 5
                            ? 'Avertisment'
                            : 'Normal'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      Nu există date de varianță.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

