// components/TrendChart.jsx
// FAZA 2C - Săptămâna 6: Trend Chart Component (Multiple KPIs)

import React, { useRef, useEffect, useState } from 'react';
import { useKPITrends } from '../hooks';
import './TrendChart.css';

/**
 * Trend Chart Component - Afișează trends pentru multiple KPI-uri
 * 
 * Props:
 * - kpiIds: array of KPI IDs to display
 * - days: number of days to look back (default: 30)
 * - height: number (default: 400)
 * - showLegend: boolean (default: true)
 * - interactive: boolean (default: true) - allow toggling KPIs
 * 
 * Usage:
 * ```jsx
 * <TrendChart 
 *   kpiIds={['gross_revenue', 'net_profit', 'avg_order_value']}
 *   days={30}
 *   height={400}
 * />
 * ```
 */
export function TrendChart({ 
    kpiIds = [],
    days = 30,
    height = 400,
    showLegend = true,
    interactive = true
}) {
    const canvasRef = useRef(null);
    const [visibleKPIs, setVisibleKPIs] = useState(kpiIds);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    
    // Fetch trends data
    const { trends, loading, error } = useKPITrends(kpiIds, { days });
    
    useEffect(() => {
        if (!canvasRef.current || !trends || trends.length === 0) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = height * dpr;
        
        ctx.scale(dpr, dpr);
        
        // Clear canvas
        ctx.clearRect(0, 0, rect.width, height);
        
        // Draw chart
        drawMultiLineChart(ctx, trends, visibleKPIs, rect.width, height);
        
    }, [trends, visibleKPIs, height]);
    
    // Toggle KPI visibility
    function toggleKPI(kpiId) {
        if (!interactive) return;
        
        setVisibleKPIs(prev => {
            if (prev.includes(kpiId)) {
                // Keep at least one visible
                if (prev.length === 1) return prev;
                return prev.filter(id => id !== kpiId);
            } else {
                return [...prev, kpiId];
            }
        });
    }
    
    if (loading) {
        return (
            <div className="trend-chart">
                <div className="trend-chart__loading">
                    <div className="spinner"></div>
                    <p>Se încarcă trends...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="trend-chart">
                <div className="trend-chart__error">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                </div>
            </div>
        );
    }
    
    if (!trends || trends.length === 0) {
        return (
            <div className="trend-chart">
                <div className="trend-chart__empty">
                    <span className="empty-icon">📈</span>
                    <p>Nicio dată disponibilă pentru trends</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="trend-chart">
            {/* Legend */}
            {showLegend && (
                <div className="trend-chart__legend">
                    {trends.map(trend => (
                        <button
                            key={trend.kpi}
                            className={`legend-item ${visibleKPIs.includes(trend.kpi) ? 'active' : 'inactive'}`}
                            onClick={() => toggleKPI(trend.kpi)}
                            disabled={!interactive}
                        >
                            <span 
                                className="legend-color"
                                style={{ backgroundColor: getKPIColor(trend.kpi) }}
                            ></span>
                            <span className="legend-label">
                                {trend.label?.ro || trend.kpi}
                            </span>
                            <span className="legend-icon">
                                {trend.icon}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            
            {/* Canvas */}
            <canvas 
                ref={canvasRef}
                className="trend-chart__canvas"
                style={{ width: '100%', height: `${height}px` }}
            />
            
            {/* Tooltip */}
            {hoveredPoint && (
                <div 
                    className="trend-chart__tooltip"
                    style={{
                        left: `${hoveredPoint.x}px`,
                        top: `${hoveredPoint.y}px`
                    }}
                >
                    <div className="tooltip-date">{hoveredPoint.date}</div>
                    {hoveredPoint.values.map(v => (
                        <div key={v.kpi} className="tooltip-value">
                            <span style={{ color: v.color }}>●</span>
                            {v.label}: {v.value}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==================== DRAWING FUNCTIONS ====================

function drawMultiLineChart(ctx, trends, visibleKPIs, width, height) {
    const padding = { top: 20, right: 20, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Filter visible trends
    const visibleTrends = trends.filter(t => visibleKPIs.includes(t.kpi));
    if (visibleTrends.length === 0) return;
    
    // Get all data points
    const allData = visibleTrends.flatMap(t => t.data);
    if (allData.length === 0) return;
    
    // Get date range
    const dates = [...new Set(allData.map(d => d.date))].sort();
    
    // Get value range (across all visible KPIs)
    const allValues = allData.map(d => d.value);
    const minValue = Math.min(...allValues, 0);
    const maxValue = Math.max(...allValues, 1);
    const range = maxValue - minValue;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        // Y-axis labels
        const value = maxValue - (range / 5) * i;
        ctx.fillStyle = '#666';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(0), padding.left - 10, y + 4);
    }
    
    // Vertical grid lines (dates)
    const dateStep = Math.ceil(dates.length / 6);
    dates.forEach((date, index) => {
        if (index % dateStep === 0) {
            const x = padding.left + (chartWidth / (dates.length - 1 || 1)) * index;
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();
            
            // X-axis labels
            ctx.fillStyle = '#666';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(formatDate(date), x, height - padding.bottom + 20);
        }
    });
    
    // Draw lines for each KPI
    visibleTrends.forEach(trend => {
        const color = getKPIColor(trend.kpi);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        
        trend.data.forEach((point, index) => {
            const dateIndex = dates.indexOf(point.date);
            const x = padding.left + (chartWidth / (dates.length - 1 || 1)) * dateIndex;
            const y = padding.top + chartHeight - ((point.value - minValue) / range) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = color;
        trend.data.forEach(point => {
            const dateIndex = dates.indexOf(point.date);
            const x = padding.left + (chartWidth / (dates.length - 1 || 1)) * dateIndex;
            const y = padding.top + chartHeight - ((point.value - minValue) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}

// ==================== HELPER FUNCTIONS ====================

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    } catch {
        return dateStr;
    }
}

function getKPIColor(kpiId) {
    const colors = {
        gross_revenue: '#28a745',
        net_revenue: '#20c997',
        net_profit: '#6610f2',
        cogs: '#dc3545',
        labor_cost: '#fd7e14',
        prime_cost: '#e83e8c',
        gross_profit: '#17a2b8',
        profit_margin: '#6f42c1',
        food_cost_percent: '#ffc107',
        labor_cost_percent: '#ff9800',
        avg_order_value: '#17a2b8',
        customer_retention: '#20c997',
        satisfaction_score: '#ffc107',
        avg_order_time: '#6610f2',
        cancellation_rate: '#dc3545'
    };
    
    return colors[kpiId] || '#1976d2';
}

export default TrendChart;

