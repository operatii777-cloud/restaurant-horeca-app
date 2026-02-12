"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - Category Profitability Chart Component
 * Pie chart pentru distribuția profitabilității pe categorii
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryProfitabilityChart = void 0;
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
require("./CategoryProfitabilityChart.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.ArcElement, chart_js_1.Tooltip, chart_js_1.Legend);
var CategoryProfitabilityChart = function (_a) {
    var data = _a.data, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.height, height = _c === void 0 ? 400 : _c;
    //   const { t } = useTranslation();
    // Afișează loading doar când se încarcă efectiv
    if (loading) {
        return (<div className="category-profitability-chart" style={{ height: "".concat(height, "px") }}>
        <div className="chart-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
          <p className="text-muted mt-2">Se încarcă datele...</p>
        </div>
      </div>);
    }
    // Dacă nu există date după ce s-a terminat loading-ul, afișează mesaj
    if (data.length === 0) {
        return (<div className="category-profitability-chart" style={{ height: "".concat(height, "px") }}>
        <div className="chart-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-muted">📊 Nu există date disponibile pentru perioada selectată</p>
          <small className="text-muted">"incearca sa selectezi o alta perioada"</small>
        </div>
      </div>);
    }
    // Generate colors for categories
    var colors = [
        'rgba(37, 99, 235, 0.8)', // Blue
        'rgba(34, 197, 94, 0.8)', // Green
        'rgba(239, 68, 68, 0.8)', // Red
        'rgba(251, 146, 60, 0.8)', // Orange
        'rgba(168, 85, 247, 0.8)', // Purple
        'rgba(236, 72, 153, 0.8)', // Pink
        'rgba(59, 130, 246, 0.8)', // Light Blue
        'rgba(16, 185, 129, 0.8)', // Teal
    ];
    var chartData = {
        labels: data.map(function (item) { return item.name; }),
        datasets: [
            {
                label: 'Revenue',
                data: data.map(function (item) { return item.value; }),
                backgroundColor: data.map(function (_, index) { return colors[index % colors.length]; }),
                borderColor: data.map(function (_, index) { return colors[index % colors.length].replace('0.8', '1'); }),
                borderWidth: 2,
            },
        ],
    };
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                    },
                    generateLabels: function (chart) {
                        var data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map(function (label, i) {
                                var dataset = data.datasets[0];
                                var value = dataset.data[i];
                                var total = dataset.data.reduce(function (a, b) { return a + b; }, 0);
                                var percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: "\"Label\" (\"Percentage\"%)",
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.borderColor[i],
                                    lineWidth: dataset.borderWidth,
                                    hidden: false,
                                    index: i,
                                };
                            });
                        }
                        return [];
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        var label = context.label || '';
                        var value = context.parsed || 0;
                        var total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                        var percentage = ((value / total) * 100).toFixed(1);
                        var categoryData = data[context.dataIndex];
                        return [
                            "\"Label\": ".concat(value.toFixed(2), " RON (\"Percentage\"%)"),
                            "Food Cost: ".concat(categoryData.foodCostPercent.toFixed(1), "%"),
                            "Profit: ".concat(categoryData.profit.toFixed(2), " RON"),
                        ];
                    },
                },
            },
        },
    };
    return (<div className="category-profitability-chart" style={{ height: "\"Height\"px" }}>
      <react_chartjs_2_1.Pie data={chartData} options={chartOptions}/>
    </div>);
};
exports.CategoryProfitabilityChart = CategoryProfitabilityChart;
