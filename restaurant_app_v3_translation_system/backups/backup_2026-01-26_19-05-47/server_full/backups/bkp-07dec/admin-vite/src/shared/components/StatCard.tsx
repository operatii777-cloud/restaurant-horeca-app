import type { ReactNode } from 'react';
import './StatCard.css';

type TrendDirection = 'up' | 'down' | 'flat';

export type StatCardProps = {
  title: string;
  value: string;
  helper?: string;
  trendLabel?: string;
  trendValue?: string;
  trendDirection?: TrendDirection;
  icon?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
};

const trendIconMap: Record<TrendDirection, string> = {
  up: '▲',
  down: '▼',
  flat: '◆',
};

export function StatCard({
  title,
  value,
  helper,
  trendLabel,
  trendValue,
  trendDirection = 'flat',
  icon,
  footer,
  children,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <header className="stat-card__header">
        <div className="stat-card__icon" aria-hidden="true">
          {icon ?? '📊'}
        </div>
        <div className="stat-card__meta">
          <span className="stat-card__title">{title}</span>
          {helper ? <small className="stat-card__helper">{helper}</small> : null}
        </div>
      </header>

      <div className="stat-card__value">{value}</div>

      {trendLabel && trendValue ? (
        <div className={`stat-card__trend stat-card__trend--${trendDirection}`}>
          <span className="stat-card__trend-icon" aria-hidden="true">
            {trendIconMap[trendDirection]}
          </span>
          <span className="stat-card__trend-value">{trendValue}</span>
          <span className="stat-card__trend-label">{trendLabel}</span>
        </div>
      ) : null}

      {children ? <div className="stat-card__content">{children}</div> : null}
      {footer ? <footer className="stat-card__footer">{footer}</footer> : null}
    </article>
  );
}
