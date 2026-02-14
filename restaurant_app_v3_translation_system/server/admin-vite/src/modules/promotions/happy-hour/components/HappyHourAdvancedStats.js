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
exports.HappyHourAdvancedStats = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
var HappyHourAdvancedStats = function (_a) {
    var happyHourId = _a.happyHourId;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }), startDate = _b[0], setStartDate = _b[1];
    var _c = (0, react_1.useState)(function () { return new Date().toISOString().split('T')[0]; }), endDate = _c[0], setEndDate = _c[1];
    var _d = (0, react_1.useState)([]), revenueData = _d[0], setRevenueData = _d[1];
    var _e = (0, react_1.useState)([]), topProducts = _e[0], setTopProducts = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var loadStats = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, _a, revenueRes, productsRes, err_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    params = {
                        startDate: startDate,
                        endDate: endDate,
                    };
                    if (happyHourId) {
                        params.happyHourId = happyHourId;
                    }
                    return [4 /*yield*/, Promise.all([
                            httpClient_1.httpClient.get('/api/admin/happy-hour/stats/revenue', { params: params }),
                            httpClient_1.httpClient.get('/api/admin/happy-hour/stats/top-products', { params: params }),
                        ])];
                case 2:
                    _a = _d.sent(), revenueRes = _a[0], productsRes = _a[1];
                    setRevenueData(revenueRes.data || []);
                    setTopProducts(productsRes.data || []);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _d.sent();
                    console.error('Error loading Happy Hour stats:', err_1);
                    setError(((_c = (_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Eroare la încărcarea statisticilor.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadStats();
    }, [startDate, endDate, happyHourId]);
    var revenueChartData = {
        labels: revenueData.map(function (d) { return new Date(d.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }); }),
        datasets: [
            {
                label: 'Venituri (RON)',
                data: revenueData.map(function (d) { return d.revenue; }),
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Discount (RON)',
                data: revenueData.map(function (d) { return d.discount; }),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
        ],
    };
    var revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Evoluție Venituri & Discount Happy Hour',
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'RON',
                },
            },
        },
    };
    var topProductsChartData = {
        labels: topProducts.slice(0, 10).map(function (p) { return p.product_name; }),
        datasets: [
            {
                label: 'Cantitate vândută',
                data: topProducts.slice(0, 10).map(function (p) { return p.quantity; }),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
            },
        ],
    };
    var topProductsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Top 10 Produse Vândute în Happy Hour',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Cantitate',
                },
            },
        },
    };
    var totalRevenue = revenueData.reduce(function (sum, d) { return sum + d.revenue; }, 0);
    var totalDiscount = revenueData.reduce(function (sum, d) { return sum + d.discount; }, 0);
    var totalOrders = revenueData.reduce(function (sum, d) { return sum + d.orders; }, 0);
    var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return (<div className="happy-hour-advanced-stats">
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header className="bg-primary text-white">
          <i className="fas fa-chart-line me-2"></i>
          Statistici Avansate Happy Hour
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row className="mb-3">
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Data Start</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Data End</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4} className="d-flex align-items-end">
              <react_bootstrap_1.Button variant="primary" onClick={loadStats} disabled={loading}>
                {loading ? (<>
                    <react_bootstrap_1.Spinner animation="border" size="sm" className="me-2"/>Se încarcă...</>) : (<>
                    <i className="fas fa-sync me-2"></i>"Reîncarcă"</>)}
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {error && (<div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>)}

          {!loading && !error && (<>
              {/* Summary Cards */}
              <react_bootstrap_1.Row className="mb-4">
                <react_bootstrap_1.Col md={3}>
                  <react_bootstrap_1.Card className="text-white bg-success">
                    <react_bootstrap_1.Card.Body>
                      <h6>Total Venituri</h6>
                      <h3>{totalRevenue.toFixed(2)} RON</h3>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={3}>
                  <react_bootstrap_1.Card className="text-white bg-danger">
                    <react_bootstrap_1.Card.Body>
                      <h6>Total Discount</h6>
                      <h3>{totalDiscount.toFixed(2)} RON</h3>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={3}>
                  <react_bootstrap_1.Card className="text-white bg-info">
                    <react_bootstrap_1.Card.Body>
                      <h6>Total Comenzi</h6>
                      <h3>{totalOrders}</h3>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={3}>
                  <react_bootstrap_1.Card className="text-white bg-warning">
                    <react_bootstrap_1.Card.Body>
                      <h6>Valoare Medie Comandă</h6>
                      <h3>{avgOrderValue.toFixed(2)} RON</h3>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              {/* Revenue Chart */}
              <react_bootstrap_1.Card className="mb-4">
                <react_bootstrap_1.Card.Body>
                  <div style={{ height: '300px' }}>
                    {revenueData.length > 0 ? (<react_chartjs_2_1.Line data={revenueChartData} options={revenueChartOptions}/>) : (<div className="text-center text-muted py-5">
                        <i className="fas fa-chart-line fa-3x mb-3"></i>
                        <p>"nu exista date pentru perioada selectata"</p>
                      </div>)}
                  </div>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>

              {/* Top Products */}
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={7}>
                  <react_bootstrap_1.Card>
                    <react_bootstrap_1.Card.Header>
                      <h5>"top produse vandute"</h5>
                    </react_bootstrap_1.Card.Header>
                    <react_bootstrap_1.Card.Body>
                      {topProducts.length > 0 ? (<div style={{ height: '300px' }}>
                          <react_chartjs_2_1.Bar data={topProductsChartData} options={topProductsChartOptions}/>
                        </div>) : (<div className="text-center text-muted py-5">
                          <i className="fas fa-box fa-3x mb-3"></i>
                          <p>"nu exista produse vandute in happy hour pentru per"</p>
                        </div>)}
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={5}>
                  <react_bootstrap_1.Card>
                    <react_bootstrap_1.Card.Header>
                      <h5>"detalii top produse"</h5>
                    </react_bootstrap_1.Card.Header>
                    <react_bootstrap_1.Card.Body>
                      {topProducts.length > 0 ? (<div className="table-responsive" style={{ maxHeight: '300px', overflowY: "Auto" }}>
                          <react_bootstrap_1.Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>Produs</th>
                                <th>Cantitate</th>
                                <th>Venit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topProducts.slice(0, 10).map(function (product) { return (<tr key={product.product_id}>
                                  <td>{product.product_name}</td>
                                  <td>
                                    <react_bootstrap_1.Badge bg="primary">{product.quantity}</react_bootstrap_1.Badge>
                                  </td>
                                  <td>{product.revenue.toFixed(2)} RON</td>
                                </tr>); })}
                            </tbody>
                          </react_bootstrap_1.Table>
                        </div>) : (<p className="text-muted text-center">"nu exista date"</p>)}
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>
            </>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.HappyHourAdvancedStats = HappyHourAdvancedStats;
