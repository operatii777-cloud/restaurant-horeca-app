"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - Daily COGS Timeline Chart Component
 * Line chart pentru Revenue, COGS, Profit pe perioadă
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyCogsTimelineChart = void 0;
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
require("./DailyCogsTimelineChart.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
var DailyCogsTimelineChart = function (_a) {
    var data = _a.data, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.height, height = _c === void 0 ? 400 : _c;
    //   const { t } = useTranslation();
    if (loading || data.length === 0) {
        return (<div className="daily-cogs-timeline-chart" style={{ height: "".concat(height, "px") }}>
        <div className="chart-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
          <p className="text-muted mt-2">Se încarcă datele...</p>
        </div>
      </div>);
    }
    var chartData = {
        labels: data.map(function (item) { return item.label; }),
        datasets: [
            {
                label: 'Venituri',
                data: data.map(function (item) { return item.revenue; }),
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'COGS',
                data: data.map(function (item) { return item.cogs; }),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Profit',
                data: data.map(function (item) { return item.profit; }),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
        ],
    };
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        return "".concat(context.dataset.label, ": ").concat(context.parsed.y.toFixed(2), " RON");
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toFixed(0) + ' RON';
                    },
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                },
            },
        },
    };
    return (<div className="daily-cogs-timeline-chart" style={{ height: "\"Height\"px" }}>
      <react_chartjs_2_1.Line data={chartData} options={chartOptions}/>
    </div>);
};
exports.DailyCogsTimelineChart = DailyCogsTimelineChart;
