// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MONITORING DASHBOARD PAGE
 * 
 * Dashboard pentru monitoring sistem (uptime, memory, database, performance)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Badge, ProgressBar, Button, Table } from 'react-bootstrap';
import { monitoringApi, type MonitoringHealth, type MonitoringAlert } from '../api/monitoringApi';
import { PageHeader } from '@/shared/components/PageHeader';
import './MonitoringDashboardPage.css';

export const MonitoringDashboardPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<MonitoringHealth | null>(null);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30 * 1000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [healthResponse, alertsResponse] = await Promise.all([
        monitoringApi.getHealth(),
        monitoringApi.getAlerts(),
      ]);
      
      if (healthResponse.data.success) {
        setHealth(healthResponse.data.data);
      }
      
      if (alertsResponse.data.success) {
        setAlerts(alertsResponse.data.alerts);
      }
    } catch (err: any) {
      console.error('Error loading monitoring data:', err);
      setError(err.message || 'Eroare la încărcarea datelor de monitoring');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' => {
    if (status === 'ok' || status === 'healthy') return 'success';
    if (status === 'warning' || status === 'slow') return 'warning';
    return 'danger';
  };

  const getStatusBadge = (status: string) => {
    const variant = getStatusVariant(status);
    const label = status === 'ok' ? 'OK' : status === 'healthy' ? 'Healthy' : status.toUpperCase();
    return <Badge bg={variant}>{label}</Badge>;
  };

  if (loading && !health) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </Spinner>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="alert alert-danger">
        <h4>Eroare</h4>
        <p>{error}</p>
        <Button onClick={loadData}>Reîncarcă</Button>
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className="monitoring-dashboard-page">
      <PageHeader
        title="Dashboard Monitorizare și Performanță"
        subtitle="Prezentare generală, metrici de performanță și stare sistem"
      />

      {/* Overall Status */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            Prezentare Generală
            {getStatusBadge(health.status)}
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <div className="status-item">
                <h6 className="text-muted">Timp de funcționare</h6>
                <h4>{health.uptime.formatted}</h4>
                <small className="text-muted">
                  {health.uptime.days} zile, {health.uptime.hours % 24} ore
                </small>
              </div>
            </Col>
            <Col md={3}>
              <div className="status-item">
                <h6 className="text-muted">Memorie utilizată</h6>
                <h4>{health.memory.usage_percent.toFixed(1)}%</h4>
                <ProgressBar
                  now={health.memory.usage_percent}
                  variant={getStatusVariant(health.memory.status)}
                  className="mt-2"
                />
                <small className="text-muted">
                  {formatBytes(health.memory.used)} / {formatBytes(health.memory.total)}
                </small>
              </div>
            </Col>
            <Col md={3}>
              <div className="status-item">
                <h6 className="text-muted">Bază de date</h6>
                <h4>{health.database.response_time_ms}ms</h4>
                {getStatusBadge(health.database.status_level)}
                <small className="text-muted d-block mt-1">
                  {health.database.table_count} tabele
                </small>
              </div>
            </Col>
            <Col md={3}>
              <div className="status-item">
                <h6 className="text-muted">Performanță sistem</h6>
                <h4>{health.performance.avg_response_time}ms</h4>
                {getStatusBadge(health.performance.status)}
                <small className="text-muted d-block mt-1">
                  {health.performance.sample_count} sample-uri
                </small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Detailed Metrics */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Detalii memorie</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover size="sm">
                <tbody>
                  <tr>
                    <td><strong>Totală</strong></td>
                    <td>{formatBytes(health.memory.total)}</td>
                  </tr>
                  <tr>
                    <td><strong>Folosit</strong></td>
                    <td>{formatBytes(health.memory.used)}</td>
                  </tr>
                  <tr>
                    <td><strong>Liber</strong></td>
                    <td>{formatBytes(health.memory.free)}</td>
                  </tr>
                  <tr>
                    <td><strong>Utilizare</strong></td>
                    <td>
                      <ProgressBar
                        now={health.memory.usage_percent}
                        variant={getStatusVariant(health.memory.status)}
                        label={`${health.memory.usage_percent.toFixed(1)}%`}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{getStatusBadge(health.memory.status)}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Detalii bază de date</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover size="sm">
                <tbody>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{getStatusBadge(health.database.status)}</td>
                  </tr>
                  <tr>
                    <td><strong>Timp de Răspuns</strong></td>
                    <td>{health.database.response_time_ms}ms</td>
                  </tr>
                  <tr>
                    <td><strong>Număr Tabele</strong></td>
                    <td>{health.database.table_count}</td>
                  </tr>
                  <tr>
                    <td><strong>Nivel Status</strong></td>
                    <td>{getStatusBadge(health.database.status_level)}</td>
                  </tr>
                  {health.database.error && (
                    <tr>
                      <td colSpan={2} className="text-danger">
                        <small>{health.database.error}</small>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Metrici performanță</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Metrică</th>
                    <th>Valoare</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Timp mediu de răspuns</strong></td>
                    <td>{health.performance.avg_response_time}ms</td>
                    <td>{health.performance.min_response_time}ms</td>
                    <td>{health.performance.max_response_time}ms</td>
                    <td>{getStatusBadge(health.performance.status)}</td>
                  </tr>
                  <tr>
                    <td><strong>Număr probe</strong></td>
                    <td colSpan={3}>{health.performance.sample_count}</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monitoring Alerts */}
      {alerts.length > 0 && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              Monitor coadă
              <Badge bg="warning" className="ms-2">{alerts.length}</Badge>
            </h5>
          </Card.Header>
          <Card.Body>
            <Table striped hover size="sm">
              <thead>
                <tr>
                  <th>Severitate</th>
                  <th>Tip</th>
                  <th>Mesaj</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, index) => (
                  <tr key={index}>
                    <td>
                      <Badge bg={getStatusVariant(alert.severity.toLowerCase())}>
                        {alert.severity}
                      </Badge>
                    </td>
                    <td>{alert.type}</td>
                    <td>{alert.message}</td>
                    <td>{new Date(alert.timestamp).toLocaleString('ro-RO')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="text-center mt-4">
        <Button onClick={loadData} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />Se încarcă...</>
            ) : (
              'Reîncarcă datele'
            )}
        </Button>
        <small className="d-block text-muted mt-2">
          Actualizare automată la fiecare 30 de secunde
        </small>
      </div>
    </div>
  );
};



