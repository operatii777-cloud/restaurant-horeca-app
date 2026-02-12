import { useTranslation } from '@/i18n/I18nContext';
import React, { useEffect, useState } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CoatroomDashboardPage.css';

interface CoatOverview {
  total: number;
  open: number;
  closed: number;
  lost: number;
}

interface HourlyStat {
  hour: number;
  tickets: number;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#3b82f6',
  CLOSED: '#22c55e',
  LOST: '#ef4444'
};

export const CoatroomDashboardPage = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [overview, setOverview] = useState<CoatOverview | null>(null);
  const [hourly, setHourly] = useState<HourlyStat[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!date) return;
    
    setLoading(true);
    try {
      const [overviewRes, hourlyRes] = await Promise.all([
        httpClient.get('/api/stats/coatroom/overview', { params: { date } }),
        httpClient.get('/api/stats/coatroom/hourly', { params: { date } })
      ]);
      
      setOverview(overviewRes.data);
      setHourly(hourlyRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const pieData = overview ? [
    { name: t('dashboard.coatroom.open'), value: overview.open, status: 'OPEN' },
    { name: t('dashboard.coatroom.closed'), value: overview.closed, status: 'CLOSED' },
    { name: t('dashboard.coatroom.lost'), value: overview.lost, status: 'LOST' }
  ] : [];

  return (
    <div className="coatroom-dashboard-page">
      <PageHeader
        title={t('dashboard.coatroom.title')}
        description={t('dashboard.coatroom.subtitle')}
      />

      {/* Date Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>{t('dashboard.filters.date')}</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* KPI Cards */}
      {overview && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="kpi-card text-center">
              <Card.Body>
                <div className="kpi-label">{t('dashboard.coatroom.totalTickets')}</div>
                <div className="kpi-value">{overview.total}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center border-primary">
              <Card.Body>
                <div className="kpi-label">{t('dashboard.coatroom.open')}</div>
                <div className="kpi-value text-primary">{overview.open}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center border-success">
              <Card.Body>
                <div className="kpi-label">{t('dashboard.coatroom.closed')}</div>
                <div className="kpi-value text-success">{overview.closed}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center border-danger">
              <Card.Body>
                <div className="kpi-label">{t('dashboard.coatroom.lost')}</div>
                <div className="kpi-value text-danger">{overview.lost}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Charts */}
      <Row>
        <Col md={6}>
          <Card className="chart-card">
            <Card.Body>
              <h5 className="chart-title">{t('dashboard.coatroom.ticketsPerHour')}</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f172a', 
                      border: '1px solid #334155',
                      color: '#f1f5f9'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#f1f5f9' }} />
                  <Bar dataKey="tickets" name={t('dashboard.coatroom.tickets')} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="chart-card">
            <Card.Body>
              <h5 className="chart-title">{t('dashboard.coatroom.statusDistribution')}</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-"Index"`} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f172a', 
                      border: '1px solid #334155',
                      color: '#f1f5f9'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};




