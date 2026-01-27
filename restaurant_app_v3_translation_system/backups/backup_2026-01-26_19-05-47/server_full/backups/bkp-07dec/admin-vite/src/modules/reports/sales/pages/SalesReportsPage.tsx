import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Alert, Tabs, Tab, Badge, Row, Col } from 'react-bootstrap';
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
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './SalesReportsPage.css';

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
  Filler
);

interface SalesDetailedItem {
  order_id: number;
  timestamp: string;
  table_number?: number;
  client_identifier?: string;
  order_total: number;
  product_name: string;
  category: string;
  price: number;
  quantity: number;
  final_price: number;
}

interface ProfitabilityItem {
  id: number;
  name: string;
  category: string;
  selling_price: number;
  times_ordered: number;
  total_quantity_sold: number;
  total_revenue: number;
  avg_selling_price: number;
  recipe_cost_per_unit: number;
  total_cost: number;
  profit: number;
  profit_margin_percent: number;
}

interface CustomerBehaviorItem {
  client_identifier: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  first_order: string;
  last_order: string;
  unique_visit_days: number;
  categories_ordered: string;
  category_diversity: number;
}

interface TimeTrendItem {
  period: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  unique_customers: number;
  tables_served: number;
}

export const SalesReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('detailed');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<string>('');
  const [period, setPeriod] = useState<string>('daily');

  // Data states
  const [salesDetailed, setSalesDetailed] = useState<SalesDetailedItem[]>([]);
  const [profitability, setProfitability] = useState<ProfitabilityItem[]>([]);
  const [profitabilitySummary, setProfitabilitySummary] = useState<any>(null);
  const [customerBehavior, setCustomerBehavior] = useState<CustomerBehaviorItem[]>([]);
  const [customerBehaviorSummary, setCustomerBehaviorSummary] = useState<any>(null);
  const [timeTrends, setTimeTrends] = useState<TimeTrendItem[]>([]);
  const [timeTrendsSummary, setTimeTrendsSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [activeTab, startDate, endDate, category, period]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'detailed':
          await loadSalesDetailed();
          break;
        case 'profitability':
          await loadProfitability();
          break;
        case 'customer-behavior':
          await loadCustomerBehavior();
          break;
        case 'time-trends':
          await loadTimeTrends();
          break;
      }
    } catch (err: any) {
      console.error('Error loading report:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesDetailed = async () => {
    const params: any = { startDate, endDate };
    if (category) params.category = category;
    
    const response = await httpClient.get('/api/admin/reports/sales-detailed', { params });
    if (response.data) {
      setSalesDetailed(Array.isArray(response.data) ? response.data : response.data.data || []);
    }
  };

  const loadProfitability = async () => {
    const response = await httpClient.get('/api/admin/reports/profitability', {
      params: { startDate, endDate },
    });
    if (response.data?.success) {
      setProfitability(response.data.data || []);
      setProfitabilitySummary(response.data.summary || null);
    }
  };

  const loadCustomerBehavior = async () => {
    const response = await httpClient.get('/api/admin/reports/customer-behavior', {
      params: { startDate, endDate },
    });
    if (response.data?.success) {
      setCustomerBehavior(response.data.data || []);
      setCustomerBehaviorSummary(response.data.summary || null);
    }
  };

  const loadTimeTrends = async () => {
    const response = await httpClient.get('/api/admin/reports/time-trends', {
      params: { startDate, endDate, period },
    });
    if (response.data?.success) {
      setTimeTrends(response.data.data || []);
      setTimeTrendsSummary(response.data.summary || null);
    }
  };

  const exportToExcel = async (reportType: string) => {
    try {
      const params: any = { startDate, endDate, format: 'excel' };
      if (reportType === 'detailed' && category) params.category = category;
      if (reportType === 'time-trends') params.period = period;

      let endpoint = '';
      switch (reportType) {
        case 'detailed':
          endpoint = '/api/admin/reports/sales-detailed';
          break;
        case 'profitability':
          endpoint = '/api/admin/reports/profitability';
          break;
        case 'customer-behavior':
          endpoint = '/api/admin/reports/customer-behavior';
          break;
        case 'time-trends':
          endpoint = '/api/admin/reports/time-trends';
          break;
      }

      const response = await httpClient.get(endpoint, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `raport_${reportType}_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error exporting to Excel:', err);
      setError('Eroare la exportarea în Excel');
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} RON`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO');
  };

  // Chart data for Time Trends
  const getTimeTrendsChartData = () => {
    return {
      labels: timeTrends.map((item) => item.period),
      datasets: [
        {
          label: 'Venituri (RON)',
          data: timeTrends.map((item) => item.total_revenue),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Număr Comenzi',
          data: timeTrends.map((item) => item.total_orders),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const getTimeTrendsChartOptions = () => {
    return {
      responsive: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Venituri (RON)',
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Număr Comenzi',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
  };

  // Chart data for Profitability
  const getProfitabilityChartData = () => {
    const topProducts = profitability.slice(0, 10);
    return {
      labels: topProducts.map((item) => item.name),
      datasets: [
        {
          label: 'Profit (RON)',
          data: topProducts.map((item) => item.profit),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="sales-reports-page">
      <PageHeader
        title="📊 Rapoarte Vânzări"
        description="Rapoarte detaliate despre vânzări, profitabilitate, comportament clienți și trend-uri temporale"
      />

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
            {activeTab === 'detailed' && (
              <Col md={3}>
                <Form.Label>Categorie</Form.Label>
                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Toate categoriile</option>
                  <option value="aperitive">Aperitive</option>
                  <option value="ciorbe">Ciorbe</option>
                  <option value="salate">Salate</option>
                  <option value="pizza">Pizza</option>
                  <option value="paste">Paste</option>
                  <option value="feluri_principale">Feluri Principale</option>
                  <option value="deserturi">Deserturi</option>
                  <option value="bauturi">Băuturi</option>
                </Form.Select>
              </Col>
            )}
            {activeTab === 'time-trends' && (
              <Col md={3}>
                <Form.Label>Perioadă</Form.Label>
                <Form.Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="hourly">Pe oră</option>
                  <option value="daily">Zilnic</option>
                  <option value="weekly">Săptămânal</option>
                  <option value="monthly">Lunar</option>
                </Form.Select>
              </Col>
            )}
            <Col md={activeTab === 'detailed' || activeTab === 'time-trends' ? 3 : 6}>
              <Form.Label>&nbsp;</Form.Label>
              <div>
                <Button variant="success" onClick={() => exportToExcel(activeTab)}>
                  <i className="fas fa-file-excel me-2"></i>Export Excel
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
        <Tab eventKey="detailed" title="📋 Vânzări Detaliate">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Raport Vânzări Detaliate</h5>
              <Badge bg="info">{salesDetailed.length} înregistrări</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : salesDetailed.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Comandă ID</th>
                      <th>Data</th>
                      <th>Masă</th>
                      <th>Client</th>
                      <th>Produs</th>
                      <th>Categorie</th>
                      <th>Cantitate</th>
                      <th>Preț Unit</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesDetailed.map((item, index) => (
                      <tr key={`${item.order_id}-${index}`}>
                        <td>{item.order_id}</td>
                        <td>{formatDate(item.timestamp)}</td>
                        <td>{item.table_number || '—'}</td>
                        <td>{item.client_identifier || '—'}</td>
                        <td>{item.product_name}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td><strong>{formatCurrency(item.final_price)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="profitability" title="💰 Profitabilitate">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Raport Profitabilitate Produse</h5>
              {profitabilitySummary && (
                <div>
                  <Badge bg="success" className="me-2">
                    Total Venituri: {formatCurrency(profitabilitySummary.totalRevenue)}
                  </Badge>
                  <Badge bg="info">
                    Total Profit: {formatCurrency(profitabilitySummary.totalProfit)}
                  </Badge>
                </div>
              )}
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : profitability.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <>
                  {profitability.length > 0 && (
                    <div className="mb-4" style={{ height: '300px' }}>
                      <Bar data={getProfitabilityChartData()} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Produs</th>
                        <th>Categorie</th>
                        <th>Cantitate Vândută</th>
                        <th>Venit Total</th>
                        <th>Cost Total</th>
                        <th>Profit</th>
                        <th>Marjă %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitability.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.category}</td>
                          <td>{item.total_quantity_sold}</td>
                          <td>{formatCurrency(item.total_revenue)}</td>
                          <td>{formatCurrency(item.total_cost)}</td>
                          <td>
                            <strong className={item.profit >= 0 ? 'text-success' : 'text-danger'}>
                              {formatCurrency(item.profit)}
                            </strong>
                          </td>
                          <td>
                            <Badge bg={item.profit_margin_percent >= 30 ? 'success' : item.profit_margin_percent >= 20 ? 'warning' : 'danger'}>
                              {item.profit_margin_percent.toFixed(1)}%
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
        </Tab>

        <Tab eventKey="customer-behavior" title="👥 Comportament Clienți">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Raport Comportament Clienți</h5>
              {customerBehaviorSummary && (
                <Badge bg="info">
                  {customerBehaviorSummary.totalCustomers} clienți analizați
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : customerBehavior.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <>
                  {customerBehaviorSummary && (
                    <Row className="mb-4">
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <h6>Medie Comenzi/Client</h6>
                            <h4>{customerBehaviorSummary.avgOrdersPerCustomer.toFixed(1)}</h4>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <h6>Medie Cheltuit/Client</h6>
                            <h4>{formatCurrency(customerBehaviorSummary.avgSpentPerCustomer)}</h4>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <h6>Top Spender</h6>
                            <h6 className="text-muted">
                              {customerBehaviorSummary.topSpender?.client_identifier || '—'}
                            </h6>
                            <p className="mb-0">
                              {formatCurrency(customerBehaviorSummary.topSpender?.total_spent || 0)}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Total Comenzi</th>
                        <th>Total Cheltuit</th>
                        <th>Valoare Medie Comandă</th>
                        <th>Zile Vizitate</th>
                        <th>Diversitate Categorii</th>
                        <th>Prima Comandă</th>
                        <th>Ultima Comandă</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerBehavior.map((item, index) => (
                        <tr key={item.client_identifier || index}>
                          <td>{item.client_identifier || 'Anonim'}</td>
                          <td>{item.total_orders}</td>
                          <td><strong>{formatCurrency(item.total_spent)}</strong></td>
                          <td>{formatCurrency(item.avg_order_value)}</td>
                          <td>{item.unique_visit_days}</td>
                          <td>{item.category_diversity}</td>
                          <td>{formatDate(item.first_order)}</td>
                          <td>{formatDate(item.last_order)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="time-trends" title="📈 Trend-uri Temporale">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Raport Trend-uri Temporale</h5>
              {timeTrendsSummary && (
                <div>
                  <Badge bg="success" className="me-2">
                    Total Venituri: {formatCurrency(timeTrendsSummary.totalRevenue)}
                  </Badge>
                  <Badge bg="info">
                    Total Comenzi: {timeTrendsSummary.totalOrders}
                  </Badge>
                </div>
              )}
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : timeTrends.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <>
                  {timeTrends.length > 0 && (
                    <div className="mb-4" style={{ height: '400px' }}>
                      <Line data={getTimeTrendsChartData()} options={getTimeTrendsChartOptions()} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Perioadă</th>
                        <th>Total Comenzi</th>
                        <th>Venituri</th>
                        <th>Valoare Medie Comandă</th>
                        <th>Clienți Unici</th>
                        <th>Mese Servite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeTrends.map((item, index) => (
                        <tr key={item.period || index}>
                          <td><strong>{item.period}</strong></td>
                          <td>{item.total_orders}</td>
                          <td><strong>{formatCurrency(item.total_revenue)}</strong></td>
                          <td>{formatCurrency(item.avg_order_value)}</td>
                          <td>{item.unique_customers}</td>
                          <td>{item.tables_served}</td>
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

