"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Consumption Situation Report Page
 *
 * Raport Consumuri:
 * - Consumuri Zilnic
 * - Consumuri per Angajat
 * - Raport Anomalii
 * - Consum Detaliat per Rețetă/Dieș
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
exports.ConsumptionReportPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var accountingReportsApi_1 = require("../api/accountingReportsApi");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./ConsumptionReportPage.css");
var ConsumptionReportPage = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    //   const { t } = useTranslation();
    var _u = (0, react_1.useState)(false), loading = _u[0], setLoading = _u[1];
    var _v = (0, react_1.useState)(null), error = _v[0], setError = _v[1];
    var _w = (0, react_1.useState)(null), data = _w[0], setData = _w[1];
    var _x = (0, react_1.useState)(new Set()), expandedRows = _x[0], setExpandedRows = _x[1];
    var _y = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    }), startDate = _y[0], setStartDate = _y[1];
    var _z = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _z[0], setEndDate = _z[1];
    var _0 = (0, react_1.useState)(null), locationId = _0[0], setLocationId = _0[1];
    var loadReport = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var filters, result, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    filters = {
                        locationId: locationId,
                        periodStart: startDate,
                        periodEnd: endDate,
                    };
                    return [4 /*yield*/, (0, accountingReportsApi_1.fetchConsumptionReport)(filters)];
                case 2:
                    result = _c.sent();
                    setData(result);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('ConsumptionReportPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea raportului');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [startDate, endDate, locationId]);
    react_1.default.useEffect(function () {
        loadReport();
    }, [loadReport]);
    var toggleRow = function (id) {
        var newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        }
        else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
        }).format(value);
    };
    return (<div className="consumption-report-page">
      <div className="page-header">
        <h1>📋 Raport Consumuri</h1>
        <p>"raport consumuri consumuri zilnic per angajat rapo"</p>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

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
              <react_bootstrap_1.Form.Select value={locationId || ''} onChange={function (e) { return setLocationId(e.target.value ? parseInt(e.target.value) : null); }}>
                <option value="">"toate locatiile"</option>
                <option value="1">Restaurant 1</option>
                <option value="2">Restaurant 2</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>&nbsp;</react_bootstrap_1.Form.Label>
              <div>
                <react_bootstrap_1.Button variant="primary" onClick={loadReport} disabled={loading}>
                  <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync', " me-2")}></i>
                  {loading ? 'Se încarcă...' : 'Actualizează'}
                </react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {data && (<>
          {/* Summary Cards */}
          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">"valoare disponibila"</h5>
                  <h3 className="text-primary">{formatCurrency((_b = (_a = data.totals) === null || _a === void 0 ? void 0 : _a.available_value) !== null && _b !== void 0 ? _b : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">Valoare Consum</h5>
                  <h3 className="text-danger">{formatCurrency((_d = (_c = data.totals) === null || _c === void 0 ? void 0 : _c.consumption_value) !== null && _d !== void 0 ? _d : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">% Consum Mediu</h5>
                  <h3 className={((_e = data.average_consumption_percentage) !== null && _e !== void 0 ? _e : 0) > 90 ? 'text-danger' : 'text-primary'}>
                    {((_f = data.average_consumption_percentage) !== null && _f !== void 0 ? _f : 0).toFixed(2)}%
                  </h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">"total bucati vandute"</h5>
                  <h3>{(_g = data.total_dishes_sold) !== null && _g !== void 0 ? _g : 0}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Consumption Table */}
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">"detalii consumuri"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped hover responsive>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>"Nomenclator"</th>
                    <th className="text-end">"stoc initial"</th>
                    <th className="text-end">"Intrări"</th>
                    <th className="text-end">Disponibil</th>
                    <th className="text-end">Consum</th>
                    <th className="text-end">% Consum</th>
                    <th className="text-end">Stoc Final</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items && Array.isArray(data.items) && data.items.length > 0) ? (data.items.map(function (item) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
                return (<react_1.default.Fragment key={item.id}>
                        <tr>
                          <td>
                            <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return toggleRow(item.id); }} className="p-0">
                              <i className={"fas ".concat(expandedRows.has(item.id) ? 'fa-chevron-up' : 'fa-chevron-down')}></i>
                            </react_bootstrap_1.Button>
                          </td>
                          <td><strong>{(_a = item.nomenclature) !== null && _a !== void 0 ? _a : '-'}</strong></td>
                          <td className="text-end">
                            {((_b = item.opening_stock) !== null && _b !== void 0 ? _b : 0).toFixed(3)} {(_c = item.unit) !== null && _c !== void 0 ? _c : ''}
                            <br />
                            <small className="text-muted">{formatCurrency((_d = item.opening_value) !== null && _d !== void 0 ? _d : 0)}</small>
                          </td>
                          <td className="text-end">
                            {((_e = item.purchases_qty) !== null && _e !== void 0 ? _e : 0).toFixed(3)} {(_f = item.unit) !== null && _f !== void 0 ? _f : ''}
                            <br />
                            <small className="text-muted">{formatCurrency((_g = item.purchases_value) !== null && _g !== void 0 ? _g : 0)}</small>
                          </td>
                          <td className="text-end">
                            {((_h = item.available_qty) !== null && _h !== void 0 ? _h : 0).toFixed(3)} {(_j = item.unit) !== null && _j !== void 0 ? _j : ''}
                            <br />
                            <small className="text-muted">{formatCurrency((_k = item.available_value) !== null && _k !== void 0 ? _k : 0)}</small>
                          </td>
                          <td className="text-end" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                            {((_l = item.consumption_qty) !== null && _l !== void 0 ? _l : 0).toFixed(3)} {(_m = item.unit) !== null && _m !== void 0 ? _m : ''}
                            <br />
                            <small>{formatCurrency((_o = item.consumption_value) !== null && _o !== void 0 ? _o : 0)}</small>
                          </td>
                          <td className="text-end" style={{
                        color: ((_p = item.consumption_percentage) !== null && _p !== void 0 ? _p : 0) > 90 ? '#d32f2f' : '#1976d2',
                        fontWeight: 'bold'
                    }}>
                            {((_q = item.consumption_percentage) !== null && _q !== void 0 ? _q : 0).toFixed(2)}%
                          </td>
                          <td className="text-end">
                            {((_r = item.closing_stock) !== null && _r !== void 0 ? _r : 0).toFixed(3)} {(_s = item.unit) !== null && _s !== void 0 ? _s : ''}
                            <br />
                            <small className="text-muted">{formatCurrency((_t = item.closing_value) !== null && _t !== void 0 ? _t : 0)}</small>
                          </td>
                        </tr>

                        {/* Expanded Row - Consumption by Dishes */}
                        {expandedRows.has(item.id) && item.consumption_by_dishes && item.consumption_by_dishes.length > 0 && (<tr style={{ backgroundColor: '#f5f5f5' }}>
                            <td colSpan={8}>
                              <react_bootstrap_1.Collapse in={true}>
                                <div className="p-3">
                                  <h6>"consum detaliat retete si diesuri"</h6>
                                  <react_bootstrap_1.Table size="sm" striped>
                                    <thead>
                                      <tr>
                                        <th>Rețetă/Dieș</th>
                                        <th className="text-end">Cantitate/Buc</th>
                                        <th className="text-end">Consum/Dieș</th>
                                        <th className="text-end">"nr bucati vandute"</th>
                                        <th className="text-end">Total Consum</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.consumption_by_dishes.map(function (dish) {
                            var _a, _b, _c, _d, _e, _f;
                            return (<tr key={dish.id}>
                                          <td>{(_a = dish.dish_name) !== null && _a !== void 0 ? _a : '-'}</td>
                                          <td className="text-end">{((_b = dish.consumption_qty) !== null && _b !== void 0 ? _b : 0).toFixed(3)} {(_c = item.unit) !== null && _c !== void 0 ? _c : ''}</td>
                                          <td className="text-end">
                                            {dish.consumption_per_dish ? "".concat(dish.consumption_per_dish.toFixed(3), " ").concat((_d = item.unit) !== null && _d !== void 0 ? _d : '') : '-'}
                                          </td>
                                          <td className="text-end">{(_e = dish.number_of_dishes_sold) !== null && _e !== void 0 ? _e : 0}</td>
                                          <td className="text-end">{formatCurrency((_f = dish.consumption_value) !== null && _f !== void 0 ? _f : 0)}</td>
                                        </tr>);
                        })}
                                    </tbody>
                                  </react_bootstrap_1.Table>
                                </div>
                              </react_bootstrap_1.Collapse>
                            </td>
                          </tr>)}
                      </react_1.default.Fragment>);
            })) : (<tr>
                      <td colSpan={8} className="text-center text-muted">"nu exista date de consum in perioada selectata"</td>
                    </tr>)}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <td colSpan={2}><strong>TOTAL</strong></td>
                    <td className="text-end">
                      <strong>{formatCurrency((_j = (_h = data.totals) === null || _h === void 0 ? void 0 : _h.opening_value) !== null && _j !== void 0 ? _j : 0)}</strong>
                    </td>
                    <td className="text-end">
                      <strong>{formatCurrency((_l = (_k = data.totals) === null || _k === void 0 ? void 0 : _k.purchases_value) !== null && _l !== void 0 ? _l : 0)}</strong>
                    </td>
                    <td className="text-end">
                      <strong>{formatCurrency((_o = (_m = data.totals) === null || _m === void 0 ? void 0 : _m.available_value) !== null && _o !== void 0 ? _o : 0)}</strong>
                    </td>
                    <td className="text-end">
                      <strong style={{ color: '#d32f2f' }}>{formatCurrency((_q = (_p = data.totals) === null || _p === void 0 ? void 0 : _p.consumption_value) !== null && _q !== void 0 ? _q : 0)}</strong>
                    </td>
                    <td className="text-end">
                      <strong>{((_r = data.average_consumption_percentage) !== null && _r !== void 0 ? _r : 0).toFixed(2)}%</strong>
                    </td>
                    <td className="text-end">
                      <strong>{formatCurrency((_t = (_s = data.totals) === null || _s === void 0 ? void 0 : _s.closing_value) !== null && _t !== void 0 ? _t : 0)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </>)}
    </div>);
};
exports.ConsumptionReportPage = ConsumptionReportPage;
