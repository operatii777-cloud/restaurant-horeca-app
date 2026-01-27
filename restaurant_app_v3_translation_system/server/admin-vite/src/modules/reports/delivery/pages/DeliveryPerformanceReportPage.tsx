// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Form, Row, Col, Table, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { StatCard } from '@/shared/components/StatCard';
import './DeliveryPerformanceReportPage.css';

interface DeliveryPerformanceData {
  period: { start: string; end: string };
  summary: {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    cancelled_orders: number;
    cancellation_rate: string;
    breakdown_by_source: Array<{
      order_source: string;
      count: number;
      revenue: number;
      avg_prep_time_minutes: number;
      cancelled: number;
    }>;
    breakdown_by_platform: Array<{
      platform: string;
      count: number;
      revenue: number;
      commission: number;
    }>;
    financial: {
      gross_revenue: number;
      platform_commissions: number;
      delivery_fees_charged: number;
      packaging_costs: number;
      net_revenue: number;
    };
  };
  couriers: Array<{
    id: number;
    name: string;
    deliveries_count: number;
    rating: number;
    total_earned: number;
  }>;
  cancellations: Array<{
    reason_code: string;
    count: number;
  }>;
}

const PLATFORM_ICONS: Record<string, string> = {
  glovo: '🛵',
  wolt: '🔵',
  bolt_food: '🍏',
  friendsride: '🟣',
  tazz: '⚡',
  phone: '📞',
  online: '🌐'
};

export const DeliveryPerformanceReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [data, setData] = useState<DeliveryPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
      
      const response = await httpClient.get(
        `/api/reports/delivery-performance?${params.toString()}`
      );
      
      // axios returnează { data: {...} }, iar backend returnează direct obiectul
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Error fetching delivery performance report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    alert('Export PDF - Funcționalitate în dezvoltare');
  };

  const exportExcel = () => {
    alert('Export Excel - Funcționalitate în dezvoltare');
  };

  if (loading) {
    return (
      <div className="delivery-performance-page">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-performance-page">
      <div className="page-header">
        <h1><i className="fas fa-chart-line me-2"></i>"raport performance delivery"</h1>
        <div className="header-actions">
          <Button variant="outline-primary" onClick={exportPDF} className="me-2">
            <i className="fas fa-file-pdf me-1"></i>Export PDF
          </Button>
          <Button variant="outline-success" onClick={exportExcel}>
            <i className="fas fa-file-excel me-1"></i>Export Excel
          </Button>
        </div>
      </div>

      {/* Filtre - Afișat ÎNTOTDEAUNA */}
      <Card className="mb-4">
        <Card.Header>
          <h5>"filtre perioada"</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>De la</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Până la</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Col>
            <Col md={4}>
              <Form.Label>&nbsp;</Form.Label>
              <Button variant="primary" onClick={fetchReport} className="w-100" disabled={loading}>
                <i className="fas fa-sync-alt me-1"></i>
                {loading ? 'Se încarcă...' : 'Actualizează'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {!data && !loading && (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">"nu exista date pentru perioada selectata"</p>
            <p className="text-muted small mt-2">
              Perioada: {new Date(dateRange.start).toLocaleDateString('ro-RO')} - {new Date(dateRange.end).toLocaleDateString('ro-RO')}
            </p>
          </Card.Body>
        </Card>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <Row className="mb-4">
        <Col md={3}>
          <StatCard
            title="Total Comenzi"
            value={data.summary.total_orders.toString()}
            helper={`Valoare: ${data.summary.total_revenue.toFixed(2)} RON`}
            icon={<span>📦</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Valoare Medie"
            value={`${data.summary.avg_order_value.toFixed(2)} RON`}
            helper="Per comandă"
            icon={<span>💰</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Anulări"
            value={data.summary.cancelled_orders.toString()}
            helper={`${data.summary.cancellation_rate}% rată anulare`}
            icon={<span>❌</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Venit Net"
            value={`${data.summary.financial.net_revenue.toFixed(2)} RON`}
            helper="După comisioane și costuri"
            icon={<span>💵</span>}
          />
        </Col>
      </Row>

      {/* Breakdown by Source */}
      <Card className="mb-4">
        <Card.Header>
          <h5>"breakdown pe tip comanda"</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Tip</th>
                <th>"numar comenzi"</th>
                <th>Venit</th>
                <th>Timp Mediu Preparare</th>
                <th>"Anulări"</th>
              </tr>
            </thead>
            <tbody>
              {data.summary.breakdown_by_source.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <Badge bg={item.order_source === 'DELIVERY' ? 'primary' : 'warning'}>
                      {item.order_source === 'DELIVERY' ? '🛵 DELIVERY' : '🚗 DRIVE-THRU'}
                    </Badge>
                  </td>
                  <td>{item.count}</td>
                  <td>{item.revenue.toFixed(2)} RON</td>
                  <td>{item.avg_prep_time_minutes ? `${item.avg_prep_time_minutes.toFixed(1)} min` : 'N/A'}</td>
                  <td>{item.cancelled}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Breakdown by Platform */}
      {data.summary.breakdown_by_platform.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5>"breakdown pe platforma"</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Platformă</th>
                  <th>"numar comenzi"</th>
                  <th>Venit</th>
                  <th>Comision</th>
                  <th>Venit Net</th>
                </tr>
              </thead>
              <tbody>
                {data.summary.breakdown_by_platform.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <Badge bg="light" text="dark">
                        {PLATFORM_ICONS[item.platform] || '📱'} {item.platform}
                      </Badge>
                    </td>
                    <td>{item.count}</td>
                    <td>{item.revenue.toFixed(2)} RON</td>
                    <td>{item.commission.toFixed(2)} RON</td>
                    <td>{(item.revenue - item.commission).toFixed(2)} RON</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Financial Summary */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Sumar Financiar</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Venit Brut:</strong> {data.summary.financial.gross_revenue.toFixed(2)} RON</p>
              <p><strong>"comisioane platforme"</strong> {data.summary.financial.platform_commissions.toFixed(2)} RON</p>
              <p><strong>Taxe Livrare:</strong> {data.summary.financial.delivery_fees_charged.toFixed(2)} RON</p>
            </Col>
            <Col md={6}>
              <p><strong>"costuri ambalaje"</strong> {data.summary.financial.packaging_costs.toFixed(2)} RON</p>
              <p><strong>Venit Net:</strong> <strong className="text-success">{data.summary.financial.net_revenue.toFixed(2)} RON</strong></p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Couriers */}
      {data.couriers.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5>"top curieri"</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Curier</th>
                  <th>"Livrări"</th>
                  <th>Rating</th>
                  <th>"Câștigat"</th>
                </tr>
              </thead>
              <tbody>
                {data.couriers.map((courier) => (
                  <tr key={courier.id}>
                    <td>{courier.name}</td>
                    <td>{courier.deliveries_count}</td>
                    <td>{courier.rating.toFixed(1)} ⭐</td>
                    <td>{courier.total_earned.toFixed(2)} RON</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Cancellations */}
      {data.cancellations.length > 0 && (
        <Card>
          <Card.Header>
            <h5>"anulari pe motiv"</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Motiv</th>
                  <th>"Număr"</th>
                </tr>
              </thead>
              <tbody>
                {data.cancellations.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.reason_code || 'Nespecificat'}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
        </>
      )}
    </div>
  );
};






