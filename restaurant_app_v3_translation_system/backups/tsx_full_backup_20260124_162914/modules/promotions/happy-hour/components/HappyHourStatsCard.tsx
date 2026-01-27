// import { useTranslation } from '@/i18n/I18nContext';
import { Card, Button, Badge } from 'react-bootstrap';
import type { HappyHourStats } from '../api/happyHourApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface HappyHourStatsCardProps {
  stats: HappyHourStats[];
  onRefresh: () => void;
}

export const HappyHourStatsCard = ({ stats, onRefresh }: HappyHourStatsCardProps) => {
//   const { t } = useTranslation();
  return (
    <Card className="mb-4">
      <Card.Header className="bg-info text-white">
        <i className="fas fa-chart-bar me-2"></i>
        Statistici Happy Hour
      </Card.Header>
      <Card.Body>
        <p className="text-muted small">"performanta happy hour urilor active"</p>
        <Button variant="info" size="sm" className="w-100 mb-3" onClick={onRefresh}>
          <i className="fas fa-sync me-2"></i>"actualizeaza statistici"</Button>
        {stats.length === 0 ? (
          <p className="text-muted text-center py-3">
            <i className="fas fa-info-circle me-2"></i>"nu exista statistici disponibile"</p>
        ) : (
          <div className="stats-list">
            {stats.map((stat) => (
              <div key={stat.id} className="stat-item mb-3 p-2 border rounded">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{stat.name}</strong>
                    <br />
                    <small className="text-muted">
                      {stat.start_time} - {stat.end_time}
                    </small>
                  </div>
                  <div className="text-end">
                    <Badge bg="primary">{stat.usage_count} utilizări</Badge>
                  </div>
                </div>
                <div className="mt-2 row text-center">
                  <div className="col-4">
                    <small className="text-muted d-block">Total Discount</small>
                    <strong>{stat.total_discount.toFixed(2)} RON</strong>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">"total revenue"</small>
                    <strong>{stat.total_revenue.toFixed(2)} RON</strong>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Avg Discount</small>
                    <strong>{stat.avg_discount.toFixed(2)} RON</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};




