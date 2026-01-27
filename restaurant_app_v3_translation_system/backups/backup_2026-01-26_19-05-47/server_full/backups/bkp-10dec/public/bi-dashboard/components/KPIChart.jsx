// components/KPIChart.jsx
// FAZA 2C - Săptămâna 6: KPI Chart Component

import React, { useRef, useEffect } from 'react';
import './KPIChart.css';

/**
 * KPI Chart Component - Afișează un chart pentru un KPI
 * 
 * Props:
 * - type: 'line' | 'bar' | 'gauge' | 'pie' (default: 'line')
 * - data: array of { date/label, value }
 * - kpi: { label, unit, color, thresholds }
 * - height: number (default: 300)
 * - width: number (default: auto)
 * - showGrid: boolean (default: true)
 * - showLegend: boolean (default: true)
 * 
 * Usage:
 * ```jsx
 * <KPIChart 
 *   type="line"
 *   data={history}
 *   kpi={{ label: 'Venituri', unit: 'RON', color: '#28a745' }}
 * />
 * ```
 */
export function KPIChart({ 
    type = 'line',
    data = [],
    kpi = {},
    height = 300,
    width = null,
    showGrid = true,
    showLegend = true
}) {
    const canvasRef = useRef(null);
    
    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;
        
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
        
        // Draw chart based on type
        switch (type) {
            case 'line':
                drawLineChart(ctx, data, kpi, rect.width, height, showGrid);
                break;
            case 'bar':
                drawBarChart(ctx, data, kpi, rect.width, height, showGrid);
                break;
            case 'gauge':
                drawGaugeChart(ctx, data, kpi, rect.width, height);
                break;
            case 'pie':
                drawPieChart(ctx, data, kpi, rect.width, height);
                break;
            default:
                drawLineChart(ctx, data, kpi, rect.width, height, showGrid);
        }
        
    }, [type, data, kpi, height, showGrid]);
    
    return (
        <div className="kpi-chart">
            {showLegend && (
                <div className="kpi-chart__legend">
                    <span className="legend-color" style={{ backgroundColor: kpi.color }}></span>
                    <span className="legend-label">{kpi.label?.ro || kpi.label?.en || 'KPI'}</span>
                    {kpi.unit && <span className="legend-unit">({kpi.unit})</span>}
                </div>
            )}
            <canvas 
                ref={canvasRef}
                className="kpi-chart__canvas"
                style={{ width: width || '100%', height: `${height}px` }}
            />
        </div>
    );
}

// ==================== DRAWING FUNCTIONS ====================

/**
 * Draw Line Chart
 */
function drawLineChart(ctx, data, kpi, width, height, showGrid) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Get min/max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    
    // Draw grid
    if (showGrid) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines (5 lines)
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = maxValue - (range / 5) * i;
            ctx.fillStyle = '#666';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(formatValue(value, kpi.unit), padding - 10, y + 4);
        }
    }
    
    // Draw line
    ctx.strokeStyle = kpi.color || '#1976d2';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = kpi.color || '#1976d2';
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw X-axis labels (sample every N points for readability)
    ctx.fillStyle = '#666';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    const labelStep = Math.ceil(data.length / 6);
    data.forEach((point, index) => {
        if (index % labelStep === 0) {
            const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
            const label = point.date || point.label || index;
            ctx.fillText(formatDate(label), x, height - padding + 20);
        }
    });
}

/**
 * Draw Bar Chart
 */
function drawBarChart(ctx, data, kpi, width, height, showGrid) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 1);
    
    const barWidth = chartWidth / data.length * 0.8;
    const barGap = chartWidth / data.length * 0.2;
    
    // Draw grid
    if (showGrid) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            
            const value = maxValue - (maxValue / 5) * i;
            ctx.fillStyle = '#666';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(formatValue(value, kpi.unit), padding - 10, y + 4);
        }
    }
    
    // Draw bars
    ctx.fillStyle = kpi.color || '#1976d2';
    
    data.forEach((point, index) => {
        const x = padding + (barWidth + barGap) * index + barGap / 2;
        const barHeight = (point.value / maxValue) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        // Gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, kpi.color || '#1976d2');
        gradient.addColorStop(1, adjustColor(kpi.color || '#1976d2', -30));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Bar label
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const label = point.date || point.label || index;
        ctx.fillText(formatDate(label), x + barWidth / 2, height - padding + 20);
    });
}

/**
 * Draw Gauge Chart (for percentage KPIs)
 */
function drawGaugeChart(ctx, data, kpi, width, height) {
    const centerX = width / 2;
    const centerY = height * 0.65;
    const radius = Math.min(width, height) * 0.35;
    
    const value = data[data.length - 1]?.value || 0;
    const maxValue = 100; // Assume percentage
    const angle = (value / maxValue) * Math.PI - Math.PI;
    
    // Background arc
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI, 0);
    ctx.stroke();
    
    // Value arc
    const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    
    // Color based on thresholds
    if (kpi.thresholds) {
        const { good, warning, critical } = kpi.thresholds;
        if (value >= good) {
            gradient.addColorStop(0, '#4caf50');
            gradient.addColorStop(1, '#8bc34a');
        } else if (value >= warning) {
            gradient.addColorStop(0, '#ff9800');
            gradient.addColorStop(1, '#ffc107');
        } else {
            gradient.addColorStop(0, '#f44336');
            gradient.addColorStop(1, '#e57373');
        }
    } else {
        gradient.addColorStop(0, kpi.color || '#1976d2');
        gradient.addColorStop(1, adjustColor(kpi.color || '#1976d2', 30));
    }
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI, angle);
    ctx.stroke();
    
    // Center value
    ctx.fillStyle = '#333';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(value.toFixed(1), centerX, centerY + 10);
    
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(kpi.unit || '%', centerX, centerY + 35);
    
    // Thresholds indicators
    if (kpi.thresholds) {
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'left';
        ctx.fillText(`Good: ${kpi.thresholds.good}+`, centerX - radius, centerY + radius + 25);
        ctx.textAlign = 'right';
        ctx.fillText(`Critical: <${kpi.thresholds.critical}`, centerX + radius, centerY + radius + 25);
    }
}

/**
 * Draw Pie Chart
 */
function drawPieChart(ctx, data, kpi, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = -Math.PI / 2;
    
    const colors = generateColors(data.length, kpi.color);
    
    data.forEach((point, index) => {
        const sliceAngle = (point.value / total) * Math.PI * 2;
        const endAngle = startAngle + sliceAngle;
        
        // Draw slice
        ctx.fillStyle = colors[index];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        
        // Draw label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${((point.value / total) * 100).toFixed(1)}%`, labelX, labelY);
        
        startAngle = endAngle;
    });
    
    // Legend
    const legendX = width - 120;
    let legendY = 20;
    
    data.forEach((point, index) => {
        ctx.fillStyle = colors[index];
        ctx.fillRect(legendX, legendY, 15, 15);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(point.label || `Item ${index + 1}`, legendX + 20, legendY + 12);
        
        legendY += 25;
    });
}

// ==================== HELPER FUNCTIONS ====================

function formatValue(value, unit) {
    if (unit === 'currency' || unit === 'RON' || unit === 'EUR') {
        return value.toFixed(0);
    } else if (unit === 'percentage' || unit === '%') {
        return `${value.toFixed(1)}%`;
    } else {
        return value.toFixed(1);
    }
}

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        
        return `${date.getDate()}/${date.getMonth() + 1}`;
    } catch {
        return dateStr;
    }
}

function adjustColor(color, amount) {
    // Simple color adjustment
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function generateColors(count, baseColor) {
    const colors = [];
    const base = baseColor || '#1976d2';
    
    for (let i = 0; i < count; i++) {
        const hueShift = (360 / count) * i;
        colors.push(shiftHue(base, hueShift));
    }
    
    return colors;
}

function shiftHue(color, degrees) {
    // Simplified hue shift
    const variations = [
        '#1976d2', '#2196f3', '#03a9f4', '#00bcd4',
        '#009688', '#4caf50', '#8bc34a', '#cddc39',
        '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    
    const index = Math.floor(degrees / 30) % variations.length;
    return variations[index];
}

export default KPIChart;

