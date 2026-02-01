// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXECUTIVE DASHBOARD PAGE
 * 
 * Dashboard executive cu KPI-uri critice pentru management
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Badge, Table, Button } from 'react-bootstrap';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { executiveDashboardApi, type ExecutiveMetrics } from '../api/executiveDashboardApi';
import { PageHeader } from '@/shared/components/PageHeader';
import { AlertsDisplay } from '@/modules/alerts/components/AlertsDisplay';
import './ExecutiveDashboardPage.css';

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

export const ExecutiveDashboardPage: React.FC = () => {
  //   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMetrics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadMetrics();
    }, 5 * 60 * 1000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadMetrics = async () => {
    try {
      setError(null);
      const response = await executiveDashboardApi.getMetrics();
      if (response.data.success) {
        setMetrics(response.data.metrics);
      }
    } catch (err: any) {
      console.error('Error loading executive metrics:', err);
      setError(err.message || 'Eroare la încărcarea metricilor');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading && !metrics) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </Spinner>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="alert alert-danger">
        <h4>Eroare</h4>
        <p>{error}</p>
        <Button onClick={loadMetrics}>Reîncearcă</Button>
      </div>
    );
  }

  if (!metrics) return null;

  // Prepare data for charts
  const dailySalesData = metrics.daily_sales.reduce((acc: any, sale) => {
    const existing = acc.find((item: any) => item.date === sale.date);
    if (existing) {
      existing[sale.platform] = sale.total_revenue;
    } else {
      acc.push({
        date: sale.date,
        [sale.platform]: sale.total_revenue,
      });
    }
    return acc;
  }, []);

  const platformSalesData = metrics.platform_sales.map(p => ({
    name: PLATFORM_LABELS[p.platform] || p.platform,
    revenue: p.total_revenue,
    orders: p.total_orders,
    color: PLATFORM_COLORS[p.platform] || '#6b7280',
  }));

  const topProductsData = metrics.top_products.slice(0, 10).map(p => ({
    name: p.product_name.length > 20 ? p.product_name.substring(0, 20) + '...' : p.product_name,
    revenue: p.total_revenue,
    quantity: p.total_quantity,
  }));

  const cancellationRatesData = metrics.cancellation_rates.map(c => ({
    name: PLATFORM_LABELS[c.platform] || c.platform,
    rate: c.cancellation_rate,
    color: c.cancellation_rate > 10 ? '#ef4444' : c.cancellation_rate > 5 ? '#f59e0b' : '#10b981',
  }));

  return (
    <div className="executive-dashboard-page">
      <PageHeader
        title='Dashboard Executive'
        subtitle='KPI-uri critice pentru management'
      />

      {/* Alerts Display */}
      <AlertsDisplay maxVisible={5} showToast={true} />

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Vânzări Astăzi</h6>
                  <h3 className="mb-0">{formatCurrency(metrics.today.total_revenue)}</h3>
                  <small className={`d-block mt-1 ${metrics.today.revenue_change_percent >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatPercent(metrics.today.revenue_change_percent)} față de ieri
                  </small>
                </div>
                <div className="kpi-icon">💰</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Comenzi astăzi</h6>
                  <h3 className="mb-0">{metrics.today.total_orders}</h3>
                  <small className={`d-block mt-1 ${metrics.today.orders_change_percent >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatPercent(metrics.today.orders_change_percent)} față de ieri
                  </small>
                </div>
                <div className="kpi-icon">📦</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Profit Estimat</h6>
                  <h3 className="mb-0">{formatCurrency(metrics.profitability.estimated_gross_profit)}</h3>
                  <small className="text-muted d-block mt-1">
                    {metrics.profitability.profit_margin_percent}% marjă
                  </small>
                </div>
                <div className="kpi-icon">📈</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Stocuri Critice</h6>
                  <h3 className="mb-0">{metrics.critical_stock.count}</h3>
                  <small className="text-muted d-block mt-1">
                    {metrics.warning_stock.count} avertismente
                  </small>
                </div>
                <div className="kpi-icon">⚠️</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Vânzări Zilnice per Platformă</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  {metrics.platform_sales.map(p => (
                    <Line
                      key={p.platform}
                      type="monotone"
                      dataKey={p.platform}
                      stroke={PLATFORM_COLORS[p.platform] || '#6b7280'}
                      name={PLATFORM_LABELS[p.platform] || p.platform}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Vânzări per Platformă (Astăzi)</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformSalesData}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.revenue)}`}
                  >
                    {platformSalesData.map((entry, index) => (
                      <Cell key={`cell-"Index"`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top 10 Produse Vândute</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Rată Anulare per Platformă</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cancellationRatesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Bar dataKey="rate" fill="#ef4444">
                    {cancellationRatesData.map((entry, index) => (
                      <Cell key={`cell-"Index"`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Stocuri Critice
                <Badge bg="danger" className="ms-2">{metrics.critical_stock.count}</Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {metrics.critical_stock.items.length === 0 ? (
                <p className="text-muted mb-0">Nu există stocuri critice</p>
              ) : (
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Stoc</th>
                      <th>Minim</th>
                      <th>Unit.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.critical_stock.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td className="text-danger fw-bold">{item.current_stock}</td>
                        <td>{item.min_stock}</td>
                        <td>{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Comenzi în așteptare
                <Badge bg="warning" className="ms-2">{metrics.pending_orders.count}</Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {metrics.pending_orders.orders.length === 0 ? (
                <p className="text-muted mb-0">Nu există comenzi în așteptare</p>
              ) : (
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Platformă</th>
                      <th>Așteptare</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.pending_orders.orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{PLATFORM_LABELS[order.platform] || order.platform}</td>
                        <td className="text-warning fw-bold">{order.wait_minutes} min</td>
                        <td>{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Refresh Button */}
      <div className="text-center mb-4">
        <Button onClick={loadMetrics} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />Se actualizează...</>
          ) : (
            'Actualizează datele'
          )}
        </Button>
      </div>
    </div>
  );
};


