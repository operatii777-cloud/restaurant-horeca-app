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
exports.SalesReportsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./SalesReportsPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
var SalesReportsPage = function () {
    var _a, _b, _c;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)('detailed'), activeTab = _d[0], setActiveTab = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }), startDate = _f[0], setStartDate = _f[1];
    var _g = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _g[0], setEndDate = _g[1];
    var _h = (0, react_1.useState)(''), category = _h[0], setCategory = _h[1];
    var _j = (0, react_1.useState)('daily'), period = _j[0], setPeriod = _j[1];
    // Data states
    var _k = (0, react_1.useState)([]), salesDetailed = _k[0], setSalesDetailed = _k[1];
    var _l = (0, react_1.useState)([]), profitability = _l[0], setProfitability = _l[1];
    var _m = (0, react_1.useState)(null), profitabilitySummary = _m[0], setProfitabilitySummary = _m[1];
    var _o = (0, react_1.useState)([]), customerBehavior = _o[0], setCustomerBehavior = _o[1];
    var _p = (0, react_1.useState)(null), customerBehaviorSummary = _p[0], setCustomerBehaviorSummary = _p[1];
    var _q = (0, react_1.useState)([]), timeTrends = _q[0], setTimeTrends = _q[1];
    var _r = (0, react_1.useState)(null), timeTrendsSummary = _r[0], setTimeTrendsSummary = _r[1];
    var _s = (0, react_1.useState)(null), error = _s[0], setError = _s[1];
    (0, react_1.useEffect)(function () {
        loadReport();
    }, [activeTab, startDate, endDate, category, period]);
    var loadReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, err_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 11, 12, 13]);
                    _a = activeTab;
                    switch (_a) {
                        case 'detailed': return [3 /*break*/, 2];
                        case 'profitability': return [3 /*break*/, 4];
                        case 'customer-behavior': return [3 /*break*/, 6];
                        case 'time-trends': return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 10];
                case 2: return [4 /*yield*/, loadSalesDetailed()];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 10];
                case 4: return [4 /*yield*/, loadProfitability()];
                case 5:
                    _d.sent();
                    return [3 /*break*/, 10];
                case 6: return [4 /*yield*/, loadCustomerBehavior()];
                case 7:
                    _d.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, loadTimeTrends()];
                case 9:
                    _d.sent();
                    return [3 /*break*/, 10];
                case 10: return [3 /*break*/, 13];
                case 11:
                    err_1 = _d.sent();
                    console.error('Error loading report:', err_1);
                    setError(((_c = (_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Eroare la încărcarea raportului');
                    return [3 /*break*/, 13];
                case 12:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    var loadSalesDetailed = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = { startDate: startDate, endDate: endDate };
                    if (category)
                        params.category = category;
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/reports/sales-detailed', { params: params })];
                case 1:
                    response = _a.sent();
                    if (response.data) {
                        setSalesDetailed(Array.isArray(response.data) ? response.data : response.data.data || []);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var loadProfitability = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/reports/profitability', {
                        params: { startDate: startDate, endDate: endDate },
                    })];
                case 1:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setProfitability(response.data.data || []);
                        setProfitabilitySummary(response.data.summary || null);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var loadCustomerBehavior = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, behaviorData, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/reports/customer-behavior', {
                            params: { startDate: startDate, endDate: endDate },
                        })];
                case 1:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        behaviorData = response.data.data;
                        setCustomerBehavior(Array.isArray(behaviorData) ? behaviorData : []);
                        setCustomerBehaviorSummary(response.data.summary || null);
                    }
                    else {
                        setCustomerBehavior([]);
                        setCustomerBehaviorSummary(null);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error loading customer behavior:', error_1);
                    // Set empty array on error
                    setCustomerBehavior([]);
                    setCustomerBehaviorSummary(null);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadTimeTrends = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/reports/time-trends', {
                        params: { startDate: startDate, endDate: endDate, period: period },
                    })];
                case 1:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setTimeTrends(response.data.data || []);
                        setTimeTrendsSummary(response.data.summary || null);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var exportToExcel = function (reportType) { return __awaiter(void 0, void 0, void 0, function () {
        var params, endpoint, response, url, link, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    params = { startDate: startDate, endDate: endDate, format: 'excel' };
                    if (reportType === 'detailed' && category)
                        params.category = category;
                    if (reportType === 'time-trends')
                        params.period = period;
                    endpoint = '';
                    switch (reportType) {
                        case 'detailed':
                            endpoint = '/api/admin/reports/sales-detailed';
                            break;
                        case 'profitability':
                            endpoint = '/api/admin/reports/profitability';
                            break;
                        case 'customer-behavior':
                            endpoint = '/api/admin/reports/customer-behavior';
                            break;
                        case 'time-trends':
                            endpoint = '/api/admin/reports/time-trends';
                            break;
                    }
                    return [4 /*yield*/, httpClient_1.httpClient.get(endpoint, {
                            params: params,
                            responseType: 'blob',
                        })];
                case 1:
                    response = _a.sent();
                    url = window.URL.createObjectURL(new Blob([response.data]));
                    link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', "raport_".concat(reportType, "_").concat(startDate, "_").concat(endDate, ".xlsx"));
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('Error exporting to Excel:', err_2);
                    setError('Eroare la exportarea în Excel');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var formatCurrency = function (value) {
        if (value === undefined || value === null || isNaN(value)) {
            return '0.00 RON';
        }
        return "".concat(Number(value).toFixed(2), " RON");
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleString('ro-RO');
    };
    // Chart data for Time Trends
    var getTimeTrendsChartData = function () {
        // Validate data before creating chart
        if (!timeTrends || timeTrends.length === 0) {
            return null;
        }
        return {
            labels: timeTrends.map(function (item) { return item.period; }),
            datasets: [
                {
                    label: 'Venituri (RON)',
                    data: timeTrends.map(function (item) { return item.total_revenue; }),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Număr Comenzi',
                    data: timeTrends.map(function (item) { return item.total_orders; }),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1',
                },
            ],
        };
    };
    var getTimeTrendsChartOptions = function () {
        return {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Venituri (RON)',
                    },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Număr Comenzi',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        };
    };
    // Chart data for Profitability
    var getProfitabilityChartData = function () {
        // Validate data before creating chart
        if (!profitability || profitability.length === 0) {
            return null;
        }
        var topProducts = profitability.slice(0, 10);
        return {
            labels: topProducts.map(function (item) { return item.name; }),
            datasets: [
                {
                    label: 'Profit (RON)',
                    data: topProducts.map(function (item) { return item.profit; }),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };
    return (<div className="sales-reports-page">
      <div className="page-header">
        <h1>📊 Rapoarte Vânzări</h1>
        <p>Rapoarte detaliate despre vânzări și profitabilitate</p>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
          {error}
        </react_bootstrap_1.Alert>)}

      {/* Filters */}
      <react_bootstrap_1.Card className="mb-4" style={{ margin: '8px 0' }}>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Data Start</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Data End</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            {activeTab === 'detailed' && (<react_bootstrap_1.Col md={3}>
                <react_bootstrap_1.Form.Label>Categorie</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={category} onChange={function (e) { return setCategory(e.target.value); }}>
                  <option value="">Toate categoriile</option>
                  <option value="aperitive">Aperitive</option>
                  <option value="ciorbe">Ciorbe</option>
                  <option value="salate">Salate</option>
                  <option value="pizza">Pizza</option>
                  <option value="paste">Paste</option>
                  <option value="Feluri Principale">Feluri Principale</option>
                  <option value="deserturi">Deserturi</option>
                  <option value="bauturi">Băuturi</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Col>)}
            {activeTab === 'time-trends' && (<react_bootstrap_1.Col md={3}>
                <react_bootstrap_1.Form.Label>Perioadă</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={period} onChange={function (e) { return setPeriod(e.target.value); }}>
                  <option value="hourly">pe ora</option>
                  <option value="daily">Zilnic</option>
                  <option value="weekly">Săptămânal</option>
                  <option value="monthly">Lunar</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Col>)}
            <react_bootstrap_1.Col md={activeTab === 'detailed' || activeTab === 'time-trends' ? 3 : 6}>
              <react_bootstrap_1.Form.Label>&nbsp;</react_bootstrap_1.Form.Label>
              <div>
                <react_bootstrap_1.Button variant="success" onClick={function () { return exportToExcel(activeTab); }}>
                  <i className="fas fa-file-excel me-2"></i>Export Excel
                </react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Tabs */}
      <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return k && setActiveTab(k); }} className="mb-4">
        <react_bootstrap_1.Tab eventKey="detailed" title='📋 Vânzări detaliate'>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Raport vânzări detaliate</h5>
              <react_bootstrap_1.Badge bg="info">{salesDetailed.length} înregistrări</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">se încarcă</span>
                  </div>
                </div>) : salesDetailed.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>ID Comandă</th>
                      <th>Data</th>
                      <th>Masă</th>
                      <th>Client</th>
                      <th>Produs</th>
                      <th>Categorie</th>
                      <th>Cantitate</th>
                      <th>"pret unit"</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesDetailed.map(function (item, index) { return (<tr key={"".concat(item.order_id, "-index")}>
                        <td>{item.order_id}</td>
                        <td>{formatDate(item.timestamp)}</td>
                        <td>{item.table_number || '-'}</td>
                        <td>{item.client_identifier || '-'}</td>
                        <td>{item.product_name}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td><strong>{formatCurrency(item.final_price)}</strong></td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="profitability" title="💰 Profitabilitate">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Raport Profitabilitate Produse</h5>
              {profitabilitySummary && (<div>
                  <react_bootstrap_1.Badge bg="success" className="me-2">
                    Total Venituri: {formatCurrency(profitabilitySummary.totalRevenue)}
                  </react_bootstrap_1.Badge>
                  <react_bootstrap_1.Badge bg="info">
                    Total Profit: {formatCurrency(profitabilitySummary.totalProfit)}
                  </react_bootstrap_1.Badge>
                </div>)}
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">se încarcă</span>
                  </div>
                </div>) : profitability.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<>
                  {profitability.length > 0 && getProfitabilityChartData() && (<div className="mb-4" style={{ height: '300px' }}>
                      <react_chartjs_2_1.Bar data={getProfitabilityChartData()} options={{ responsive: true }}/>
                    </div>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Produs</th>
                        <th>Categorie</th>
                        <th>Cantitate Vândută</th>
                        <th>Venit Total</th>
                        <th>Cost Total</th>
                        <th>Profit</th>
                        <th>Marjă %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitability.map(function (item) {
                var _a, _b, _c;
                return (<tr key={item.id}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.category}</td>
                          <td>{item.total_quantity_sold}</td>
                          <td>{formatCurrency(item.total_revenue)}</td>
                          <td>{formatCurrency(item.total_cost)}</td>
                          <td>
                            <strong className={item.profit >= 0 ? 'text-success' : 'text-danger'}>
                              {formatCurrency(item.profit)}
                            </strong>
                          </td>
                          <td>
                            <react_bootstrap_1.Badge bg={((_a = item.profit_margin_percent) !== null && _a !== void 0 ? _a : 0) >= 30 ? 'success' : ((_b = item.profit_margin_percent) !== null && _b !== void 0 ? _b : 0) >= 20 ? 'warning' : 'danger'}>
                              {((_c = item.profit_margin_percent) !== null && _c !== void 0 ? _c : 0).toFixed(1)}%
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

        <react_bootstrap_1.Tab eventKey="customer-behavior" title='👥 Comportament clienți'>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Raport comportament clienți</h5>
              {customerBehaviorSummary && (<react_bootstrap_1.Badge bg="info">
                  {customerBehaviorSummary.totalCustomers} clienți analizați
                </react_bootstrap_1.Badge>)}
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">se încarcă</span>
                  </div>
                </div>) : !Array.isArray(customerBehavior) || customerBehavior.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<>
                  {customerBehaviorSummary && (<react_bootstrap_1.Row className="mb-4">
                      <react_bootstrap_1.Col md={4}>
                        <react_bootstrap_1.Card className="text-center">
                          <react_bootstrap_1.Card.Body>
                            <h6>Medie Comenzi/Client</h6>
                            <h4>{((_a = customerBehaviorSummary.avgOrdersPerCustomer) !== null && _a !== void 0 ? _a : 0).toFixed(1)}</h4>
                          </react_bootstrap_1.Card.Body>
                        </react_bootstrap_1.Card>
                      </react_bootstrap_1.Col>
                      <react_bootstrap_1.Col md={4}>
                        <react_bootstrap_1.Card className="text-center">
                          <react_bootstrap_1.Card.Body>
                            <h6>Medie Cheltuit/Client</h6>
                            <h4>{formatCurrency(customerBehaviorSummary.avgSpentPerCustomer)}</h4>
                          </react_bootstrap_1.Card.Body>
                        </react_bootstrap_1.Card>
                      </react_bootstrap_1.Col>
                      <react_bootstrap_1.Col md={4}>
                        <react_bootstrap_1.Card className="text-center">
                          <react_bootstrap_1.Card.Body>
                            <h6>Top cheltuitor</h6>
                            <h6 className="text-muted">
                              {((_b = customerBehaviorSummary.topSpender) === null || _b === void 0 ? void 0 : _b.client_identifier) || '-'}
                            </h6>
                            <p className="mb-0">
                              {formatCurrency(((_c = customerBehaviorSummary.topSpender) === null || _c === void 0 ? void 0 : _c.total_spent) || 0)}
                            </p>
                          </react_bootstrap_1.Card.Body>
                        </react_bootstrap_1.Card>
                      </react_bootstrap_1.Col>
                    </react_bootstrap_1.Row>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Total Comenzi</th>
                        <th>Total Cheltuit</th>
                        <th>Valoare Medie Comandă</th>
                        <th>Zile Vizitate</th>
                        <th>Diversitate Categorii</th>
                        <th>Prima comandă</th>
                        <th>Ultima comandă</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(customerBehavior) && customerBehavior.map(function (item, index) { return (<tr key={item.client_identifier || index}>
                          <td>{item.client_identifier || 'Anonim'}</td>
                          <td>{item.total_orders}</td>
                          <td><strong>{formatCurrency(item.total_spent)}</strong></td>
                          <td>{formatCurrency(item.avg_order_value)}</td>
                          <td>{item.unique_visit_days}</td>
                          <td>{item.category_diversity}</td>
                          <td>{formatDate(item.first_order)}</td>
                          <td>{formatDate(item.last_order)}</td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="time-trends" title="📈 Trend-uri Temporale">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Raport Trend-uri Temporale</h5>
              {timeTrendsSummary && (<div>
                  <react_bootstrap_1.Badge bg="success" className="me-2">
                    Total Venituri: {formatCurrency(timeTrendsSummary.totalRevenue)}
                  </react_bootstrap_1.Badge>
                  <react_bootstrap_1.Badge bg="info">
                    Total Comenzi: {timeTrendsSummary.totalOrders}
                  </react_bootstrap_1.Badge>
                </div>)}
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">se încarcă</span>
                  </div>
                </div>) : timeTrends.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<>
                  {timeTrends.length > 0 && getTimeTrendsChartData() && (<div className="mb-4" style={{ height: '400px' }}>
                      <react_chartjs_2_1.Line data={getTimeTrendsChartData()} options={getTimeTrendsChartOptions()}/>
                    </div>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Perioadă</th>
                        <th>Total Comenzi</th>
                        <th>Venituri</th>
                        <th>Valoare Medie Comandă</th>
                        <th>'platform-stats.clienti_unici'</th>
                        <th>Mese Servite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeTrends.map(function (item, index) { return (<tr key={item.period || index}>
                          <td><strong>{item.period}</strong></td>
                          <td>{item.total_orders}</td>
                          <td><strong>{formatCurrency(item.total_revenue)}</strong></td>
                          <td>{formatCurrency(item.avg_order_value)}</td>
                          <td>{item.unique_customers}</td>
                          <td>{item.tables_served}</td>
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
exports.SalesReportsPage = SalesReportsPage;
