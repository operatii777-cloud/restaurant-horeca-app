"use strict";
/**
 * S15 — Financial P&L Chart Component
 *
 * Bar/Line chart for P&L visualization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialPnlChart = FinancialPnlChart;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
function FinancialPnlChart(_a) {
    var data = _a.data, _b = _a.chartType, chartType = _b === void 0 ? 'bar' : _b, _c = _a.title, title = _c === void 0 ? 'Profit & Loss' : _c;
    var chartData = (0, react_1.useMemo)(function () {
        return {
            labels: data.map(function (item) { return item.day; }),
            datasets: [
                {
                    label: 'Venituri',
                    data: data.map(function (item) { return item.revenue; }),
                    backgroundColor: 'rgba(37, 99, 235, 0.5)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'COGS',
                    data: data.map(function (item) { return item.cogsTotal; }),
                    backgroundColor: 'rgba(220, 53, 69, 0.5)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Profit Brut',
                    data: data.map(function (item) { return item.grossProfit; }),
                    backgroundColor: 'rgba(40, 167, 69, 0.5)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1,
                },
            ],
        };
    }, [data]);
    var options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: !!title,
                text: title,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        var _a, _b;
                        var value = (_b = (_a = context.parsed) === null || _a === void 0 ? void 0 : _a.y) !== null && _b !== void 0 ? _b : 0;
                        return "".concat(context.dataset.label, ": ").concat(Number(value).toFixed(2), " RON");
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        var numValue = Number(value) || 0;
                        return "".concat(numValue.toFixed(0), " RON");
                    },
                },
            },
        },
    };
    var ChartComponent = chartType === 'bar' ? react_chartjs_2_1.Bar : react_chartjs_2_1.Line;
    return (<react_bootstrap_1.Card>
      <react_bootstrap_1.Card.Body>
        <div style={{ height: '400px' }}>
          <ChartComponent data={chartData} options={options}/>
        </div>
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
}
