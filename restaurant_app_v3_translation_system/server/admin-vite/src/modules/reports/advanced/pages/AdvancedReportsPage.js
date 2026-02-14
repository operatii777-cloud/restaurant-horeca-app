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
exports.AdvancedReportsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
var SalesReportTab_1 = require("../components/SalesReportTab");
var ProfitabilityReportTab_1 = require("../components/ProfitabilityReportTab");
var CustomerBehaviorReportTab_1 = require("../components/CustomerBehaviorReportTab");
var TimeTrendsReportTab_1 = require("../components/TimeTrendsReportTab");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./AdvancedReportsPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
var AdvancedReportsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)('sales'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    }), startDate = _c[0], setStartDate = _c[1];
    var _d = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _d[0], setEndDate = _d[1];
    // Export handler
    var handleExport = function (reportType, format) { return __awaiter(void 0, void 0, void 0, function () {
        var reportMap, endpoint, url, response, blob, downloadUrl, a, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    reportMap = {
                        'sales': 'sales-detailed',
                        'profitability': 'profitability',
                        'customer-behavior': 'customer-behavior',
                        'time-trends': 'time-trends'
                    };
                    endpoint = reportMap[reportType] || 'sales-detailed';
                    url = "/api/reports/\"Endpoint\"?startDate=".concat(startDate, "&endDate=").concat(endDate, "&format=\"Format\"");
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Export failed');
                    return [4 /*yield*/, response.blob()];
                case 2:
                    blob = _a.sent();
                    downloadUrl = URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = "Raport_".concat(reportType, "_").concat(startDate, "_").concat(endDate, ".").concat(format === 'excel' ? 'xlsx' : 'pdf');
                    a.click();
                    URL.revokeObjectURL(downloadUrl);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Export error:', error_1);
                    alert('Eroare la export');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Data states
    var _e = (0, react_1.useState)(null), metrics = _e[0], setMetrics = _e[1];
    var _f = (0, react_1.useState)([]), revenueChart = _f[0], setRevenueChart = _f[1];
    var _g = (0, react_1.useState)([]), inventoryAlerts = _g[0], setInventoryAlerts = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    (0, react_1.useEffect)(function () {
        loadData();
        var interval = setInterval(loadData, 30000); // Update every 30 seconds
        return function () { return clearInterval(interval); };
    }, [startDate, endDate]);
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var metricsResponse, data, revenueResponse, chartData, chartData, alertsResponse, err_1;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/dashboard/metrics')];
                case 2:
                    metricsResponse = _g.sent();
                    if ((_a = metricsResponse.data) === null || _a === void 0 ? void 0 : _a.success) {
                        data = metricsResponse.data.data || metricsResponse.data;
                        setMetrics({
                            todayRevenue: data.todayRevenue || 0,
                            yesterdayRevenue: data.yesterdayRevenue || 0,
                            revenueChange: data.revenueChange || 0,
                            todayOrders: data.todayOrders || 0,
                            yesterdayOrders: data.yesterdayOrders || 0,
                            ordersChange: data.ordersChange || 0,
                            avgOrderValue: data.avgOrderValue || 0,
                            activeTables: data.activeTables || 0,
                        });
                    }
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/dashboard/revenue-chart', {
                            params: { startDate: startDate, endDate: endDate },
                        })];
                case 3:
                    revenueResponse = _g.sent();
                    if ((_b = revenueResponse.data) === null || _b === void 0 ? void 0 : _b.success) {
                        chartData = revenueResponse.data.data;
                        // Ensure it's always an array
                        setRevenueChart(Array.isArray(chartData) ? chartData : []);
                    }
                    else {
                        chartData = ((_c = revenueResponse.data) === null || _c === void 0 ? void 0 : _c.data) || revenueResponse.data;
                        setRevenueChart(Array.isArray(chartData) ? chartData : []);
                    }
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/dashboard/inventory-alerts')];
                case 4:
                    alertsResponse = _g.sent();
                    if ((_d = alertsResponse.data) === null || _d === void 0 ? void 0 : _d.success) {
                        setInventoryAlerts(alertsResponse.data.data || []);
                    }
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _g.sent();
                    console.error('Error loading analytics data:', err_1);
                    setError(((_f = (_e = err_1.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error) || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var formatCurrency = function (value) {
        return "".concat(value.toFixed(2), " RON");
    };
    var formatPercent = function (value) {
        var sign = value >= 0 ? '+' : '';
        return "".concat(sign).concat(value.toFixed(1), "%");
    };
    // Ensure revenueChart is always an array
    var safeRevenueChart = (0, react_1.useMemo)(function () {
        return Array.isArray(revenueChart) ? revenueChart : [];
    }, [revenueChart]);
    // Chart data for Revenue
    var getRevenueChartData = function () {
        if (!Array.isArray(safeRevenueChart) || safeRevenueChart.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        label: 'Venituri (RON)',
                        data: [],
                        borderColor: 'rgb(37, 99, 235)',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.4,
                    },
                ],
            };
        }
        return {
            labels: safeRevenueChart.map(function (item) { return new Date(item.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }); }),
            datasets: [
                {
                    label: 'Venituri (RON)',
                    data: safeRevenueChart.map(function (item) { return item.revenue || 0; }),
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    };
    // Chart data for Inventory Alerts
    var getInventoryAlertsChartData = function () {
        var lowStock = inventoryAlerts.filter(function (a) { return a.alert_type === 'low'; }).length;
        var outOfStock = inventoryAlerts.filter(function (a) { return a.alert_type === 'out'; }).length;
        return {
            labels: ['Stoc Scăzut', 'Stoc Epuizat'],
            datasets: [
                {
                    label: 'Număr Alerte',
                    data: [lowStock, outOfStock],
                    backgroundColor: [
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(255, 99, 132, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };
    return (<div className="advanced-reports-page">
      <div className="page-header">
        <h1>📊 Analytics Avansat</h1>
        <p>Dashboard avansat cu metrici detaliate și grafice interactive</p>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      {/* Key Metrics */}
      {metrics && (<react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Venituri Astăzi</h6>
                <h4 className="text-success">{formatCurrency(metrics.todayRevenue)}</h4>
                <small className={metrics.revenueChange >= 0 ? 'text-success' : 'text-danger'}>
                  {formatPercent(metrics.revenueChange)} față de ieri
                </small>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Comenzi Astăzi</h6>
                <h4>{metrics.todayOrders}</h4>
                <small className={metrics.ordersChange >= 0 ? 'text-success' : 'text-danger'}>
                  {formatPercent(metrics.ordersChange)} față de ieri
                </small>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Valoare Medie Comandă</h6>
                <h4>{formatCurrency(metrics.avgOrderValue)}</h4>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Mese Active</h6>
                <h4>{metrics.activeTables}</h4>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Filters */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Data Start</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Data End</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>&nbsp;</react_bootstrap_1.Form.Label>
              <div>
                <react_bootstrap_1.Button variant="primary" onClick={loadData} disabled={loading}>
                  <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync', " me-2")}></i>
                  {loading ? 'Se încarcă...' : 'Actualizează'}
                </react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Tabs */}
      <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return k && setActiveTab(k); }} className="mb-4">
        <react_bootstrap_1.Tab eventKey="sales" title='💰 Vânzări'>
          <SalesReportTab_1.SalesReportTab startDate={startDate} endDate={endDate} onExport={function (format) { return __awaiter(void 0, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                try {
                    url = "/api/reports/sales-detailed?startDate=".concat(startDate, "&endDate=").concat(endDate, "&format=").concat(format);
                    window.open(url, '_blank');
                }
                catch (err) {
                    console.error('Export error:', err);
                }
                return [2 /*return*/];
            });
        }); }}/>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="profitability" title="📈 Profitabilitate">
          <ProfitabilityReportTab_1.ProfitabilityReportTab startDate={startDate} endDate={endDate} onExport={function (format) { return __awaiter(void 0, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                try {
                    url = "/api/reports/profitability?startDate=".concat(startDate, "&endDate=").concat(endDate, "&format=\"Format\"");
                    window.open(url, '_blank');
                }
                catch (err) {
                    console.error('Export error:', err);
                }
                return [2 /*return*/];
            });
        }); }}/>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="customers" title='👥 Comportament Clienți'>
          <CustomerBehaviorReportTab_1.CustomerBehaviorReportTab startDate={startDate} endDate={endDate} onExport={function (format) { return __awaiter(void 0, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                try {
                    url = "/api/reports/customer-behavior?startDate=".concat(startDate, "&endDate=").concat(endDate, "&format=\"Format\"");
                    window.open(url, '_blank');
                }
                catch (err) {
                    console.error('Export error:', err);
                }
                return [2 /*return*/];
            });
        }); }}/>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="trends" title="📊 Trend-uri Temporale">
          <TimeTrendsReportTab_1.TimeTrendsReportTab startDate={startDate} endDate={endDate} onExport={function (format) { return __awaiter(void 0, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                try {
                    url = "/api/reports/time-trends?startDate=".concat(startDate, "&endDate=").concat(endDate, "&format=\"Format\"");
                    window.open(url, '_blank');
                }
                catch (err) {
                    console.error('Export error:', err);
                }
                return [2 /*return*/];
            });
        }); }}/>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="overview" title="📊 Overview">
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={8}>
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h5 className="mb-0">"evolutie venituri"</h5>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  {loading ? (<div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Se încarcă...</span>
                      </div>
                    </div>) : safeRevenueChart.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<div style={{ height: '400px' }}>
                      <react_chartjs_2_1.Line data={getRevenueChartData()} options={{ responsive: true }}/>
                    </div>)}
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h5 className="mb-0">Alerte Inventar</h5>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  {loading ? (<div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Se încarcă...</span>
                      </div>
                    </div>) : inventoryAlerts.length === 0 ? (<react_bootstrap_1.Alert variant="success">
                      <i className="fas fa-check-circle me-2"></i>Nu există alerte de inventar</react_bootstrap_1.Alert>) : (<>
                      <div className="mb-3" style={{ height: '200px' }}>
                        <react_chartjs_2_1.Pie data={getInventoryAlertsChartData()} options={{ responsive: true }}/>
                      </div>
                      <react_bootstrap_1.Table striped hover size="sm">
                        <thead>
                          <tr>
                            <th>Ingredient</th>
                            <th>Stoc</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryAlerts.slice(0, 5).map(function (alert) { return (<tr key={alert.ingredient_id}>
                              <td>{alert.ingredient_name}</td>
                              <td>{alert.current_stock}</td>
                              <td>
                                <react_bootstrap_1.Badge bg={alert.alert_type === 'out' ? 'danger' : 'warning'}>
                                  {alert.alert_type === 'out' ? 'EPUIZAT' : 'SCĂZUT'}
                                </react_bootstrap_1.Badge>
                              </td>
                            </tr>); })}
                        </tbody>
                      </react_bootstrap_1.Table>
                    </>)}
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="revenue" title="💰 Venituri">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Analiză Venituri</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>) : safeRevenueChart.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<>
                  <div className="mb-4" style={{ height: '400px' }}>
                    <react_chartjs_2_1.Line data={getRevenueChartData()} options={{ responsive: true }}/>
                  </div>
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Venituri</th>
                        <th>"Evoluție"</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeRevenueChart.map(function (item, index) {
                var prevRevenue = index > 0 ? safeRevenueChart[index - 1].revenue : item.revenue;
                var change = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue) * 100 : 0;
                return (<tr key={item.date}>
                            <td>{new Date(item.date).toLocaleDateString('ro-RO')}</td>
                            <td><strong>{formatCurrency(item.revenue || 0)}</strong></td>
                            <td>
                              <react_bootstrap_1.Badge bg={change >= 0 ? 'success' : 'danger'}>
                                {formatPercent(change)}
                              </react_bootstrap_1.Badge>
                            </td>
                          </tr>);
            })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="inventory" title="📦 Inventar">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Alerte Inventar</h5>
              <react_bootstrap_1.Badge bg="danger">{inventoryAlerts.length} alerte</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>) : inventoryAlerts.length === 0 ? (<react_bootstrap_1.Alert variant="success">
                  <i className="fas fa-check-circle me-2"></i>Nu există alerte de inventar, toate ingredientele sunt în stoc.</react_bootstrap_1.Alert>) : (<>
                  {inventoryAlerts.length > 0 && (<div className="mb-4" style={{ height: '300px' }}>
                      <react_chartjs_2_1.Bar data={getInventoryAlertsChartData()} options={{ responsive: true }}/>
                    </div>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Stoc Curent</th>
                        <th>Stoc Minim</th>
                        <th>Tip Alertă</th>
                        <th>Acțiune</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryAlerts.map(function (alert) { return (<tr key={alert.ingredient_id} className={alert.alert_type === 'out' ? 'table-danger' : 'table-warning'}>
                          <td><strong>{alert.ingredient_name}</strong></td>
                          <td>
                            <strong className={alert.alert_type === 'out' ? 'text-danger' : 'text-warning'}>
                              {alert.current_stock}
                            </strong>
                          </td>
                          <td>{alert.min_stock}</td>
                          <td>
                            <react_bootstrap_1.Badge bg={alert.alert_type === 'out' ? 'danger' : 'warning'}>
                              {alert.alert_type === 'out' ? 'STOC EPUIZAT' : 'STOC SCĂZUT'}
                            </react_bootstrap_1.Badge>
                          </td>
                          <td>
                            <react_bootstrap_1.Button variant="outline-primary" size="sm">
                              <i className="fas fa-shopping-cart me-1"></i>Comandă
                            </react_bootstrap_1.Button>
                          </td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>
      </react_bootstrap_1.Tabs>
    </div>);
};
exports.AdvancedReportsPage = AdvancedReportsPage;
