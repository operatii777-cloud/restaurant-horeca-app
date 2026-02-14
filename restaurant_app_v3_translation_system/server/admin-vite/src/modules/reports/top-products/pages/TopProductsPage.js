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
exports.TopProductsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./TopProductsPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
var TopProductsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)('top-sold'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }), startDate = _c[0], setStartDate = _c[1];
    var _d = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _d[0], setEndDate = _d[1];
    var _e = (0, react_1.useState)(10), limit = _e[0], setLimit = _e[1];
    // Data states
    var _f = (0, react_1.useState)([]), topProductsByRevenue = _f[0], setTopProductsByRevenue = _f[1];
    var _g = (0, react_1.useState)([]), topProductsByQuantity = _g[0], setTopProductsByQuantity = _g[1];
    var _h = (0, react_1.useState)([]), topProductsByOrders = _h[0], setTopProductsByOrders = _h[1];
    var _j = (0, react_1.useState)(null), analytics = _j[0], setAnalytics = _j[1];
    var _k = (0, react_1.useState)(null), error = _k[0], setError = _k[1];
    (0, react_1.useEffect)(function () {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, limit]);
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, products, byRevenue, byQuantity, byOrders, totalRevenue, totalOrders, avgOrderValue, categoryRevenue_1, topCategory, err_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/reports/profitability', {
                            params: { startDate: startDate, endDate: endDate },
                        })];
                case 2:
                    response = _e.sent();
                    if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data)) {
                        products = response.data.data.map(function (p) { return ({
                            id: p.id || 0,
                            name: p.name || 'Produs necunoscut',
                            category: p.category || 'Fără categorie',
                            times_ordered: Number(p.times_ordered) || 0,
                            total_quantity_sold: Number(p.total_quantity_sold) || 0,
                            total_revenue: Number(p.total_revenue) || 0,
                            avg_selling_price: Number(p.avg_selling_price) || 0,
                            profit: p.profit !== undefined ? Number(p.profit) : undefined,
                            profit_margin_percent: p.profit_margin_percent !== undefined ? Number(p.profit_margin_percent) : undefined,
                        }); });
                        byRevenue = __spreadArray([], products, true).sort(function (a, b) { return (b.total_revenue || 0) - (a.total_revenue || 0); })
                            .slice(0, limit);
                        setTopProductsByRevenue(byRevenue);
                        byQuantity = __spreadArray([], products, true).sort(function (a, b) { return (b.total_quantity_sold || 0) - (a.total_quantity_sold || 0); })
                            .slice(0, limit);
                        setTopProductsByQuantity(byQuantity);
                        byOrders = __spreadArray([], products, true).sort(function (a, b) { return (b.times_ordered || 0) - (a.times_ordered || 0); })
                            .slice(0, limit);
                        setTopProductsByOrders(byOrders);
                        totalRevenue = products.reduce(function (sum, p) { return sum + (p.total_revenue || 0); }, 0);
                        totalOrders = products.reduce(function (sum, p) { return sum + (p.times_ordered || 0); }, 0);
                        avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
                        categoryRevenue_1 = {};
                        products.forEach(function (p) {
                            var cat = p.category || 'Fără categorie';
                            categoryRevenue_1[cat] = (categoryRevenue_1[cat] || 0) + (p.total_revenue || 0);
                        });
                        topCategory = ((_b = Object.entries(categoryRevenue_1).sort(function (a, b) { return b[1] - a[1]; })[0]) === null || _b === void 0 ? void 0 : _b[0]) || '—';
                        setAnalytics({
                            totalProducts: products.length,
                            totalRevenue: totalRevenue,
                            avgOrderValue: avgOrderValue,
                            topCategory: topCategory,
                            bestSeller: byRevenue[0] || null,
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _e.sent();
                    console.error('Error loading top products:', err_1);
                    setError(((_d = (_c = err_1.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var formatCurrency = function (value) {
        if (value === undefined || value === null || isNaN(value)) {
            return '0.00 RON';
        }
        return "".concat(Number(value).toFixed(2), " RON");
    };
    var getTopProductsChartData = function (products, label) {
        return {
            labels: products.map(function (p) { return p.name; }),
            datasets: [
                {
                    label: label,
                    data: products.map(function (p) {
                        return label.includes('Venit') ? p.total_revenue : label.includes('Cantitate') ? p.total_quantity_sold : p.times_ordered;
                    }),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };
    var getCategoryChartData = function () {
        var categoryRevenue = {};
        topProductsByRevenue.forEach(function (p) {
            categoryRevenue[p.category] = (categoryRevenue[p.category] || 0) + p.total_revenue;
        });
        return {
            labels: Object.keys(categoryRevenue),
            datasets: [
                {
                    label: 'Venituri pe Categorie',
                    data: Object.values(categoryRevenue),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };
    return (<div className="top-products-page">
      <div className="page-header">
        <h1>📊 Top Products & Analytics</h1>
        <p>Analiză produse top vânzări și performanță</p>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      {/* Statistics */}
      {analytics && (<react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Total Produse</h6>
                <h4>{analytics.totalProducts}</h4>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Total Venituri</h6>
                <h4>{formatCurrency(analytics.totalRevenue)}</h4>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Valoare Medie Comandă</h6>
                <h4>{formatCurrency(analytics.avgOrderValue)}</h4>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Categoria Top</h6>
                <h6 className="text-muted">{analytics.topCategory}</h6>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Filters */}
      <react_bootstrap_1.Card className="mb-4">
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
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Număr Produse</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={limit} onChange={function (e) { return setLimit(parseInt(e.target.value)); }}>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>&nbsp;</react_bootstrap_1.Form.Label>
              <div>
                <react_bootstrap_1.Button variant="primary" onClick={loadData}>
                  <i className="fas fa-sync me-2"></i>Actualizează</react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Tabs */}
      <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return k && setActiveTab(k); }} className="mb-4">
        <react_bootstrap_1.Tab eventKey="top-sold" title="💰 Top Venituri">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top {limit} Produse după Venituri</h5>
              <react_bootstrap_1.Badge bg="success">{topProductsByRevenue.length} produse</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>) : topProductsByRevenue.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<>
                  {topProductsByRevenue.length > 0 && (<div className="mb-4" style={{ height: '300px' }}>
                      <react_chartjs_2_1.Bar data={getTopProductsChartData(topProductsByRevenue, 'Venituri (RON)')} options={{ responsive: true }}/>
                    </div>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produs</th>
                        <th>Categorie</th>
                        <th>Cantitate Vândută</th>
                        <th>Venit Total</th>
                        <th>Preț Mediu</th>
                        <th>Profit</th>
                        <th>Marjă %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductsByRevenue.map(function (product, index) { return (<tr key={product.id}>
                          <td>
                            <react_bootstrap_1.Badge bg="primary">{index + 1}</react_bootstrap_1.Badge>
                          </td>
                          <td><strong>{product.name}</strong></td>
                          <td>{product.category}</td>
                          <td>{product.total_quantity_sold}</td>
                          <td><strong>{formatCurrency(product.total_revenue)}</strong></td>
                          <td>{formatCurrency(product.avg_selling_price)}</td>
                          <td>
                            <strong className={product.profit && product.profit >= 0 ? 'text-success' : 'text-danger'}>
                              {product.profit !== undefined && product.profit !== null ? formatCurrency(product.profit) : '—'}
                            </strong>
                          </td>
                          <td>
                            {product.profit_margin_percent !== undefined && product.profit_margin_percent !== null ? (<react_bootstrap_1.Badge bg={product.profit_margin_percent >= 30 ? 'success' : product.profit_margin_percent >= 20 ? 'warning' : 'danger'}>
                                {(product.profit_margin_percent || 0).toFixed(1)}%
                              </react_bootstrap_1.Badge>) : ('—')}
                          </td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="top-quantity" title='📦 Top Cantități'>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top {limit} Produse după Cantitate Vândută</h5>
              <react_bootstrap_1.Badge bg="info">{topProductsByQuantity.length} produse</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>) : topProductsByQuantity.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<>
                  {topProductsByQuantity.length > 0 && (<div className="mb-4" style={{ height: '300px' }}>
                      <react_chartjs_2_1.Bar data={getTopProductsChartData(topProductsByQuantity, 'Cantitate Vândută')} options={{ responsive: true }}/>
                    </div>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produs</th>
                        <th>Categorie</th>
                        <th>Cantitate Vândută</th>
                        <th>Venit Total</th>
                        <th>Număr Comenzi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductsByQuantity.map(function (product, index) { return (<tr key={product.id}>
                          <td>
                            <react_bootstrap_1.Badge bg="info">{index + 1}</react_bootstrap_1.Badge>
                          </td>
                          <td><strong>{product.name}</strong></td>
                          <td>{product.category}</td>
                          <td><strong>{product.total_quantity_sold}</strong></td>
                          <td>{formatCurrency(product.total_revenue)}</td>
                          <td>{product.times_ordered}</td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="top-orders" title="🛒 Top Comenzi">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top {limit} Produse după Număr Comenzi</h5>
              <react_bootstrap_1.Badge bg="warning">{topProductsByOrders.length} produse</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>) : topProductsByOrders.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<>
                  {topProductsByOrders.length > 0 && (<div className="mb-4" style={{ height: '300px' }}>
                      <react_chartjs_2_1.Bar data={getTopProductsChartData(topProductsByOrders, 'Număr Comenzi')} options={{ responsive: true }}/>
                    </div>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produs</th>
                        <th>Categorie</th>
                        <th>Număr Comenzi</th>
                        <th>Cantitate Totală</th>
                        <th>Venit Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductsByOrders.map(function (product, index) { return (<tr key={product.id}>
                          <td>
                            <react_bootstrap_1.Badge bg="warning">{index + 1}</react_bootstrap_1.Badge>
                          </td>
                          <td><strong>{product.name}</strong></td>
                          <td>{product.category}</td>
                          <td><strong>{product.times_ordered}</strong></td>
                          <td>{product.total_quantity_sold}</td>
                          <td>{formatCurrency(product.total_revenue)}</td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="analytics" title="📈 Analytics">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Analytics Produse</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>) : (<>
                  {topProductsByRevenue.length > 0 && (<div className="mb-4" style={{ height: '400px' }}>
                      <react_chartjs_2_1.Pie data={getCategoryChartData()} options={{ responsive: true }}/>
                    </div>)}
                  {(analytics === null || analytics === void 0 ? void 0 : analytics.bestSeller) && (<react_bootstrap_1.Alert variant="success">
                      <h6><i className="fas fa-trophy me-2"></i>Best Seller</h6>
                      <p className="mb-1"><strong>Produs:</strong> {analytics.bestSeller.name}</p>
                      <p className="mb-1"><strong>Categorie:</strong> {analytics.bestSeller.category}</p>
                      <p className="mb-1"><strong>Venit Total:</strong> {formatCurrency(analytics.bestSeller.total_revenue)}</p>
                      <p className="mb-0"><strong>Cantitate Vândută:</strong> {analytics.bestSeller.total_quantity_sold}</p>
                    </react_bootstrap_1.Alert>)}
                </>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>
      </react_bootstrap_1.Tabs>
    </div>);
};
exports.TopProductsPage = TopProductsPage;
