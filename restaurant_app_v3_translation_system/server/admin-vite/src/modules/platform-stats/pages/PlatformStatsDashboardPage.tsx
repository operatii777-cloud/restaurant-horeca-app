// import { useTranslation } from '@/i18n/I18nContext';
import React, { useEffect, useState } from 'react';
import { Card, Form, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
  PieChart, Pie, Cell, CartesianGrid, AreaChart, Area
} from 'recharts';
import { platformStatsApi, type Platform, type PlatformComparison, type PlatformTrend, type PlatformTopProduct } from '../api/platformStatsApi';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PlatformStatsDashboardPage.css';

// Culori pentru platforme
const PLATFORM_COLORS: Record<string, string> = {
  'MOBILE_APP': '#3b82f6',
  'FRIENDSRIDE': '#8b5cf6',
  'GLOVO': '#10b981',
  'WOLT': '#f59e0b',
  'UBER_EATS': '#000000',
  'BOLT_FOOD': '#00d4ff',
  'POS': '#ef4444',
  'KIOSK': '#06b6d4',
  'PHONE': '#6366f1',
};

const PLATFORM_LABELS: Record<string, string> = {
  'MOBILE_APP': 'Aplicația Mobilă',
  'FRIENDSRIDE': 'Friends Ride',
  'GLOVO': 'Glovo',
  'WOLT': 'Wolt',
  'UBER_EATS': 'Uber Eats',
  'BOLT_FOOD': 'Bolt Food',
  'POS': 'POS Restaurant',
  'KIOSK': 'KIOSK Self-Service',
  'PHONE': 'Telefon',
};

export const PlatformStatsDashboardPage = () => {
//   const { t } = useTranslation();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [comparison, setComparison] = useState<PlatformComparison[]>([]);
  const [trends, setTrends] = useState<PlatformTrend[]>([]);
  const [topProducts, setTopProducts] = useState<PlatformTopProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Încarcă lista platformelor
  const loadPlatforms = async () => {
    setLoading(true);
    try {
      const response = await platformStatsApi.getPlatforms({
        startDate,
        endDate,
      });
      setPlatforms(response.data.platforms || []);
    } catch (error) {
      console.error('Error loading platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Încarcă comparația între platforme
  const loadComparison = async () => {
    setLoading(true);
    try {
      const response = await platformStatsApi.comparePlatforms({
        startDate,
        endDate,
      });
      setComparison(response.data.comparison || []);
    } catch (error) {
      console.error('Error loading comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  // Încarcă trendurile pentru platforma selectată
  const loadTrends = async () => {
    if (!selectedPlatform) return;
    
    setLoading(true);
    try {
      const response = await platformStatsApi.getPlatformTrends(selectedPlatform, {
        startDate,
        endDate,
        period,
      });
      setTrends(response.data.trends || []);
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  // Încarcă top produse pentru platforma selectată
  const loadTopProducts = async () => {
    if (!selectedPlatform) return;
    
    setLoading(true);
    try {
      const response = await platformStatsApi.getPlatformTopProducts(selectedPlatform, {
        startDate,
        endDate,
        limit: 10,
      });
      setTopProducts(response.data.top_products || []);
    } catch (error) {
      console.error('Error loading top products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatforms();
    loadComparison();
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedPlatform) {
      loadTrends();
      loadTopProducts();
    }
  }, [selectedPlatform, startDate, endDate, period]);

  // Pregătește datele pentru graficul de comparație
  const comparisonChartData = comparison.map(p => ({
    name: PLATFORM_LABELS[p.platform] || p.platform,
    orders: p.total_orders,
    revenue: p.total_revenue,
    avg_order: p.avg_order_value,
  }));

  // Pregătește datele pentru graficul de trenduri
  const trendsChartData = trends.map(t => ({
    period: t.period,
    orders: t.orders,
    revenue: t.revenue,
    avg_order: t.avg_order_value,
  }));

  // Calculează totaluri
  const totalRevenue = comparison.reduce((sum, p) => sum + p.total_revenue, 0);
  const totalOrders = comparison.reduce((sum, p) => sum + p.total_orders, 0);

  return (
    <div className="platform-stats-dashboard-page">
      <PageHeader
        title='📊 statistici per platforma'
        description="Dashboard-uri detaliate pentru fiecare platformă de comandă"
      />

      {/* Filtre */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
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
                <Form.Label>Platformă</Form.Label>
                <Form.Select
                  value={selectedPlatform || ''}
                  onChange={(e) => setSelectedPlatform(e.target.value || null)}
                >
                  <option value="">'platform-stats.toate_platformele'</option>
                  {platforms.map(p => (
                    <option key={p.platform} value={p.platform}>
                      {PLATFORM_LABELS[p.platform] || p.platform}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Perioadă</Form.Label>
                <Form.Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
                  disabled={!selectedPlatform}
                >
                  <option value="day">Zilnic</option>
                  <option value="week">"Săptămânal"</option>
                  <option value="month">Lunar</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && (
        <div className="text-center mb-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* KPI Cards - Totaluri */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="kpi-card text-center border-primary">
            <Card.Body>
              <div className="kpi-label">Total Venituri</div>
              <div className="kpi-value">{totalRevenue.toFixed(2)} RON</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="kpi-card text-center border-success">
            <Card.Body>
              <div className="kpi-label">Total Comenzi</div>
              <div className="kpi-value">{totalOrders}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="kpi-card text-center border-info">
            <Card.Body>
              <div className="kpi-label">'platform-stats.platforme_active'</div>
              <div className="kpi-value">{platforms.length}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Comparație Platforme */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>'platform-stats.comparatie_platforme'</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Comenzi" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Venituri (RON)" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabel Comparație */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>'platform-stats.detalii_comparatie'</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Platformă</th>
                    <th>Comenzi</th>
                    <th>Venituri (RON)</th>
                    <th>Valoare Medie Comandă</th>
                    <th>'platform-stats.clienti_unici'</th>
                    <th>% Venituri</th>
                    <th>% Comenzi</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map(p => (
                    <tr key={p.platform}>
                      <td>
                        <Badge bg="primary" style={{ backgroundColor: PLATFORM_COLORS[p.platform] || '#6c757d' }}>
                          {PLATFORM_LABELS[p.platform] || p.platform}
                        </Badge>
                      </td>
                      <td>{p.total_orders}</td>
                      <td>{p.total_revenue.toFixed(2)}</td>
                      <td>{p.avg_order_value.toFixed(2)}</td>
                      <td>{p.unique_customers}</td>
                      <td>
                        <div className="progress" style={{ height: '20px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${p.revenue_percentage}%` }}
                          >
                            {p.revenue_percentage}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="progress" style={{ height: '20px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${p.orders_percentage}%` }}
                          >
                            {p.orders_percentage}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trenduri pentru Platforma Selectată */}
      {selectedPlatform && trends.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h5>Trenduri - {PLATFORM_labels[selectedPlatform] || selectedPlatform}</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Comenzi" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Venituri (RON)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Top Produse pentru Platforma Selectată */}
      {selectedPlatform && topProducts.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h5>Top 10 Produse - {PLATFORM_labels[selectedPlatform] || selectedPlatform}</h5>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Produs</th>
                      <th>Cantitate</th>
                      <th>Comenzi</th>
                      <th>Venituri (RON)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={product.product_id}>
                        <td>{index + 1}</td>
                        <td>{product.product_name}</td>
                        <td>{product.total_quantity}</td>
                        <td>{product.order_count}</td>
                        <td>{product.total_revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};





