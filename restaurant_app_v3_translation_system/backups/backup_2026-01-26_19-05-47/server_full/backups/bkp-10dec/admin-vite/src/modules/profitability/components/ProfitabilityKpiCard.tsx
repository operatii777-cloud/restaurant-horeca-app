/**
 * S14 - Profitability KPI Card Component
 * Card pentru afișarea KPI-urilor (Revenue, COGS, Profit, Food Cost %, Margin %)
 */

import { Card } from 'react-bootstrap';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { KpiBlock } from '../utils/profitabilityMappers';
import './ProfitabilityKpiCard.css';

interface ProfitabilityKpiCardProps {
  kpi: KpiBlock;
  loading?: boolean;
}

export const ProfitabilityKpiCard = ({ kpi, loading = false }: ProfitabilityKpiCardProps) => {
  if (loading) {
    return (
      <Card className="profitability-kpi-card profitability-kpi-card--loading">
        <Card.Body>
          <div className="kpi-skeleton">
            <div className="kpi-skeleton-title"></div>
            <div className="kpi-skeleton-value"></div>
            <div className="kpi-skeleton-subtitle"></div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const colorClass = `profitability-kpi-card--${kpi.color}`;
  const TrendIcon = kpi.trend?.isPositive ? TrendingUp : TrendingDown;
  const trendClass = kpi.trend?.isPositive ? 'trend-positive' : 'trend-negative';

  return (
    <Card className={`profitability-kpi-card ${colorClass}`}>
      <Card.Body>
        <div className="kpi-header">
          <h6 className="kpi-title">{kpi.title}</h6>
          {kpi.trend && (
            <span className={`kpi-trend ${trendClass}`}>
              <TrendIcon size={16} />
              {kpi.trend.value}
            </span>
          )}
        </div>
        <div className="kpi-value">{kpi.value}</div>
        {kpi.subtitle && <div className="kpi-subtitle">{kpi.subtitle}</div>}
      </Card.Body>
    </Card>
  );
};

