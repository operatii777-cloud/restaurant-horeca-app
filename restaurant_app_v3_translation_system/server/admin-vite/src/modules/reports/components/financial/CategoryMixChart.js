"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S15 — Category Mix Chart Component
 *
 * Pie/Bar chart for category mix visualization
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryMixChart = CategoryMixChart;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
function CategoryMixChart(_a) {
    var categories = _a.categories, _b = _a.chartType, chartType = _b === void 0 ? 'pie' : _b, _c = _a.title, title = _c === void 0 ? 'Category Mix' : _c;
    //   const { t } = useTranslation();
    var chartData = (0, react_1.useMemo)(function () {
        //   const { t } = useTranslation();
        var sortedCategories = __spreadArray([], categories, true).sort(function (a, b) { return b.shareOfRevenue - a.shareOfRevenue; });
        return {
            labels: sortedCategories.map(function (cat) { return cat.categoryName; }),
            datasets: [
                {
                    label: 'Share of Revenue (%)',
                    data: sortedCategories.map(function (cat) { return cat.shareOfRevenue; }),
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.5)',
                        'rgba(40, 167, 69, 0.5)',
                        'rgba(255, 193, 7, 0.5)',
                        'rgba(220, 53, 69, 0.5)',
                        'rgba(23, 162, 184, 0.5)',
                        'rgba(108, 117, 125, 0.5)',
                        'rgba(255, 87, 34, 0.5)',
                        'rgba(156, 39, 176, 0.5)',
                    ],
                    borderColor: [
                        'rgba(37, 99, 235, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(23, 162, 184, 1)',
                        'rgba(108, 117, 125, 1)',
                        'rgba(255, 87, 34, 1)',
                        'rgba(156, 39, 176, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [categories]);
    var options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: !!title,
                text: title,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        var _a;
                        var label = context.label || '';
                        var value = context.parsed || ((_a = context.parsed) === null || _a === void 0 ? void 0 : _a.y) || 0;
                        var numValue = Number(value) || 0;
                        return "\"Label\": ".concat(numValue.toFixed(1), "%");
                    },
                },
            },
        },
    };
    var ChartComponent = chartType === 'pie' ? react_chartjs_2_1.Pie : react_chartjs_2_1.Bar;
    return (<react_bootstrap_1.Card>
      <react_bootstrap_1.Card.Body>
        <div style={{ height: '400px' }}>
          <ChartComponent data={chartData} options={options}/>
        </div>
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
}
