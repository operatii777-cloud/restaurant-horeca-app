"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DriveThruPerformanceReportPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var StatCard_1 = require("@/shared/components/StatCard");
require("./DriveThruPerformanceReportPage.css");
var DriveThruPerformanceReportPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), data = _a[0], setData = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    }), dateRange = _c[0], setDateRange = _c[1];
    (0, react_1.useEffect)(function () {
        fetchReport();
    }, [dateRange]);
    var fetchReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, driveThruData, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    params = new URLSearchParams();
                    params.append('start_date', dateRange.start);
                    params.append('end_date', dateRange.end);
                    params.append('order_source', 'DRIVE_THRU');
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/reports/delivery-performance?".concat(params.toString()))];
                case 1:
                    response = _c.sent();
                    if (response.data) {
                        driveThruData = (_b = (_a = response.data.summary) === null || _a === void 0 ? void 0 : _a.breakdown_by_source) === null || _b === void 0 ? void 0 : _b.find(function (s) { return s.order_source === 'DRIVE_THRU'; });
                        if (driveThruData) {
                            // Simulăm datele pentru drive-thru (ar trebui să vină de la backend)
                            setData({
                                period: response.data.period,
                                summary: {
                                    total_orders: driveThruData.count || 0,
                                    total_revenue: driveThruData.revenue || 0,
                                    avg_order_value: (driveThruData.revenue || 0) / (driveThruData.count || 1),
                                    avg_service_time_minutes: driveThruData.avg_prep_time_minutes || 0,
                                    orders_under_3min: 0, // Ar trebui calculat de backend
                                    orders_over_5min: 0, // Ar trebui calculat de backend
                                    orders_under_3min_percent: 0,
                                    orders_over_5min_percent: 0
                                },
                                by_lane: [],
                                hourly_heatmap: []
                            });
                        }
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _c.sent();
                    console.error('Error fetching drive-thru performance report:', err_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var exportPDF = function () {
        alert('Export PDF - Funcționalitate în dezvoltare');
    };
    var exportExcel = function () {
        alert('Export Excel - Funcționalitate în dezvoltare');
    };
    if (loading) {
        return (<div className="drivethru-performance-page">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      </div>);
    }
    return (<div className="drivethru-performance-page">
      <div className="page-header">
        <h1><i className="fas fa-chart-line me-2"></i>"raport performance drive thru"</h1>
        <div className="header-actions">
          <react_bootstrap_1.Button variant="outline-primary" onClick={exportPDF} className="me-2">
            <i className="fas fa-file-pdf me-1"></i>Export PDF
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="outline-success" onClick={exportExcel}>
            <i className="fas fa-file-excel me-1"></i>Export Excel
          </react_bootstrap_1.Button>
        </div>
      </div>

      {/* Filtre - Afișat ÎNTOTDEAUNA */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5>"filtre perioada"</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row className="g-3">
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>De la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateRange.start} onChange={function (e) { return setDateRange(__assign(__assign({}, dateRange), { start: e.target.value })); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Până la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateRange.end} onChange={function (e) { return setDateRange(__assign(__assign({}, dateRange), { end: e.target.value })); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>&nbsp;</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Button variant="primary" onClick={fetchReport} className="w-100" disabled={loading}>
                <i className="fas fa-sync-alt me-1"></i>
                {loading ? 'Se încarcă...' : 'Actualizează'}
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {!data && !loading && (<react_bootstrap_1.Card>
          <react_bootstrap_1.Card.Body className="text-center py-5">
            <p className="text-muted">"nu exista date pentru perioada selectata"</p>
            <p className="text-muted small mt-2">
              Perioada: {new Date(dateRange.start).toLocaleDateString('ro-RO')} - {new Date(dateRange.end).toLocaleDateString('ro-RO')}
            </p>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {data && (<>
          {/* KPI Cards */}
          <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Total Comenzi" value={data.summary.total_orders.toString()} helper={"Valoare: ".concat(data.summary.total_revenue.toFixed(2), " RON")} icon={<span>🚗</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Timp Mediu" value={data.summary.avg_service_time_minutes > 0 ? "".concat(data.summary.avg_service_time_minutes.toFixed(1), " min") : 'N/A'} helper="Per comandă" icon={<span>⏱️</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Sub 3 min" value={data.summary.orders_under_3min_percent > 0 ? "".concat(data.summary.orders_under_3min_percent.toFixed(1), "%") : 'N/A'} helper={"".concat(data.summary.orders_under_3min, " comenzi")} icon={<span>✅</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title={t('$([peste_5_min] -replace "\[|\]")')} value={data.summary.orders_over_5min_percent > 0 ? "".concat(data.summary.orders_over_5min_percent.toFixed(1), "%") : 'N/A'} helper={"".concat(data.summary.orders_over_5min, " comenzi")} icon={<span>⚠️</span>}/>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Summary */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5>Sumar General</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={6}>
              <p><strong>Total Comenzi:</strong> {data.summary.total_orders}</p>
              <p><strong>Venit Total:</strong> {data.summary.total_revenue.toFixed(2)} RON</p>
              <p><strong>"valoare medie comanda"</strong> {data.summary.avg_order_value.toFixed(2)} RON</p>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={6}>
              <p><strong>Timp Mediu Servire:</strong> {data.summary.avg_service_time_minutes > 0 ? "".concat(data.summary.avg_service_time_minutes.toFixed(1), " minute") : 'N/A'}</p>
              <p><strong>Comenzi Sub 3 min:</strong> {data.summary.orders_under_3min} ({data.summary.orders_under_3min_percent.toFixed(1)}%)</p>
              <p><strong>Comenzi Peste 5 min:</strong> {data.summary.orders_over_5min} ({data.summary.orders_over_5min_percent.toFixed(1)}%)</p>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* By Lane */}
      {data.by_lane.length > 0 && (<react_bootstrap_1.Card className="mb-4">
          <react_bootstrap_1.Card.Header>
            <h5>"breakdown pe banda"</h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped bordered hover>
              <thead>
                <tr>
                  <th>Bandă</th>
                  <th>"numar comenzi"</th>
                  <th>Venit</th>
                  <th>Timp Mediu</th>
                </tr>
              </thead>
              <tbody>
                {data.by_lane.map(function (lane, idx) { return (<tr key={idx}>
                    <td><react_bootstrap_1.Badge bg="warning">{lane.lane_number}</react_bootstrap_1.Badge></td>
                    <td>{lane.count}</td>
                    <td>{lane.revenue.toFixed(2)} RON</td>
                    <td>{lane.avg_time_minutes.toFixed(1)} min</td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {data.by_lane.length === 0 && (<react_bootstrap_1.Card>
          <react_bootstrap_1.Card.Body className="text-center py-5">
            <p className="text-muted">"nu exista date pentru breakdown pe banda"</p>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}
        </>)}
    </div>);
};
exports.DriveThruPerformanceReportPage = DriveThruPerformanceReportPage;
