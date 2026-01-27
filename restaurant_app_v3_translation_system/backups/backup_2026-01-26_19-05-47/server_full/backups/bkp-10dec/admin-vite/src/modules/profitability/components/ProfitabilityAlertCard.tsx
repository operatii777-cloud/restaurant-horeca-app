/**
 * S14 - Profitability Alert Card Component
 * Card pentru afișarea alertelor (high food cost, low margin, spikes, etc.)
 */

import { Card, Badge } from 'react-bootstrap';
import { AlertTriangle, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { ProfitabilityAlert } from '../utils/profitabilityMappers';
import './ProfitabilityAlertCard.css';

interface ProfitabilityAlertCardProps {
  alerts: ProfitabilityAlert[];
  loading?: boolean;
  maxAlerts?: number;
}

export const ProfitabilityAlertCard = ({
  alerts,
  loading = false,
  maxAlerts = 5,
}: ProfitabilityAlertCardProps) => {
  if (loading) {
    return (
      <Card className="profitability-alert-card">
        <Card.Header>
          <h6 className="mb-0">⚠️ Alerte COGS</h6>
        </Card.Header>
        <Card.Body>
          <div className="alert-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="alert-skeleton-item"></div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  const displayedAlerts = alerts.slice(0, maxAlerts);
  const hasAlerts = displayedAlerts.length > 0;

  const getAlertIcon = (type: ProfitabilityAlert['type']) => {
    switch (type) {
      case 'high_food_cost':
        return <AlertTriangle size={18} />;
      case 'low_margin':
        return <TrendingDown size={18} />;
      case 'spike_cogs':
        return <TrendingUp size={18} />;
      case 'category_alert':
        return <AlertCircle size={18} />;
      default:
        return <AlertTriangle size={18} />;
    }
  };

  return (
    <Card className="profitability-alert-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          ⚠️ Alerte COGS
          {hasAlerts && (
            <Badge bg="danger" className="ms-2">
              {alerts.length}
            </Badge>
          )}
        </h6>
      </Card.Header>
      <Card.Body>
        {!hasAlerts ? (
          <div className="no-alerts">
            <AlertCircle size={32} className="text-muted mb-2" />
            <p className="text-muted mb-0">Nu există alerte în acest moment</p>
          </div>
        ) : (
          <div className="alert-list">
            {displayedAlerts.map((alert, index) => (
              <div
                key={index}
                className={`alert-item alert-item--${alert.severity}`}
              >
                <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                </div>
                <Badge
                  bg={alert.severity === 'danger' ? 'danger' : 'warning'}
                  className="alert-badge"
                >
                  {alert.severity === 'danger' ? 'Critic' : 'Atenție'}
                </Badge>
              </div>
            ))}
            {alerts.length > maxAlerts && (
              <div className="alert-more">
                +{alerts.length - maxAlerts} alerte suplimentare
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

