import React, { useState, useEffect } from 'react';
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
} from 'chart.js';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import { ProfitLossPage } from '@/modules/reports/pages/ProfitLossPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FinancialReportsPage.css';

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

interface VATBreakdown {
  vat_rate: number;
  taxable_base: number;
  vat_amount: number;
  total: number;
}

interface FinancialSummary {
  totalRevenue: number;
  totalVAT: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export const FinancialReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('profit-loss');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Data states
  const [vatBreakdown, setVATBreakdown] = useState<VATBreakdown[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'profit-loss') {
      loadFinancialData();
    }
  }, [activeTab, startDate, endDate]);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load Profit & Loss data for summary
      const plResponse = await httpClient.get('/api/reports/profit-loss', {
        params: { start_date: startDate, end_date: endDate },
      });

      if (plResponse.data) {
        const totals = plResponse.data.totals || {};
        const totalRevenue = totals.total_revenue || 0;
        const totalCosts = totals.total_costs || 0;
        const totalProfit = totals.total_profit || (totalRevenue - totalCosts);
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        // Estimate VAT (21% of revenue, simplified)
        const estimatedVAT = totalRevenue * 0.21 / 1.21;
        const netProfit = totalProfit - estimatedVAT;

        setFinancialSummary({
          totalRevenue,
          totalVAT: estimatedVAT,
          totalCosts,
          grossProfit: totalProfit,
          netProfit,
          profitMargin,
        });

        // VAT Breakdown (simplified - would need actual order data with VAT rates)
        const vat21Base = totalRevenue * 0.8; // Assume 80% at 21%
        const vat11Base = totalRevenue * 0.2; // Assume 20% at 11%
        const vat21Amount = vat21Base * 0.21 / 1.21;
        const vat11Amount = vat11Base * 0.11 / 1.11;

        setVATBreakdown([
          {
            vat_rate: 21,
            taxable_base: vat21Base,
            vat_amount: vat21Amount,
            total: vat21Base,
          },
          {
            vat_rate: 11,
            taxable_base: vat11Base,
            vat_amount: vat11Amount,
            total: vat11Base,
          },
        ]);
      }

      // Load monthly revenue from time trends
      const trendsResponse = await httpClient.get('/api/admin/reports/time-trends', {
        params: { startDate, endDate, period: 'monthly' },
      });

      if (trendsResponse.data?.success) {
        setMonthlyRevenue(trendsResponse.data.data || []);
      }
    } catch (err: any) {
      console.error('Error loading financial data:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea datelor financiare');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} RON`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Chart data for Monthly Revenue
  const getMonthlyRevenueChartData = () => {
    return {
      labels: monthlyRevenue.map((item) => item.period),
      datasets: [
        {
          label: 'Venituri (RON)',
          data: monthlyRevenue.map((item) => item.total_revenue),
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Chart data for VAT Breakdown
  const getVATChartData = () => {
    return {
      labels: vatBreakdown.map((item) => `${item.vat_rate}%`),
      datasets: [
        {
          label: 'TVA Colectat',
          data: vatBreakdown.map((item) => item.vat_amount),
          backgroundColor: [
            'rgba(37, 99, 235, 0.5)',
            'rgba(34, 197, 94, 0.5)',
          ],
          borderColor: [
            'rgba(37, 99, 235, 1)',
            'rgba(34, 197, 94, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="financial-reports-page">
      <PageHeader
        title="💰 Rapoarte Financiare"
        description="Rapoarte financiare complete: Profit & Loss, TVA, venituri și analiză financiară"
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      {/* Summary Statistics */}
      {financialSummary && (
        <Row className="mb-4">
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h6>Venituri Totale</h6>
                <h4 className="text-success">{formatCurrency(financialSummary.totalRevenue)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h6>TVA Colectat</h6>
                <h4 className="text-primary">{formatCurrency(financialSummary.totalVAT)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h6>Costuri Totale</h6>
                <h4 className="text-danger">{formatCurrency(financialSummary.totalCosts)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h6>Profit Brut</h6>
                <h4 className="text-success">{formatCurrency(financialSummary.grossProfit)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h6>Profit Net</h6>
                <h4 className="text-success">{formatCurrency(financialSummary.netProfit)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h6>Marjă Profit</h6>
                <h4 className="text-info">{formatPercent(financialSummary.profitMargin)}</h4>
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
                <Button variant="primary" onClick={loadFinancialData} disabled={loading}>
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
        <Tab eventKey="profit-loss" title="💰 Profit & Loss">
          <ProfitLossPage />
        </Tab>

        <Tab eventKey="vat" title="📊 TVA & Fiscalitate">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Defalcare TVA</h5>
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
                  {vatBreakdown.length > 0 && (
                    <div className="mb-4" style={{ height: '300px' }}>
                      <Pie data={getVATChartData()} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Cotă TVA</th>
                        <th>Bază Impozabilă</th>
                        <th>TVA Colectat</th>
                        <th>Total cu TVA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vatBreakdown.map((item, index) => (
                        <tr key={index}>
                          <td><strong>{item.vat_rate}%</strong></td>
                          <td>{formatCurrency(item.taxable_base)}</td>
                          <td><strong>{formatCurrency(item.vat_amount)}</strong></td>
                          <td>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                      {vatBreakdown.length > 0 && (
                        <tr className="table-info">
                          <td><strong>TOTAL</strong></td>
                          <td>
                            <strong>
                              {formatCurrency(vatBreakdown.reduce((sum, item) => sum + item.taxable_base, 0))}
                            </strong>
                          </td>
                          <td>
                            <strong>
                              {formatCurrency(vatBreakdown.reduce((sum, item) => sum + item.vat_amount, 0))}
                            </strong>
                          </td>
                          <td>
                            <strong>
                              {formatCurrency(vatBreakdown.reduce((sum, item) => sum + item.total, 0))}
                            </strong>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="revenue" title="📈 Venituri">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Venituri pe Lună</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : monthlyRevenue.length === 0 ? (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              ) : (
                <>
                  {monthlyRevenue.length > 0 && (
                    <div className="mb-4" style={{ height: '400px' }}>
                      <Line data={getMonthlyRevenueChartData()} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Lună</th>
                        <th>Total Comenzi</th>
                        <th>Venituri</th>
                        <th>Valoare Medie Comandă</th>
                        <th>Clienți Unici</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRevenue.map((item, index) => (
                        <tr key={index}>
                          <td><strong>{item.period}</strong></td>
                          <td>{item.total_orders}</td>
                          <td><strong>{formatCurrency(item.total_revenue)}</strong></td>
                          <td>{formatCurrency(item.avg_order_value)}</td>
                          <td>{item.unique_customers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="summary" title="📋 Rezumat">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Rezumat Financiar</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : financialSummary ? (
                <Row>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <h6>Venituri</h6>
                        <h3 className="text-success">{formatCurrency(financialSummary.totalRevenue)}</h3>
                        <p className="text-muted mb-0">Total venituri pentru perioada selectată</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <h6>Costuri</h6>
                        <h3 className="text-danger">{formatCurrency(financialSummary.totalCosts)}</h3>
                        <p className="text-muted mb-0">Total costuri pentru perioada selectată</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <h6>Profit Brut</h6>
                        <h3 className="text-success">{formatCurrency(financialSummary.grossProfit)}</h3>
                        <p className="text-muted mb-0">Venituri - Costuri</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <h6>Profit Net</h6>
                        <h3 className="text-success">{formatCurrency(financialSummary.netProfit)}</h3>
                        <p className="text-muted mb-0">Profit Brut - TVA</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={12}>
                    <Card>
                      <Card.Body className="text-center">
                        <h6>Marjă de Profit</h6>
                        <h2 className={financialSummary.profitMargin >= 30 ? 'text-success' : financialSummary.profitMargin >= 20 ? 'text-warning' : 'text-danger'}>
                          {formatPercent(financialSummary.profitMargin)}
                        </h2>
                        <p className="text-muted mb-0">
                          {financialSummary.profitMargin >= 30
                            ? '✅ Excelent'
                            : financialSummary.profitMargin >= 20
                            ? '⚠️ Acceptabil'
                            : '❌ Necesită atenție'}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              ) : (
                <Alert variant="info">Nu există date pentru perioada selectată</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

