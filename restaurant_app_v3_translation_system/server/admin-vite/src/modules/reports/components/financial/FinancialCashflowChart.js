"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S15 — Financial Cashflow Chart Component
 *
 * Bar chart for cashflow visualization (inflows vs outflows)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialCashflowChart = FinancialCashflowChart;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
function FinancialCashflowChart(_a) {
    var _b, _c, _d, _e, _f, _g;
    var data = _a.data, _h = _a.title, title = _h === void 0 ? 'Cashflow' : _h;
    //   const { t } = useTranslation();
    var chartData = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        //   const { t } = useTranslation();
        return {
            labels: ['Cash', 'Card', 'Vouchers', 'Other'],
            datasets: [
                {
                    label: 'Inflows',
                    data: [
                        (_b = (_a = data === null || data === void 0 ? void 0 : data.inflows) === null || _a === void 0 ? void 0 : _a.cash) !== null && _b !== void 0 ? _b : 0,
                        (_d = (_c = data === null || data === void 0 ? void 0 : data.inflows) === null || _c === void 0 ? void 0 : _c.card) !== null && _d !== void 0 ? _d : 0,
                        (_f = (_e = data === null || data === void 0 ? void 0 : data.inflows) === null || _e === void 0 ? void 0 : _e.vouchers) !== null && _f !== void 0 ? _f : 0,
                        (_h = (_g = data === null || data === void 0 ? void 0 : data.inflows) === null || _g === void 0 ? void 0 : _g.other) !== null && _h !== void 0 ? _h : 0,
                    ],
                    backgroundColor: 'rgba(40, 167, 69, 0.5)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Outflows',
                    data: [
                        (_k = (_j = data === null || data === void 0 ? void 0 : data.outflows) === null || _j === void 0 ? void 0 : _j.suppliers) !== null && _k !== void 0 ? _k : 0,
                        (_m = (_l = data === null || data === void 0 ? void 0 : data.outflows) === null || _l === void 0 ? void 0 : _l.salaries) !== null && _m !== void 0 ? _m : 0,
                        (_p = (_o = data === null || data === void 0 ? void 0 : data.outflows) === null || _o === void 0 ? void 0 : _o.other) !== null && _p !== void 0 ? _p : 0,
                        0, // Placeholder for alignment
                    ],
                    backgroundColor: 'rgba(220, 53, 69, 0.5)',
                    borderColor: 'rgba(220, 53, 69, 1)',
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
    return (<react_bootstrap_1.Card>
      <react_bootstrap_1.Card.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Net Cashflow:</strong>' '
              <span className={((_b = data === null || data === void 0 ? void 0 : data.netCashflow) !== null && _b !== void 0 ? _b : 0) >= 0 ? 'text-success' : 'text-danger'}>
                {((_c = data === null || data === void 0 ? void 0 : data.netCashflow) !== null && _c !== void 0 ? _c : 0).toFixed(2)} RON
              </span>
            </div>
            <div>
              <small className="text-muted">
                Period: {(_e = (_d = data === null || data === void 0 ? void 0 : data.period) === null || _d === void 0 ? void 0 : _d.from) !== null && _e !== void 0 ? _e : 'N/A'} - {(_g = (_f = data === null || data === void 0 ? void 0 : data.period) === null || _f === void 0 ? void 0 : _f.to) !== null && _g !== void 0 ? _g : 'N/A'}
              </small>
            </div>
          </div>
        </div>
        <div style={{ height: '400px' }}>
          <react_chartjs_2_1.Bar data={chartData} options={options}/>
        </div>
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
}
