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
exports.PlatformStatsDashboardPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var recharts_1 = require("recharts");
var platformStatsApi_1 = require("../api/platformStatsApi");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("./PlatformStatsDashboardPage.css");
// Culori pentru platforme
var PLATFORM_COLORS = {
    'MOBILE_APP': '#3b82f6',
    'FRIENDSRIDE': '#8b5cf6',
    'GLOVO': '#10b981',
    'WOLT': '#f59e0b',
    'UBER_EATS': '#000000',
    'BOLT_FOOD': '#00d4ff',
    'POS': '#ef4444',
    'KIOSK': '#06b6d4',
    'PHONE': '#6366f1',
};
var PLATFORM_LABELS = {
    'MOBILE_APP': 'Aplicația Mobilă',
    'FRIENDSRIDE': 'Friends Ride',
    'GLOVO': 'Glovo',
    'WOLT': 'Wolt',
    'UBER_EATS': 'Uber Eats',
    'BOLT_FOOD': 'Bolt Food',
    'POS': 'POS Restaurant',
    'KIOSK': 'KIOSK Self-Service',
    'PHONE': 'Telefon',
};
var PlatformStatsDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }), startDate = _a[0], setStartDate = _a[1];
    var _b = (0, react_1.useState)(function () { return new Date().toISOString().split('T')[0]; }), endDate = _b[0], setEndDate = _b[1];
    var _c = (0, react_1.useState)(null), selectedPlatform = _c[0], setSelectedPlatform = _c[1];
    var _d = (0, react_1.useState)('day'), period = _d[0], setPeriod = _d[1];
    var _e = (0, react_1.useState)([]), platforms = _e[0], setPlatforms = _e[1];
    var _f = (0, react_1.useState)([]), comparison = _f[0], setComparison = _f[1];
    var _g = (0, react_1.useState)([]), trends = _g[0], setTrends = _g[1];
    var _h = (0, react_1.useState)([]), topProducts = _h[0], setTopProducts = _h[1];
    var _j = (0, react_1.useState)(false), loading = _j[0], setLoading = _j[1];
    // Încarcă lista platformelor
    var loadPlatforms = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, platformStatsApi_1.platformStatsApi.getPlatforms({
                            startDate: startDate,
                            endDate: endDate,
                        })];
                case 2:
                    response = _a.sent();
                    setPlatforms(response.data.platforms || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading platforms:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Încarcă comparația între platforme
    var loadComparison = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, platformStatsApi_1.platformStatsApi.comparePlatforms({
                            startDate: startDate,
                            endDate: endDate,
                        })];
                case 2:
                    response = _a.sent();
                    setComparison(response.data.comparison || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error loading comparison:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Încarcă trendurile pentru platforma selectată
    var loadTrends = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedPlatform)
                        return [2 /*return*/];
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, platformStatsApi_1.platformStatsApi.getPlatformTrends(selectedPlatform, {
                            startDate: startDate,
                            endDate: endDate,
                            period: period,
                        })];
                case 2:
                    response = _a.sent();
                    setTrends(response.data.trends || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error loading trends:', error_3);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Încarcă top produse pentru platforma selectată
    var loadTopProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedPlatform)
                        return [2 /*return*/];
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, platformStatsApi_1.platformStatsApi.getPlatformTopProducts(selectedPlatform, {
                            startDate: startDate,
                            endDate: endDate,
                            limit: 10,
                        })];
                case 2:
                    response = _a.sent();
                    setTopProducts(response.data.top_products || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error loading top products:', error_4);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadPlatforms();
        loadComparison();
    }, [startDate, endDate]);
    (0, react_1.useEffect)(function () {
        if (selectedPlatform) {
            loadTrends();
            loadTopProducts();
        }
    }, [selectedPlatform, startDate, endDate, period]);
    // Pregătește datele pentru graficul de comparație
    var comparisonChartData = comparison.map(function (p) { return ({
        name: PLATFORM_LABELS[p.platform] || p.platform,
        orders: p.total_orders,
        revenue: p.total_revenue,
        avg_order: p.avg_order_value,
    }); });
    // Pregătește datele pentru graficul de trenduri
    var trendsChartData = trends.map(function (t) { return ({
        period: t.period,
        orders: t.orders,
        revenue: t.revenue,
        avg_order: t.avg_order_value,
    }); });
    // Calculează totaluri
    var totalRevenue = comparison.reduce(function (sum, p) { return sum + p.total_revenue; }, 0);
    var totalOrders = comparison.reduce(function (sum, p) { return sum + p.total_orders; }, 0);
    return (<div className="platform-stats-dashboard-page">
      <PageHeader_1.PageHeader title='📊 statistici per platforma' description="Dashboard-uri detaliate pentru fiecare platformă de comandă"/>

      {/* Filtre */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Data Început</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Data Sfârșit</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Platformă</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={selectedPlatform || ''} onChange={function (e) { return setSelectedPlatform(e.target.value || null); }}>
                  <option value="">'platform-stats.toate_platformele'</option>
                  {platforms.map(function (p) { return (<option key={p.platform} value={p.platform}>
                      {PLATFORM_LABELS[p.platform] || p.platform}
                    </option>); })}
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Perioadă</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={period} onChange={function (e) { return setPeriod(e.target.value); }} disabled={!selectedPlatform}>
                  <option value="day">Zilnic</option>
                  <option value="week">"Săptămânal"</option>
                  <option value="month">Lunar</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {loading && (<div className="text-center mb-4">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
        </div>)}

      {/* KPI Cards - Totaluri */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="kpi-card text-center border-primary">
            <react_bootstrap_1.Card.Body>
              <div className="kpi-label">Total Venituri</div>
              <div className="kpi-value">{totalRevenue.toFixed(2)} RON</div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="kpi-card text-center border-success">
            <react_bootstrap_1.Card.Body>
              <div className="kpi-label">Total Comenzi</div>
              <div className="kpi-value">{totalOrders}</div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="kpi-card text-center border-info">
            <react_bootstrap_1.Card.Body>
              <div className="kpi-label">'platform-stats.platforme_active'</div>
              <div className="kpi-value">{platforms.length}</div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Comparație Platforme */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={12}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5>'platform-stats.comparatie_platforme'</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.BarChart data={comparisonChartData}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="name" angle={-45} textAnchor="end" height={100}/>
                  <recharts_1.YAxis yAxisId="left"/>
                  <recharts_1.YAxis yAxisId="right" orientation="right"/>
                  <recharts_1.Tooltip />
                  <recharts_1.Legend />
                  <recharts_1.Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Comenzi"/>
                  <recharts_1.Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Venituri (RON)"/>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Tabel Comparație */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={12}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5>'platform-stats.detalii_comparatie'</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Platformă</th>
                    <th>Comenzi</th>
                    <th>Venituri (RON)</th>
                    <th>Valoare Medie Comandă</th>
                    <th>'platform-stats.clienti_unici'</th>
                    <th>% Venituri</th>
                    <th>% Comenzi</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map(function (p) { return (<tr key={p.platform}>
                      <td>
                        <react_bootstrap_1.Badge bg="primary" style={{ backgroundColor: PLATFORM_COLORS[p.platform] || '#6c757d' }}>
                          {PLATFORM_LABELS[p.platform] || p.platform}
                        </react_bootstrap_1.Badge>
                      </td>
                      <td>{p.total_orders}</td>
                      <td>{p.total_revenue.toFixed(2)}</td>
                      <td>{p.avg_order_value.toFixed(2)}</td>
                      <td>{p.unique_customers}</td>
                      <td>
                        <div className="progress" style={{ height: '20px' }}>
                          <div className="progress-bar" role="progressbar" style={{ width: "".concat(p.revenue_percentage, "%") }}>
                            {p.revenue_percentage}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="progress" style={{ height: '20px' }}>
                          <div className="progress-bar bg-success" role="progressbar" style={{ width: "".concat(p.orders_percentage, "%") }}>
                            {p.orders_percentage}%
                          </div>
                        </div>
                      </td>
                    </tr>); })}
                </tbody>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Trenduri pentru Platforma Selectată */}
      {selectedPlatform && trends.length > 0 && (<react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col md={12}>
            <react_bootstrap_1.Card>
              <react_bootstrap_1.Card.Header>
                <h5>Trenduri - {PLATFORM_labels[selectedPlatform] || selectedPlatform}</h5>
              </react_bootstrap_1.Card.Header>
              <react_bootstrap_1.Card.Body>
                <recharts_1.ResponsiveContainer width="100%" height={400}>
                  <recharts_1.AreaChart data={trendsChartData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="period"/>
                    <recharts_1.YAxis yAxisId="left"/>
                    <recharts_1.YAxis yAxisId="right" orientation="right"/>
                    <recharts_1.Tooltip />
                    <recharts_1.Legend />
                    <recharts_1.Area yAxisId="left" type="monotone" dataKey="orders" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Comenzi"/>
                    <recharts_1.Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Venituri (RON)"/>
                  </recharts_1.AreaChart>
                </recharts_1.ResponsiveContainer>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Top Produse pentru Platforma Selectată */}
      {selectedPlatform && topProducts.length > 0 && (<react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col md={12}>
            <react_bootstrap_1.Card>
              <react_bootstrap_1.Card.Header>
                <h5>Top 10 Produse - {PLATFORM_labels[selectedPlatform] || selectedPlatform}</h5>
              </react_bootstrap_1.Card.Header>
              <react_bootstrap_1.Card.Body>
                <react_bootstrap_1.Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Produs</th>
                      <th>Cantitate</th>
                      <th>Comenzi</th>
                      <th>Venituri (RON)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map(function (product, index) { return (<tr key={product.product_id}>
                        <td>{index + 1}</td>
                        <td>{product.product_name}</td>
                        <td>{product.total_quantity}</td>
                        <td>{product.order_count}</td>
                        <td>{product.total_revenue.toFixed(2)}</td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}
    </div>);
};
exports.PlatformStatsDashboardPage = PlatformStatsDashboardPage;
