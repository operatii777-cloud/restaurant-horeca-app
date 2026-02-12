"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Stock Balance Report Page
 *
 * Raport Balanța Stocurilor:
 * - Stoc inițial, intrări, consumuri, stoc final
 * - Analiza diferențelor (variance)
 * - Grafic compoziție stocuri
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
exports.StockBalanceReportPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var recharts_1 = require("recharts");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./StockBalanceReportPage.css");
var StockBalanceReportPage = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    //   const { t } = useTranslation();
    var _l = (0, react_1.useState)(false), loading = _l[0], setLoading = _l[1];
    var _m = (0, react_1.useState)(null), error = _m[0], setError = _m[1];
    var _o = (0, react_1.useState)(null), data = _o[0], setData = _o[1];
    var _p = (0, react_1.useState)([]), varianceData = _p[0], setVarianceData = _p[1];
    var _q = (0, react_1.useState)(false), showVariance = _q[0], setShowVariance = _q[1];
    var _r = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), reportDate = _r[0], setReportDate = _r[1];
    var _s = (0, react_1.useState)(1), locationId = _s[0], setLocationId = _s[1];
    var _t = (0, react_1.useState)(''), subcategory = _t[0], setSubcategory = _t[1];
    var loadReport = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, varianceResponse, varianceErr_1, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 9, 10, 11]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/accounting/stock-balance', {
                            locationId: locationId,
                            reportDate: reportDate,
                            subcategory: subcategory || undefined
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.data.success) return [3 /*break*/, 7];
                    setData(response.data.data);
                    if (!response.data.data.snapshot_id) return [3 /*break*/, 6];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/accounting/stock-variance/".concat(response.data.data.snapshot_id))];
                case 4:
                    varianceResponse = _c.sent();
                    if (varianceResponse.data.success) {
                        setVarianceData(varianceResponse.data.data || []);
                    }
                    return [3 /*break*/, 6];
                case 5:
                    varianceErr_1 = _c.sent();
                    console.warn('Variance data not available:', varianceErr_1);
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 8];
                case 7:
                    setError(response.data.error || 'Eroare la încărcarea raportului');
                    _c.label = 8;
                case 8: return [3 /*break*/, 11];
                case 9:
                    err_1 = _c.sent();
                    console.error('StockBalanceReportPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea raportului');
                    return [3 /*break*/, 11];
                case 10:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    }); }, [reportDate, locationId, subcategory]);
    react_1.default.useEffect(function () {
        if (locationId && reportDate) {
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
    return (<div className="stock-balance-report-page">
      <div className="page-header">
        <h1>📊 Balanța Stocurilor</h1>
        <p>"raport detaliat al stocurilor stoc initial intrari"</p>
      </div>

      {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row className="align-items-end">
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Data Raport</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="date" value={reportDate} onChange={function (e) { return setReportDate(e.target.value); }}/>
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
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Categorie (opțional)</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={subcategory} onChange={function (e) { return setSubcategory(e.target.value); }} placeholder="filtreaza dupa categorie"/>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Button onClick={loadReport} disabled={loading} className="w-100">
                {loading ? (<><i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...</>) : (<><i className="fas fa-sync-alt me-2"></i>"actualizeaza raport"</>)}
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {data && (<>
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header>
              <h5>"detalii balanta stocuri"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped bordered hover responsive className="stock-balance-table">
                <thead>
                  <tr>
                    <th>"Nomenclator"</th>
                    <th className="text-center">UM</th>
                    <th className="text-end">"stoc initial"</th>
                    <th className="text-end">Valoare Inițială</th>
                    <th className="text-end">"intrari cant"</th>
                    <th className="text-end">"intrari val"</th>
                    <th className="text-end">Consum Cant.</th>
                    <th className="text-end">Consum Val.</th>
                    <th className="text-end">Waste Cant.</th>
                    <th className="text-end">Waste Val.</th>
                    <th className="text-end">Stoc Final</th>
                    <th className="text-end">"valoare finala"</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items && Array.isArray(data.items) && data.items.length > 0) ? (data.items.map(function (item) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                return (<tr key={item.id}>
                        <td>{(_a = item.nomenclature) !== null && _a !== void 0 ? _a : '-'}</td>
                        <td className="text-center">{(_b = item.unit) !== null && _b !== void 0 ? _b : '-'}</td>
                        <td className="text-end">{formatNumber((_c = item.opening_stock) !== null && _c !== void 0 ? _c : 0, 3)}</td>
                        <td className="text-end">{formatCurrency((_d = item.opening_value) !== null && _d !== void 0 ? _d : 0)}</td>
                        <td className="text-end">{formatNumber((_e = item.entries_qty) !== null && _e !== void 0 ? _e : 0, 3)}</td>
                        <td className="text-end">{formatCurrency((_f = item.entries_value) !== null && _f !== void 0 ? _f : 0)}</td>
                        <td className="text-end" style={{ color: '#d32f2f' }}>
                          {formatNumber((_g = item.consumption_qty) !== null && _g !== void 0 ? _g : 0, 3)}
                        </td>
                        <td className="text-end" style={{ color: '#d32f2f' }}>
                          {formatCurrency((_h = item.consumption_value) !== null && _h !== void 0 ? _h : 0)}
                        </td>
                        <td className="text-end" style={{ color: '#ff9800' }}>
                          {formatNumber((_j = item.waste_qty) !== null && _j !== void 0 ? _j : 0, 3)}
                        </td>
                        <td className="text-end" style={{ color: '#ff9800' }}>
                          {formatCurrency((_k = item.waste_value) !== null && _k !== void 0 ? _k : 0)}
                        </td>
                        <td className="text-end"><strong>{formatNumber((_l = item.closing_stock) !== null && _l !== void 0 ? _l : 0, 3)}</strong></td>
                        <td className="text-end"><strong>{formatCurrency((_m = item.closing_value) !== null && _m !== void 0 ? _m : 0)}</strong></td>
                      </tr>);
            })) : (<tr>
                      <td colSpan={12} className="text-center text-muted">"nu exista date de stoc pentru perioada selectata"</td>
                    </tr>)}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <th colSpan={3} className="text-end"><strong>TOTAL:</strong></th>
                    <th className="text-end">{formatCurrency((_b = (_a = data.totals) === null || _a === void 0 ? void 0 : _a.opening_value) !== null && _b !== void 0 ? _b : 0)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency((_d = (_c = data.totals) === null || _c === void 0 ? void 0 : _c.entries_value) !== null && _d !== void 0 ? _d : 0)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency((_f = (_e = data.totals) === null || _e === void 0 ? void 0 : _e.consumption_value) !== null && _f !== void 0 ? _f : 0)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency((_h = (_g = data.totals) === null || _g === void 0 ? void 0 : _g.waste_value) !== null && _h !== void 0 ? _h : 0)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency((_k = (_j = data.totals) === null || _j === void 0 ? void 0 : _j.closing_value) !== null && _k !== void 0 ? _k : 0)}</th>
                  </tr>
                </tfoot>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {varianceData.length > 0 && (<react_bootstrap_1.Card className="mb-4">
              <react_bootstrap_1.Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5>Analiza Diferențelor (Variance)</h5>
                  <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return setShowVariance(!showVariance); }}>
                    {showVariance ? (<><i className="fas fa-eye-slash me-2"></i>"Ascunde"</>) : (<><i className="fas fa-eye me-2"></i>"Arată"</>)}
                  </react_bootstrap_1.Button>
                </div>
              </react_bootstrap_1.Card.Header>
              {showVariance && (<react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Table striped bordered hover responsive className="variance-table">
                    <thead>
                      <tr>
                        <th>"Nomenclator"</th>
                        <th className="text-end">Stoc Teoretic</th>
                        <th className="text-end">Stoc Fizic</th>
                        <th className="text-end">Diferență</th>
                        <th className="text-end">% Diferență</th>
                        <th className="text-center">Tip</th>
                        <th>Motiv</th>
                      </tr>
                    </thead>
                    <tbody>
                      {varianceData.map(function (item) { return (<tr key={item.id} style={{
                            backgroundColor: item.variance_type === 'shortage' ? '#ffebee' : '#e8f5e9'
                        }}>
                          <td>{item.nomenclature}</td>
                          <td className="text-end">{formatNumber(item.theoretical_stock, 3)}</td>
                          <td className="text-end">{formatNumber(item.physical_stock, 3)}</td>
                          <td className="text-end">
                            <strong style={{
                            color: item.variance_type === 'shortage' ? '#d32f2f' : '#2e7d32'
                        }}>
                              {item.variance_qty > 0 ? '+' : ''}{formatNumber(item.variance_qty, 3)}
                            </strong>
                          </td>
                          <td className="text-end">{formatNumber(item.variance_percentage, 2)}%</td>
                          <td className="text-center">
                            <react_bootstrap_1.Badge bg={item.variance_type === 'shortage' ? 'danger' : 'success'}>
                              {item.variance_type === 'shortage' ? 'Lipsă' : 'Surplus'}
                            </react_bootstrap_1.Badge>
                          </td>
                          <td>{item.variance_reason || '-'}</td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </react_bootstrap_1.Card.Body>)}
            </react_bootstrap_1.Card>)}

          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5>Grafic Compoziție Stocuri (Valoare)</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {(data.items && data.items.length > 0) ? (<recharts_1.ResponsiveContainer width="100%" height={400}>
                  <recharts_1.BarChart data={data.items.slice(0, 20)}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="nomenclature" angle={-45} textAnchor="end" height={100}/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip formatter={function (value) { return formatCurrency(value); }}/>
                    <recharts_1.Legend />
                    <recharts_1.Bar dataKey="opening_value" stackId="a" fill="#2196f3" name="stoc initial"/>
                    <recharts_1.Bar dataKey="entries_value" stackId="a" fill="#4caf50" name="Intrări"/>
                    <recharts_1.Bar dataKey="consumption_value" stackId="b" fill="#f44336" name="Consum"/>
                    <recharts_1.Bar dataKey="waste_value" stackId="b" fill="#ff9800" name="Waste"/>
                    <recharts_1.Bar dataKey="closing_value" fill="#9c27b0" name="Stoc Final"/>
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>) : (<div className="text-center text-muted py-5">
                  <i className="fas fa-chart-bar fa-3x mb-3"></i>
                  <p>"nu exista date pentru a genera graficul"</p>
                </div>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </>)}
    </div>);
};
exports.StockBalanceReportPage = StockBalanceReportPage;
