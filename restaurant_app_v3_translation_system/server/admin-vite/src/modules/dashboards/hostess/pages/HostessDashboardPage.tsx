import { useTranslation } from '@/i18n/I18nContext';
import React, { useEffect, useState } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HostessDashboardPage.css';

interface HostessOverview {
  totalSessions: number;
  totalCovers: number;
  avgDurationMinutes: number;
  avgCoversPerSession: number;
}

interface ZoneStat {
  zone: string;
  sessions: number;
  covers: number;
}

interface HourlyStat {
  hour: number;
  sessions: number;
}

export const HostessDashboardPage = () => {
  const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [day, setDay] = useState('');
  const [overview, setOverview] = useState<HostessOverview | null>(null);
  const [byZone, setByZone] = useState<ZoneStat[]>([]);
  const [hourly, setHourly] = useState<HourlyStat[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOverview = async () => {
    if (!from || !to) return;
    
    setLoading(true);
    try {
      const response = await httpClient.get('/api/stats/hostess/overview', {
        params: { from, to }
      });
      setOverview(response.data);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadByZone = async () => {
    if (!from || !to) return;
    
    try {
      const response = await httpClient.get('/api/stats/hostess/by-zone', {
        params: { from, to }
      });
      setByZone(response.data);
    } catch (error) {
      console.error('Error loading by-zone:', error);
    }
  };

  const loadHourly = async () => {
    if (!day) return;
    
    try {
      const response = await httpClient.get('/api/stats/hostess/hourly', {
        params: { date: day }
      });
      setHourly(response.data);
    } catch (error) {
      console.error('Error loading hourly:', error);
    }
  };

  useEffect(() => {
    if (from && to) {
      loadOverview();
      loadByZone();
    }
  }, [from, to]);

  useEffect(() => {
    if (day) {
      loadHourly();
    }
  }, [day]);

  return (
    <div className="hostess-dashboard-page">
      <PageHeader
        title={t('dashboard.hostess.title')}
        description={t('dashboard.hostess.subtitle')}
      />

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('dashboard.filters.from')}</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('dashboard.filters.to')}</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('dashboard.hostess.selectDay')}</Form.Label>
                <Form.Control
                  type="date"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* KPI Cards */}
      {overview && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="kpi-card text-center">
              <Card.Body>
                <div className="kpi-label">{t('dashboard.hostess.totalSessions')}</div>
                <div className="kpi-value">{overview.totalSessions}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center">
              <Card.Body>
                <div className="kpi-label">{t('dashboard.hostess.totalCovers')}</div>
                <div className="kpi-value">{overview.totalCovers}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center">
              <Card.Body>
                <div className="kpi-label">{t('dashboard.hostess.avgDuration')}</div>
                <div className="kpi-value">{overview.avgDurationMinutes}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center">
              <Card.Body>
                <div className="kpi-label">{t('dashboard.hostess.coversPerSession')}</div>
                <div className="kpi-value">{overview.avgCoversPerSession}</div>
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
              <h5 className="chart-title">{t('dashboard.hostess.zoneDistribution')}</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byZone}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="zone" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f172a', 
                      border: '1px solid #334155',
                      color: '#f1f5f9'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#f1f5f9' }} />
                  <Bar dataKey="sessions" name={t('dashboard.hostess.sessions')} fill="#3b82f6" />
                  <Bar dataKey="covers" name={t('dashboard.hostess.covers')} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="chart-card">
            <Card.Body>
              <h5 className="chart-title">{t('dashboard.hostess.sessionsPerHour')}</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourly}>
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
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    name={t('dashboard.hostess.sessions')} 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};




