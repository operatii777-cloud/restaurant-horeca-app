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
exports.DeliveryPerformanceReportPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var StatCard_1 = require("@/shared/components/StatCard");
require("./DeliveryPerformanceReportPage.css");
var PLATFORM_ICONS = {
    glovo: '🛵',
    wolt: '🔵',
    bolt_food: '🍏',
    friendsride: '🟣',
    tazz: '⚡',
    phone: '📞',
    online: '🌐'
};
var DeliveryPerformanceReportPage = function () {
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
        var params, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    params = new URLSearchParams();
                    params.append('start_date', dateRange.start);
                    params.append('end_date', dateRange.end);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/reports/delivery-performance?".concat(params.toString()))];
                case 1:
                    response = _a.sent();
                    // axios returnează { data: {...} }, iar backend returnează direct obiectul
                    if (response.data) {
                        setData(response.data);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error fetching delivery performance report:', err_1);
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
        return (<div className="delivery-performance-page">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      </div>);
    }
    return (<div className="delivery-performance-page">
      <div className="page-header">
        <h1><i className="fas fa-chart-line me-2"></i>"raport performance delivery"</h1>
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
          <StatCard_1.StatCard title="Total Comenzi" value={data.summary.total_orders.toString()} helper={"Valoare: ".concat(data.summary.total_revenue.toFixed(2), " RON")} icon={<span>📦</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Valoare Medie" value={"".concat(data.summary.avg_order_value.toFixed(2), " RON")} helper="Per comandă" icon={<span>💰</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Anulări" value={data.summary.cancelled_orders.toString()} helper={"".concat(data.summary.cancellation_rate, "% rat\u0103 anulare")} icon={<span>❌</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Venit Net" value={"".concat(data.summary.financial.net_revenue.toFixed(2), " RON")} helper="După comisioane și costuri" icon={<span>💵</span>}/>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Breakdown by Source */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5>"breakdown pe tip comanda"</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Table striped bordered hover>
            <thead>
              <tr>
                <th>Tip</th>
                <th>"numar comenzi"</th>
                <th>Venit</th>
                <th>Timp Mediu Preparare</th>
                <th>"Anulări"</th>
              </tr>
            </thead>
            <tbody>
              {data.summary.breakdown_by_source.map(function (item, idx) { return (<tr key={idx}>
                  <td>
                    <react_bootstrap_1.Badge bg={item.order_source === 'DELIVERY' ? 'primary' : 'warning'}>
                      {item.order_source === 'DELIVERY' ? '🛵 DELIVERY' : '🚗 DRIVE-THRU'}
                    </react_bootstrap_1.Badge>
                  </td>
                  <td>{item.count}</td>
                  <td>{item.revenue.toFixed(2)} RON</td>
                  <td>{item.avg_prep_time_minutes ? "".concat(item.avg_prep_time_minutes.toFixed(1), " min") : 'N/A'}</td>
                  <td>{item.cancelled}</td>
                </tr>); })}
            </tbody>
          </react_bootstrap_1.Table>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Breakdown by Platform */}
      {data.summary.breakdown_by_platform.length > 0 && (<react_bootstrap_1.Card className="mb-4">
          <react_bootstrap_1.Card.Header>
            <h5>"breakdown pe platforma"</h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped bordered hover>
              <thead>
                <tr>
                  <th>Platformă</th>
                  <th>"numar comenzi"</th>
                  <th>Venit</th>
                  <th>Comision</th>
                  <th>Venit Net</th>
                </tr>
              </thead>
              <tbody>
                {data.summary.breakdown_by_platform.map(function (item, idx) { return (<tr key={idx}>
                    <td>
                      <react_bootstrap_1.Badge bg="light" text="dark">
                        {PLATFORM_ICONS[item.platform] || '📱'} {item.platform}
                      </react_bootstrap_1.Badge>
                    </td>
                    <td>{item.count}</td>
                    <td>{item.revenue.toFixed(2)} RON</td>
                    <td>{item.commission.toFixed(2)} RON</td>
                    <td>{(item.revenue - item.commission).toFixed(2)} RON</td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {/* Financial Summary */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5>Sumar Financiar</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={6}>
              <p><strong>Venit Brut:</strong> {data.summary.financial.gross_revenue.toFixed(2)} RON</p>
              <p><strong>"comisioane platforme"</strong> {data.summary.financial.platform_commissions.toFixed(2)} RON</p>
              <p><strong>Taxe Livrare:</strong> {data.summary.financial.delivery_fees_charged.toFixed(2)} RON</p>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={6}>
              <p><strong>"costuri ambalaje"</strong> {data.summary.financial.packaging_costs.toFixed(2)} RON</p>
              <p><strong>Venit Net:</strong> <strong className="text-success">{data.summary.financial.net_revenue.toFixed(2)} RON</strong></p>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Couriers */}
      {data.couriers.length > 0 && (<react_bootstrap_1.Card className="mb-4">
          <react_bootstrap_1.Card.Header>
            <h5>"top curieri"</h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped bordered hover>
              <thead>
                <tr>
                  <th>Curier</th>
                  <th>"Livrări"</th>
                  <th>Rating</th>
                  <th>"Câștigat"</th>
                </tr>
              </thead>
              <tbody>
                {data.couriers.map(function (courier) { return (<tr key={courier.id}>
                    <td>{courier.name}</td>
                    <td>{courier.deliveries_count}</td>
                    <td>{courier.rating.toFixed(1)} ⭐</td>
                    <td>{courier.total_earned.toFixed(2)} RON</td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {/* Cancellations */}
      {data.cancellations.length > 0 && (<react_bootstrap_1.Card>
          <react_bootstrap_1.Card.Header>
            <h5>"anulari pe motiv"</h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped bordered hover>
              <thead>
                <tr>
                  <th>Motiv</th>
                  <th>"Număr"</th>
                </tr>
              </thead>
              <tbody>
                {data.cancellations.map(function (item, idx) { return (<tr key={idx}>
                    <td>{item.reason_code || 'Nespecificat'}</td>
                    <td>{item.count}</td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}
        </>)}
    </div>);
};
exports.DeliveryPerformanceReportPage = DeliveryPerformanceReportPage;
