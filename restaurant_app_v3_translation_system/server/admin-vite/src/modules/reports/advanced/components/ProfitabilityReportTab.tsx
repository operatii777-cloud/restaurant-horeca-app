// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { httpClient } from '@/shared/api/httpClient';

interface ProfitabilityReportData {
  period: { startDate: string; endDate: string };
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalGrossProfit: number;
    overallMargin: number;
    totalProducts: number;
  };
  products: Array<{
    productId: number;
    name: string;
    category: string;
    revenue: number;
    quantity: number;
    orders: number;
    sellingPrice: number;
    estimatedCost: number;
    totalCost: number;
    grossProfit: number;
    margin: number;
    marginPercent: number;
    profitability: 'High' | 'Medium' | 'Low';
  }>;
}

interface ProfitabilityReportTabProps {
  startDate: string;
  endDate: string;
  onExport?: (format: 'excel' | 'pdf') => void;
}

export const ProfitabilityReportTab: React.FC<ProfitabilityReportTabProps> = ({ startDate, endDate, onExport }) => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProfitabilityReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/reports/profitability', {
        params: { startDate, endDate },
      });
      setData(response.data);
    } catch (err: any) {
      console.error('Error loading profitability report:', err);
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
  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${Number(value).toFixed(1)}%`;
  };

  const getProfitabilityChartData = () => {
    if (!data || !data.products.length) return null;

    const topProducts = data.products.slice(0, 10);
    return {
      labels: topProducts.map(p => p.name),
      datasets: [
        {
          label: 'Profit Brut (RON)',
          data: topProducts.map(p => p.grossProfit),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getMarginChartData = () => {
    if (!data || !data.products.length) return null;

    const topProducts = data.products.slice(0, 10);
    return {
      labels: topProducts.map(p => p.name),
      datasets: [
        {
          label: 'Marjă (%)',
          data: topProducts.map(p => p.marginPercent),
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
              <h6>Total Costuri</h6>
              <h4 className="text-danger">{formatCurrency(data.summary.totalCost)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Profit Brut</h6>
              <h4 className="text-primary">{formatCurrency(data.summary.totalGrossProfit)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>"marja totala"</h6>
              <h4 className={data.summary.overallMargin > 30 ? 'text-success' : data.summary.overallMargin > 15 ? 'text-warning' : 'text-danger'}>
                {formatPercent(data.summary.overallMargin)}
              </h4>
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
              <h5 className="mb-0">Top 10 Produse - Profit Brut</h5>
            </Card.Header>
            <Card.Body>
              {getProfitabilityChartData() ? (
                <div style={{ height: '300px' }}>
                  <Bar data={getProfitabilityChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
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
              <h5 className="mb-0">Top 10 Produse - Marjă (%)</h5>
            </Card.Header>
            <Card.Body>
              {getMarginChartData() ? (
                <div style={{ height: '300px' }}>
                  <Bar data={getMarginChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              ) : (
                <Alert variant="info">Nu există date</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Products Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Profitabilitate Produse</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Produs</th>
                <th>Categorie</th>
                <th>Venituri</th>
                <th>Costuri</th>
                <th>Profit Brut</th>
                <th>"Marjă"</th>
                <th>Profitabilitate</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((prod) => (
                <tr key={prod.productId}>
                  <td><strong>{prod.name}</strong></td>
                  <td><Badge bg="secondary">{prod.category}</Badge></td>
                  <td>{formatCurrency(prod.revenue)}</td>
                  <td>{formatCurrency(prod.totalCost)}</td>
                  <td className={prod.grossProfit > 0 ? 'text-success' : 'text-danger'}>
                    <strong>{formatCurrency(prod.grossProfit)}</strong>
                  </td>
                  <td>
                    <Badge bg={prod.marginPercent > 30 ? 'success' : prod.marginPercent > 15 ? 'warning' : 'danger'}>
                      {formatPercent(prod.marginPercent)}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={prod.profitability === 'High' ? 'success' : prod.profitability === 'Medium' ? 'warning' : 'danger'}>
                      {prod.profitability === 'High' ? 'Ridicată' : prod.profitability === 'Medium' ? 'Medie' : 'Scăzută'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};




