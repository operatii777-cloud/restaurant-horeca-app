// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Form, Alert, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import { SalesReportTab } from '../components/SalesReportTab';
import { ProfitabilityReportTab } from '../components/ProfitabilityReportTab';
import { CustomerBehaviorReportTab } from '../components/CustomerBehaviorReportTab';
import { TimeTrendsReportTab } from '../components/TimeTrendsReportTab';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './AdvancedReportsPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardMetrics {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueChange: number;
  todayOrders: number;
  yesterdayOrders: number;
  ordersChange: number;
  avgOrderValue: number;
  activeTables: number;
}

interface InventoryAlert {
  ingredient_id: number;
  ingredient_name: string;
  current_stock: number;
  min_stock: number;
  alert_type: 'low' | 'out';
}

interface RevenueChartData {
  date: string;
  revenue: number;
}

export const AdvancedReportsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('sales');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Export handler
  const handleExport = async (reportType: string, format: 'excel' | 'pdf') => {
    try {
      const reportMap: Record<string, string> = {
        'sales': 'sales-detailed',
        'profitability': 'profitability',
        'customer-behavior': 'customer-behavior',
        'time-trends': 'time-trends'
      };
      const endpoint = reportMap[reportType] || 'sales-detailed';
      const url = `/api/reports/"Endpoint"?startDate=${startDate}&endDate=${endDate}&format="Format"`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Raport_${reportType}_${startDate}_${endDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export error:', error);
      alert('Eroare la export');
    }
  };

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load dashboard metrics
      const metricsResponse = await httpClient.get('/api/admin/dashboard/metrics');
      if (metricsResponse.data?.success) {
        const data = metricsResponse.data.data || metricsResponse.data;
        setMetrics({
          todayRevenue: data.todayRevenue || 0,
          yesterdayRevenue: data.yesterdayRevenue || 0,
          revenueChange: data.revenueChange || 0,
          todayOrders: data.todayOrders || 0,
          yesterdayOrders: data.yesterdayOrders || 0,
          ordersChange: data.ordersChange || 0,
          avgOrderValue: data.avgOrderValue || 0,
          activeTables: data.activeTables || 0,
        });
      }

      // Load revenue chart
      const revenueResponse = await httpClient.get('/api/admin/dashboard/revenue-chart', {
        params: { startDate, endDate },
      });
      if (revenueResponse.data?.success) {
        const chartData = revenueResponse.data.data;
        // Ensure it's always an array
        setRevenueChart(Array.isArray(chartData) ? chartData : []);
      } else {
        // If response doesn't have success flag, check if data exists
        const chartData = revenueResponse.data?.data || revenueResponse.data;
        setRevenueChart(Array.isArray(chartData) ? chartData : []);
      }

      // Load inventory alerts
      const alertsResponse = await httpClient.get('/api/admin/dashboard/inventory-alerts');
      if (alertsResponse.data?.success) {
        setInventoryAlerts(alertsResponse.data.data || []);
      }
    } catch (err: any) {
      console.error('Error loading analytics data:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} RON`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `"Sign"${value.toFixed(1)}%`;
  };

  // Ensure revenueChart is always an array
  const safeRevenueChart = useMemo(() => {
    return Array.isArray(revenueChart) ? revenueChart : [];
  }, [revenueChart]);

  // Chart data for Revenue
  const getRevenueChartData = () => {
    if (!Array.isArray(safeRevenueChart) || safeRevenueChart.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Venituri (RON)',
            data: [],
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }
    return {
      labels: safeRevenueChart.map((item) => new Date(item.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })),
      datasets: [
        {
          label: 'Venituri (RON)',
          data: safeRevenueChart.map((item) => item.revenue || 0),
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Chart data for Inventory Alerts
  const getInventoryAlertsChartData = () => {
    const lowStock = inventoryAlerts.filter(a => a.alert_type === 'low').length;
    const outOfStock = inventoryAlerts.filter(a => a.alert_type === 'out').length;
    
    return {
      labels: ['Stoc Scăzut', 'Stoc Epuizat'],
      datasets: [
        {
          label: 'Număr Alerte',
          data: [lowStock, outOfStock],
          backgroundColor: [
            'rgba(255, 206, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)',
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="advanced-reports-page">
      <div className="page-header">
        <h1>📊 Analytics Avansat</h1>
        <p>"dashboard avansat cu metrici detaliate grafice int"</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      {metrics && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>"venituri astazi"</h6>
                <h4 className="text-success">{formatCurrency(metrics.todayRevenue)}</h4>
                <small className={metrics.revenueChange >= 0 ? 'text-success' : 'text-danger'}>
                  {formatPercent(metrics.revenueChange)} față de ieri
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>"comenzi astazi"</h6>
                <h4>{metrics.todayOrders}</h4>
                <small className={metrics.ordersChange >= 0 ? 'text-success' : 'text-danger'}>
                  {formatPercent(metrics.ordersChange)} față de ieri
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Valoare Medie Comandă</h6>
                <h4>{formatCurrency(metrics.avgOrderValue)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Mese Active</h6>
                <h4>{metrics.activeTables}</h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Label>Data Start</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Data End</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label>&nbsp;</Form.Label>
              <div>
                <Button variant="primary" onClick={loadData} disabled={loading}>
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync'} me-2`}></i>
                  {loading ? 'Se încarcă...' : 'Actualizează'}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
        <Tab eventKey="sales" title='💰 vanzari'>
          <SalesReportTab
            startDate={startDate}
            endDate={endDate}
            onExport={async (format) => {
              try {
                const url = `/api/reports/sales-detailed?startDate=${startDate}&endDate=${endDate}&format="Format"`;
                window.open(url, '_blank');
              } catch (err) {
                console.error('Export error:', err);
              }
            }}
          />
        </Tab>

        <Tab eventKey="profitability" title="📈 Profitabilitate">
          <ProfitabilityReportTab
            startDate={startDate}
            endDate={endDate}
            onExport={async (format) => {
              try {
                const url = `/api/reports/profitability?startDate=${startDate}&endDate=${endDate}&format="Format"`;
                window.open(url, '_blank');
              } catch (err) {
                console.error('Export error:', err);
              }
            }}
          />
        </Tab>

        <Tab eventKey="customers" title='👥 comportament clienti'>
          <CustomerBehaviorReportTab
            startDate={startDate}
            endDate={endDate}
            onExport={async (format) => {
              try {
                const url = `/api/reports/customer-behavior?startDate=${startDate}&endDate=${endDate}&format="Format"`;
                window.open(url, '_blank');
              } catch (err) {
                console.error('Export error:', err);
              }
            }}
          />
        </Tab>

        <Tab eventKey="trends" title="📊 Trend-uri Temporale">
          <TimeTrendsReportTab
            startDate={startDate}
            endDate={endDate}
            onExport={async (format) => {
              try {
                const url = `/api/reports/time-trends?startDate=${startDate}&endDate=${endDate}&format="Format"`;
                window.open(url, '_blank');
              } catch (err) {
                console.error('Export error:', err);
              }
            }}
          />
        </Tab>

        <Tab eventKey="overview" title="📊 Overview">
          <Row>
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">"evolutie venituri"</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Se încarcă...</span>
                      </div>
                    </div>
                  ) : safeRevenueChart.length === 0 ? (
                    <Alert variant="info">Nu există date pentru perioada selectată</Alert>
                  ) : (
                    <div style={{ height: '400px' }}>
                      <Line data={getRevenueChartData()} options={{ responsive: true }} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Alerte Inventar</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Se încarcă...</span>
                      </div>
                    </div>
                  ) : inventoryAlerts.length === 0 ? (
                    <Alert variant="success">
                      <i className="fas fa-check-circle me-2"></i>"nu exista alerte de inventar"</Alert>
                  ) : (
                    <>
                      <div className="mb-3" style={{ height: '200px' }}>
                        <Pie data={getInventoryAlertsChartData()} options={{ responsive: true }} />
                      </div>
                      <Table striped hover size="sm">
                        <thead>
                          <tr>
                            <th>Ingredient</th>
                            <th>Stoc</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryAlerts.slice(0, 5).map((alert) => (
                            <tr key={alert.ingredient_id}>
                              <td>{alert.ingredient_name}</td>
                              <td>{alert.current_stock}</td>
                              <td>
                                <Badge bg={alert.alert_type === 'out' ? 'danger' : 'warning'}>
                                  {alert.alert_type === 'out' ? 'EPUIZAT' : 'SCĂZUT'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="revenue" title="💰 Venituri">
          <Card>
            <Card.Header>
              <h5 className="mb-0">"analiza venituri"</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : safeRevenueChart.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <>
                  <div className="mb-4" style={{ height: '400px' }}>
                    <Line data={getRevenueChartData()} options={{ responsive: true }} />
                  </div>
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Venituri</th>
                        <th>"Evoluție"</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeRevenueChart.map((item, index) => {
                        const prevRevenue = index > 0 ? safeRevenueChart[index - 1].revenue : item.revenue;
                        const change = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue) * 100 : 0;
                        return (
                          <tr key={item.date}>
                            <td>{new Date(item.date).toLocaleDateString('ro-RO')}</td>
                            <td><strong>{formatCurrency(item.revenue || 0)}</strong></td>
                            <td>
                              <Badge bg={change >= 0 ? 'success' : 'danger'}>
                                {formatPercent(change)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="inventory" title="📦 Inventar">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Alerte Inventar</h5>
              <Badge bg="danger">{inventoryAlerts.length} alerte</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : inventoryAlerts.length === 0 ? (
                <Alert variant="success">
                  <i className="fas fa-check-circle me-2"></i>"nu exista alerte de inventar toate ingredientele a"</Alert>
              ) : (
                <>
                  {inventoryAlerts.length > 0 && (
                    <div className="mb-4" style={{ height: '300px' }}>
                      <Bar data={getInventoryAlertsChartData()} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Stoc Curent</th>
                        <th>Stoc Minim</th>
                        <th>"tip alerta"</th>
                        <th>Acțiune</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryAlerts.map((alert) => (
                        <tr
                          key={alert.ingredient_id}
                          className={alert.alert_type === 'out' ? 'table-danger' : 'table-warning'}
                        >
                          <td><strong>{alert.ingredient_name}</strong></td>
                          <td>
                            <strong className={alert.alert_type === 'out' ? 'text-danger' : 'text-warning'}>
                              {alert.current_stock}
                            </strong>
                          </td>
                          <td>{alert.min_stock}</td>
                          <td>
                            <Badge bg={alert.alert_type === 'out' ? 'danger' : 'warning'}>
                              {alert.alert_type === 'out' ? 'STOC EPUIZAT' : 'STOC SCĂZUT'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm">
                              <i className="fas fa-shopping-cart me-1"></i>Comandă
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};



