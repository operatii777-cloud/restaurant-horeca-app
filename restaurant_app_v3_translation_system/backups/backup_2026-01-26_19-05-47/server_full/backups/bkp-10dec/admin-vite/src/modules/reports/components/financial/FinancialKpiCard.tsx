/**
 * S15 — Financial KPI Card Component
 * 
 * Reusable KPI card for financial metrics
 */

import React from 'react';
import { Card } from 'react-bootstrap';
import './FinancialKpiCard.css';

interface FinancialKpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'success' | 'danger' | 'primary' | 'warning' | 'info';
  format?: 'currency' | 'percent' | 'number';
}

export function FinancialKpiCard({
  title,
  value,
  subtitle,
  trend,
  variant = 'primary',
  format = 'currency',
}: FinancialKpiCardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `${val.toFixed(2)} RON`;
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'number':
        return val.toLocaleString('ro-RO');
      default:
        return String(val);
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <i className="fas fa-arrow-up text-success ms-2"></i>;
      case 'down':
        return <i className="fas fa-arrow-down text-danger ms-2"></i>;
      case 'neutral':
        return <i className="fas fa-minus text-muted ms-2"></i>;
    }
  };

  return (
    <Card className={`financial-kpi-card financial-kpi-card--${variant}`}>
      <Card.Body>
        <div className="financial-kpi-title">{title}</div>
        <div className="financial-kpi-value">
          {formatValue(value)}
          {getTrendIcon()}
        </div>
        {subtitle && <div className="financial-kpi-subtitle">{subtitle}</div>}
      </Card.Body>
    </Card>
  );
}

