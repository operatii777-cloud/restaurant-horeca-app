// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Table, Badge, Alert, Spinner, Form, Button, Modal } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { feedbackApi, type Feedback } from '../api/feedbackApi';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FeedbackPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface FeedbackData {
  success?: boolean;
  recentFeedback: Feedback[];
  total: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface FeedbackDetails {
  id: number;
  orderId: number;
  client: string;
  table: string;
  rating: number;
  comment: string;
  date: string;
}

export const FeedbackPage = () => {
  //   const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    rating: '',
    period: 'overall',
    limit: 100,
  });
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const ratingDistChartRef = useRef<ChartJS<'bar'> | null>(null);
  const ratingTrendChartRef = useRef<ChartJS<'line'> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        limit: filters.limit,
        period: filters.period,
      };
      if (filters.rating) params.rating = parseInt(filters.rating);

      const response = await fetch(`/api/feedback/recent?${new URLSearchParams(params as any).toString()}`);
      const data: FeedbackData = await response.json();

      if (data.success !== false) {
        setFeedbacks(data.recentFeedback || []);
        setStats(data);
      } else {
        setError('Eroare la încărcarea datelor');
      }
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea feedback-urilor:', err);
      setError(err?.response?.data?.error || err?.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const getRatingBadge = (rating: number) => {
    const colors: { [key: number]: string } = {
      5: 'success',
      4: 'info',
      3: 'warning',
      2: 'danger',
      1: 'danger',
    };
    return colors[rating] || 'secondary';
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const changePeriod = (period: string) => {
    setFilters((prev) => ({ ...prev, period }));
  };

  const filterByRating = (rating: string | number) => {
    setFilters((prev) => ({ ...prev, rating: rating === 'all' ? '' : String(rating) }));
  };

  const viewFeedbackDetails = (feedback: Feedback) => {
    setSelectedFeedback({
      id: feedback.id,
      orderId: feedback.order_id || 0,
      client: feedback.customer_token || 'N/A',
      table: 'N/A', // table_number nu este în tipul Feedback
      rating: feedback.rating,
      comment: feedback.comment || 'Fără comentariu',
      date: new Date(feedback.timestamp).toLocaleString('ro-RO'),
    });
    setShowDetailsModal(true);
  };

  // Chart data pentru distribuție rating-uri
  const ratingDistributionData = stats ? {
    labels: ['1★', '2★', '3★', '4★', '5★'],
    datasets: [
      {
        label: 'Număr Feedback-uri',
        data: [
          stats.ratingDistribution?.[1] || 0,
          stats.ratingDistribution?.[2] || 0,
          stats.ratingDistribution?.[3] || 0,
          stats.ratingDistribution?.[4] || 0,
          stats.ratingDistribution?.[5] || 0,
        ],
        backgroundColor: [
          'rgba(220, 53, 69, 0.8)',
          'rgba(253, 126, 20, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(23, 162, 184, 0.8)',
        ],
      },
    ],
  } : null;

  // Chart data pentru trend (placeholder - ar trebui să fie date reale pentru ultimele 7 zile)
  const ratingTrendData = {
    labels: ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'],
    datasets: [
      {
        label: 'Rating Mediu',
        data: [4.2, 4.5, 4.3, 4.6, 4.4, 4.7, 4.5],
        borderColor: 'rgba(23, 162, 184, 1)',
        backgroundColor: 'rgba(23, 162, 184, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const periodLabels: { [key: string]: string } = {
    today: 'Astăzi',
    week: 'Săptămâna aceasta',
    month: 'Luna aceasta',
    quarter: 'Trimestru',
    semester: 'Semestru',
    year: 'An',
    overall: 'Toate timpurile',
  };

  const periodLabel = periodLabels[filters.period] || 'Toate timpurile';
  const lowRatings = stats ? (stats.ratingDistribution?.[1] || 0) + (stats.ratingDistribution?.[2] || 0) : 0;
  const excellentRatings = stats ? stats.ratingDistribution?.[5] || 0 : 0;

  if (loading) {
    return (
      <div className="feedback-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Se încarcă feedback-urile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page" data-page-ready="true">
      <PageHeader
        title="Feedback Clienți"
        description="Vizualizează și analizează feedback-urile clienților."
        actions={[
          {
            label: '↻ Reîncarcă',
            variant: 'secondary',
            onClick: () => void loadData(),
          },
        ]}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Statistici Rapide */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="metric-card text-white bg-warning">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats?.total || 0}</h4>
                  <small>Feedback-uri ({periodLabel})</small>
                </div>
                <i className="fas fa-comment-dots fa-2x text-warning"></i>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="metric-card text-white bg-success">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{(stats?.averageRating || 0).toFixed(1)}★</h4>
                  <small>Rating Mediu ({periodLabel})</small>
                </div>
                <i className="fas fa-star fa-2x" style={{ color: '#ffd700' }}></i>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="metric-card text-white bg-danger">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{lowRatings}</h4>
                  <small>Rating-uri Scăzute (≤2★)</small>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="metric-card text-white bg-info">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{excellentRatings}</h4>
                  <small>Rating-uri Excelente (5★)</small>
                </div>
                <i className="fas fa-heart fa-2x" style={{ color: '#ff69b4' }}></i>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Grafice */}
      <div className="row mb-4">
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <i className="fas fa-chart-bar me-1"></i> Distribuție Rating-uri ({periodLabel})
            </Card.Header>
            <Card.Body>
              {ratingDistributionData && (
                <Bar
                  data={ratingDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    },
                  }}
                  height={250}
                />
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <i className="fas fa-chart-line me-1"></i> Trend Rating-uri (Ultimele 7 Zile)
            </Card.Header>
            <Card.Body>
              <Line
                data={ratingTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 5 },
                  },
                }}
                height={250}
              />
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Lista Feedback-uri */}
      <div className="row">
        <div className="col-md-12">
          <Card className="shadow-sm">
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
              <span>
                <i className="fas fa-comments me-1"></i> Feedback-uri Recente
              </span>
              <div className="d-flex gap-3 align-items-center">
                {/* Dropdown Perioadă */}
                <Form.Select
                  value={filters.period}
                  onChange={(e) => changePeriod(e.target.value)}
                  className="form-select-sm feedback-period-select"
                  style={{
                    width: '200px',
                    backgroundColor: '#343a40',
                    color: 'white',
                    borderColor: '#6c757d',
                    textDecoration: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    paddingRight: '2rem',
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1rem 1rem'
                  }}
                >
                  <option value="today">📅 Astăzi</option>
                  <option value="week">📆 Săptămâna aceasta</option>
                  <option value="month">🗓️ Luna aceasta</option>
                  <option value="quarter">📊 Trimestru (3 luni)</option>
                  <option value="semester">🗂️ Semestru (6 luni)</option>
                  <option value="year">📅 An (12 luni)</option>
                  <option value="overall">🌍 TOATE TIMPURILE</option>
                </Form.Select>

                {/* Filtre Rating */}
                <div className="btn-group btn-group-sm" role="group">
                  <Button
                    variant={filters.rating === '' ? 'light' : 'outline-light'}
                    onClick={() => filterByRating('all')}
                  >Toate</Button>
                  <Button
                    variant={filters.rating === '5' ? 'light' : 'outline-light'}
                    onClick={() => filterByRating(5)}
                  >
                    5★
                  </Button>
                  <Button
                    variant={filters.rating === '4' ? 'light' : 'outline-light'}
                    onClick={() => filterByRating(4)}
                  >
                    4★
                  </Button>
                  <Button
                    variant={filters.rating === '3' ? 'light' : 'outline-light'}
                    onClick={() => filterByRating(3)}
                  >
                    3★
                  </Button>
                  <Button
                    variant={filters.rating === '2' ? 'light' : 'outline-light'}
                    onClick={() => filterByRating(2)}
                  >
                    2★
                  </Button>
                  <Button
                    variant={filters.rating === '1' ? 'light' : 'outline-light'}
                    onClick={() => filterByRating(1)}
                  >
                    1★
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                {feedbacks.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-star fa-3x mb-3 opacity-50"></i>
                    <p>Nu există feedback-uri</p>
                  </div>
                ) : (
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Comandă</th>
                        <th>Client</th>
                        <th>Rating</th>
                        <th>Comentariu</th>
                        <th>Data</th>
                        <th>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.map((feedback) => {
                        const ratingClass =
                          feedback.rating <= 2
                            ? 'text-danger'
                            : feedback.rating >= 4
                              ? 'text-success'
                              : 'text-warning';
                        return (
                          <tr key={feedback.id} className="feedback-row" data-rating={feedback.rating}>
                            <td>#{feedback.id}</td>
                            <td>
                              {feedback.order_id ? (
                                <code>#{feedback.order_id}</code>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {feedback.customer_token ? (
                                <code className="small">{feedback.customer_token.substring(0, 8)}...</code>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className={`${ratingClass} fw-bold`}>
                              {getRatingStars(feedback.rating)} ({feedback.rating})
                            </td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: '300px' }}
                              title={feedback.comment || ''}
                            >
                              {feedback.comment || <em className="text-muted">Fără comentariu</em>}
                            </td>
                            <td className="small">
                              {new Date(feedback.timestamp).toLocaleString('ro-RO')}
                            </td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => viewFeedbackDetails(feedback)}
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal Detalii Feedback */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-star me-2"></i>Detalii Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div>
              <p>
                <strong>ID:</strong> #{selectedFeedback.id}
              </p>
              <p>
                <strong>Rating:</strong>' '
                <Badge bg={getRatingBadge(selectedFeedback.rating)}>
                  {getRatingStars(selectedFeedback.rating)} ({selectedFeedback.rating}/5)
                </Badge>
              </p>
              <p>
                <strong>Comandă:</strong> #{selectedFeedback.orderId}
              </p>
              <p>
                <strong>Client:</strong> {selectedFeedback.client}
              </p>
              <p>
                <strong>Masă:</strong> {selectedFeedback.table}
              </p>
              <p>
                <strong>Data:</strong> {selectedFeedback.date}
              </p>
              <p>
                <strong>Comentariu:</strong>
              </p>
              <p>{selectedFeedback.comment}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Închide</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};



