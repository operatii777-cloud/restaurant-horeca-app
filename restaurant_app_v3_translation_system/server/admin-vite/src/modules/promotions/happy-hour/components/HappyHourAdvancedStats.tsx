// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Badge, Spinner } from 'react-bootstrap';
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
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

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

interface HappyHourAdvancedStatsProps {
  happyHourId?: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  discount: number;
  orders: number;
}

interface TopProduct {
  product_id: number;
  product_name: string;
  quantity: number;
  revenue: number;
  discount: number;
}

export const HappyHourAdvancedStats = ({ happyHourId }: HappyHourAdvancedStatsProps) => {
//   const { t } = useTranslation();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        startDate,
        endDate,
      };
      if (happyHourId) {
        params.happyHourId = happyHourId;
      }

      const [revenueRes, productsRes] = await Promise.all([
        httpClient.get('/api/admin/happy-hour/stats/revenue', { params }),
        httpClient.get('/api/admin/happy-hour/stats/top-products', { params }),
      ]);

      setRevenueData(revenueRes.data || []);
      setTopProducts(productsRes.data || []);
    } catch (err: any) {
      console.error('Error loading Happy Hour stats:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea statisticilor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [startDate, endDate, happyHourId]);

  const revenueChartData = {
    labels: revenueData.map((d) => new Date(d.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: 'Venituri (RON)',
        data: revenueData.map((d) => d.revenue),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Discount (RON)',
        data: revenueData.map((d) => d.discount),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evoluție Venituri & Discount Happy Hour',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'RON',
        },
      },
    },
  };

  const topProductsChartData = {
    labels: topProducts.slice(0, 10).map((p) => p.product_name),
    datasets: [
      {
        label: 'Cantitate vândută',
        data: topProducts.slice(0, 10).map((p) => p.quantity),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topProductsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 10 Produse Vândute în Happy Hour',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantitate',
        },
      },
    },
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalDiscount = revenueData.reduce((sum, d) => sum + d.discount, 0);
  const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="happy-hour-advanced-stats">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <i className="fas fa-chart-line me-2"></i>
          Statistici Avansate Happy Hour
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Data Start</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Data End</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="primary" onClick={loadStats} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />Se încarcă...</>
                ) : (
                  <>
                    <i className="fas fa-sync me-2"></i>"Reîncarcă"</>
                )}
              </Button>
            </Col>
          </Row>

          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Summary Cards */}
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-white bg-success">
                    <Card.Body>
                      <h6>Total Venituri</h6>
                      <h3>{totalRevenue.toFixed(2)} RON</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-white bg-danger">
                    <Card.Body>
                      <h6>Total Discount</h6>
                      <h3>{totalDiscount.toFixed(2)} RON</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-white bg-info">
                    <Card.Body>
                      <h6>Total Comenzi</h6>
                      <h3>{totalOrders}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-white bg-warning">
                    <Card.Body>
                      <h6>Valoare Medie Comandă</h6>
                      <h3>{avgOrderValue.toFixed(2)} RON</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Revenue Chart */}
              <Card className="mb-4">
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    {revenueData.length > 0 ? (
                      <Line data={revenueChartData} options={revenueChartOptions} />
                    ) : (
                      <div className="text-center text-muted py-5">
                        <i className="fas fa-chart-line fa-3x mb-3"></i>
                        <p>"nu exista date pentru perioada selectata"</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>

              {/* Top Products */}
              <Row>
                <Col md={7}>
                  <Card>
                    <Card.Header>
                      <h5>"top produse vandute"</h5>
                    </Card.Header>
                    <Card.Body>
                      {topProducts.length > 0 ? (
                        <div style={{ height: '300px' }}>
                          <Bar data={topProductsChartData} options={topProductsChartOptions} />
                        </div>
                      ) : (
                        <div className="text-center text-muted py-5">
                          <i className="fas fa-box fa-3x mb-3"></i>
                          <p>"nu exista produse vandute in happy hour pentru per"</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={5}>
                  <Card>
                    <Card.Header>
                      <h5>"detalii top produse"</h5>
                    </Card.Header>
                    <Card.Body>
                      {topProducts.length > 0 ? (
                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: "Auto" }}>
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>Produs</th>
                                <th>Cantitate</th>
                                <th>Venit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topProducts.slice(0, 10).map((product) => (
                                <tr key={product.product_id}>
                                  <td>{product.product_name}</td>
                                  <td>
                                    <Badge bg="primary">{product.quantity}</Badge>
                                  </td>
                                  <td>{product.revenue.toFixed(2)} RON</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-muted text-center">"nu exista date"</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};





