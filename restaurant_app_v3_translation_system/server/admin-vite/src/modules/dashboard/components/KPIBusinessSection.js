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
exports.KPIBusinessSection = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./KPIBusinessSection.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
var KPIBusinessSection = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), kpiData = _b[0], setKpiData = _b[1];
    (0, react_1.useEffect)(function () {
        loadKPIData();
    }, []);
    var loadKPIData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, toNumber, normalizedData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/dashboard/kpi')];
                case 2:
                    response = _a.sent();
                    if (response.data) {
                        data = response.data.kpi || response.data;
                        toNumber = function (value, defaultValue) {
                            if (defaultValue === void 0) { defaultValue = 0; }
                            if (typeof value === 'number')
                                return value;
                            if (typeof value === 'string') {
                                var parsed = parseFloat(value);
                                return isNaN(parsed) ? defaultValue : parsed;
                            }
                            return defaultValue;
                        };
                        normalizedData = {
                            todayRevenue: toNumber(data.todayRevenue, 0),
                            revenueChange: data.revenueChange || '0%',
                            inventoryAlerts: toNumber(data.inventoryAlerts, 0),
                            customerRetention: toNumber(data.customerRetention, 0),
                            cogsToday: toNumber(data.cogsToday, 0),
                            tableTurnover: data.tableTurnover || '0x',
                            tableUtilization: data.tableUtilization || '0/0',
                            avgRating: toNumber(data.avgRating, 0),
                            totalFeedback: toNumber(data.totalFeedback, 0),
                            excellentCount: toNumber(data.excellentCount, 0),
                            lowRatingCount: toNumber(data.lowRatingCount, 0),
                            todayOrders: toNumber(data.todayOrders, 0),
                            todayOrdersChange: data.todayOrdersChange || '0%',
                            todayProfit: toNumber(data.todayProfit, 0),
                            profitMargin: toNumber(data.profitMargin, 0),
                            topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
                            revenueMarginData: Array.isArray(data.revenueMarginData) ? data.revenueMarginData : [],
                            deliveryActive: data.deliveryActive || 0,
                            deliveryAvgTime: data.deliveryAvgTime || 'N/A',
                            drivethruActive: data.drivethruActive || 0,
                            drivethruAvgTime: data.drivethruAvgTime || 'N/A',
                            takeawayActive: data.takeawayActive || 0,
                            takeawayAvgTime: data.takeawayAvgTime || 'N/A',
                        };
                        setKpiData(normalizedData);
                    }
                    else {
                        // Fallback: use mock data for development
                        setKpiData({
                            todayRevenue: 12500,
                            revenueChange: '+12.5% față de ieri',
                            inventoryAlerts: 8,
                            customerRetention: 68,
                            cogsToday: 4500,
                            tableTurnover: '2.3x',
                            tableUtilization: '145/200',
                            avgRating: 4.5,
                            totalFeedback: 127,
                            excellentCount: 89,
                            lowRatingCount: 3,
                            todayOrders: 156,
                            todayOrdersChange: '+8.3% față de ieri',
                            todayProfit: 8000,
                            profitMargin: 64,
                            deliveryActive: 0,
                            deliveryAvgTime: 'N/A',
                            drivethruActive: 0,
                            drivethruAvgTime: 'N/A',
                            takeawayActive: 0,
                            takeawayAvgTime: 'N/A',
                            topProducts: [
                                { product_name: 'Pizza Margherita', category: 'Pizza', quantity_sold: 45, revenue: 1125, percentage: 9.0 },
                                { product_name: 'Pasta Carbonara', category: 'Pasta', quantity_sold: 32, revenue: 960, percentage: 7.7 },
                                { product_name: 'Salată Cezar', category: 'Salate', quantity_sold: 28, revenue: 700, percentage: 5.6 },
                                { product_name: 'Tiramisu', category: 'Desert', quantity_sold: 25, revenue: 625, percentage: 5.0 },
                                { product_name: 'Coca Cola', category: 'Băuturi', quantity_sold: 120, revenue: 600, percentage: 4.8 },
                            ],
                            revenueMarginData: [
                                { date: '2025-01-15', revenue: 11000, margin: 62 },
                                { date: '2025-01-16', revenue: 12000, margin: 63 },
                                { date: '2025-01-17', revenue: 11500, margin: 61 },
                                { date: '2025-01-18', revenue: 13000, margin: 64 },
                                { date: '2025-01-19', revenue: 12500, margin: 63 },
                                { date: '2025-01-20', revenue: 12800, margin: 64 },
                                { date: '2025-01-21', revenue: 12500, margin: 63 },
                            ],
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('❌ Eroare la încărcarea KPI-urilor:', error_1);
                    // Fallback: use mock data
                    setKpiData({
                        todayRevenue: 12500,
                        revenueChange: '+12.5% față de ieri',
                        inventoryAlerts: 8,
                        customerRetention: 68,
                        cogsToday: 4500,
                        tableTurnover: '2.3x',
                        tableUtilization: '145/200',
                        avgRating: 4.5,
                        totalFeedback: 127,
                        excellentCount: 89,
                        lowRatingCount: 3,
                        todayOrders: 156,
                        todayOrdersChange: '+8.3% față de ieri',
                        todayProfit: 8000,
                        profitMargin: 64,
                        topProducts: [
                            { product_name: 'Pizza Margherita', category: 'Pizza', quantity_sold: 45, revenue: 1125, percentage: 9.0 },
                            { product_name: 'Pasta Carbonara', category: 'Pasta', quantity_sold: 32, revenue: 960, percentage: 7.7 },
                            { product_name: 'Salată Cezar', category: 'Salate', quantity_sold: 28, revenue: 700, percentage: 5.6 },
                            { product_name: 'Tiramisu', category: 'Desert', quantity_sold: 25, revenue: 625, percentage: 5.0 },
                            { product_name: 'Coca Cola', category: 'Băuturi', quantity_sold: 120, revenue: 600, percentage: 4.8 },
                        ],
                        revenueMarginData: [
                            { date: '2025-01-15', revenue: 11000, margin: 62 },
                            { date: '2025-01-16', revenue: 12000, margin: 63 },
                            { date: '2025-01-17', revenue: 11500, margin: 61 },
                            { date: '2025-01-18', revenue: 13000, margin: 64 },
                            { date: '2025-01-19', revenue: 12500, margin: 63 },
                            { date: '2025-01-20', revenue: 12800, margin: 64 },
                            { date: '2025-01-21', revenue: 12500, margin: 63 },
                        ],
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="kpi-business-section">
        <react_bootstrap_1.Card className="shadow-sm">
          <react_bootstrap_1.Card.Body>
              <div className="text-center">
                <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă KPI-urile business...</div>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>
      </div>);
    }
    if (!kpiData) {
        return null;
    }
    // Ensure arrays exist with fallback to empty arrays
    var revenueMarginData = Array.isArray(kpiData.revenueMarginData) ? kpiData.revenueMarginData : [];
    var topProducts = Array.isArray(kpiData.topProducts) ? kpiData.topProducts : [];
    var revenueMarginChartData = {
        labels: revenueMarginData.map(function (item) {
            return new Date(item.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });
        }),
        datasets: [
            {
                label: 'Venituri (RON)',
                data: revenueMarginData.map(function (item) { return item.revenue; }),
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Marjă Brută (%)',
                data: revenueMarginData.map(function (item) { return item.margin; }),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
            },
        ],
    };
    var revenueMarginChartOptions = {
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
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        if (context.datasetIndex === 0) {
                            return "Venituri: ".concat(context.parsed.y.toFixed(2), " RON");
                        }
                        else {
                            return "Marj\u0103: ".concat(context.parsed.y.toFixed(2), "%");
                        }
                    },
                },
            },
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
                ticks: {
                    callback: function (value) {
                        return value.toFixed(0) + ' RON';
                    },
                },
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Marjă (%)',
                },
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    callback: function (value) {
                        return value.toFixed(0) + '%';
                    },
                },
            },
        },
    };
    return (<div className="kpi-business-section">
      <h3 className="kpi-section-title">
        <i className="fas fa-chart-line me-2"></i>KPI Business
      </h3>

      {/* Row 1: Revenue, Orders, Profit, COGS */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="metric-card text-white bg-primary">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.todayRevenue.toFixed(2)} RON</h4>
                  <small>Venituri Astăzi</small>
                </div>
                <i className="fas fa-coins fa-2x"></i>
              </div>
              <small className="mt-2 d-block">{kpiData.revenueChange}</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.todayOrders}</h4>
                  <small>Comenzi Astăzi</small>
                </div>
                <i className="fas fa-shopping-cart fa-2x"></i>
              </div>
              <small className="mt-2 d-block">{kpiData.todayOrdersChange}</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.todayProfit.toFixed(2)} RON</h4>
                  <small>Profit Astăzi</small>
                </div>
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Marjă: {kpiData.profitMargin.toFixed(1)}%</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="metric-card text-white bg-danger">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.cogsToday.toFixed(2)} RON</h4>
                  <small>COGS Astăzi</small>
                </div>
                <i className="fas fa-calculator fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Cost ingrediente vândute</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Row 1.5: Alerts, Retention */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="metric-card text-white bg-warning">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.inventoryAlerts}</h4>
                  <small>Alerte Stoc</small>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Produse sub minim stoc</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="metric-card text-white bg-success">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.customerRetention}%</h4>
                  <small>Retenție Clienți</small>
                </div>
                <i className="fas fa-users fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Clienți care revin</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Row 1.5: Table Turnover & Utilization */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.tableTurnover}</h4>
                  <small>🔄 Rotație Mese</small>
                </div>
                <i className="fas fa-sync-alt fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Grupuri per masă ocupată</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #6610f2 0%, #5a0dd6 100%)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.tableUtilization}</h4>
                  <small>📊 Utilizare Mese</small>
                </div>
                <i className="fas fa-table fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Mese folosite din 200</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Row 2: Delivery, Drive-Thru, Takeaway Metrics - NOU */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>🛵 Delivery</h4>
                  <small>Active: {kpiData.deliveryActive || 0}</small>
                </div>
                <i className="fas fa-motorcycle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Timp mediu: {kpiData.deliveryAvgTime || 'N/A'}</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>🚗 Drive-Thru</h4>
                  <small>Active: {kpiData.drivethruActive || 0}</small>
                </div>
                <i className="fas fa-car fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Timp mediu: {kpiData.drivethruAvgTime || 'N/A'}</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>📦 Takeaway</h4>
                  <small>Active: {kpiData.takeawayActive || 0}</small>
                </div>
                <i className="fas fa-shopping-bag fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Timp mediu: {kpiData.takeawayAvgTime || 'N/A'}</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Row 2: Feedback Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="metric-card text-white bg-info">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.avgRating.toFixed(1)}★</h4>
                  <small>🌍 Rating Mediu OVERALL</small>
                </div>
                <i className="fas fa-star fa-2x"></i>
              </div>
              <small className="mt-2 d-block">{kpiData.totalFeedback} evaluări (overall)</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.excellentCount}</h4>
                  <small>⭐ Rating-uri 5★ (OVERALL)</small>
                </div>
                <i className="fas fa-heart fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Clienți foarte mulțumiți</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="metric-card text-white bg-warning">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.lowRatingCount}</h4>
                  <small>⚠️ Rating-uri ≤2★ (OVERALL)</small>
                </div>
                <i className="fas fa-exclamation-circle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Necesită atenție urgentă</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Row 3: Revenue & Margin Chart + Top Products */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={7}>
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-area me-1"></i> Evoluție Venituri & Marjă Brută (Ultimele 7 zile)
              </h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <div style={{ height: '300px' }}>
                <react_chartjs_2_1.Line data={revenueMarginChartData} options={revenueMarginChartOptions}/>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={5}>
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-trophy me-1"></i> Top 5 Produse Astăzi
              </h5>
              <react_bootstrap_1.Button variant="link" size="sm" onClick={loadKPIData}>
                <i className="fas fa-sync-alt"></i>
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <div className="table-responsive" style={{ maxHeight: '300px', overflowY: "Auto" }}>
                <react_bootstrap_1.Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Produs</th>
                      <th>Cantitate</th>
                      <th>Venit</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length === 0 ? (<tr>
                        <td colSpan={4} className="text-center text-muted">Nu există date disponibile</td>
                      </tr>) : (topProducts.map(function (product, index) {
            var revenue = typeof product.revenue === 'number' ? product.revenue : (parseFloat(String(product.revenue || 0)) || 0);
            var percentage = typeof product.percentage === 'number' ? product.percentage : (parseFloat(String(product.percentage || 0)) || 0);
            return (<tr key={index}>
                            <td>
                              <strong>{product.product_name || 'N/A'}</strong>
                              <br />
                              <small className="text-muted">{product.category || ''}</small>
                            </td>
                            <td>{product.quantity_sold || 0}</td>
                            <td>{revenue.toFixed(2)} RON</td>
                            <td>
                              <span className="badge bg-info">{percentage.toFixed(1)}%</span>
                            </td>
                          </tr>);
        }))}
                  </tbody>
                </react_bootstrap_1.Table>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Row 4: Top Products Bar Chart */}
      <react_bootstrap_1.Row>
        <react_bootstrap_1.Col md={12}>
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-1"></i>Top Produse - Distribuție Venituri</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <div style={{ height: '250px' }}>
                <react_chartjs_2_1.Bar data={{
            labels: topProducts.map(function (p) { return p.product_name; }),
            datasets: [
                {
                    label: 'Venit (RON)',
                    data: topProducts.map(function (p) { return p.revenue; }),
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                    ],
                },
            ],
        }} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            var product = topProducts[context.dataIndex];
                            if (!product)
                                return "Venit: ".concat(context.parsed.y.toFixed(2), " RON");
                            var percentage = typeof product.percentage === 'number' ? product.percentage : (parseFloat(String(product.percentage || 0)) || 0);
                            return "Venit: ".concat(context.parsed.y.toFixed(2), " RON (").concat(percentage.toFixed(1), "%)");
                        },
                    },
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
        }}/>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>
    </div>);
};
exports.KPIBusinessSection = KPIBusinessSection;
