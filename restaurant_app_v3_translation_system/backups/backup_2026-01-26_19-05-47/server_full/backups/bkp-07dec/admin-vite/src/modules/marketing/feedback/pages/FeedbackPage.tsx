import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Alert, Spinner, Form, Button } from 'react-bootstrap';
import { feedbackApi, type Feedback, type FeedbackStats } from '../api/feedbackApi';
import { FeedbackStatsCard } from '../components/FeedbackStatsCard';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FeedbackPage.css';

export const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    rating: '',
    period: '',
    limit: 50,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.rating) params.rating = parseInt(filters.rating);
      if (filters.period) params.period = filters.period;
      if (filters.limit) params.limit = filters.limit;

      const [feedbacksData, statsData] = await Promise.all([
        feedbackApi.getAll(params),
        feedbackApi.getStats(),
      ]);
      setFeedbacks(feedbacksData);
      setStats(statsData);
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
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

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

      <div className="row mt-4">
        {/* Statistici */}
        <div className="col-md-4">
          {stats && <FeedbackStatsCard stats={stats} />}
        </div>

        {/* Lista Feedback-uri */}
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <i className="fas fa-star me-2"></i>
              Feedback-uri Clienți
            </Card.Header>
            <Card.Body>
              {/* Filtre */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <Form.Select
                    value={filters.rating}
                    onChange={(e) => setFilters((prev) => ({ ...prev, rating: e.target.value }))}
                  >
                    <option value="">Toate rating-urile</option>
                    <option value="5">5 stele</option>
                    <option value="4">4 stele</option>
                    <option value="3">3 stele</option>
                    <option value="2">2 stele</option>
                    <option value="1">1 stea</option>
                  </Form.Select>
                </div>
                <div className="col-md-4">
                  <Form.Select
                    value={filters.period}
                    onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value }))}
                  >
                    <option value="">Toate perioadele</option>
                    <option value="week">Ultima săptămână</option>
                    <option value="month">Ultima lună</option>
                    <option value="year">Ultimul an</option>
                  </Form.Select>
                </div>
                <div className="col-md-4">
                  <Button variant="outline-secondary" onClick={() => setFilters({ rating: '', period: '', limit: 50 })}>
                    <i className="fas fa-times me-2"></i>
                    Resetează Filtre
                  </Button>
                </div>
              </div>

              {feedbacks.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-star fa-3x mb-3 opacity-50"></i>
                  <p>Nu există feedback-uri.</p>
                </div>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Rating</th>
                      <th>Comentariu</th>
                      <th>Comandă</th>
                      <th>Client</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((feedback) => (
                      <tr key={feedback.id}>
                        <td>
                          <Badge bg={getRatingBadge(feedback.rating)}>
                            {getRatingStars(feedback.rating)}
                          </Badge>
                        </td>
                        <td>{feedback.comment || <span className="text-muted">-</span>}</td>
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
                        <td>{new Date(feedback.timestamp).toLocaleDateString('ro-RO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

