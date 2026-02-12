"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Daily Balance Report Page
 *
 * Raport Balanță Zilnică:
 * - Stoc inițial, intrări zilnice, consumuri zilnice, stoc final
 * - Trend ultimele 30 zile
 * - Diferențe și variance
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
exports.DailyBalanceReportPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./DailyBalanceReportPage.css");
var DailyBalanceReportPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var _c = (0, react_1.useState)(null), data = _c[0], setData = _c[1];
    var _d = (0, react_1.useState)(function () {
        var date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    }), startDate = _d[0], setStartDate = _d[1];
    var _e = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _e[0], setEndDate = _e[1];
    var _f = (0, react_1.useState)(1), locationId = _f[0], setLocationId = _f[1];
    var loadReport = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/accounting/daily-balance', {
                            locationId: locationId,
                            reportDate: endDate
                        })];
                case 2:
                    response = _c.sent();
                    if (response.data.success) {
                        setData(response.data.data);
                    }
                    else {
                        setError(response.data.error || 'Eroare la încărcarea raportului');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('DailyBalanceReportPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea raportului');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [endDate, locationId]);
    react_1.default.useEffect(function () {
        if (locationId && endDate) {
            loadReport();
        }
    }, [loadReport]);
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(value);
    };
    var formatNumber = function (value, decimals) {
        if (decimals === void 0) { decimals = 2; }
        return new Intl.NumberFormat('ro-RO', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    };
    var handlePrint = function () {
        window.print();
    };
    return (<div className="daily-balance-report-page">
      <div className="page-header">
        <h1>📅 Balanța Zilnică</h1>
        <p>"raport zilnic al stocurilor stoc initial intrari c"</p>
      </div>

      {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row className="align-items-end">
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
                <react_bootstrap_1.Form.Label>Locație</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control as="select" value={locationId || ''} onChange={function (e) { return setLocationId(e.target.value ? parseInt(e.target.value) : null); }}>
                  <option value="">"selecteaza locatia"</option>
                  <option value="1">"restaurant best center"</option>
                  <option value="2">"restaurant best mall"</option>
                </react_bootstrap_1.Form.Control>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <div className="d-flex gap-2">
                <react_bootstrap_1.Button onClick={loadReport} disabled={loading} className="flex-fill">
                  {loading ? (<><i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...</>) : (<><i className="fas fa-sync-alt me-2"></i>"Reîncarcă"</>)}
                </react_bootstrap_1.Button>
                <react_bootstrap_1.Button variant="outline-primary" onClick={handlePrint}>
                  <i className="fas fa-print me-2"></i>"Tipărire"</react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {data && (<>
          <react_bootstrap_1.Card className="mb-4 info-box">
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={4}>
                  <strong>Data Raport:</strong> {new Date(data.report_date).toLocaleDateString('ro-RO')}
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={4}>
                  <strong>"Locație:"</strong> Restaurant BEST {data.location_id === 1 ? 'Center' : 'Mall'}
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={4}>
                  <strong>Ora Raport:</strong> {new Date().toLocaleTimeString('ro-RO')}
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header>
              <h5>"detalii balanta zilnica"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped bordered hover responsive className="daily-balance-table">
                <thead>
                  <tr>
                    <th>"Nomenclator"</th>
                    <th className="text-center">UM</th>
                    <th className="text-end">"stoc initial"</th>
                    <th className="text-end">Valoare Inițială</th>
                    <th className="text-end">"intrari astazi"</th>
                    <th className="text-end">"valoare intrari"</th>
                    <th className="text-end">"consum astazi"</th>
                    <th className="text-end">Valoare Consum</th>
                    <th className="text-end">Stoc Final</th>
                    <th className="text-end">"valoare finala"</th>
                    <th className="text-end">Diferență</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(function (item) { return (<tr key={item.id} style={{
                    backgroundColor: item.variance_qty < 0 ? '#ffebee' : item.variance_qty > 0 ? '#e8f5e9' : 'transparent'
                }}>
                      <td>{item.nomenclature}</td>
                      <td className="text-center">{item.unit}</td>
                      <td className="text-end">{formatNumber(item.opening_stock, 3)}</td>
                      <td className="text-end">{formatCurrency(item.opening_value)}</td>
                      <td className="text-end" style={{ color: '#2e7d32' }}>
                        {formatNumber(item.entries_today_qty, 3)}
                      </td>
                      <td className="text-end" style={{ color: '#2e7d32' }}>
                        {formatCurrency(item.entries_today_value)}
                      </td>
                      <td className="text-end" style={{ color: '#d32f2f' }}>
                        {formatNumber(item.consumption_today_qty, 3)}
                      </td>
                      <td className="text-end" style={{ color: '#d32f2f' }}>
                        {formatCurrency(item.consumption_today_value)}
                      </td>
                      <td className="text-end"><strong>{formatNumber(item.closing_stock, 3)}</strong></td>
                      <td className="text-end"><strong>{formatCurrency(item.closing_value)}</strong></td>
                      <td className="text-end">
                        {item.variance_qty !== 0 && (<react_bootstrap_1.Badge bg={item.variance_qty < 0 ? 'danger' : 'success'}>
                            {item.variance_qty > 0 ? '+' : ''}{formatNumber(item.variance_qty, 3)}
                          </react_bootstrap_1.Badge>)}
                      </td>
                    </tr>); })}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <th colSpan={3} className="text-end"><strong>TOTAL:</strong></th>
                    <th className="text-end">{formatCurrency(data.totals.opening_value)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals.entries_value)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals.consumption_value)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals.closing_value)}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="kpi-card bg-primary text-white">
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Card.Title className="text-white">"stoc initial"</react_bootstrap_1.Card.Title>
                  <react_bootstrap_1.Card.Text className="kpi-value">{formatCurrency(data.totals.opening_value)}</react_bootstrap_1.Card.Text>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="kpi-card bg-success text-white">
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Card.Title className="text-white">"Intrări"</react_bootstrap_1.Card.Title>
                  <react_bootstrap_1.Card.Text className="kpi-value">{formatCurrency(data.totals.entries_value)}</react_bootstrap_1.Card.Text>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="kpi-card bg-danger text-white">
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Card.Title className="text-white">Consum</react_bootstrap_1.Card.Title>
                  <react_bootstrap_1.Card.Text className="kpi-value">{formatCurrency(data.totals.consumption_value)}</react_bootstrap_1.Card.Text>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="kpi-card bg-info text-white">
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Card.Title className="text-white">Stoc Final</react_bootstrap_1.Card.Title>
                  <react_bootstrap_1.Card.Text className="kpi-value">{formatCurrency(data.totals.closing_value)}</react_bootstrap_1.Card.Text>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5>Trend Ultimele 30 Zile</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Alert variant="info">
                <i className="fas fa-info-circle me-2"></i>
                Graficul trend va fi disponibil după colectarea datelor pentru 30 de zile consecutive.
              </react_bootstrap_1.Alert>
              {/* TODO: Implementare trend chart cu date istorice */}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </>)}
    </div>);
};
exports.DailyBalanceReportPage = DailyBalanceReportPage;
