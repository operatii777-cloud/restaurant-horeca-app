// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { httpClient } from '@/shared/api/httpClient';

interface CustomerBehaviorReportData {
  period: { startDate: string; endDate: string };
  summary: {
    totalCustomers: number;
    totalRevenue: number;
    avgRevenuePerCustomer: number;
    avgVisitsPerCustomer: number;
    avgOrderValue: number;
    vipCustomers: number;
    regularCustomers: number;
    occasionalCustomers: number;
  };
  customers: Array<{
    name: string;
    phone: string | null;
    email: string | null;
    visits: number;
    totalSpent: number;
    avgOrderValue: number;
    favoriteCategory: string;
    favoriteProduct: string;
    firstVisit: string;
    lastVisit: string;
  }>;
  segments: {
    vip: Array<any>;
    regular: Array<any>;
    occasional: Array<any>;
  };
}

interface CustomerBehaviorReportTabProps {
  startDate: string;
  endDate: string;
  onExport?: (format: 'excel' | 'pdf') => void;
}

export const CustomerBehaviorReportTab: React.FC<CustomerBehaviorReportTabProps> = ({ startDate, endDate, onExport }) => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CustomerBehaviorReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/reports/customer-behavior', {
        params: { startDate, endDate },
      });
      setData(response.data);
    } catch (err: any) {
      console.error('Error loading customer behavior report:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00 RON';
    }
    return `${Number(value).toFixed(2)} RON`;
  };

  const getSegmentChartData = () => {
    if (!data) return null;

    return {
      labels: ['VIP', 'Regulari', 'Ocazionali'],
      datasets: [
        {
          label: 'Număr Clienți',
          data: [
            data.summary.vipCustomers,
            data.summary.regularCustomers,
            data.summary.occasionalCustomers,
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.5)',
            'rgba(37, 99, 235, 0.5)',
            'rgba(245, 158, 11, 0.5)',
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(37, 99, 235, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getTopCustomersChartData = () => {
    if (!data || !data.customers.length) return null;

    const top10 = data.customers.slice(0, 10);
    return {
      labels: top10.map(c => c.name || 'Guest'),
      datasets: [
        {
          label: 'Total Cheltuit (RON)',
          data: top10.map(c => c.totalSpent),
          backgroundColor: 'rgba(37, 99, 235, 0.5)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">"se incarca"</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!data) {
    return <Alert variant="info">"selecteaza o perioada pentru a genera raportul"</Alert>;
  }

  return (
    <div>
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>"total clienti"</h6>
              <h4>{data.summary.totalCustomers}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Total Venituri</h6>
              <h4 className="text-success">{formatCurrency(data.summary.totalRevenue)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Venit Mediu/Client</h6>
              <h4>{formatCurrency(data.summary.avgRevenuePerCustomer)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Vizite Medii/Client</h6>
              <h4>{(data.summary.avgVisitsPerCustomer ?? 0).toFixed(1)}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Segment Summary */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-success">
            <Card.Body>
              <h6>"clienti vip"</h6>
              <h4 className="text-success">{data.summary.vipCustomers}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h6>"clienti regulari"</h6>
              <h4 className="text-primary">{data.summary.regularCustomers}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h6>"clienti ocazionali"</h6>
              <h4 className="text-warning">{data.summary.occasionalCustomers}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Export Buttons */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex gap-2">
                <Button variant="success" onClick={() => onExport?.('excel')}>
                  <i className="fas fa-file-excel me-2"></i>Export Excel
                </Button>
                <Button variant="danger" onClick={() => onExport?.('pdf')}>
                  <i className="fas fa-file-pdf me-2"></i>Export PDF
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">"segmente clienti"</h5>
            </Card.Header>
            <Card.Body>
              {getSegmentChartData() ? (
                <div style={{ height: '300px' }}>
                  <Pie data={getSegmentChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              ) : (
                <Alert variant="info">Nu există date</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top 10 Clienți</h5>
            </Card.Header>
            <Card.Body>
              {getTopCustomersChartData() ? (
                <div style={{ height: '300px' }}>
                  <Bar data={getTopCustomersChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              ) : (
                <Alert variant="info">Nu există date</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Customers Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Top 100 Clienți</h5>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="all" className="mb-3">
            <Tab eventKey="all" title={`Toți (${data.customers.length})`}>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Contact</th>
                    <th>Vizite</th>
                    <th>Total Cheltuit</th>
                    <th>Valoare Medie</th>
                    <th>"categorie preferata"</th>
                    <th>Produs Preferat</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((customer, idx) => (
                    <tr key={idx}>
                      <td><strong>{customer.name}</strong></td>
                      <td>
                        {customer.phone && <div>{customer.phone}</div>}
                        {customer.email && <div className="text-muted small">{customer.email}</div>}
                      </td>
                      <td>{customer.visits}</td>
                      <td className="text-success"><strong>{formatCurrency(customer.totalSpent)}</strong></td>
                      <td>{formatCurrency(customer.avgOrderValue)}</td>
                      <td><Badge bg="info">{customer.favoriteCategory}</Badge></td>
                      <td className="small">{customer.favoriteProduct}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="vip" title={`VIP (${data.segments.vip.length})`}>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Contact</th>
                    <th>Vizite</th>
                    <th>Total Cheltuit</th>
                    <th>Valoare Medie</th>
                  </tr>
                </thead>
                <tbody>
                  {data.segments.vip.map((customer: any, idx: number) => (
                    <tr key={idx}>
                      <td><strong>{customer.name}</strong></td>
                      <td>
                        {customer.phone && <div>{customer.phone}</div>}
                        {customer.email && <div className="text-muted small">{customer.email}</div>}
                      </td>
                      <td>{customer.visits}</td>
                      <td className="text-success"><strong>{formatCurrency(customer.totalSpent)}</strong></td>
                      <td>{formatCurrency(customer.avgOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="regular" title={`Regulari (${data.segments.regular.length})`}>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Contact</th>
                    <th>Vizite</th>
                    <th>Total Cheltuit</th>
                    <th>Valoare Medie</th>
                  </tr>
                </thead>
                <tbody>
                  {data.segments.regular.map((customer: any, idx: number) => (
                    <tr key={idx}>
                      <td><strong>{customer.name}</strong></td>
                      <td>
                        {customer.phone && <div>{customer.phone}</div>}
                        {customer.email && <div className="text-muted small">{customer.email}</div>}
                      </td>
                      <td>{customer.visits}</td>
                      <td className="text-primary"><strong>{formatCurrency(customer.totalSpent)}</strong></td>
                      <td>{formatCurrency(customer.avgOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="occasional" title={`Ocazionali (${data.segments.occasional.length})`}>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Contact</th>
                    <th>Vizite</th>
                    <th>Total Cheltuit</th>
                    <th>Valoare Medie</th>
                  </tr>
                </thead>
                <tbody>
                  {data.segments.occasional.map((customer: any, idx: number) => (
                    <tr key={idx}>
                      <td><strong>{customer.name}</strong></td>
                      <td>
                        {customer.phone && <div>{customer.phone}</div>}
                        {customer.email && <div className="text-muted small">{customer.email}</div>}
                      </td>
                      <td>{customer.visits}</td>
                      <td className="text-warning"><strong>{formatCurrency(customer.totalSpent)}</strong></td>
                      <td>{formatCurrency(customer.avgOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};




