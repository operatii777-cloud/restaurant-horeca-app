"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Advanced Stock Dashboard Page
 * Complete dashboard with Stock Prediction, Inventory Alerts, Revenue Margin Chart
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
exports.AdvancedStockDashboardPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
var AdvancedStockDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)([]), trends = _c[0], setTrends = _c[1];
    var _d = (0, react_1.useState)([]), topVariances = _d[0], setTopVariances = _d[1];
    var _e = (0, react_1.useState)([]), locations = _e[0], setLocations = _e[1];
    var _f = (0, react_1.useState)([]), predictions = _f[0], setPredictions = _f[1];
    var _g = (0, react_1.useState)(false), showPredictionCard = _g[0], setShowPredictionCard = _g[1];
    var _h = (0, react_1.useState)('all'), selectedLocation = _h[0], setSelectedLocation = _h[1];
    var _j = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }), startDate = _j[0], setStartDate = _j[1];
    var _k = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _k[0], setEndDate = _k[1];
    (0, react_1.useEffect)(function () {
        loadData();
    }, [startDate, endDate, selectedLocation]);
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, statsRes, trendsRes, variancesRes, locationsRes, predictionsRes, error_1;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    setLoading(true);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            httpClient_1.httpClient.get('/api/admin/inventory/dashboard/stats', {
                                params: { start_date: startDate, end_date: endDate }
                            }),
                            httpClient_1.httpClient.get('/api/admin/inventory/dashboard/trends', {
                                params: { start_date: startDate, end_date: endDate }
                            }),
                            httpClient_1.httpClient.get('/api/admin/inventory/dashboard/top-variances', {
                                params: { location: selectedLocation !== 'all' ? selectedLocation : undefined }
                            }),
                            httpClient_1.httpClient.get('/api/admin/inventory/dashboard/locations', {
                                params: { start_date: startDate, end_date: endDate }
                            }),
                            httpClient_1.httpClient.get('/api/admin/inventory/dashboard/predictions').catch(function () { return ({ data: [] }); })
                        ])];
                case 2:
                    _a = _f.sent(), statsRes = _a[0], trendsRes = _a[1], variancesRes = _a[2], locationsRes = _a[3], predictionsRes = _a[4];
                    setStats(statsRes.data);
                    setTrends(((_b = trendsRes.data) === null || _b === void 0 ? void 0 : _b.data) || []);
                    setTopVariances(((_c = variancesRes.data) === null || _c === void 0 ? void 0 : _c.data) || []);
                    setLocations(((_d = locationsRes.data) === null || _d === void 0 ? void 0 : _d.data) || []);
                    setPredictions(((_e = predictionsRes.data) === null || _e === void 0 ? void 0 : _e.data) || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _f.sent();
                    console.error('Error loading dashboard data:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getTrendChartData = function () {
        return {
            labels: trends.map(function (t) { return new Date(t.date).toLocaleDateString('ro-RO'); }),
            datasets: [
                {
                    label: 'Valoare Totală',
                    data: trends.map(function (t) { return t.total_value; }),
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                },
                {
                    label: 'Ajustări Pozitive',
                    data: trends.map(function (t) { return t.positive; }),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                },
                {
                    label: 'Ajustări Negative',
                    data: trends.map(function (t) { return t.negative; }),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                },
            ],
        };
    };
    if (loading) {
        return (<div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>);
    }
    return (<div className="advanced-stock-dashboard">
      <PageHeader_1.PageHeader title='stocks-dashboard.dashboard_avansat_stocuri' description="Analiză detaliată a stocurilor, predicții și alerte" actions={[
            {
                label: '↻ Reîncarcă',
                variant: 'secondary',
                onClick: function () { return loadData(); },
            },
        ]}/>

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
              <react_bootstrap_1.Form.Label>Locație</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={selectedLocation} onChange={function (e) { return setSelectedLocation(e.target.value); }}>
                <option value="all">'stocks-dashboard.toate_locatiile'</option>
                {locations.map(function (loc) { return (<option key={loc.location_name} value={loc.location_name}>
                    {loc.location_name}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Summary Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Total Inventare</h6>
              <h4>{(stats === null || stats === void 0 ? void 0 : stats.total_inventories) || 0}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Valoare Totală</h6>
              <h4 className="text-success">
                {((stats === null || stats === void 0 ? void 0 : stats.total_value) || 0).toFixed(2)} RON
              </h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Alerte Critice</h6>
              <h4 className="text-danger">{(stats === null || stats === void 0 ? void 0 : stats.critical_alerts) || 0}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Alerte Warning</h6>
              <h4 className="text-warning">{(stats === null || stats === void 0 ? void 0 : stats.warning_alerts) || 0}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Stock Prediction Card (Collapsible) */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header className="collapsible-card-header" style={{ cursor: 'pointer' }} onClick={function () { return setShowPredictionCard(!showPredictionCard); }}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-chart-line me-2"></i>'stocks-dashboard.predictii_stoc'</h5>
            <i className={"fas fa-chevron-".concat(showPredictionCard ? 'up' : 'down')}></i>
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Collapse in={showPredictionCard}>
          <div>
            <react_bootstrap_1.Card.Body>
              {predictions.length === 0 ? (<react_bootstrap_1.Alert variant="info">'stocks-dashboard.nu_exista_predictii_disponibile'</react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Stoc Curent</th>
                      <th>'stocks-dashboard.consum_prevazut'</th>
                      <th>'stocks-dashboard.zile_pana_la_epuizare'</th>
                      <th>Recomandare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map(function (pred, idx) { return (<tr key={idx}>
                        <td>{pred.ingredient_name}</td>
                        <td>{pred.current_stock.toFixed(2)}</td>
                        <td>{pred.predicted_consumption.toFixed(2)}</td>
                        <td>{pred.days_until_out}</td>
                        <td>
                          <react_bootstrap_1.Badge bg={pred.recommendation === 'restock' ? 'danger' :
                    pred.recommendation === 'monitor' ? 'warning' : 'success'}>
                            {pred.recommendation === 'restock' ? 'Reaprovizionare' :
                    pred.recommendation === 'monitor' ? 'Monitorizare' : 'OK'}
                          </react_bootstrap_1.Badge>
                        </td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </div>
        </react_bootstrap_1.Collapse>
      </react_bootstrap_1.Card>

      {/* Trends Chart */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">'stocks-dashboard.evolutie_inventar'</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {trends.length === 0 ? (<react_bootstrap_1.Alert variant="info">Nu există date pentru perioada selectată</react_bootstrap_1.Alert>) : (<div style={{ height: '400px' }}>
              <react_chartjs_2_1.Line data={getTrendChartData()} options={{ responsive: true, maintainAspectRatio: false }}/>
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Top Variances */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">'stocks-dashboard.top_variante'</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {topVariances.length === 0 ? (<react_bootstrap_1.Alert variant="info">'stocks-dashboard.nu_exista_variante'</react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Locație</th>
                  <th>Așteptat</th>
                  <th>Actual</th>
                  <th>Varianță %</th>
                </tr>
              </thead>
              <tbody>
                {topVariances.slice(0, 20).map(function (v, idx) { return (<tr key={idx}>
                    <td>{v.ingredient_name}</td>
                    <td>{v.location}</td>
                    <td>{v.expected.toFixed(2)}</td>
                    <td>{v.actual.toFixed(2)}</td>
                    <td>
                      <react_bootstrap_1.Badge bg={v.variance > 10 ? 'danger' : v.variance > 5 ? 'warning' : 'info'}>
                        {v.variance.toFixed(2)}%
                      </react_bootstrap_1.Badge>
                    </td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Inventory Alerts per Location */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">'stocks-dashboard.alerte_per_locatie'</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {locations.length === 0 ? (<react_bootstrap_1.Alert variant="info">'stocks-dashboard.nu_exista_date_pentru_locatii'</react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Locație</th>
                  <th>Total Inventare</th>
                  <th>Valoare Totală</th>
                  <th>Alerte Critice</th>
                  <th>Alerte Warning</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(function (loc, idx) { return (<tr key={idx}>
                    <td><strong>{loc.location_name}</strong></td>
                    <td>{loc.total_inventories}</td>
                    <td>{loc.total_value.toFixed(2)} RON</td>
                    <td>
                      <react_bootstrap_1.Badge bg="danger">{loc.critical_alerts}</react_bootstrap_1.Badge>
                    </td>
                    <td>
                      <react_bootstrap_1.Badge bg="warning">{loc.warning_alerts}</react_bootstrap_1.Badge>
                    </td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.AdvancedStockDashboardPage = AdvancedStockDashboardPage;
