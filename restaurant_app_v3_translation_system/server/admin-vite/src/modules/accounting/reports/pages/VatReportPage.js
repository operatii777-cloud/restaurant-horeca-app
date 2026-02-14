"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - VAT Report Page
 *
 * Raport TVA complet:
 * - TVA de Plată
 * - TVA Deductibil
 * - Reconciliare
 * - Declarație TVA
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
exports.VatReportPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var accountingReportsApi_1 = require("../api/accountingReportsApi");
var HelpButton_1 = require("@/shared/components/HelpButton");
// Removed: Bootstrap and FontAwesome CSS imports - already loaded globally
// // Removed: Bootstrap CSS import - already loaded globally
// // Removed: FontAwesome CSS import - already loaded globally
require("./VatReportPage.css");
var VatReportPage = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103, _104, _105, _106, _107, _108, _109, _110, _111;
    //   const { t } = useTranslation();
    var _112 = (0, react_1.useState)(false), loading = _112[0], setLoading = _112[1];
    var _113 = (0, react_1.useState)(null), error = _113[0], setError = _113[1];
    var _114 = (0, react_1.useState)(null), data = _114[0], setData = _114[1];
    var _115 = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    }), startDate = _115[0], setStartDate = _115[1];
    var _116 = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _116[0], setEndDate = _116[1];
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
                        dateFrom: startDate,
                        dateTo: endDate,
                    };
                    return [4 /*yield*/, (0, accountingReportsApi_1.fetchVatReport)(filters)];
                case 2:
                    result = _c.sent();
                    setData(result);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('VatReportPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea raportului TVA');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [startDate, endDate]);
    var handleExport = function (format) { return __awaiter(void 0, void 0, void 0, function () {
        var filters, blob, url, a, err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    filters = {
                        dateFrom: startDate,
                        dateTo: endDate,
                    };
                    return [4 /*yield*/, (0, accountingReportsApi_1.exportVatReport)(filters, format)];
                case 1:
                    blob = _c.sent();
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = "raport-tva-".concat(startDate, "-").concat(endDate, ".").concat(format === 'excel' ? 'xlsx' : 'pdf');
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _c.sent();
                    setError(((_b = (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_2.message || 'Eroare la export');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    react_1.default.useEffect(function () {
        loadReport();
    }, [loadReport]);
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
        }).format(value);
    };
    return (<div className="vat-report-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>🧾 Raport TVA</h1>
          <p>"raport tva complet tva de plata tva deductibil rec"</p>
        </div>
        <HelpButton_1.HelpButton title="Ajutor - Raport TVA" content={<div>
              <h5>📊 Ce este Raportul TVA?</h5>
              <p>
                Raportul TVA oferă o vedere completă asupra TVA-ului colectat și deductibil pentru 
                o perioadă selectată, necesar pentru declarația TVA lunară.
              </p>
              <h5 className="mt-4">🔍 Secțiuni raport</h5>
              <ul>
                <li><strong>"tva de plata"</strong> - TVA colectat din vânzări (TVA de încasat de la ANAF)</li>
                <li><strong>"tva deductibil"</strong> - TVA plătit la achiziții (TVA de dedus)</li>
                <li><strong>Reconciliare</strong> - Diferența între TVA colectat și deductibil</li>
                <li><strong>"declaratie tva"</strong> - Export pentru declarația ANAF</li>
              </ul>
              <h5 className="mt-4">📅 Filtre disponibile</h5>
              <ul>
                <li><strong>"data de la"</strong> - Data de început a perioadei</li>
                <li><strong>"data pana la"</strong> - Data de sfârșit a perioadei</li>
              </ul>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> Raportul poate fi exportat în Excel sau PDF pentru 
                trimitere către contabil sau ANAF.
              </div>
            </div>}/>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      {/* Filters */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Data Start</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Data End</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>&nbsp;</react_bootstrap_1.Form.Label>
              <div>
                <react_bootstrap_1.Button variant="primary" onClick={loadReport} disabled={loading} className="me-2">
                  <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync', " me-2")}></i>
                  {loading ? 'Se încarcă...' : 'Actualizează'}
                </react_bootstrap_1.Button>
                {data && (<>
                    <react_bootstrap_1.Button variant="success" onClick={function () { return handleExpor[excel]; }} className="me-2">
                      <i className="fas fa-file-excel me-2"></i>
                      Export Excel
                    </react_bootstrap_1.Button>
                    <react_bootstrap_1.Button variant="danger" onClick={function () { return handleExpor[pdf]; }}>
                      <i className="fas fa-file-pdf me-2"></i>
                      Export PDF
                    </react_bootstrap_1.Button>
                  </>)}
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {data && (<>
          {/* Summary Cards */}
          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">"tva de plata"</h5>
                  <h3 className="text-danger">{formatCurrency((_b = (_a = data.vatToPay) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">"tva deductibil"</h5>
                  <h3 className="text-success">{formatCurrency((_d = (_c = data.vatDeductible) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">"tva net de plata"</h5>
                  <h3 className={((_f = (_e = data.reconciliation) === null || _e === void 0 ? void 0 : _e.netVatToPay) !== null && _f !== void 0 ? _f : 0) >= 0 ? 'text-danger' : 'text-success'}>
                    {formatCurrency((_h = (_g = data.reconciliation) === null || _g === void 0 ? void 0 : _g.netVatToPay) !== null && _h !== void 0 ? _h : 0)}
                  </h3>
                  <react_bootstrap_1.Badge bg={((_j = data.reconciliation) === null || _j === void 0 ? void 0 : _j.status) === 'ok' ? 'success' : ((_k = data.reconciliation) === null || _k === void 0 ? void 0 : _k.status) === 'warning' ? 'warning' : 'danger'}>
                    {((_l = data.reconciliation) === null || _l === void 0 ? void 0 : _l.status) === 'ok' ? 'OK' : ((_m = data.reconciliation) === null || _m === void 0 ? void 0 : _m.status) === 'warning' ? 'Atenție' : 'N/A'}
                  </react_bootstrap_1.Badge>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Tabs */}
          <react_bootstrap_1.Tabs defaultActiveKey="vat-to-pay" className="mb-4">
            <react_bootstrap_1.Tab eventKey="vat-to-pay" title="tva de plata">
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h5 className="mb-0">TVA de Plată (Vânzări)</h5>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Cota TVA</th>
                        <th className="text-end">"baza impozabila"</th>
                        <th className="text-end">TVA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>11%</td>
                        <td className="text-end">{formatCurrency((_t = (_q = (_p = (_o = data.vatToPay) === null || _o === void 0 ? void 0 : _o.vat9) === null || _p === void 0 ? void 0 : _p.base) !== null && _q !== void 0 ? _q : (_s = (_r = data.vatToPay) === null || _r === void 0 ? void 0 : _r.vat11) === null || _s === void 0 ? void 0 : _s.base) !== null && _t !== void 0 ? _t : 0)}</td>
                        <td className="text-end">{formatCurrency((_z = (_w = (_v = (_u = data.vatToPay) === null || _u === void 0 ? void 0 : _u.vat9) === null || _v === void 0 ? void 0 : _v.amount) !== null && _w !== void 0 ? _w : (_y = (_x = data.vatToPay) === null || _x === void 0 ? void 0 : _x.vat11) === null || _y === void 0 ? void 0 : _y.amount) !== null && _z !== void 0 ? _z : 0)}</td>
                      </tr>
                      <tr>
                        <td>21%</td>
                        <td className="text-end">{formatCurrency((_5 = (_2 = (_1 = (_0 = data.vatToPay) === null || _0 === void 0 ? void 0 : _0.vat19) === null || _1 === void 0 ? void 0 : _1.base) !== null && _2 !== void 0 ? _2 : (_4 = (_3 = data.vatToPay) === null || _3 === void 0 ? void 0 : _3.vat21) === null || _4 === void 0 ? void 0 : _4.base) !== null && _5 !== void 0 ? _5 : 0)}</td>
                        <td className="text-end">{formatCurrency((_11 = (_8 = (_7 = (_6 = data.vatToPay) === null || _6 === void 0 ? void 0 : _6.vat19) === null || _7 === void 0 ? void 0 : _7.amount) !== null && _8 !== void 0 ? _8 : (_10 = (_9 = data.vatToPay) === null || _9 === void 0 ? void 0 : _9.vat21) === null || _10 === void 0 ? void 0 : _10.amount) !== null && _11 !== void 0 ? _11 : 0)}</td>
                      </tr>
                      <tr>
                        <td>5%</td>
                        <td className="text-end">{formatCurrency((_17 = (_14 = (_13 = (_12 = data.vatToPay) === null || _12 === void 0 ? void 0 : _12.vat24) === null || _13 === void 0 ? void 0 : _13.base) !== null && _14 !== void 0 ? _14 : (_16 = (_15 = data.vatToPay) === null || _15 === void 0 ? void 0 : _15.vat5) === null || _16 === void 0 ? void 0 : _16.base) !== null && _17 !== void 0 ? _17 : 0)}</td>
                        <td className="text-end">{formatCurrency((_23 = (_20 = (_19 = (_18 = data.vatToPay) === null || _18 === void 0 ? void 0 : _18.vat24) === null || _19 === void 0 ? void 0 : _19.amount) !== null && _20 !== void 0 ? _20 : (_22 = (_21 = data.vatToPay) === null || _21 === void 0 ? void 0 : _21.vat5) === null || _22 === void 0 ? void 0 : _22.amount) !== null && _23 !== void 0 ? _23 : 0)}</td>
                      </tr>
                      <tr className="table-primary">
                        <td><strong>TOTAL</strong></td>
                        <td className="text-end">
                          <strong>
                            {formatCurrency(((_29 = (_26 = (_25 = (_24 = data.vatToPay) === null || _24 === void 0 ? void 0 : _24.vat9) === null || _25 === void 0 ? void 0 : _25.base) !== null && _26 !== void 0 ? _26 : (_28 = (_27 = data.vatToPay) === null || _27 === void 0 ? void 0 : _27.vat11) === null || _28 === void 0 ? void 0 : _28.base) !== null && _29 !== void 0 ? _29 : 0) +
                ((_35 = (_32 = (_31 = (_30 = data.vatToPay) === null || _30 === void 0 ? void 0 : _30.vat19) === null || _31 === void 0 ? void 0 : _31.base) !== null && _32 !== void 0 ? _32 : (_34 = (_33 = data.vatToPay) === null || _33 === void 0 ? void 0 : _33.vat21) === null || _34 === void 0 ? void 0 : _34.base) !== null && _35 !== void 0 ? _35 : 0) +
                ((_41 = (_38 = (_37 = (_36 = data.vatToPay) === null || _36 === void 0 ? void 0 : _36.vat24) === null || _37 === void 0 ? void 0 : _37.base) !== null && _38 !== void 0 ? _38 : (_40 = (_39 = data.vatToPay) === null || _39 === void 0 ? void 0 : _39.vat5) === null || _40 === void 0 ? void 0 : _40.base) !== null && _41 !== void 0 ? _41 : 0))}
                          </strong>
                        </td>
                        <td className="text-end">
                          <strong>{formatCurrency((_43 = (_42 = data.vatToPay) === null || _42 === void 0 ? void 0 : _42.total) !== null && _43 !== void 0 ? _43 : 0)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </react_bootstrap_1.Table>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab>

            <react_bootstrap_1.Tab eventKey="vat-deductible" title="tva deductibil">
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h5 className="mb-0">TVA Deductibil (Achiziții)</h5>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Cota TVA</th>
                        <th className="text-end">"baza impozabila"</th>
                        <th className="text-end">TVA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>11%</td>
                        <td className="text-end">{formatCurrency((_49 = (_46 = (_45 = (_44 = data.vatDeductible) === null || _44 === void 0 ? void 0 : _44.vat9) === null || _45 === void 0 ? void 0 : _45.base) !== null && _46 !== void 0 ? _46 : (_48 = (_47 = data.vatDeductible) === null || _47 === void 0 ? void 0 : _47.vat11) === null || _48 === void 0 ? void 0 : _48.base) !== null && _49 !== void 0 ? _49 : 0)}</td>
                        <td className="text-end">{formatCurrency((_55 = (_52 = (_51 = (_50 = data.vatDeductible) === null || _50 === void 0 ? void 0 : _50.vat9) === null || _51 === void 0 ? void 0 : _51.amount) !== null && _52 !== void 0 ? _52 : (_54 = (_53 = data.vatDeductible) === null || _53 === void 0 ? void 0 : _53.vat11) === null || _54 === void 0 ? void 0 : _54.amount) !== null && _55 !== void 0 ? _55 : 0)}</td>
                      </tr>
                      <tr>
                        <td>21%</td>
                        <td className="text-end">{formatCurrency((_61 = (_58 = (_57 = (_56 = data.vatDeductible) === null || _56 === void 0 ? void 0 : _56.vat19) === null || _57 === void 0 ? void 0 : _57.base) !== null && _58 !== void 0 ? _58 : (_60 = (_59 = data.vatDeductible) === null || _59 === void 0 ? void 0 : _59.vat21) === null || _60 === void 0 ? void 0 : _60.base) !== null && _61 !== void 0 ? _61 : 0)}</td>
                        <td className="text-end">{formatCurrency((_67 = (_64 = (_63 = (_62 = data.vatDeductible) === null || _62 === void 0 ? void 0 : _62.vat19) === null || _63 === void 0 ? void 0 : _63.amount) !== null && _64 !== void 0 ? _64 : (_66 = (_65 = data.vatDeductible) === null || _65 === void 0 ? void 0 : _65.vat21) === null || _66 === void 0 ? void 0 : _66.amount) !== null && _67 !== void 0 ? _67 : 0)}</td>
                      </tr>
                      <tr>
                        <td>5%</td>
                        <td className="text-end">{formatCurrency((_73 = (_70 = (_69 = (_68 = data.vatDeductible) === null || _68 === void 0 ? void 0 : _68.vat24) === null || _69 === void 0 ? void 0 : _69.base) !== null && _70 !== void 0 ? _70 : (_72 = (_71 = data.vatDeductible) === null || _71 === void 0 ? void 0 : _71.vat5) === null || _72 === void 0 ? void 0 : _72.base) !== null && _73 !== void 0 ? _73 : 0)}</td>
                        <td className="text-end">{formatCurrency((_79 = (_76 = (_75 = (_74 = data.vatDeductible) === null || _74 === void 0 ? void 0 : _74.vat24) === null || _75 === void 0 ? void 0 : _75.amount) !== null && _76 !== void 0 ? _76 : (_78 = (_77 = data.vatDeductible) === null || _77 === void 0 ? void 0 : _77.vat5) === null || _78 === void 0 ? void 0 : _78.amount) !== null && _79 !== void 0 ? _79 : 0)}</td>
                      </tr>
                      <tr className="table-success">
                        <td><strong>TOTAL</strong></td>
                        <td className="text-end">
                          <strong>
                            {formatCurrency(((_85 = (_82 = (_81 = (_80 = data.vatDeductible) === null || _80 === void 0 ? void 0 : _80.vat9) === null || _81 === void 0 ? void 0 : _81.base) !== null && _82 !== void 0 ? _82 : (_84 = (_83 = data.vatDeductible) === null || _83 === void 0 ? void 0 : _83.vat11) === null || _84 === void 0 ? void 0 : _84.base) !== null && _85 !== void 0 ? _85 : 0) +
                ((_91 = (_88 = (_87 = (_86 = data.vatDeductible) === null || _86 === void 0 ? void 0 : _86.vat19) === null || _87 === void 0 ? void 0 : _87.base) !== null && _88 !== void 0 ? _88 : (_90 = (_89 = data.vatDeductible) === null || _89 === void 0 ? void 0 : _89.vat21) === null || _90 === void 0 ? void 0 : _90.base) !== null && _91 !== void 0 ? _91 : 0) +
                ((_97 = (_94 = (_93 = (_92 = data.vatDeductible) === null || _92 === void 0 ? void 0 : _92.vat24) === null || _93 === void 0 ? void 0 : _93.base) !== null && _94 !== void 0 ? _94 : (_96 = (_95 = data.vatDeductible) === null || _95 === void 0 ? void 0 : _95.vat5) === null || _96 === void 0 ? void 0 : _96.base) !== null && _97 !== void 0 ? _97 : 0))}
                          </strong>
                        </td>
                        <td className="text-end">
                          <strong>{formatCurrency((_99 = (_98 = data.vatDeductible) === null || _98 === void 0 ? void 0 : _98.total) !== null && _99 !== void 0 ? _99 : 0)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </react_bootstrap_1.Table>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab>

            <react_bootstrap_1.Tab eventKey="reconciliation" title="Reconciliare">
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h5 className="mb-0">Reconciliare TVA</h5>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Row>
                    <react_bootstrap_1.Col md={6}>
                      <react_bootstrap_1.Card className="mb-3">
                        <react_bootstrap_1.Card.Body>
                          <h6>TVA de Plată (Vânzări)</h6>
                          <h4 className="text-danger">{formatCurrency((_101 = (_100 = data.vatToPay) === null || _100 === void 0 ? void 0 : _100.total) !== null && _101 !== void 0 ? _101 : 0)}</h4>
                        </react_bootstrap_1.Card.Body>
                      </react_bootstrap_1.Card>
                    </react_bootstrap_1.Col>
                    <react_bootstrap_1.Col md={6}>
                      <react_bootstrap_1.Card className="mb-3">
                        <react_bootstrap_1.Card.Body>
                          <h6>TVA Deductibil (Achiziții)</h6>
                          <h4 className="text-success">{formatCurrency((_103 = (_102 = data.vatDeductible) === null || _102 === void 0 ? void 0 : _102.total) !== null && _103 !== void 0 ? _103 : 0)}</h4>
                        </react_bootstrap_1.Card.Body>
                      </react_bootstrap_1.Card>
                    </react_bootstrap_1.Col>
                  </react_bootstrap_1.Row>
                  <react_bootstrap_1.Card className={((_105 = (_104 = data.reconciliation) === null || _104 === void 0 ? void 0 : _104.netVatToPay) !== null && _105 !== void 0 ? _105 : 0) >= 0 ? 'border-danger' : 'border-success'}>
                    <react_bootstrap_1.Card.Body className="text-center">
                      <h5>"tva net de plata"</h5>
                      <h2 className={((_107 = (_106 = data.reconciliation) === null || _106 === void 0 ? void 0 : _106.netVatToPay) !== null && _107 !== void 0 ? _107 : 0) >= 0 ? 'text-danger' : 'text-success'}>
                        {formatCurrency((_109 = (_108 = data.reconciliation) === null || _108 === void 0 ? void 0 : _108.netVatToPay) !== null && _109 !== void 0 ? _109 : 0)}
                      </h2>
                      <p className="text-muted">
                        {((_111 = (_110 = data.reconciliation) === null || _110 === void 0 ? void 0 : _110.netVatToPay) !== null && _111 !== void 0 ? _111 : 0) >= 0
                ? 'Sumă de plată către ANAF'
                : 'Sumă de recuperat de la ANAF'}
                      </p>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab>

            <react_bootstrap_1.Tab eventKey="breakdown" title="Detalii">
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <h5 className="mb-0">"detalii documente"</h5>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tip Document</th>
                        <th>"numar document"</th>
                        <th>Cota TVA</th>
                        <th className="text-end">Baza</th>
                        <th className="text-end">TVA</th>
                        <th>Tip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.breakdown && Array.isArray(data.breakdown) && data.breakdown.length > 0) ? (data.breakdown.map(function (item, index) {
                var _a, _b, _c, _d, _e;
                return (<tr key={index}>
                            <td>{item.date ? new Date(item.date).toLocaleDateString('ro-RO') : '-'}</td>
                            <td>{(_a = item.documentType) !== null && _a !== void 0 ? _a : '-'}</td>
                            <td>{(_b = item.documentNumber) !== null && _b !== void 0 ? _b : '-'}</td>
                            <td>{(_c = item.vatRate) !== null && _c !== void 0 ? _c : 0}%</td>
                            <td className="text-end">{formatCurrency((_d = item.baseAmount) !== null && _d !== void 0 ? _d : 0)}</td>
                            <td className="text-end">{formatCurrency((_e = item.vatAmount) !== null && _e !== void 0 ? _e : 0)}</td>
                            <td>
                              <react_bootstrap_1.Badge bg={item.type === 'sale' ? 'danger' : 'success'}>
                                {item.type === 'sale' ? 'Vânzare' : 'Achiziție'}
                              </react_bootstrap_1.Badge>
                            </td>
                          </tr>);
            })) : (<tr>
                          <td colSpan={7} className="text-center text-muted">"nu exista documente in perioada selectata"</td>
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
exports.VatReportPage = VatReportPage;
