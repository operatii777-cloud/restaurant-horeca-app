// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Badge, Row, Col, Form } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import { httpClient } from '@/shared/api/httpClient';

interface TimeTrendsReportData {
  period: { startDate: string; endDate: string };
  groupBy: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    periods: number;
  };
  trends: Array<{
    period: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
    byType: Record<string, { revenue: number; orders: number }>;
    byCategory: Record<string, { revenue: number; quantity: number }>;
  }>;
  growthRates: Array<{
    period: string;
    revenueGrowth: number;
    ordersGrowth: number;
  }>;
}

interface TimeTrendsReportTabProps {
  startDate: string;
  endDate: string;
  onExport?: (format: 'excel' | 'pdf') => void;
}

export const TimeTrendsReportTab: React.FC<TimeTrendsReportTabProps> = ({ startDate, endDate, onExport }) => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TimeTrendsReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  useEffect(() => {
    loadReport();
  }, [startDate, endDate, groupBy]);

  const loadReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/reports/time-trends', {
        params: { startDate, endDate, groupBy },
      });
      setData(response.data);
    } catch (err: any) {
      console.error('Error loading time trends report:', err);
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
      return '+0.0%';
    }
    const sign = Number(value) >= 0 ? '+' : '';
    return `"Sign"${Number(value).toFixed(1)}%`;
  };

  const getRevenueTrendChartData = () => {
    if (!data || !data.trends.length) return null;

    return {
      labels: data.trends.map(t => t.period),
      datasets: [
        {
          label: 'Venituri (RON)',
          data: data.trends.map(t => t.revenue),
          borderColor: 'rgba(37, 99, 235, 1)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getOrdersTrendChartData = () => {
    if (!data || !data.trends.length) return null;

    return {
      labels: data.trends.map(t => t.period),
      datasets: [
        {
          label: 'Comenzi',
          data: data.trends.map(t => t.orders),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getGrowthRatesChartData = () => {
    if (!data || !data.growthRates.length) return null;

    return {
      labels: data.growthRates.map(g => g.period),
      datasets: [
        {
          label: 'Creștere Venituri (%)',
          data: data.growthRates.map(g => g.revenueGrowth),
          borderColor: 'rgba(37, 99, 235, 1)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: false,
        },
        {
          label: 'Creștere Comenzi (%)',
          data: data.growthRates.map(g => g.ordersGrowth),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
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
              <h6>"perioade analizate"</h6>
              <h4>{data.summary.periods}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Group By Selector */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Label>"grupare dupa"</Form.Label>
              <Form.Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
                <option value="hour">Oră</option>
                <option value="day">Zi</option>
                <option value="week">"Săptămână"</option>
                <option value="month">"Lună"</option>
              </Form.Select>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <div className="d-flex gap-2">
                <Button variant="success" onClick={() => onExport?.('excel')}>
                  <i className="fas fa-file-excel me-2"></i>Export Excel
                </Button>
                <Button variant="danger" onClick={() => onExport?.('pdf')}>
                  <i className="fas fa-file-pdf me-2"></i>Export PDF
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">"evolutie venituri"</h5>
            </Card.Header>
            <Card.Body>
              {getRevenueTrendChartData() ? (
                <div style={{ height: '400px' }}>
                  <Line data={getRevenueTrendChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              ) : (
                <Alert variant="info">Nu există date</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">"evolutie comenzi"</h5>
            </Card.Header>
            <Card.Body>
              {getOrdersTrendChartData() ? (
                <div style={{ height: '300px' }}>
                  <Line data={getOrdersTrendChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
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
              <h5 className="mb-0">"rate de crestere"</h5>
            </Card.Header>
            <Card.Body>
              {getGrowthRatesChartData() ? (
                <div style={{ height: '300px' }}>
                  <Line data={getGrowthRatesChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              ) : (
                <Alert variant="info">Nu există date</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trends Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">"detalii trend uri"</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Perioadă</th>
                <th>Venituri</th>
                <th>Comenzi</th>
                <th>Valoare Medie</th>
                <th>"crestere venituri"</th>
                <th>"crestere comenzi"</th>
              </tr>
            </thead>
            <tbody>
              {data.trends.map((trend, idx) => {
                const growth = data.growthRates.find(g => g.period === trend.period);
                return (
                  <tr key={idx}>
                    <td><strong>{trend.period}</strong></td>
                    <td className="text-success"><strong>{formatCurrency(trend.revenue)}</strong></td>
                    <td>{trend.orders}</td>
                    <td>{formatCurrency(trend.avgOrderValue)}</td>
                    <td>
                      {growth && (
                        <Badge bg={growth.revenueGrowth >= 0 ? 'success' : 'danger'}>
                          {formatPercent(growth.revenueGrowth)}
                        </Badge>
                      )}
                    </td>
                    <td>
                      {growth && (
                        <Badge bg={growth.ordersGrowth >= 0 ? 'success' : 'danger'}>
                          {formatPercent(growth.ordersGrowth)}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};




