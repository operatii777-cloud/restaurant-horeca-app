// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Row, Col, Button, Form } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ABCAnalysisPage.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface ABCProduct {
  product_name: string;
  category: string;
  abc_class: 'A' | 'B' | 'C';
  total_revenue: number;
  cumulative_percent: number;
  quantity_sold: number;
}

interface ABCSummary {
  classA: { count: number; revenue: number; percent: number };
  classB: { count: number; revenue: number; percent: number };
  classC: { count: number; revenue: number; percent: number };
  totalProducts: number;
  totalRevenue: number;
}

export const ABCAnalysisPage = () => {
//   const { t } = useTranslation();
  const [period, setPeriod] = useState('3');
  const [products, setProducts] = useState<ABCProduct[]>([]);
  const [summary, setSummary] = useState<ABCSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadABCAnalysis();
  }, [period]);

  const loadABCAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/reports/abc-analysis', {
        params: {
          period_months: period,
        },
      });

      if (response.data?.success) {
        // Backend-ul returneazÄƒ: { success: true, data: { summary: {...}, products: [...], ... } }
        const responseData = response.data.data;
        let rawProducts: any[] = [];
        
        if (Array.isArray(responseData)) {
          // Cazul cÃ¢nd data este direct un array
          rawProducts = responseData;
        } else if (responseData?.products && Array.isArray(responseData.products)) {
          // Cazul cÃ¢nd data este un obiect cu proprietatea products
          rawProducts = responseData.products;
        } else {
          console.warn('âŒ Format neaÈ™teptat pentru datele ABC:', responseData);
          rawProducts = [];
        }

        // MapeazÄƒ proprietÄƒÈ›ile backend la interfaÈ›a ABCProduct
        // Backend foloseÈ™te: category (pentru ABC class), total_quantity (pentru quantity_sold)
        const data: ABCProduct[] = rawProducts.map((p: any) => ({
          product_name: p.product_name || p.name || 'Produs necunoscut',
          category: p.category || 'FÄƒrÄƒ categorie',
          abc_class: (p.abc_class || p.category || 'C') as 'A' | 'B' | 'C', // Backend foloseÈ™te 'category' pentru ABC class
          total_revenue: parseFloat(p.total_revenue) || 0,
          cumulative_percent: parseFloat(p.cumulative_percent) || parseFloat(p.contribution_percent) || 0,
          quantity_sold: parseFloat(p.quantity_sold) || parseFloat(p.total_quantity) || 0,
        }));

        setProducts(data);

        // Calculate summary
        const classA = data.filter((p: ABCProduct) => p.abc_class === 'A');
        const classB = data.filter((p: ABCProduct) => p.abc_class === 'B');
        const classC = data.filter((p: ABCProduct) => p.abc_class === 'C');

        const totalRevenue = data.reduce((sum: number, p: ABCProduct) => sum + p.total_revenue, 0);
        const revenueA = classA.reduce((sum: number, p: ABCProduct) => sum + p.total_revenue, 0);
        const revenueB = classB.reduce((sum: number, p: ABCProduct) => sum + p.total_revenue, 0);
        const revenueC = classC.reduce((sum: number, p: ABCProduct) => sum + p.total_revenue, 0);

        setSummary({
          classA: {
            count: classA.length,
            revenue: revenueA,
            percent: totalRevenue > 0 ? (revenueA / totalRevenue) * 100 : 0,
          },
          classB: {
            count: classB.length,
            revenue: revenueB,
            percent: totalRevenue > 0 ? (revenueB / totalRevenue) * 100 : 0,
          },
          classC: {
            count: classC.length,
            revenue: revenueC,
            percent: totalRevenue > 0 ? (revenueC / totalRevenue) * 100 : 0,
          },
          totalProducts: data.length,
          totalRevenue,
        });
      }
    } catch (error) {
      console.error('âŒ Eroare la Ã®ncÄƒrcarea analizei ABC:', error);
      // Fallback pentru development
      const mockData: ABCProduct[] = [
        {
          product_name: 'Pizza Margherita',
          category: 'Pizza',
          abc_class: 'A',
          total_revenue: 15000,
          cumulative_percent: 25.5,
          quantity_sold: 500,
        },
        {
          product_name: 'Pizza Quattro Stagioni',
          category: 'Pizza',
          abc_class: 'A',
          total_revenue: 12000,
          cumulative_percent: 45.9,
          quantity_sold: 400,
        },
        {
          product_name: 'Pasta Carbonara',
          category: 'Pasta',
          abc_class: 'B',
          total_revenue: 8000,
          cumulative_percent: 59.5,
          quantity_sold: 300,
        },
        {
          product_name: 'SalatÄƒ Cezar',
          category: 'Salate',
          abc_class: 'C',
          total_revenue: 3000,
          cumulative_percent: 64.6,
          quantity_sold: 150,
        },
      ];
      setProducts(mockData);
      setSummary({
        classA: { count: 2, revenue: 27000, percent: 45.9 },
        classB: { count: 1, revenue: 8000, percent: 13.6 },
        classC: { count: 1, revenue: 3000, percent: 5.1 },
        totalProducts: 4,
        totalRevenue: 38000,
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  const barChartData = {
    labels: products.slice(0, 20).map((p) => p.product_name),
    datasets: [
      {
        label: 'Venit Total (RON)',
        data: products.slice(0, 20).map((p) => p.total_revenue),
        backgroundColor: products.slice(0, 20).map((p) =>
          p.abc_class === 'A' ? 'rgba(40, 167, 69, 0.8)' : p.abc_class === 'B' ? 'rgba(255, 193, 7, 0.8)' : 'rgba(220, 53, 69, 0.8)',
        ),
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 20 Produse - AnalizÄƒ ABC',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Venit (RON)',
        },
      },
    },
  };

  const pieChartData = summary
    ? {
        labels: ['Clasa A', 'Clasa B', 'Clasa C'],
        datasets: [
          {
            data: [summary.classA.revenue, summary.classB.revenue, summary.classC.revenue],
            backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(255, 193, 7, 0.8)', 'rgba(220, 53, 69, 0.8)'],
            borderColor: ['#28a745', '#ffc107', '#dc3545'],
            borderWidth: 2,
          },
        ],
      }
    : null;

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'DistribuÈ›ie Venituri pe Clase ABC',
      },
    },
  };

  return (
    <div className="abc-analysis-page">
      <h2 className="mb-4">Analiza ABC a Produselor Vândute</h2>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-chart-pie me-2"></i>Analiza ABC Produse</h5>
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              size="sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ width: "Auto", backgroundColor: '#bbdefb !important', color: '#000 !important', fontWeight: 'bold' }}
              className="form-select-blue"
            >
              <option value="1">Luna Trecuta</option>
              <option value="3">Ultimele 3 luni</option>
              <option value="6">Ultimele 6 luni</option>
              <option value="12">Ultimul an</option>
            </Form.Select>
            <Button variant="light" size="sm" onClick={loadABCAnalysis} disabled={loading} className="btn-refresh-blue">
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-1`}></i>Reîmprospătează</Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Summary Cards */}
          {summary && (
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-white bg-success">
                  <Card.Body>
                    <h4>Clasa A</h4>
                    <p className="mb-1">
                      <strong>{summary.classA.count}</strong> produse
                    </p>
                    <p className="mb-0">
                      <strong>{summary.classA.revenue.toFixed(2)} RON</strong>
                    </p>
                    <small>{summary.classA.percent.toFixed(1)}% din total</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-white bg-warning">
                  <Card.Body>
                    <h4>Clasa B</h4>
                    <p className="mb-1">
                      <strong>{summary.classB.count}</strong> produse
                    </p>
                    <p className="mb-0">
                      <strong>{summary.classB.revenue.toFixed(2)} RON</strong>
                    </p>
                    <small>{summary.classB.percent.toFixed(1)}% din total</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-white bg-danger">
                  <Card.Body>
                    <h4>Clasa C</h4>
                    <p className="mb-1">
                      <strong>{summary.classC.count}</strong> produse
                    </p>
                    <p className="mb-0">
                      <strong>{summary.classC.revenue.toFixed(2)} RON</strong>
                    </p>
                    <small>{summary.classC.percent.toFixed(1)}% din total</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-white bg-info">
                  <Card.Body>
                    <h4>Total</h4>
                    <p className="mb-1">
                      <strong>{summary.totalProducts}</strong> produse
                    </p>
                    <p className="mb-0">
                      <strong>{summary.totalRevenue.toFixed(2)} RON</strong>
                    </p>
                    <small>Venit total</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Charts */}
          <Row className="mb-4">
            <Col md={8}>
              <Card className="shadow-sm">
                <Card.Header>
                  <h6>
                    <i className="fas fa-chart-bar me-1"></i>Top 20 Produse - Clasificare ABC
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Header>
                  <h6>
                    <i className="fas fa-chart-pie me-1"></i>Distribuție Venituri pe Clase ABC</h6>
                </Card.Header>
                <Card.Body>
                  {pieChartData ? (
                    <div style={{ height: '400px' }}>
                      <Pie data={pieChartData} options={pieChartOptions} />
                    </div>
                  ) : (
                    <div className="text-center text-muted">Nu existÄƒ date</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Table */}
          <Card className="shadow-sm">
            <Card.Header>
              <h6>
                <i className="fas fa-list me-1"></i>Lista Completa Produse - Clasificare ABC</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Produs</th>
                      <th>Categorie</th>
                      <th>Clasa ABC</th>
                      <th>Venit Total</th>
                      <th>% Cumulat</th>
                      <th>Cantitate VÃ¢ndutÄƒ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center">
                          <i className="fas fa-spinner fa-spin me-2"></i>Se Ã®ncarcÄƒ...</td>
                      </tr>
                    ) : products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={index}>
                          <td>{product.product_name}</td>
                          <td>{product.category}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                product.abc_class === 'A' ? 'success' : product.abc_class === 'B' ? 'warning' : 'danger'
                              }`}
                            >
                              Clasa {product.abc_class}
                            </span>
                          </td>
                          <td>{product.total_revenue.toFixed(2)} RON</td>
                          <td>{product.cumulative_percent.toFixed(2)}%</td>
                          <td>{product.quantity_sold}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">Nu Există Date pentru Perioada Selectata</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </div>
  );
};





