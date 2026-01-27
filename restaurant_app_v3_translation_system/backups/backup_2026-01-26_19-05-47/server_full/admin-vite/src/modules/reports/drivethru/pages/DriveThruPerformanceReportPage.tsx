// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Table, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { StatCard } from '@/shared/components/StatCard';
import './DriveThruPerformanceReportPage.css';

interface DriveThruPerformanceData {
  period: { start: string; end: string };
  summary: {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    avg_service_time_minutes: number;
    orders_under_3min: number;
    orders_over_5min: number;
    orders_under_3min_percent: number;
    orders_over_5min_percent: number;
  };
  by_lane: Array<{
    lane_number: string;
    count: number;
    revenue: number;
    avg_time_minutes: number;
  }>;
  hourly_heatmap: Array<{
    hour: number;
    count: number;
    avg_time_minutes: number;
  }>;
}

export const DriveThruPerformanceReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [data, setData] = useState<DriveThruPerformanceData | null>(null);
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
      // Folosim același endpoint dar filtrăm pentru drive-thru
      const params = new URLSearchParams();
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
      params.append('order_source', 'DRIVE_THRU');
      
      const response = await httpClient.get<any>(
        `/api/reports/delivery-performance?${params.toString()}`
      );
      
      if (response.data) {
        // Transformăm datele pentru drive-thru
        const driveThruData = response.data.summary?.breakdown_by_source?.find(
          (s: any) => s.order_source === 'DRIVE_THRU'
        );
        
        if (driveThruData) {
          // Simulăm datele pentru drive-thru (ar trebui să vină de la backend)
          setData({
            period: response.data.period,
            summary: {
              total_orders: driveThruData.count || 0,
              total_revenue: driveThruData.revenue || 0,
              avg_order_value: (driveThruData.revenue || 0) / (driveThruData.count || 1),
              avg_service_time_minutes: driveThruData.avg_prep_time_minutes || 0,
              orders_under_3min: 0, // Ar trebui calculat de backend
              orders_over_5min: 0, // Ar trebui calculat de backend
              orders_under_3min_percent: 0,
              orders_over_5min_percent: 0
            },
            by_lane: [],
            hourly_heatmap: []
          });
        }
      }
    } catch (err) {
      console.error('Error fetching drive-thru performance report:', err);
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
      <div className="drivethru-performance-page">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="drivethru-performance-page">
      <div className="page-header">
        <h1><i className="fas fa-chart-line me-2"></i>"raport performance drive thru"</h1>
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
            icon={<span>🚗</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Timp Mediu"
            value={data.summary.avg_service_time_minutes > 0 ? `${data.summary.avg_service_time_minutes.toFixed(1)} min` : 'N/A'}
            helper="Per comandă"
            icon={<span>⏱️</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Sub 3 min"
            value={data.summary.orders_under_3min_percent > 0 ? `${data.summary.orders_under_3min_percent.toFixed(1)}%` : 'N/A'}
            helper={`${data.summary.orders_under_3min} comenzi`}
            icon={<span>✅</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title={t('$([peste_5_min] -replace "\[|\]")')}
            value={data.summary.orders_over_5min_percent > 0 ? `${data.summary.orders_over_5min_percent.toFixed(1)}%` : 'N/A'}
            helper={`${data.summary.orders_over_5min} comenzi`}
            icon={<span>⚠️</span>}
          />
        </Col>
      </Row>

      {/* Summary */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Sumar General</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Total Comenzi:</strong> {data.summary.total_orders}</p>
              <p><strong>Venit Total:</strong> {data.summary.total_revenue.toFixed(2)} RON</p>
              <p><strong>"valoare medie comanda"</strong> {data.summary.avg_order_value.toFixed(2)} RON</p>
            </Col>
            <Col md={6}>
              <p><strong>Timp Mediu Servire:</strong> {data.summary.avg_service_time_minutes > 0 ? `${data.summary.avg_service_time_minutes.toFixed(1)} minute` : 'N/A'}</p>
              <p><strong>Comenzi Sub 3 min:</strong> {data.summary.orders_under_3min} ({data.summary.orders_under_3min_percent.toFixed(1)}%)</p>
              <p><strong>Comenzi Peste 5 min:</strong> {data.summary.orders_over_5min} ({data.summary.orders_over_5min_percent.toFixed(1)}%)</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* By Lane */}
      {data.by_lane.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5>"breakdown pe banda"</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Bandă</th>
                  <th>"numar comenzi"</th>
                  <th>Venit</th>
                  <th>Timp Mediu</th>
                </tr>
              </thead>
              <tbody>
                {data.by_lane.map((lane, idx) => (
                  <tr key={idx}>
                    <td><Badge bg="warning">{lane.lane_number}</Badge></td>
                    <td>{lane.count}</td>
                    <td>{lane.revenue.toFixed(2)} RON</td>
                    <td>{lane.avg_time_minutes.toFixed(1)} min</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {data.by_lane.length === 0 && (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">"nu exista date pentru breakdown pe banda"</p>
          </Card.Body>
        </Card>
      )}
        </>
      )}
    </div>
  );
};





