"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Entries by VAT and Accounting Account Report Page
 *
 * Raport Intrări după TVA și Cont Contabil:
 * - Rezumat per Cota TVA
 * - Detalii Intrări per Cont Contabil
 * - Grafice distribuție TVA
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
exports.EntriesByVatReportPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var accountingReportsApi_1 = require("../api/accountingReportsApi");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./EntriesByVatReportPage.css");
var EntriesByVatReportPage = function () {
    var _a, _b, _c, _d, _e, _f;
    //   const { t } = useTranslation();
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)(null), data = _j[0], setData = _j[1];
    var _k = (0, react_1.useState)(new Set()), expandedRows = _k[0], setExpandedRows = _k[1];
    var _l = (0, react_1.useState)('by-account'), activeTab = _l[0], setActiveTab = _l[1];
    var _m = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    }), startDate = _m[0], setStartDate = _m[1];
    var _o = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _o[0], setEndDate = _o[1];
    var _p = (0, react_1.useState)(null), locationId = _p[0], setLocationId = _p[1];
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
                    return [4 /*yield*/, (0, accountingReportsApi_1.fetchEntriesByVatReport)(filters)];
                case 2:
                    result = _c.sent();
                    setData(result);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('EntriesByVatReportPage Error:', err_1);
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
    return (<div className="entries-by-vat-report-page">
      <div className="page-header">
        <h1>📊 Situația Intrărilor după TVA și Cont Contabil</h1>
        <p>"raport intrari rezumat per cota tva si detalii per"</p>
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
          {/* VAT Summary Cards */}
          {data.vat_summary && Array.isArray(data.vat_summary) && data.vat_summary.length > 0 && (<react_bootstrap_1.Row className="mb-4">
              {data.vat_summary.map(function (vat) {
                    var _a, _b, _c, _d;
                    return (<react_bootstrap_1.Col md={3} key={vat.id}>
                  <react_bootstrap_1.Card className="text-center">
                    <react_bootstrap_1.Card.Body>
                      <h5 className="text-muted">TVA {((_a = vat.vat_percentage) !== null && _a !== void 0 ? _a : 0).toFixed(2)}%</h5>
                      <p className="mb-1">
                        <small>Bază: {formatCurrency((_b = vat.total_base_value) !== null && _b !== void 0 ? _b : 0)}</small>
                      </p>
                      <p className="mb-1">
                        <small style={{ color: '#d32f2f' }}>TVA: {formatCurrency((_c = vat.total_vat_value) !== null && _c !== void 0 ? _c : 0)}</small>
                      </p>
                      <h4>{formatCurrency((_d = vat.total_with_vat) !== null && _d !== void 0 ? _d : 0)}</h4>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>);
                })}
            </react_bootstrap_1.Row>)}

          {/* Grand Totals */}
          <react_bootstrap_1.Card className="mb-4 border-primary">
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={4}>
                  <div className="text-center">
                    <h6 className="text-muted">"total valoare baza"</h6>
                    <h3>{formatCurrency((_b = (_a = data.totals) === null || _a === void 0 ? void 0 : _a.total_base_value) !== null && _b !== void 0 ? _b : 0)}</h3>
                  </div>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={4}>
                  <div className="text-center">
                    <h6 className="text-muted">"total tva recuperabil"</h6>
                    <h3 style={{ color: '#d32f2f' }}>{formatCurrency((_d = (_c = data.totals) === null || _c === void 0 ? void 0 : _c.total_vat_value) !== null && _d !== void 0 ? _d : 0)}</h3>
                  </div>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={4}>
                  <div className="text-center">
                    <h6 className="text-muted">TOTAL CU TVA</h6>
                    <h3>{formatCurrency((_f = (_e = data.totals) === null || _e === void 0 ? void 0 : _e.total_with_vat) !== null && _f !== void 0 ? _f : 0)}</h3>
                  </div>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {/* Tabs */}
          <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return k && setActiveTab(k); }} className="mb-4">
            <react_bootstrap_1.Tab eventKey="by-account" title="dupa cont contabil">
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h5 className="mb-0">"detalii intrari per cont contabil"</h5>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Cont Contabil</th>
                        <th className="text-end">"valoare baza"</th>
                        <th className="text-end">TVA</th>
                        <th className="text-end">Total + TVA</th>
                        <th className="text-center">"nr documente"</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.entries_by_account && Array.isArray(data.entries_by_account) && data.entries_by_account.length > 0) ? (data.entries_by_account.map(function (account) {
                var _a, _b, _c, _d, _e, _f;
                return (<react_1.default.Fragment key={account.id}>
                            <tr>
                              <td>
                                <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return toggleRow(account.id); }} className="p-0">
                                  <i className={"fas ".concat(expandedRows.has(account.id) ? 'fa-chevron-up' : 'fa-chevron-down')}></i>
                                </react_bootstrap_1.Button>
                              </td>
                              <td>
                                <strong>{(_a = account.account_code) !== null && _a !== void 0 ? _a : '-'}</strong> - {(_b = account.account_name) !== null && _b !== void 0 ? _b : '-'}
                              </td>
                              <td className="text-end">{formatCurrency((_c = account.total_base_value) !== null && _c !== void 0 ? _c : 0)}</td>
                              <td className="text-end">{formatCurrency((_d = account.total_vat_value) !== null && _d !== void 0 ? _d : 0)}</td>
                              <td className="text-end">
                                <strong>{formatCurrency((_e = account.total_with_vat) !== null && _e !== void 0 ? _e : 0)}</strong>
                              </td>
                              <td className="text-center">{(_f = account.document_count) !== null && _f !== void 0 ? _f : 0}</td>
                            </tr>

                            {/* Expanded Details */}
                            {expandedRows.has(account.id) && account.entries && account.entries.length > 0 && (<tr style={{ backgroundColor: '#f5f5f5' }}>
                                <td colSpan={6}>
                                  <react_bootstrap_1.Collapse in={true}>
                                    <div className="p-3">
                                      <h6>"detalii intrari"</h6>
                                      <react_bootstrap_1.Table size="sm" striped>
                                        <thead>
                                          <tr>
                                            <th>"Nomenclator"</th>
                                            <th className="text-end">Cantitate</th>
                                            <th className="text-end">Cost/U</th>
                                            <th className="text-end">"valoare baza"</th>
                                            <th className="text-end">TVA %</th>
                                            <th className="text-end">Total</th>
                                            <th>"Document"</th>
                                            <th>Furnizor</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {account.entries.map(function (entry) {
                            var _a, _b, _c, _d, _e, _f, _g, _h;
                            return (<tr key={entry.id}>
                                              <td>{(_a = entry.nomenclature) !== null && _a !== void 0 ? _a : '-'}</td>
                                              <td className="text-end">{((_b = entry.quantity_entered) !== null && _b !== void 0 ? _b : 0).toFixed(3)}</td>
                                              <td className="text-end">{((_c = entry.average_cost_per_unit) !== null && _c !== void 0 ? _c : 0).toFixed(4)} RON</td>
                                              <td className="text-end">{formatCurrency((_d = entry.base_value) !== null && _d !== void 0 ? _d : 0)}</td>
                                              <td className="text-end">{((_e = entry.vat_percentage) !== null && _e !== void 0 ? _e : 0).toFixed(2)}%</td>
                                              <td className="text-end">{formatCurrency((_f = entry.total_value) !== null && _f !== void 0 ? _f : 0)}</td>
                                              <td>
                                                {(_g = entry.document_type) !== null && _g !== void 0 ? _g : '-'} {(_h = entry.document_number) !== null && _h !== void 0 ? _h : '-'}
                                                <br />
                                                <small className="text-muted">
                                                  {entry.document_date ? new Date(entry.document_date).toLocaleDateString('ro-RO') : '-'}
                                                </small>
                                              </td>
                                              <td>{entry.supplier_name || '-'}</td>
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
                          <td colSpan={6} className="text-center text-muted">"nu exista intrari in perioada selectata"</td>
                        </tr>)}
                    </tbody>
                  </react_bootstrap_1.Table>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab>

            <react_bootstrap_1.Tab eventKey="by-vat" title="dupa tva">
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h5 className="mb-0">"rezumat per cota tva"</h5>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Cota TVA</th>
                        <th className="text-end">"valoare baza"</th>
                        <th className="text-end">Valoare TVA</th>
                        <th className="text-end">"total cu tva"</th>
                        <th className="text-end">% din Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.vat_summary && Array.isArray(data.vat_summary) && data.vat_summary.length > 0) ? (data.vat_summary.map(function (vat) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                return (<tr key={vat.id}>
                            <td><strong>{((_a = vat.vat_percentage) !== null && _a !== void 0 ? _a : 0).toFixed(2)}%</strong></td>
                            <td className="text-end">{formatCurrency((_b = vat.total_base_value) !== null && _b !== void 0 ? _b : 0)}</td>
                            <td className="text-end" style={{ color: '#d32f2f' }}>
                              {formatCurrency((_c = vat.total_vat_value) !== null && _c !== void 0 ? _c : 0)}
                            </td>
                            <td className="text-end">{formatCurrency((_d = vat.total_with_vat) !== null && _d !== void 0 ? _d : 0)}</td>
                            <td className="text-end">
                              {((_f = (_e = data.totals) === null || _e === void 0 ? void 0 : _e.total_with_vat) !== null && _f !== void 0 ? _f : 0) > 0
                        ? ((((_g = vat.total_with_vat) !== null && _g !== void 0 ? _g : 0) / ((_j = (_h = data.totals) === null || _h === void 0 ? void 0 : _h.total_with_vat) !== null && _j !== void 0 ? _j : 1)) * 100).toFixed(2)
                        : '0.00'}%
                            </td>
                          </tr>);
            })) : (<tr>
                          <td colSpan={5} className="text-center text-muted">"nu exista date tva in perioada selectata"</td>
                        </tr>)}
                    </tbody>
                  </react_bootstrap_1.Table>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab>
          </react_bootstrap_1.Tabs>
        </>)}
    </div>);
};
exports.EntriesByVatReportPage = EntriesByVatReportPage;
