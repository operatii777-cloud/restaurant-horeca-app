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
exports.StockReportsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./StockReportsPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
var StockReportsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)('current'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }), startDate = _c[0], setStartDate = _c[1];
    var _d = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _d[0], setEndDate = _d[1];
    // Data states
    var _e = (0, react_1.useState)([]), ingredients = _e[0], setIngredients = _e[1];
    var _f = (0, react_1.useState)([]), inventorySessions = _f[0], setInventorySessions = _f[1];
    var _g = (0, react_1.useState)([]), stockAlerts = _g[0], setStockAlerts = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    (0, react_1.useEffect)(function () {
        loadReport();
    }, [activeTab, startDate, endDate]);
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
                    _d.trys.push([1, 9, 10, 11]);
                    _a = activeTab;
                    switch (_a) {
                        case 'current': return [3 /*break*/, 2];
                        case 'history': return [3 /*break*/, 4];
                        case 'alerts': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 2: return [4 /*yield*/, loadCurrentStock()];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 4: return [4 /*yield*/, loadInventoryHistory()];
                case 5:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, loadStockAlerts()];
                case 7:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 11];
                case 9:
                    err_1 = _d.sent();
                    console.error('Error loading report:', err_1);
                    setError(((_c = (_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Eroare la încărcarea raportului');
                    return [3 /*break*/, 11];
                case 10:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    }); };
    var loadCurrentStock = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, httpClient_1.httpClient.get('/api/ingredients')];
                case 1:
                    response = _b.sent();
                    if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data)) {
                        setIngredients(response.data.data);
                    }
                    else if (Array.isArray(response.data)) {
                        setIngredients(response.data);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var loadInventoryHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, httpClient_1.httpClient.get('/api/inventory/sessions', {
                        params: { startDate: startDate, endDate: endDate },
                    })];
                case 1:
                    response = _b.sent();
                    if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data)) {
                        setInventorySessions(response.data.data);
                    }
                    else if (Array.isArray(response.data)) {
                        setInventorySessions(response.data);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var loadStockAlerts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, alerts, err_2, alerts;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 7]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/dashboard/inventory-alerts')];
                case 1:
                    response = _b.sent();
                    if (!(((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data))) return [3 /*break*/, 2];
                    setStockAlerts(response.data.data);
                    return [3 /*break*/, 4];
                case 2: 
                // Fallback: calculează alertele din ingrediente
                return [4 /*yield*/, loadCurrentStock()];
                case 3:
                    // Fallback: calculează alertele din ingrediente
                    _b.sent();
                    alerts = ingredients
                        .filter(function (ing) { return ing.current_stock < ing.min_stock; })
                        .map(function (ing) { return ({
                        ingredient_id: ing.id,
                        ingredient_name: ing.name,
                        current_stock: ing.current_stock,
                        min_stock: ing.min_stock,
                        alert_type: ing.current_stock === 0 ? 'out' : 'low',
                    }); });
                    setStockAlerts(alerts);
                    _b.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    err_2 = _b.sent();
                    // Fallback: calculează alertele din ingrediente
                    return [4 /*yield*/, loadCurrentStock()];
                case 6:
                    // Fallback: calculează alertele din ingrediente
                    _b.sent();
                    alerts = ingredients
                        .filter(function (ing) { return ing.current_stock < ing.min_stock; })
                        .map(function (ing) { return ({
                        ingredient_id: ing.id,
                        ingredient_name: ing.name,
                        current_stock: ing.current_stock,
                        min_stock: ing.min_stock,
                        alert_type: ing.current_stock === 0 ? 'out' : 'low',
                    }); });
                    setStockAlerts(alerts);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('ro-RO');
    };
    var getStockStatus = function (ingredient) {
        if (ingredient.current_stock === 0) {
            return { badge: 'danger', text: 'STOC EPUIZAT' };
        }
        else if (ingredient.current_stock < ingredient.min_stock) {
            return { badge: 'warning', text: 'STOC SCĂZUT' };
        }
        else if (ingredient.max_stock && ingredient.current_stock > ingredient.max_stock) {
            return { badge: 'info', text: 'STOC RIDICAT' };
        }
        return { badge: 'success', text: 'OK' };
    };
    // Chart data for Inventory History
    var getInventoryHistoryChartData = function () {
        // Validate data before creating chart
        if (!inventorySessions || inventorySessions.length === 0) {
            return null;
        }
        return {
            labels: inventorySessions.map(function (session) { return formatDate(session.session_date); }),
            datasets: [
                {
                    label: 'Total Items',
                    data: inventorySessions.map(function (session) { return session.total_items; }),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Discrepanțe',
                    data: inventorySessions.map(function (session) { return session.discrepancies; }),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    };
    // Chart data for Stock Alerts
    var getStockAlertsChartData = function () {
        // Validate data before creating chart
        if (!stockAlerts || stockAlerts.length === 0) {
            return null;
        }
        var lowStock = stockAlerts.filter(function (a) { return a.alert_type === 'low'; }).length;
        var outOfStock = stockAlerts.filter(function (a) { return a.alert_type === 'out'; }).length;
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
    var lowStockCount = ingredients.filter(function (ing) { return ing.current_stock < ing.min_stock; }).length;
    var outOfStockCount = ingredients.filter(function (ing) { return ing.current_stock === 0; }).length;
    var totalValue = ingredients.reduce(function (sum, ing) {
        // Estimare valoare (ar trebui să aibă cost_per_unit în backend)
        return sum + (ing.current_stock * 1); // Placeholder
    }, 0);
    return (<div className="stock-reports-page">
      <div className="page-header">
        <h1>📦 Rapoarte Stoc</h1>
        <p>Rapoarte detaliate despre stocuri, inventar și alerte</p>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      {/* Statistics */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Total Ingrediente</h6>
              <h4>{ingredients.length}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Stoc Scăzut</h6>
              <h4 className="text-warning">{lowStockCount}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Stoc Epuizat</h6>
              <h4 className="text-danger">{outOfStockCount}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Valoare Estimată</h6>
              <h4>{totalValue.toFixed(2)} RON</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Filters */}
      {(activeTab === 'history' || activeTab === 'alerts') && (<react_bootstrap_1.Card className="mb-4">
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
                  <react_bootstrap_1.Button variant="primary" onClick={loadReport}>
                    <i className="fas fa-sync me-2"></i>Actualizează</react_bootstrap_1.Button>
                </div>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {/* Tabs */}
      <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return k && setActiveTab(k); }} className="mb-4">
        <react_bootstrap_1.Tab eventKey="current" title='📦 stocuri curente'>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">situație stocuri curente</h5>
              <react_bootstrap_1.Badge bg="info">{ingredients.length} ingrediente</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">se încarcă</span>
                  </div>
                </div>) : ingredients.length === 0 ? (<react_bootstrap_1.Alert variant="info">nu există ingrediente în sistem</react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Categorie</th>
                      <th>Stoc Curent</th>
                      <th>Stoc Minim</th>
                      <th>Stoc Maxim</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map(function (ingredient) {
                var status = getStockStatus(ingredient);
                return (<tr key={ingredient.id} className={ingredient.current_stock < ingredient.min_stock
                        ? 'table-warning'
                        : ingredient.current_stock === 0
                            ? 'table-danger'
                            : ''}>
                          <td><strong>{ingredient.name}</strong></td>
                          <td>{ingredient.category || '—'}</td>
                          <td>
                            <strong>{ingredient.current_stock || 0}</strong> {ingredient.unit}
                          </td>
                          <td>{ingredient.min_stock || 0} {ingredient.unit}</td>
                          <td>{ingredient.max_stock || '—'}</td>
                          <td>
                            <react_bootstrap_1.Badge bg={status.badge}>{status.text}</react_bootstrap_1.Badge>
                          </td>
                        </tr>);
            })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="history" title="📊 Istoric Inventar">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Istoric Sesiuni Inventar</h5>
              <react_bootstrap_1.Badge bg="info">{inventorySessions.length} sesiuni</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">se încarcă</span>
                  </div>
                </div>) : inventorySessions.length === 0 ? (<react_bootstrap_1.Alert variant="info">nu există sesiuni de inventar pentru perioada selectată</react_bootstrap_1.Alert>) : (<>
                  {inventorySessions.length > 0 && getInventoryHistoryChartData() && (<div className="mb-4" style={{ height: '300px' }}>
                      <react_chartjs_2_1.Line data={getInventoryHistoryChartData()} options={{ responsive: true }}/>
                    </div>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Total Items</th>
                        <th>Discrepanțe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventorySessions.map(function (session) { return (<tr key={session.id}>
                          <td>{formatDate(session.session_date)}</td>
                          <td>
                            <react_bootstrap_1.Badge bg={session.status === 'completed' ? 'success' : 'warning'}>
                              {session.status}
                            </react_bootstrap_1.Badge>
                          </td>
                          <td>{session.total_items}</td>
                          <td>
                            <react_bootstrap_1.Badge bg={session.discrepancies > 0 ? 'warning' : 'success'}>
                              {session.discrepancies}
                            </react_bootstrap_1.Badge>
                          </td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="alerts" title="⚠️ Alerte Stoc">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Alerte Stoc</h5>
              <react_bootstrap_1.Badge bg="danger">{stockAlerts.length} alerte</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">se încarcă</span>
                  </div>
                </div>) : stockAlerts.length === 0 ? (<react_bootstrap_1.Alert variant="success">
                  <i className="fas fa-check-circle me-2"></i>nu există alerte de stoc, toate ingredientele au stoc suficient</react_bootstrap_1.Alert>) : (<>
                  {stockAlerts.length > 0 && getStockAlertsChartData() && (<div className="mb-4" style={{ height: '300px' }}>
                      <react_chartjs_2_1.Bar data={getStockAlertsChartData()} options={{ responsive: true }}/>
                    </div>)}
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Stoc Curent</th>
                        <th>Stoc Minim</th>
                        <th>tip alertă</th>
                        <th>Acțiune</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockAlerts.map(function (alert) { return (<tr key={alert.ingredient_id} className={alert.alert_type === 'out' ? 'table-danger' : 'table-warning'}>
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
exports.StockReportsPage = StockReportsPage;
