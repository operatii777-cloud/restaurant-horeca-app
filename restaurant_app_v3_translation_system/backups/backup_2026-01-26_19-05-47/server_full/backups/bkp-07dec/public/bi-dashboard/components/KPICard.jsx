// components/KPICard.jsx
// FAZA 2C - Săptămâna 5: KPI Card Component

import React from 'react';
import './KPICard.css';

/**
 * KPI Card Component - Afișează un singur KPI
 * 
 * Props:
 * - metric: obiect cu { kpi, label, value, formatted, unit, icon, status, comparison }
 * - size: 'small' | 'medium' | 'large' (default: 'medium')
 * - onClick: callback când se face click pe card
 * 
 * Usage:
 * ```jsx
 * <KPICard 
 *   metric={metric}
 *   size="medium"
 *   onClick={() => navigateToDetails(metric.kpi)}
 * />
 * ```
 */
export function KPICard({ metric, size = 'medium', onClick }) {
    if (!metric) return null;
    
    const {
        icon = '📊',
        label,
        formatted,
        value,
        unit,
        status,
        comparison,
        color
    } = metric;
    
    // Determine status color
    const statusColor = status === 'good' ? 'var(--success-color, #4caf50)' 
                      : status === 'warning' ? 'var(--warning-color, #ff9800)'
                      : status === 'critical' ? 'var(--error-color, #f44336)'
                      : color || 'var(--primary-color, #1976d2)';
    
    // Determine trend icon
    const trendIcon = comparison?.trend === 'up' ? '↑' 
                    : comparison?.trend === 'down' ? '↓'
                    : '→';
    
    const trendClass = comparison?.trend === 'up' ? 'trend-up'
                     : comparison?.trend === 'down' ? 'trend-down'
                     : 'trend-stable';
    
    return (
        <div 
            className={`kpi-card kpi-card--${size} kpi-card--${status}`}
            onClick={onClick}
            style={{ borderLeftColor: statusColor }}
        >
            {/* Header */}
            <div className="kpi-card__header">
                <span className="kpi-card__icon" style={{ color: statusColor }}>
                    {icon}
                </span>
                <h3 className="kpi-card__title">
                    {label?.ro || label?.en || metric.kpi}
                </h3>
            </div>
            
            {/* Value */}
            <div className="kpi-card__value">
                <span className="kpi-card__value-main" style={{ color: statusColor }}>
                    {formatted || value}
                </span>
                {unit && unit !== 'currency' && unit !== 'percentage' && (
                    <span className="kpi-card__unit">{unit}</span>
                )}
            </div>
            
            {/* Comparison */}
            {comparison && (
                <div className={`kpi-card__comparison ${trendClass}`}>
                    <span className="kpi-card__trend-icon">{trendIcon}</span>
                    <span className="kpi-card__trend-value">
                        {comparison.change_percent >= 0 ? '+' : ''}
                        {comparison.change_percent.toFixed(1)}%
                    </span>
                    <span className="kpi-card__trend-label">vs perioada anterioară</span>
                </div>
            )}
            
            {/* Status badge */}
            <div className="kpi-card__status">
                <span className={`status-badge status-badge--${status}`}>
                    {status === 'good' && '✓ Bun'}
                    {status === 'warning' && '⚠ Atenție'}
                    {status === 'critical' && '✗ Critic'}
                    {status === 'neutral' && '— Normal'}
                </span>
            </div>
        </div>
    );
}

export default KPICard;

