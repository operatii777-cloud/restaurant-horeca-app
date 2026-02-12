"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXECUTIVE DASHBOARD PAGE
 *
 * Dashboard executive cu KPI-uri critice pentru management
 * ═══════════════════════════════════════════════════════════════════════════
 */
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
exports.ExecutiveDashboardPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var recharts_1 = require("recharts");
var executiveDashboardApi_1 = require("../api/executiveDashboardApi");
var PageHeader_1 = require("@/shared/components/PageHeader");
var AlertsDisplay_1 = require("@/modules/alerts/components/AlertsDisplay");
require("./ExecutiveDashboardPage.css");
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
var ExecutiveDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), metrics = _b[0], setMetrics = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(null), refreshInterval = _d[0], setRefreshInterval = _d[1];
    (0, react_1.useEffect)(function () {
        loadMetrics();
        // Auto-refresh every 5 minutes
        var interval = setInterval(function () {
            loadMetrics();
        }, 5 * 60 * 1000);
        setRefreshInterval(interval);
        return function () {
            if (interval)
                clearInterval(interval);
        };
    }, []);
    var loadMetrics = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setError(null);
                    return [4 /*yield*/, executiveDashboardApi_1.executiveDashboardApi.getMetrics()];
                case 1:
                    response = _a.sent();
                    if (response.data.success) {
                        setMetrics(response.data.metrics);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error loading executive metrics:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea metricilor');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
        }).format(value);
    };
    var formatPercent = function (value) {
        var sign = value >= 0 ? '+' : '';
        return "".concat(sign).concat(value.toFixed(2), "%");
    };
    if (loading && !metrics) {
        return (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <react_bootstrap_1.Spinner animation="border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </react_bootstrap_1.Spinner>
      </div>);
    }
    if (error && !metrics) {
        return (<div className="alert alert-danger">
        <h4>Eroare</h4>
        <p>{error}</p>
        <react_bootstrap_1.Button onClick={loadMetrics}>Reîncearcă</react_bootstrap_1.Button>
      </div>);
    }
    if (!metrics)
        return null;
    // Prepare data for charts
    var dailySalesData = metrics.daily_sales.reduce(function (acc, sale) {
        var _a;
        var existing = acc.find(function (item) { return item.date === sale.date; });
        if (existing) {
            existing[sale.platform] = sale.total_revenue;
        }
        else {
            acc.push((_a = {
                    date: sale.date
                },
                _a[sale.platform] = sale.total_revenue,
                _a));
        }
        return acc;
    }, []);
    var platformSalesData = metrics.platform_sales.map(function (p) { return ({
        name: PLATFORM_LABELS[p.platform] || p.platform,
        revenue: p.total_revenue,
        orders: p.total_orders,
        color: PLATFORM_COLORS[p.platform] || '#6b7280',
    }); });
    var topProductsData = metrics.top_products.slice(0, 10).map(function (p) { return ({
        name: p.product_name.length > 20 ? p.product_name.substring(0, 20) + '...' : p.product_name,
        revenue: p.total_revenue,
        quantity: p.total_quantity,
    }); });
    var cancellationRatesData = metrics.cancellation_rates.map(function (c) { return ({
        name: PLATFORM_LABELS[c.platform] || c.platform,
        rate: c.cancellation_rate,
        color: c.cancellation_rate > 10 ? '#ef4444' : c.cancellation_rate > 5 ? '#f59e0b' : '#10b981',
    }); });
    return (<div className="executive-dashboard-page">
      <PageHeader_1.PageHeader title='Dashboard Executive' subtitle='KPI-uri critice pentru management'/>

      {/* Alerts Display */}
      <AlertsDisplay_1.AlertsDisplay maxVisible={5} showToast={true}/>

      {/* KPI Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="kpi-card">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Vânzări Astăzi</h6>
                  <h3 className="mb-0">{formatCurrency(metrics.today.total_revenue)}</h3>
                  <small className={"d-block mt-1 ".concat(metrics.today.revenue_change_percent >= 0 ? 'text-success' : 'text-danger')}>
                    {formatPercent(metrics.today.revenue_change_percent)} față de ieri
                  </small>
                </div>
                <div className="kpi-icon">💰</div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="kpi-card">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Comenzi astăzi</h6>
                  <h3 className="mb-0">{metrics.today.total_orders}</h3>
                  <small className={"d-block mt-1 ".concat(metrics.today.orders_change_percent >= 0 ? 'text-success' : 'text-danger')}>
                    {formatPercent(metrics.today.orders_change_percent)} față de ieri
                  </small>
                </div>
                <div className="kpi-icon">📦</div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="kpi-card">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Profit Estimat</h6>
                  <h3 className="mb-0">{formatCurrency(metrics.profitability.estimated_gross_profit)}</h3>
                  <small className="text-muted d-block mt-1">
                    {metrics.profitability.profit_margin_percent}% marjă
                  </small>
                </div>
                <div className="kpi-icon">📈</div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="kpi-card">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Stocuri Critice</h6>
                  <h3 className="mb-0">{metrics.critical_stock.count}</h3>
                  <small className="text-muted d-block mt-1">
                    {metrics.warning_stock.count} avertismente
                  </small>
                </div>
                <div className="kpi-icon">⚠️</div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Charts Row 1 */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={8}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Vânzări Zilnice per Platformă</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.LineChart data={dailySalesData}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="date"/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip formatter={function (value) { return formatCurrency(value); }}/>
                  <recharts_1.Legend />
                  {metrics.platform_sales.map(function (p) { return (<recharts_1.Line key={p.platform} type="monotone" dataKey={p.platform} stroke={PLATFORM_COLORS[p.platform] || '#6b7280'} name={PLATFORM_LABELS[p.platform] || p.platform}/>); })}
                </recharts_1.LineChart>
              </recharts_1.ResponsiveContainer>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Vânzări per Platformă (Astăzi)</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.PieChart>
                  <recharts_1.Pie data={platformSalesData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={function (entry) { return "".concat(entry.name, ": ").concat(formatCurrency(entry.revenue)); }}>
                    {platformSalesData.map(function (entry, index) { return (<recharts_1.Cell key={"cell-\"Index\""} fill={entry.color}/>); })}
                  </recharts_1.Pie>
                  <recharts_1.Tooltip formatter={function (value) { return formatCurrency(value); }}/>
                </recharts_1.PieChart>
              </recharts_1.ResponsiveContainer>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Charts Row 2 */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Top 10 Produse Vândute</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.BarChart data={topProductsData}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="name" angle={-45} textAnchor="end" height={100}/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip formatter={function (value) { return formatCurrency(value); }}/>
                  <recharts_1.Bar dataKey="revenue" fill="#3b82f6"/>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Rată Anulare per Platformă</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.BarChart data={cancellationRatesData}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="name" angle={-45} textAnchor="end" height={100}/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip formatter={function (value) { return "".concat(value.toFixed(2), "%"); }}/>
                  <recharts_1.Bar dataKey="rate" fill="#ef4444">
                    {cancellationRatesData.map(function (entry, index) { return (<recharts_1.Cell key={"cell-\"Index\""} fill={entry.color}/>); })}
                  </recharts_1.Bar>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Tables Row */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">
                Stocuri Critice
                <react_bootstrap_1.Badge bg="danger" className="ms-2">{metrics.critical_stock.count}</react_bootstrap_1.Badge>
              </h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {metrics.critical_stock.items.length === 0 ? (<p className="text-muted mb-0">Nu există stocuri critice</p>) : (<react_bootstrap_1.Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Stoc</th>
                      <th>Minim</th>
                      <th>Unit.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.critical_stock.items.map(function (item) { return (<tr key={item.id}>
                        <td>{item.name}</td>
                        <td className="text-danger fw-bold">{item.current_stock}</td>
                        <td>{item.min_stock}</td>
                        <td>{item.unit}</td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">
                Comenzi în așteptare
                <react_bootstrap_1.Badge bg="warning" className="ms-2">{metrics.pending_orders.count}</react_bootstrap_1.Badge>
              </h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {metrics.pending_orders.orders.length === 0 ? (<p className="text-muted mb-0">Nu există comenzi în așteptare</p>) : (<react_bootstrap_1.Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Platformă</th>
                      <th>Așteptare</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.pending_orders.orders.map(function (order) { return (<tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{PLATFORM_LABELS[order.platform] || order.platform}</td>
                        <td className="text-warning fw-bold">{order.wait_minutes} min</td>
                        <td>{formatCurrency(order.total)}</td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Refresh Button */}
      <div className="text-center mb-4">
        <react_bootstrap_1.Button onClick={loadMetrics} disabled={loading}>
          {loading ? (<>
              <react_bootstrap_1.Spinner size="sm" className="me-2"/>Se actualizează...</>) : ('Actualizează datele')}
        </react_bootstrap_1.Button>
      </div>
    </div>);
};
exports.ExecutiveDashboardPage = ExecutiveDashboardPage;
