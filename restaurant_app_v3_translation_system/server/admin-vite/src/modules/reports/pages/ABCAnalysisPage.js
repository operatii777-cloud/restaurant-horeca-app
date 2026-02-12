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
exports.ABCAnalysisPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./ABCAnalysisPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
var ABCAnalysisPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)('3'), period = _a[0], setPeriod = _a[1];
    var _b = (0, react_1.useState)([]), products = _b[0], setProducts = _b[1];
    var _c = (0, react_1.useState)(null), summary = _c[0], setSummary = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    (0, react_1.useEffect)(function () {
        loadABCAnalysis();
    }, [period]);
    var loadABCAnalysis = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, responseData, rawProducts, data, classA, classB, classC, totalRevenue, revenueA, revenueB, revenueC, error_1, mockData;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/reports/abc-analysis', {
                            params: {
                                period_months: period,
                            },
                        })];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        responseData = response.data.data;
                        rawProducts = [];
                        if (Array.isArray(responseData)) {
                            // Cazul când data este direct un array
                            rawProducts = responseData;
                        }
                        else if ((responseData === null || responseData === void 0 ? void 0 : responseData.products) && Array.isArray(responseData.products)) {
                            // Cazul când data este un obiect cu proprietatea products
                            rawProducts = responseData.products;
                        }
                        else {
                            console.warn('âŒ Format neașteptat pentru datele ABC:', responseData);
                            rawProducts = [];
                        }
                        data = rawProducts.map(function (p) { return ({
                            product_name: p.product_name || p.name || 'Produs necunoscut',
                            category: p.category || 'Fără categorie',
                            abc_class: (p.abc_class || p.category || 'C'), // Backend folosește 'category' pentru ABC class
                            total_revenue: parseFloat(p.total_revenue) || 0,
                            cumulative_percent: parseFloat(p.cumulative_percent) || parseFloat(p.contribution_percent) || 0,
                            quantity_sold: parseFloat(p.quantity_sold) || parseFloat(p.total_quantity) || 0,
                        }); });
                        setProducts(data);
                        classA = data.filter(function (p) { return p.abc_class === 'A'; });
                        classB = data.filter(function (p) { return p.abc_class === 'B'; });
                        classC = data.filter(function (p) { return p.abc_class === 'C'; });
                        totalRevenue = data.reduce(function (sum, p) { return sum + p.total_revenue; }, 0);
                        revenueA = classA.reduce(function (sum, p) { return sum + p.total_revenue; }, 0);
                        revenueB = classB.reduce(function (sum, p) { return sum + p.total_revenue; }, 0);
                        revenueC = classC.reduce(function (sum, p) { return sum + p.total_revenue; }, 0);
                        setSummary({
                            classA: {
                                count: classA.length,
                                revenue: revenueA,
                                percent: totalRevenue > 0 ? (revenueA / totalRevenue) * 100 : 0,
                            },
                            classB: {
                                count: classB.length,
                                revenue: revenueB,
                                percent: totalRevenue > 0 ? (revenueB / totalRevenue) * 100 : 0,
                            },
                            classC: {
                                count: classC.length,
                                revenue: revenueC,
                                percent: totalRevenue > 0 ? (revenueC / totalRevenue) * 100 : 0,
                            },
                            totalProducts: data.length,
                            totalRevenue: totalRevenue,
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('âŒ Eroare la încărcarea analizei ABC:', error_1);
                    mockData = [
                        {
                            product_name: 'Pizza Margherita',
                            category: 'Pizza',
                            abc_class: 'A',
                            total_revenue: 15000,
                            cumulative_percent: 25.5,
                            quantity_sold: 500,
                        },
                        {
                            product_name: 'Pizza Quattro Stagioni',
                            category: 'Pizza',
                            abc_class: 'A',
                            total_revenue: 12000,
                            cumulative_percent: 45.9,
                            quantity_sold: 400,
                        },
                        {
                            product_name: 'Pasta Carbonara',
                            category: 'Pasta',
                            abc_class: 'B',
                            total_revenue: 8000,
                            cumulative_percent: 59.5,
                            quantity_sold: 300,
                        },
                        {
                            product_name: 'Salată Cezar',
                            category: 'Salate',
                            abc_class: 'C',
                            total_revenue: 3000,
                            cumulative_percent: 64.6,
                            quantity_sold: 150,
                        },
                    ];
                    setProducts(mockData);
                    setSummary({
                        classA: { count: 2, revenue: 27000, percent: 45.9 },
                        classB: { count: 1, revenue: 8000, percent: 13.6 },
                        classC: { count: 1, revenue: 3000, percent: 5.1 },
                        totalProducts: 4,
                        totalRevenue: 38000,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [period]);
    var barChartData = {
        labels: products.slice(0, 20).map(function (p) { return p.product_name; }),
        datasets: [
            {
                label: 'Venit Total (RON)',
                data: products.slice(0, 20).map(function (p) { return p.total_revenue; }),
                backgroundColor: products.slice(0, 20).map(function (p) {
                    return p.abc_class === 'A' ? 'rgba(40, 167, 69, 0.8)' : p.abc_class === 'B' ? 'rgba(255, 193, 7, 0.8)' : 'rgba(220, 53, 69, 0.8)';
                }),
            },
        ],
    };
    var barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Top 20 Produse - Analiză ABC',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Venit (RON)',
                },
            },
        },
    };
    var pieChartData = summary
        ? {
            labels: ['Clasa A', 'Clasa B', 'Clasa C'],
            datasets: [
                {
                    data: [summary.classA.revenue, summary.classB.revenue, summary.classC.revenue],
                    backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(255, 193, 7, 0.8)', 'rgba(220, 53, 69, 0.8)'],
                    borderColor: ['#28a745', '#ffc107', '#dc3545'],
                    borderWidth: 2,
                },
            ],
        }
        : null;
    var pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Distribuție Venituri pe Clase ABC',
            },
        },
    };
    return (<div className="abc-analysis-page">
      <h2 className="mb-4">Analiza ABC a Produselor Vândute</h2>
      <react_bootstrap_1.Card className="shadow-sm mb-4">
        <react_bootstrap_1.Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-chart-pie me-2"></i>Analiza ABC Produse</h5>
          <div className="d-flex align-items-center gap-2">
            <react_bootstrap_1.Form.Select size="sm" value={period} onChange={function (e) { return setPeriod(e.target.value); }} style={{ width: "Auto", backgroundColor: '#bbdefb !important', color: '#000 !important', fontWeight: 'bold' }} className="form-select-blue">
              <option value="1">Luna Trecuta</option>
              <option value="3">Ultimele 3 luni</option>
              <option value="6">Ultimele 6 luni</option>
              <option value="12">Ultimul an</option>
            </react_bootstrap_1.Form.Select>
            <react_bootstrap_1.Button variant="light" size="sm" onClick={loadABCAnalysis} disabled={loading} className="btn-refresh-blue">
              <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync-alt', " me-1")}></i>Reîmprospătează</react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {/* Summary Cards */}
          {summary && (<react_bootstrap_1.Row className="mb-4">
              <react_bootstrap_1.Col md={3}>
                <react_bootstrap_1.Card className="text-white bg-success">
                  <react_bootstrap_1.Card.Body>
                    <h4>Clasa A</h4>
                    <p className="mb-1">
                      <strong>{summary.classA.count}</strong> produse
                    </p>
                    <p className="mb-0">
                      <strong>{summary.classA.revenue.toFixed(2)} RON</strong>
                    </p>
                    <small>{summary.classA.percent.toFixed(1)}% din total</small>
                  </react_bootstrap_1.Card.Body>
                </react_bootstrap_1.Card>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={3}>
                <react_bootstrap_1.Card className="text-white bg-warning">
                  <react_bootstrap_1.Card.Body>
                    <h4>Clasa B</h4>
                    <p className="mb-1">
                      <strong>{summary.classB.count}</strong> produse
                    </p>
                    <p className="mb-0">
                      <strong>{summary.classB.revenue.toFixed(2)} RON</strong>
                    </p>
                    <small>{summary.classB.percent.toFixed(1)}% din total</small>
                  </react_bootstrap_1.Card.Body>
                </react_bootstrap_1.Card>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={3}>
                <react_bootstrap_1.Card className="text-white bg-danger">
                  <react_bootstrap_1.Card.Body>
                    <h4>Clasa C</h4>
                    <p className="mb-1">
                      <strong>{summary.classC.count}</strong> produse
                    </p>
                    <p className="mb-0">
                      <strong>{summary.classC.revenue.toFixed(2)} RON</strong>
                    </p>
                    <small>{summary.classC.percent.toFixed(1)}% din total</small>
                  </react_bootstrap_1.Card.Body>
                </react_bootstrap_1.Card>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={3}>
                <react_bootstrap_1.Card className="text-white bg-info">
                  <react_bootstrap_1.Card.Body>
                    <h4>Total</h4>
                    <p className="mb-1">
                      <strong>{summary.totalProducts}</strong> produse
                    </p>
                    <p className="mb-0">
                      <strong>{summary.totalRevenue.toFixed(2)} RON</strong>
                    </p>
                    <small>Venit total</small>
                  </react_bootstrap_1.Card.Body>
                </react_bootstrap_1.Card>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>)}

          {/* Charts */}
          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={8}>
              <react_bootstrap_1.Card className="shadow-sm">
                <react_bootstrap_1.Card.Header>
                  <h6>
                    <i className="fas fa-chart-bar me-1"></i>Top 20 Produse - Clasificare ABC
                  </h6>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <div style={{ height: '400px' }}>
                    <react_chartjs_2_1.Bar data={barChartData} options={barChartOptions}/>
                  </div>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Card className="shadow-sm">
                <react_bootstrap_1.Card.Header>
                  <h6>
                    <i className="fas fa-chart-pie me-1"></i>Distribuție Venituri pe Clase ABC</h6>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  {pieChartData ? (<div style={{ height: '400px' }}>
                      <react_chartjs_2_1.Pie data={pieChartData} options={pieChartOptions}/>
                    </div>) : (<div className="text-center text-muted">Nu există date</div>)}
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Table */}
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header>
              <h6>
                <i className="fas fa-list me-1"></i>Lista Completa Produse - Clasificare ABC</h6>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <div className="table-responsive">
                <react_bootstrap_1.Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Produs</th>
                      <th>Categorie</th>
                      <th>Clasa ABC</th>
                      <th>Venit Total</th>
                      <th>% Cumulat</th>
                      <th>Cantitate Vândută</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (<tr>
                        <td colSpan={6} className="text-center">
                          <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...</td>
                      </tr>) : products.length > 0 ? (products.map(function (product, index) { return (<tr key={index}>
                          <td>{product.product_name}</td>
                          <td>{product.category}</td>
                          <td>
                            <span className={"badge bg-".concat(product.abc_class === 'A' ? 'success' : product.abc_class === 'B' ? 'warning' : 'danger')}>
                              Clasa {product.abc_class}
                            </span>
                          </td>
                          <td>{product.total_revenue.toFixed(2)} RON</td>
                          <td>{product.cumulative_percent.toFixed(2)}%</td>
                          <td>{product.quantity_sold}</td>
                        </tr>); })) : (<tr>
                        <td colSpan={6} className="text-center text-muted">Nu Există Date pentru Perioada Selectata</td>
                      </tr>)}
                  </tbody>
                </react_bootstrap_1.Table>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.ABCAnalysisPage = ABCAnalysisPage;
