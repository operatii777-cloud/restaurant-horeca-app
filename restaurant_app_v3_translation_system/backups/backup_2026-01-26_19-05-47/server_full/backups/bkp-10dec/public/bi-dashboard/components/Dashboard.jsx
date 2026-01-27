// components/Dashboard.jsx
// FAZA 2C - Săptămâna 5: Executive Dashboard Component

import React, { useState, useEffect } from 'react';
import { useKPIs, useTenant, useBranding } from '../hooks';
import KPICard from './KPICard';
import './Dashboard.css';

/**
 * Executive Dashboard Component - Main BI Dashboard
 * 
 * Props:
 * - period: 'today' | 'week' | 'month' | 'quarter' | 'year' (default: 'month')
 * - autoRefresh: boolean (default: false)
 * - refreshInterval: number in ms (default: 60000)
 * 
 * Usage:
 * ```jsx
 * <Dashboard period="month" autoRefresh={true} />
 * ```
 */
export function Dashboard({ 
    period = 'month', 
    autoRefresh = false,
    refreshInterval = 60000
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // Hooks
    const { tenant, loading: tenantLoading } = useTenant();
    const { branding, applyBranding } = useBranding();
    const { 
        metrics, 
        categorized, 
        summary, 
        period: periodInfo,
        loading: metricsLoading, 
        error,
        refresh 
    } = useKPIs({
        period: selectedPeriod,
        autoRefresh,
        refreshInterval
    });
    
    // Apply branding on mount
    useEffect(() => {
        if (branding) {
            applyBranding();
        }
    }, [branding]);
    
    // Loading state
    if (tenantLoading || metricsLoading) {
        return (
            <div className="dashboard">
                <div className="dashboard__loading">
                    <div className="spinner"></div>
                    <p>Se încarcă dashboard-ul...</p>
                </div>
            </div>
        );
    }
    
    // Error state
    if (error) {
        return (
            <div className="dashboard">
                <div className="dashboard__error">
                    <span className="error-icon">⚠️</span>
                    <h3>Eroare la încărcarea datelor</h3>
                    <p>{error}</p>
                    <button onClick={refresh} className="btn btn--primary">
                        Reîncearcă
                    </button>
                </div>
            </div>
        );
    }
    
    // Get categories
    const categories = categorized ? Object.keys(categorized) : [];
    
    // Filter metrics by category
    const filteredMetrics = selectedCategory === 'all' 
        ? metrics 
        : metrics.filter(m => m.category === selectedCategory);
    
    // Only show visible metrics
    const visibleMetrics = filteredMetrics.filter(m => m.is_visible !== false);
    
    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard__header">
                <div className="dashboard__title">
                    <h1>📊 Dashboard Executiv</h1>
                    <p className="dashboard__subtitle">
                        {tenant?.name || 'Restaurant'}
                    </p>
                </div>
                
                <div className="dashboard__controls">
                    {/* Period Selector */}
                    <div className="period-selector">
                        <button 
                            className={`period-btn ${selectedPeriod === 'today' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('today')}
                        >
                            Astăzi
                        </button>
                        <button 
                            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('week')}
                        >
                            Săptămână
                        </button>
                        <button 
                            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('month')}
                        >
                            Lună
                        </button>
                        <button 
                            className={`period-btn ${selectedPeriod === 'quarter' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('quarter')}
                        >
                            Trimestru
                        </button>
                        <button 
                            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('year')}
                        >
                            An
                        </button>
                    </div>
                    
                    {/* Refresh Button */}
                    <button 
                        className="btn btn--icon" 
                        onClick={refresh}
                        title="Reîmprospătează datele"
                    >
                        🔄
                    </button>
                </div>
            </div>
            
            {/* Period Info */}
            {periodInfo && (
                <div className="dashboard__period-info">
                    <span className="period-info__label">Perioadă curentă:</span>
                    <span className="period-info__date">
                        {new Date(periodInfo.current.start).toLocaleDateString('ro-RO')} - {' '}
                        {new Date(periodInfo.current.end).toLocaleDateString('ro-RO')}
                    </span>
                    {periodInfo.previous && (
                        <>
                            <span className="period-info__separator">vs</span>
                            <span className="period-info__date period-info__date--previous">
                                {new Date(periodInfo.previous.start).toLocaleDateString('ro-RO')} - {' '}
                                {new Date(periodInfo.previous.end).toLocaleDateString('ro-RO')}
                            </span>
                        </>
                    )}
                </div>
            )}
            
            {/* Summary */}
            <div className="dashboard__summary">
                <div className="summary-card">
                    <span className="summary-card__icon">📈</span>
                    <div className="summary-card__content">
                        <span className="summary-card__value">{summary.total}</span>
                        <span className="summary-card__label">Total Metrici</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="summary-card__icon">✅</span>
                    <div className="summary-card__content">
                        <span className="summary-card__value">{summary.successful}</span>
                        <span className="summary-card__label">Calculate</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="summary-card__icon">❌</span>
                    <div className="summary-card__content">
                        <span className="summary-card__value">{summary.failed}</span>
                        <span className="summary-card__label">Eșecuri</span>
                    </div>
                </div>
            </div>
            
            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="dashboard__category-filter">
                    <button 
                        className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        Toate
                    </button>
                    {categories.map(category => (
                        <button 
                            key={category}
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {getCategoryLabel(category)}
                        </button>
                    ))}
                </div>
            )}
            
            {/* Metrics Grid */}
            <div className="dashboard__metrics">
                {visibleMetrics.length === 0 ? (
                    <div className="dashboard__empty">
                        <span className="empty-icon">📊</span>
                        <h3>Nicio metrică disponibilă</h3>
                        <p>Configurați KPI-urile dorite în setări.</p>
                    </div>
                ) : (
                    <div className="metrics-grid">
                        {visibleMetrics.map((metric, index) => (
                            <KPICard 
                                key={metric.kpi}
                                metric={metric}
                                size="medium"
                                onClick={() => handleKPIClick(metric)}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="dashboard__footer">
                <p className="dashboard__footer-text">
                    Ultima actualizare: {new Date().toLocaleString('ro-RO')}
                </p>
                {autoRefresh && (
                    <p className="dashboard__footer-text">
                        <span className="auto-refresh-indicator">●</span>
                        Reîmprospătare automată activă (la fiecare {refreshInterval / 1000}s)
                    </p>
                )}
            </div>
        </div>
    );
}

// Helper Functions
function getCategoryLabel(category) {
    const labels = {
        revenue: '💰 Venituri',
        cost: '📦 Costuri',
        profit: '💎 Profit',
        customer: '👥 Clienți',
        efficiency: '⚡ Eficiență'
    };
    return labels[category] || category;
}

function handleKPIClick(metric) {
    console.log('[Dashboard] KPI clicked:', metric.kpi);
    // TODO: Navigare către detalii KPI
    // Ex: window.location.href = `/bi/kpis/${metric.kpi}`;
}

export default Dashboard;

