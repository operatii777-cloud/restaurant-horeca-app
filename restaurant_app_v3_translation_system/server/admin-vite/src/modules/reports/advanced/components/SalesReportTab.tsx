// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Badge, Row, Col, Form } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { httpClient } from '@/shared/api/httpClient';

interface SalesReportData {
  period: { startDate: string; endDate: string };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalItems: number;
  };
  byCategory: Array<{
    name: string;
    revenue: number;
    quantity: number;
    orders: number;
    avgOrderValue: number;
  }>;
  byProduct: Array<{
    name: string;
    category: string;
    revenue: number;
    quantity: number;
    orders: number;
    avgPrice: number;
  }>;
}

interface SalesReportTabProps {
  startDate: string;
  endDate: string;
  onExport?: (format: 'excel' | 'pdf') => void;
}

export const SalesReportTab: React.FC<SalesReportTabProps> = ({ startDate, endDate, onExport }) => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalesReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/reports/sales-detailed', {
        params: { startDate, endDate },
      });
      setData(response.data);
    } catch (err: any) {
      console.error('Error loading sales report:', err);
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

  const getCategoryChartData = () => {
    if (!data || !data.byCategory.length) return null;

    return {
      labels: data.byCategory.slice(0, 10).map(c => c.name),
      datasets: [
        {
          label: 'Venituri (RON)',
          data: data.byCategory.slice(0, 10).map(c => c.revenue),
          backgroundColor: 'rgba(37, 99, 235, 0.5)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getProductChartData = () => {
    if (!data || !data.byProduct.length) return null;

    return {
      labels: data.byProduct.slice(0, 10).map(p => p.name),
      datasets: [
        {
          label: 'Venituri (RON)',
          data: data.byProduct.slice(0, 10).map(p => p.revenue),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Se încarcă...</span>
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
              <h6>Total Venituri</h6>
              <h4 className="text-success">{formatCurrency(data.summary.totalRevenue)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Total Comenzi</h6>
              <h4>{data.summary.totalOrders}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Valoare Medie Comandă</h6>
              <h4>{formatCurrency(data.summary.avgOrderValue)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Total Articole</h6>
              <h4>{data.summary.totalItems}</h4>
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
              <h5 className="mb-0">Top 10 Categorii</h5>
            </Card.Header>
            <Card.Body>
              {getCategoryChartData() ? (
                <div style={{ height: '300px' }}>
                  <Bar data={getCategoryChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
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
              <h5 className="mb-0">Top 10 Produse</h5>
            </Card.Header>
            <Card.Body>
              {getProductChartData() ? (
                <div style={{ height: '300px' }}>
                  <Bar data={getProductChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              ) : (
                <Alert variant="info">Nu există date</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Category Table */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">"vanzari pe categorii"</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Categorie</th>
                <th>Venituri</th>
                <th>Cantitate</th>
                <th>Comenzi</th>
                <th>Valoare Medie</th>
              </tr>
            </thead>
            <tbody>
              {data.byCategory.map((cat, idx) => (
                <tr key={idx}>
                  <td><strong>{cat.name}</strong></td>
                  <td>{formatCurrency(cat.revenue)}</td>
                  <td>{cat.quantity}</td>
                  <td>{cat.orders}</td>
                  <td>{formatCurrency(cat.avgOrderValue)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Product Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Top 50 Produse</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Produs</th>
                <th>Categorie</th>
                <th>Venituri</th>
                <th>Cantitate</th>
                <th>Comenzi</th>
                <th>Preț Mediu</th>
              </tr>
            </thead>
            <tbody>
              {data.byProduct.map((prod, idx) => (
                <tr key={idx}>
                  <td><strong>{prod.name}</strong></td>
                  <td><Badge bg="secondary">{prod.category}</Badge></td>
                  <td>{formatCurrency(prod.revenue)}</td>
                  <td>{prod.quantity}</td>
                  <td>{prod.orders}</td>
                  <td>{formatCurrency(prod.avgPrice)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};




