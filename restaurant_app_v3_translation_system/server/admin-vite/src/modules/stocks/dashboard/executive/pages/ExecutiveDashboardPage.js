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
exports.ExecutiveDashboardPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./ExecutiveDashboardPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
var ExecutiveDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), metrics = _a[0], setMetrics = _a[1];
    var _b = (0, react_1.useState)([]), locationComparison = _b[0], setLocationComparison = _b[1];
    var _c = (0, react_1.useState)([]), stockValue = _c[0], setStockValue = _c[1];
    var _d = (0, react_1.useState)([]), varianceSummary = _d[0], setVarianceSummary = _d[1];
    var _e = (0, react_1.useState)([]), topIngredients = _e[0], setTopIngredients = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, metricsRes, comparisonRes, stockValueRes, varianceRes, topIngredientsRes, data, err_1;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _p.label = 1;
                case 1:
                    _p.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            httpClient_1.httpClient.get('/api/executive-dashboard/metrics'),
                            httpClient_1.httpClient.get('/api/executive-dashboard/location-comparison'),
                            httpClient_1.httpClient.get('/api/executive-dashboard/stock-value'),
                            httpClient_1.httpClient.get('/api/executive-dashboard/variance-summary'),
                            httpClient_1.httpClient.get('/api/executive-dashboard/top-ingredients', { params: { limit: 10 } }),
                        ])];
                case 2:
                    _a = _p.sent(), metricsRes = _a[0], comparisonRes = _a[1], stockValueRes = _a[2], varianceRes = _a[3], topIngredientsRes = _a[4];
                    // Process metrics
                    if (((_b = metricsRes.data) === null || _b === void 0 ? void 0 : _b.success) && ((_c = metricsRes.data) === null || _c === void 0 ? void 0 : _c.data)) {
                        data = metricsRes.data.data;
                        setMetrics({
                            totalStockValue: parseFloat(String(data.totalStockValue || 0)) || 0,
                            totalTransfers: parseInt(String(data.totalTransfers || 0)) || 0,
                            complianceRate: parseFloat(String(data.complianceRate || 0)) || 0,
                            totalVariance: parseFloat(String(data.totalVariance || 0)) || 0,
                        });
                    }
                    else if (metricsRes.data && !metricsRes.data.success) {
                        // Fallback: try direct access
                        setMetrics({
                            totalStockValue: parseFloat(String(metricsRes.data.total_stock_value || 0)) || 0,
                            totalTransfers: parseInt(String(metricsRes.data.total_transfers || 0)) || 0,
                            complianceRate: parseFloat(String(metricsRes.data.compliance_rate || 0)) || 0,
                            totalVariance: parseFloat(String(metricsRes.data.total_variance || 0)) || 0,
                        });
                    }
                    // Process location comparison
                    if (((_d = comparisonRes.data) === null || _d === void 0 ? void 0 : _d.success) && Array.isArray((_e = comparisonRes.data) === null || _e === void 0 ? void 0 : _e.data)) {
                        setLocationComparison(comparisonRes.data.data);
                    }
                    else if (Array.isArray(comparisonRes.data)) {
                        setLocationComparison(comparisonRes.data);
                    }
                    // Process stock value
                    if (((_f = stockValueRes.data) === null || _f === void 0 ? void 0 : _f.success) && Array.isArray((_g = stockValueRes.data) === null || _g === void 0 ? void 0 : _g.data)) {
                        setStockValue(stockValueRes.data.data);
                    }
                    else if (Array.isArray(stockValueRes.data)) {
                        setStockValue(stockValueRes.data);
                    }
                    // Process variance summary
                    if (((_h = varianceRes.data) === null || _h === void 0 ? void 0 : _h.success) && Array.isArray((_j = varianceRes.data) === null || _j === void 0 ? void 0 : _j.data)) {
                        setVarianceSummary(varianceRes.data.data);
                    }
                    else if (Array.isArray(varianceRes.data)) {
                        setVarianceSummary(varianceRes.data);
                    }
                    // Process top ingredients
                    if (((_k = topIngredientsRes.data) === null || _k === void 0 ? void 0 : _k.success) && Array.isArray((_l = topIngredientsRes.data) === null || _l === void 0 ? void 0 : _l.data)) {
                        setTopIngredients(topIngredientsRes.data.data);
                    }
                    else if (Array.isArray(topIngredientsRes.data)) {
                        setTopIngredients(topIngredientsRes.data);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _p.sent();
                    console.error('❌ Eroare la încărcarea datelor dashboard executiv:', err_1);
                    setError(((_o = (_m = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _m === void 0 ? void 0 : _m.data) === null || _o === void 0 ? void 0 : _o.error) || (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        loadData();
    }, [loadData]);
    var formatCurrency = function (value) {
        var numValue = typeof value === 'string' ? parseFloat(value) : (value || 0);
        if (isNaN(numValue))
            return '0.00 RON';
        return "".concat(numValue.toFixed(2), " RON");
    };
    var getComplianceBadgeClass = function (rate) {
        if (rate >= 90)
            return 'bg-success';
        if (rate >= 70)
            return 'bg-warning';
        return 'bg-danger';
    };
    // Chart data for Stock Value
    var stockValueChartData = {
        labels: stockValue.map(function (loc) { return loc.location_name; }),
        datasets: [
            {
                label: 'Valoare Stoc (RON)',
                data: stockValue.map(function (loc) {
                    var value = typeof loc.total_value === 'string' ? parseFloat(loc.total_value) : (loc.total_value || 0);
                    return isNaN(value) ? 0 : value;
                }),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };
    var stockValueChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString('ro-RO') + ' RON';
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.parsed.y.toLocaleString('ro-RO') + ' RON';
                    },
                },
            },
        },
    };
    // Chart data for Variance Distribution (Doughnut)
    var varianceChartData = {
        labels: varianceSummary.map(function (item) { return item.location_name; }),
        datasets: [
            {
                label: 'Varianță (RON)',
                data: varianceSummary.map(function (item) {
                    var value = typeof item.total_variance_value === 'string' ? parseFloat(item.total_variance_value) : (item.total_variance_value || 0);
                    return isNaN(value) ? 0 : value;
                }),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
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
    var varianceChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'right',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.label + ': ' + context.parsed.toLocaleString('ro-RO') + ' RON';
                    },
                },
            },
        },
    };
    var handleExportConsolidated = function () {
        window.open('/api/export/consolidated?format=excel', '_blank');
    };
    if (loading) {
        return (<div className="executive-dashboard-page">
        <PageHeader_1.PageHeader title="dashboard executiv multi gestiune" description="Vizualizare consolidată a tuturor metricilor pentru toate locațiile"/>
        <div className="text-center py-5">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
          <p className="mt-3">"se incarca dashboard ul executiv"</p>
        </div>
      </div>);
    }
    return (<div className="executive-dashboard-page">
      <react_bootstrap_1.Card className="shadow-sm mb-4">
        <react_bootstrap_1.Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-tachometer-alt me-2"></i>"dashboard executiv multi gestiune"</h5>
          <div>
            <react_bootstrap_1.Button variant="success" size="sm" className="me-2" onClick={handleExportConsolidated}>
              <i className="fas fa-file-excel me-1"></i>Export Consolidat
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="light" size="sm" onClick={loadData}>
              <i className="fas fa-sync-alt me-1"></i>"Reîmprospătare"</react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mb-4">
              {error}
            </react_bootstrap_1.Alert>)}

          {/* KPI Cards */}
          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="bg-primary text-white">
                <react_bootstrap_1.Card.Body className="text-center">
                  <h5>Total Valoare Stoc</h5>
                  <h2>{metrics ? formatCurrency(metrics.totalStockValue) : '0 RON'}</h2>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="bg-info text-white">
                <react_bootstrap_1.Card.Body className="text-center">
                  <h5>Total Transferuri</h5>
                  <h2>{metrics ? metrics.totalTransfers : 0}</h2>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="bg-success text-white">
                <react_bootstrap_1.Card.Body className="text-center">
                  <h5>Rata Conformitate</h5>
                  <h2>{metrics ? "".concat(metrics.complianceRate.toFixed(1), "%") : '0%'}</h2>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="bg-danger text-white">
                <react_bootstrap_1.Card.Body className="text-center">
                  <h5>"total varianta"</h5>
                  <h2>{metrics ? formatCurrency(metrics.totalVariance) : '0 RON'}</h2>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Charts Row */}
          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={6}>
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h6 className="mb-0">"valoare stoc per locatie"</h6>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  {stockValue.length === 0 ? (<p className="text-muted text-center py-4">"nu exista date disponibile"</p>) : (<div style={{ height: '300px' }}>
                      <react_chartjs_2_1.Bar data={stockValueChartData} options={stockValueChartOptions}/>
                    </div>)}
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={6}>
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h6 className="mb-0">"distributie varianta per locatie"</h6>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  {varianceSummary.length === 0 ? (<p className="text-muted text-center py-4">"nu exista date disponibile"</p>) : (<div style={{ height: '300px' }}>
                      <react_chartjs_2_1.Doughnut data={varianceChartData} options={varianceChartOptions}/>
                    </div>)}
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Location Comparison Table */}
          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={12}>
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h6 className="mb-0">"comparatie kpi per locatie"</h6>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  {locationComparison.length === 0 ? (<p className="text-muted text-center py-4">"nu exista date disponibile"</p>) : (<react_bootstrap_1.Table hover size="sm" responsive>
                      <thead className="table-light">
                        <tr>
                          <th>Locație</th>
                          <th>Tip</th>
                          <th className="text-end">Valoare Stoc (RON)</th>
                          <th className="text-center">Nr. Transferuri</th>
                          <th className="text-center">Conformitate (%)</th>
                          <th className="text-end">Varianță (RON)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locationComparison.map(function (location) { return (<tr key={location.location_id}>
                            <td><strong>{location.location_name}</strong></td>
                            <td>
                              <react_bootstrap_1.Badge bg="secondary">{location.location_type}</react_bootstrap_1.Badge>
                            </td>
                            <td className="text-end">{formatCurrency(location.stock_value)}</td>
                            <td className="text-center">{location.transfers_count}</td>
                            <td className="text-center">
                              <react_bootstrap_1.Badge bg={getComplianceBadgeClass(parseFloat(String(location.compliance_rate || 0)))}>
                                {parseFloat(String(location.compliance_rate || 0)).toFixed(1)}%
                              </react_bootstrap_1.Badge>
                            </td>
                            <td className={"text-end ".concat(parseFloat(String(location.variance_value || 0)) > 0 ? 'text-danger' : 'text-success')}>
                              {formatCurrency(location.variance_value)}
                            </td>
                          </tr>); })}
                      </tbody>
                    </react_bootstrap_1.Table>)}
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Top Ingredients */}
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={12}>
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h6 className="mb-0">Top 10 Ingrediente cu Mișcare Mare</h6>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  {topIngredients.length === 0 ? (<p className="text-muted text-center py-4">"nu exista date disponibile"</p>) : (<react_bootstrap_1.Table size="sm" responsive>
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Ingredient</th>
                          <th>Categorie</th>
                          <th className="text-center">Nr. Transferuri</th>
                          <th className="text-end">Cantitate Totală</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topIngredients.map(function (ing, index) { return (<tr key={ing.ingredient_id}>
                            <td>{index + 1}</td>
                            <td>{ing.ingredient_name}</td>
                            <td>{ing.category}</td>
                            <td className="text-center">{ing.transfer_count}</td>
                            <td className="text-end">{parseFloat(String(ing.total_quantity || 0)).toFixed(2)}</td>
                          </tr>); })}
                      </tbody>
                    </react_bootstrap_1.Table>)}
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.ExecutiveDashboardPage = ExecutiveDashboardPage;
