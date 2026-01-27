// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './QueueMonitorPage.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface QueueStats {
  processed: number;
  failed: number;
  queued: number;
  currentQueueSize: number;
  retried: number;
  avgProcessingTime?: number;
  todayTotal?: number;
  ordersByStatus?: {
    pending?: number;
    processing?: number;
    completed?: number;
    failed?: number;
  };
}

interface QueueItem {
  id: string;
  orderId: number;
  status: "Pending:" | 'processing' | 'completed' | 'failed';
  addedAt: number;
  retries?: number;
  priority?: number;
}

interface FailedJob {
  jobId: string;
  orderId: number;
  error: string;
  failedAt: string;
  retries: number;
}

interface QueueMonitorData {
  success: boolean;
  queueType: 'memory' | 'redis' | 'none';
  stats?: QueueStats;
  queueItems?: QueueItem[];
  failedJobs?: FailedJob[];
  message?: string;
}

export default function QueueMonitorPage() {
//   const { t } = useTranslation();
  const [data, setData] = useState<QueueMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueueMonitor = async () => {
    try {
      setError(null);
      const response = await httpClient.get<QueueMonitorData>('/api/queue/monitor');
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea Queue Monitor:', err);
      setError(err.response?.data?.message || 'Eroare la încărcarea datelor');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueueMonitor();
    const interval = setInterval(loadQueueMonitor, 3000); // Auto-refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}o`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO');
  };

  if (loading && !data) {
    return (
      <div className="queue-monitor-page">
        <PageHeader title='📊 monitor coada' description="Monitorizare coadă comenzi și job-uri" />
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">"se incarca datele"</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="queue-monitor-page">
        <PageHeader title='📊 monitor coada' description="Monitorizare coadă comenzi și job-uri" />
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <Button variant="outline-danger" size="sm" className="ms-3" onClick={loadQueueMonitor}>
            <i className="fas fa-redo me-1"></i>Reîncearcă</Button>
        </Alert>
      </div>
    );
  }

  const queueType = data?.queueType || 'none';
  const stats = data?.stats;
  const queueItems = data?.queueItems || [];
  const failedJobs = data?.failedJobs || [];

  // Calculate metrics
  const queueSize = stats?.currentQueueSize || 0;
  const processed = stats?.processed || 0;
  const failed = stats?.failed || 0;
  const avgTime = stats?.avgProcessingTime || 0;
  const retries = stats?.retried || 0;
  const todayTotal = stats?.todayTotal || processed + failed;
  const successRate = todayTotal > 0 ? ((processed / todayTotal) * 100).toFixed(1) : 100;
  const throughput = todayTotal > 0 ? Math.round(todayTotal / (new Date().getHours() + 1)) : 0;
  const queueLoad = ((queueSize / 1000) * 100).toFixed(1);

  // Chart data for orders by status
  const ordersByStatus = stats?.ordersByStatus || {};
  const chartData = {
    labels: ['Pending', 'Processing', 'Completed', 'Failed'],
    datasets: [
      {
        label: 'Comenzi',
        data: [
          ordersByStatus.pending || 0,
          ordersByStatus.processing || 0,
          ordersByStatus.completed || 0,
          ordersByStatus.failed || 0,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const getQueueStatus = () => {
    if (queueType === 'memory') {
      return { text: 'Active (In-Memory)', icon: 'fas fa-check-circle', color: 'text-success' };
    } else if (queueType === 'redis') {
      return { text: 'Active (Redis)', icon: 'fas fa-check-circle', color: 'text-success' };
    } else {
      return { text: 'No queue active', icon: 'fas fa-times-circle', color: 'text-danger' };
    }
  };

  const status = getQueueStatus();

  return (
    <div className="queue-monitor-page">
      <PageHeader
        title='📊 monitor coada'
        description="Monitorizare coadă comenzi și job-uri în timp real"
      />

      {error && (
        <Alert variant="warning" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      {/* Status Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="metric-card text-white" style={{ background: 'linear-gradient(45deg, #6a11cb, #2575fc)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{queueType === 'none' ? 'Disabled' : 'Queue'}</h4>
                  <small>Queue System</small>
                </div>
                <i className="fas fa-layer-group fa-2x"></i>
              </div>
              <small className={`mt-2 d-block ${status.color}`}>
                <i className={`${status.icon} me-1`}></i>
                {status.text}
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-white bg-warning">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{queueSize}</h4>
                  <small>În Coadă</small>
                </div>
                <i className="fas fa-clock fa-2x"></i>
              </div>
              <small className="mt-2 d-block">"comenzi in asteptare"</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-white bg-success">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{processed}</h4>
                  <small>"procesate astazi"</small>
                </div>
                <i className="fas fa-check-circle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">~{avgTime}ms avg</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-white bg-danger">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{failed}</h4>
                  <small>Failed</small>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">"necesita atentie"</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        {/* Queue Items (Live) */}
        <Col md={7}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-tasks me-1"></i> Comenzi în Coadă (Live)
              </h5>
              <Badge bg="primary">{queueItems.length}</Badge>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: "Auto" }}>
              {queueItems.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-inbox fa-3x mb-2"></i>
                  <p>Coada este goală</p>
                </div>
              ) : (
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>"comanda id"</th>
                      <th>Timp</th>
                      <th>Retries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Badge bg={item.status === 'processing' ? 'warning' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </td>
                        <td><strong>#{item.orderId}</strong></td>
                        <td>{getTimeAgo(item.addedAt)} ago</td>
                        <td>{item.retries || 0}/3</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            <Card.Footer className="text-end">
              <Button variant="outline-primary" size="sm" onClick={loadQueueMonitor}>
                <i className="fas fa-sync-alt me-1"></i>Reîmprospătează</Button>
            </Card.Footer>
          </Card>
        </Col>

        {/* Failed Jobs */}
        <Col md={5}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-exclamation-circle me-1"></i> Failed Jobs
              </h5>
              <Badge bg="danger">{failedJobs.length}</Badge>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: "Auto" }}>
              {failedJobs.length === 0 ? (
                <div className="text-center text-success py-4">
                  <i className="fas fa-check-circle fa-3x mb-2"></i>
                  <p>"niciun job esuat"</p>
                </div>
              ) : (
                <div className="list-group">
                  {failedJobs.map((job) => (
                    <div key={job.jobId} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Comanda #{job.orderId}</h6>
                          <p className="mb-1 text-danger small">{job.error}</p>
                          <small className="text-muted">{formatDate(job.failedAt)}</small>
                        </div>
                        <Badge bg="warning">Reîncercări: {job.retries}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts and Performance Metrics */}
      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-1"></i> Comenzi pe Status (Astăzi)
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-tachometer-alt me-1"></i>Performance Metrics</h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Throughput</h6>
                  <h3 className="text-primary">{throughput}</h3>
                  <small>comenzi/oră</small>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Success Rate</h6>
                  <h3 className="text-success">{successRate}%</h3>
                  <small>procesate cu succes</small>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Retries</h6>
                  <h3 className="text-warning">{retries}</h3>
                  <small>reîncercări totale</small>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Queue Load</h6>
                  <h3 className="text-info">{queueLoad}%</h3>
                  <small>capacitate utilizată</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Auto-refresh indicator */}
      <div className="text-center text-muted mt-4">
        <i className="fas fa-sync-alt me-2"></i>
        Actualizare automată la fiecare 3 secunde
      </div>
    </div>
  );
}



