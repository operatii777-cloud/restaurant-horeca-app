import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Alert, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { Bar, Line, Pie } from 'react-chartjs-2';
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
} from 'chart.js';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './TopProductsPage.css';

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

interface TopProduct {
  id: number;
  name: string;
  category: string;
  times_ordered: number;
  total_quantity_sold: number;
  total_revenue: number;
  avg_selling_price: number;
  profit?: number;
  profit_margin_percent?: number;
}

interface ProductAnalytics {
  totalProducts: number;
  totalRevenue: number;
  avgOrderValue: number;
  topCategory: string;
  bestSeller: TopProduct | null;
}

export const TopProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('top-sold');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [limit, setLimit] = useState<number>(10);

  // Data states
  const [topProductsByRevenue, setTopProductsByRevenue] = useState<TopProduct[]>([]);
  const [topProductsByQuantity, setTopProductsByQuantity] = useState<TopProduct[]>([]);
  const [topProductsByOrders, setTopProductsByOrders] = useState<TopProduct[]>([]);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, limit]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Folosim endpointul de profitabilitate pentru a obține date despre produse
      const response = await httpClient.get('/api/admin/reports/profitability', {
        params: { startDate, endDate },
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        const products = response.data.data;

        // Sortare după venituri
        const byRevenue = [...products]
          .sort((a, b) => b.total_revenue - a.total_revenue)
          .slice(0, limit);
        setTopProductsByRevenue(byRevenue);

        // Sortare după cantitate
        const byQuantity = [...products]
          .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
          .slice(0, limit);
        setTopProductsByQuantity(byQuantity);

        // Sortare după număr comenzi
        const byOrders = [...products]
          .sort((a, b) => b.times_ordered - a.times_ordered)
          .slice(0, limit);
        setTopProductsByOrders(byOrders);

        // Calculează analytics
        const totalRevenue = products.reduce((sum: number, p: TopProduct) => sum + p.total_revenue, 0);
        const totalOrders = products.reduce((sum: number, p: TopProduct) => sum + p.times_ordered, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Găsește categoria cu cel mai mare venit
        const categoryRevenue: { [key: string]: number } = {};
        products.forEach((p: TopProduct) => {
          categoryRevenue[p.category] = (categoryRevenue[p.category] || 0) + p.total_revenue;
        });
        const topCategory = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

        setAnalytics({
          totalProducts: products.length,
          totalRevenue,
          avgOrderValue,
          topCategory,
          bestSeller: byRevenue[0] || null,
        });
      }
    } catch (err: any) {
      console.error('Error loading top products:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} RON`;
  };

  const getTopProductsChartData = (products: TopProduct[], label: string) => {
    return {
      labels: products.map((p) => p.name),
      datasets: [
        {
          label,
          data: products.map((p) =>
            label.includes('Venit') ? p.total_revenue : label.includes('Cantitate') ? p.total_quantity_sold : p.times_ordered
          ),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getCategoryChartData = () => {
    const categoryRevenue: { [key: string]: number } = {};
    topProductsByRevenue.forEach((p) => {
      categoryRevenue[p.category] = (categoryRevenue[p.category] || 0) + p.total_revenue;
    });

    return {
      labels: Object.keys(categoryRevenue),
      datasets: [
        {
          label: 'Venituri pe Categorie',
          data: Object.values(categoryRevenue),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="top-products-page">
      <PageHeader
        title="📊 Top Products & Analytics"
        description="Analiză produse top, vânzări și performanță"
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      {/* Statistics */}
      {analytics && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Total Produse</h6>
                <h4>{analytics.totalProducts}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Total Venituri</h6>
                <h4>{formatCurrency(analytics.totalRevenue)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Valoare Medie Comandă</h6>
                <h4>{formatCurrency(analytics.avgOrderValue)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Categoria Top</h6>
                <h6 className="text-muted">{analytics.topCategory}</h6>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
              <Form.Label>Număr Produse</Form.Label>
              <Form.Select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))}>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>&nbsp;</Form.Label>
              <div>
                <Button variant="primary" onClick={loadData}>
                  <i className="fas fa-sync me-2"></i>Actualizează
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
        <Tab eventKey="top-sold" title="💰 Top Venituri">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top {limit} Produse după Venituri</h5>
              <Badge bg="success">{topProductsByRevenue.length} produse</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : topProductsByRevenue.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <>
                  {topProductsByRevenue.length > 0 && (
                    <div className="mb-4" style={{ height: '300px' }}>
                      <Bar data={getTopProductsChartData(topProductsByRevenue, 'Venituri (RON)')} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produs</th>
                        <th>Categorie</th>
                        <th>Cantitate Vândută</th>
                        <th>Venit Total</th>
                        <th>Preț Mediu</th>
                        <th>Profit</th>
                        <th>Marjă %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductsByRevenue.map((product, index) => (
                        <tr key={product.id}>
                          <td>
                            <Badge bg="primary">{index + 1}</Badge>
                          </td>
                          <td><strong>{product.name}</strong></td>
                          <td>{product.category}</td>
                          <td>{product.total_quantity_sold}</td>
                          <td><strong>{formatCurrency(product.total_revenue)}</strong></td>
                          <td>{formatCurrency(product.avg_selling_price)}</td>
                          <td>
                            <strong className={product.profit && product.profit >= 0 ? 'text-success' : 'text-danger'}>
                              {product.profit ? formatCurrency(product.profit) : '—'}
                            </strong>
                          </td>
                          <td>
                            {product.profit_margin_percent !== undefined ? (
                              <Badge bg={product.profit_margin_percent >= 30 ? 'success' : product.profit_margin_percent >= 20 ? 'warning' : 'danger'}>
                                {product.profit_margin_percent.toFixed(1)}%
                              </Badge>
                            ) : (
                              '—'
                            )}
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

        <Tab eventKey="top-quantity" title="📦 Top Cantități">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top {limit} Produse după Cantitate Vândută</h5>
              <Badge bg="info">{topProductsByQuantity.length} produse</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : topProductsByQuantity.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <>
                  {topProductsByQuantity.length > 0 && (
                    <div className="mb-4" style={{ height: '300px' }}>
                      <Bar data={getTopProductsChartData(topProductsByQuantity, 'Cantitate Vândută')} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produs</th>
                        <th>Categorie</th>
                        <th>Cantitate Vândută</th>
                        <th>Venit Total</th>
                        <th>Număr Comenzi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductsByQuantity.map((product, index) => (
                        <tr key={product.id}>
                          <td>
                            <Badge bg="info">{index + 1}</Badge>
                          </td>
                          <td><strong>{product.name}</strong></td>
                          <td>{product.category}</td>
                          <td><strong>{product.total_quantity_sold}</strong></td>
                          <td>{formatCurrency(product.total_revenue)}</td>
                          <td>{product.times_ordered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="top-orders" title="🛒 Top Comenzi">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top {limit} Produse după Număr Comenzi</h5>
              <Badge bg="warning">{topProductsByOrders.length} produse</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : topProductsByOrders.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <>
                  {topProductsByOrders.length > 0 && (
                    <div className="mb-4" style={{ height: '300px' }}>
                      <Bar data={getTopProductsChartData(topProductsByOrders, 'Număr Comenzi')} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produs</th>
                        <th>Categorie</th>
                        <th>Număr Comenzi</th>
                        <th>Cantitate Totală</th>
                        <th>Venit Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductsByOrders.map((product, index) => (
                        <tr key={product.id}>
                          <td>
                            <Badge bg="warning">{index + 1}</Badge>
                          </td>
                          <td><strong>{product.name}</strong></td>
                          <td>{product.category}</td>
                          <td><strong>{product.times_ordered}</strong></td>
                          <td>{product.total_quantity_sold}</td>
                          <td>{formatCurrency(product.total_revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="analytics" title="📈 Analytics">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Analytics Produse</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : (
                <>
                  {topProductsByRevenue.length > 0 && (
                    <div className="mb-4" style={{ height: '400px' }}>
                      <Pie data={getCategoryChartData()} options={{ responsive: true }} />
                    </div>
                  )}
                  {analytics?.bestSeller && (
                    <Alert variant="success">
                      <h6><i className="fas fa-trophy me-2"></i>Best Seller</h6>
                      <p className="mb-1"><strong>Produs:</strong> {analytics.bestSeller.name}</p>
                      <p className="mb-1"><strong>Categorie:</strong> {analytics.bestSeller.category}</p>
                      <p className="mb-1"><strong>Venit Total:</strong> {formatCurrency(analytics.bestSeller.total_revenue)}</p>
                      <p className="mb-0"><strong>Cantitate Vândută:</strong> {analytics.bestSeller.total_quantity_sold}</p>
                    </Alert>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

