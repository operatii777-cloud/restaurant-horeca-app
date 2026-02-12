"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitLossPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./ProfitLossPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
var ProfitLossPage = function () {
    var _a, _b, _c;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)(function () {
        var date = new Date();
        date.setFullYear(2025, 0, 1);
        return date.toISOString().split('T')[0];
    }), startDate = _d[0], setStartDate = _d[1];
    var _e = (0, react_1.useState)(function () {
        var date = new Date();
        date.setFullYear(2025, 11, 31);
        return date.toISOString().split('T')[0];
    }), endDate = _e[0], setEndDate = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)([]), data = _g[0], setData = _g[1];
    var _h = (0, react_1.useState)({
        totalRevenue: 0,
        totalCOGS: 0,
        grossProfit: 0,
    }), summary = _h[0], setSummary = _h[1];
    var loadProfitLoss = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, backendData, dailyData, totals, totalRevenue, totalCOGS, grossProfit, error_1, mockData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/reports/profit-loss', {
                            params: {
                                start_date: startDate,
                                end_date: endDate,
                            },
                        })];
                case 2:
                    response = _a.sent();
                    if (response.data) {
                        backendData = response.data;
                        dailyData = (backendData.data || []).map(function (day) { return ({
                            date: day.date,
                            revenue: day.revenue || 0,
                            cogs: day.costs || 0,
                            grossProfit: day.profit || 0,
                            margin: day.margin || 0,
                        }); });
                        setData(dailyData);
                        totals = backendData.totals || {};
                        totalRevenue = totals.total_revenue || dailyData.reduce(function (sum, item) { return sum + item.revenue; }, 0);
                        totalCOGS = totals.total_costs || dailyData.reduce(function (sum, item) { return sum + item.cogs; }, 0);
                        grossProfit = totals.total_profit || (totalRevenue - totalCOGS);
                        setSummary({
                            totalRevenue: totalRevenue,
                            totalCOGS: totalCOGS,
                            grossProfit: grossProfit,
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('❌ Eroare la încărcarea raportului Profit & Loss:', error_1);
                    mockData = [
                        { date: '2025-01-01', revenue: 5000, cogs: 2000, grossProfit: 3000, margin: 60 },
                        { date: '2025-01-02', revenue: 5500, cogs: 2200, grossProfit: 3300, margin: 60 },
                        { date: '2025-01-03', revenue: 4800, cogs: 1920, grossProfit: 2880, margin: 60 },
                        { date: '2025-01-04', revenue: 6200, cogs: 2480, grossProfit: 3720, margin: 60 },
                        { date: '2025-01-05', revenue: 5800, cogs: 2320, grossProfit: 3480, margin: 60 },
                    ];
                    setData(mockData);
                    setSummary({
                        totalRevenue: 27300,
                        totalCOGS: 10920,
                        grossProfit: 16380,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadProfitLoss();
    }, [startDate, endDate]);
    var chartData = {
        labels: data.map(function (item) { return new Date(item.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }); }),
        datasets: [
            {
                label: 'Venituri', // Text românesc direct
                data: data.map(function (item) { return item.revenue; }),
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'COGS',
                data: data.map(function (item) { return item.cogs; }),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Profit Brut',
                data: data.map(function (item) { return item.grossProfit; }),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
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
                        return numValue.toFixed(0) + ' RON';
                    },
                },
            },
        },
    };
    return (<div className="profit-loss-page">
      <react_bootstrap_1.Card className="shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Raport Profit & Loss (P&L)</h5>
          <div className="d-flex">
            <input type="date" className="form-control me-2" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }} style={{ width: "Auto" }}/>
            <input type="date" className="form-control me-2" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }} style={{ width: "Auto" }}/>
            <button className="btn btn-primary" onClick={loadProfitLoss} disabled={loading}>
              <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync-alt', " me-1")}></i>
              {loading ? 'Se încarcă...' : 'Reîmprospătează'}
            </button>
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {/* Summary Cards */}
          <div className="row text-center mb-4">
            <div className="col border-end">
              <h4>{((_a = summary.totalRevenue) !== null && _a !== void 0 ? _a : 0).toFixed(2)} RON</h4>
              <small className="text-muted">Venituri Totale</small>
            </div>
            <div className="col border-end">
              <h4>{((_b = summary.totalCOGS) !== null && _b !== void 0 ? _b : 0).toFixed(2)} RON</h4>
              <small className="text-muted">Costul Mărfii Vândute (COGS)</small>
            </div>
            <div className="col">
              <h4>{((_c = summary.grossProfit) !== null && _c !== void 0 ? _c : 0).toFixed(2)} RON</h4>
              <small className="text-muted">Profit Brut</small>
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: '400px', marginBottom: '2rem' }}>
            <react_chartjs_2_1.Line data={chartData} options={chartOptions}/>
          </div>

          {/* Details Table */}
          <h6 className="mt-4">"detalii zilnice"</h6>
          <react_bootstrap_1.Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Data</th>
                <th>Venituri</th>
                <th>COGS</th>
                <th>Profit Brut</th>
                <th>Marjă (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (<tr>
                  <td colSpan={5} className="text-center text-muted">
                    {loading ? 'Se încarcă datele...' : 'Nu există date pentru perioada selectată.'}
                  </td>
                </tr>) : (data.map(function (item, index) {
            var _a, _b, _c, _d;
            return (<tr key={index}>
                    <td>{new Date(item.date).toLocaleDateString('ro-RO')}</td>
                    <td>{((_a = item.revenue) !== null && _a !== void 0 ? _a : 0).toFixed(2)} RON</td>
                    <td>{((_b = item.cogs) !== null && _b !== void 0 ? _b : 0).toFixed(2)} RON</td>
                    <td>{((_c = item.grossProfit) !== null && _c !== void 0 ? _c : 0).toFixed(2)} RON</td>
                    <td>{((_d = item.margin) !== null && _d !== void 0 ? _d : 0).toFixed(2)}%</td>
                  </tr>);
        }))}
            </tbody>
          </react_bootstrap_1.Table>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.ProfitLossPage = ProfitLossPage;
