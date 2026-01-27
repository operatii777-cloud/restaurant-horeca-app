import React, { useEffect, useState } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LostFoundDashboardPage.css';

interface LFOverview {
  total: number;
  stored: number;
  returned: number;
  discarded: number;
}

interface LocationStat {
  location: string;
  count: number;
}

const LF_COLORS: Record<string, string> = {
  STORED: '#3b82f6',
  RETURNED: '#22c55e',
  DISCARDED: '#f97316'
};

export const LostFoundDashboardPage = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [overview, setOverview] = useState<LFOverview | null>(null);
  const [locations, setLocations] = useState<LocationStat[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!from || !to) return;
    
    setLoading(true);
    try {
      const [overviewRes, locationsRes] = await Promise.all([
        httpClient.get('/api/stats/lostfound/overview', { params: { from, to } }),
        httpClient.get('/api/stats/lostfound/by-location', { params: { from, to } })
      ]);
      
      setOverview(overviewRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [from, to]);

  const pieData = overview ? [
    { name: 'În Depozit', value: overview.stored, status: 'STORED' },
    { name: 'Returnate', value: overview.returned, status: 'RETURNED' },
    { name: 'Eliminate', value: overview.discarded, status: 'DISCARDED' }
  ] : [];

  const returnRate = overview && overview.total > 0
    ? Math.round((overview.returned / overview.total) * 100)
    : 0;

  return (
    <div className="lostfound-dashboard-page">
      <PageHeader
        title="📊 Lost & Found Dashboard"
        description="Analytics obiecte găsite și pierdute"
      />

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>De la</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Până la</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
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
                <div className="kpi-label">Total Obiecte</div>
                <div className="kpi-value">{overview.total}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center border-warning">
              <Card.Body>
                <div className="kpi-label">În Depozit</div>
                <div className="kpi-value text-warning">{overview.stored}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center border-success">
              <Card.Body>
                <div className="kpi-label">Returnate</div>
                <div className="kpi-value text-success">{overview.returned}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="kpi-card text-center">
              <Card.Body>
                <div className="kpi-label">Return Rate</div>
                <div className="kpi-value">{returnRate}%</div>
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
              <h5 className="chart-title">Obiecte pe Locații</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="location" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f172a', 
                      border: '1px solid #334155',
                      color: '#f1f5f9'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#f1f5f9' }} />
                  <Bar dataKey="count" name="Obiecte" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="chart-card">
            <Card.Body>
              <h5 className="chart-title">Status Obiecte</h5>
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
                      <Cell key={`cell-${index}`} fill={LF_COLORS[entry.status]} />
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

