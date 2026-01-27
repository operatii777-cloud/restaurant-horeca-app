// import { useTranslation } from '@/i18n/I18nContext';
import { Card, Badge } from 'react-bootstrap';
import type { FeedbackStats } from '../api/feedbackApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface FeedbackStatsCardProps {
  stats: FeedbackStats;
}

export const FeedbackStatsCard = ({ stats }: FeedbackStatsCardProps) => {
//   const { t } = useTranslation();
  const getRatingColor = (rating: number) => {
    const colors: { [key: number]: string } = {
      5: 'success',
      4: 'info',
      3: 'warning',
      2: 'danger',
      1: 'danger',
    };
    return colors[rating] || 'secondary';
  };

  return (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white">
        <i className="fas fa-chart-bar me-2"></i>
        Statistici Feedback
      </Card.Header>
      <Card.Body>
        <div className="text-center mb-4">
          <h2 className="mb-0">{stats.avg_rating.toFixed(1)}</h2>
          <p className="text-muted mb-0">Rating Mediu</p>
          <div className="mt-2">
            {'★'.repeat(Math.round(stats.avg_rating))}
            {'☆'.repeat(5 - Math.round(stats.avg_rating))}
          </div>
        </div>

        <div className="mb-3">
          <strong>Total Feedback-uri:</strong> {stats.total_feedback}
        </div>

        <div className="mt-4">
          <strong className="d-block mb-2">"distributie rating uri"</strong>
          {stats.rating_distribution.map((dist) => (
            <div key={dist.rating} className="d-flex align-items-center mb-2">
              <div className="me-2" style={{ width: '60px' }}>
                <Badge bg={getRatingColor(dist.rating)}>
                  {'★'.repeat(dist.rating)}
                </Badge>
              </div>
              <div className="flex-grow-1">
                <div className="progress" style={{ height: '20px' }}>
                  <div
                    className={`progress-bar bg-${getRatingColor(dist.rating)}`}
                    role="progressbar"
                    style={{
                      width: `${(dist.count / stats.total_feedback) * 100}%`,
                    }}
                    aria-label={`${dist.rating} stele: ${dist.count} feedback-uri`}
                  >
                    {dist.count}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};




