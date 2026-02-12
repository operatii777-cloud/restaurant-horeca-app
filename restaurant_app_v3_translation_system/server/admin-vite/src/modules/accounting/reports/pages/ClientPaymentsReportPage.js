"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Client Payments Report Page
 *
 * Raport Plăți Client:
 * - Plații Efectuate
 * - Plații Pending
 * - Vârste Creanțe
 * - Clienți cu Întârzieri
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
exports.ClientPaymentsReportPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var accountingReportsApi_1 = require("../api/accountingReportsApi");
var HelpButton_1 = require("@/shared/components/HelpButton");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./ClientPaymentsReportPage.css");
var ClientPaymentsReportPage = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    //   const { t } = useTranslation();
    var _u = (0, react_1.useState)(false), loading = _u[0], setLoading = _u[1];
    var _v = (0, react_1.useState)(null), error = _v[0], setError = _v[1];
    var _w = (0, react_1.useState)(null), data = _w[0], setData = _w[1];
    var _x = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 3);
        return date.toISOString().split('T')[0];
    }), startDate = _x[0], setStartDate = _x[1];
    var _y = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _y[0], setEndDate = _y[1];
    var _z = (0, react_1.useState)('all'), statusFilter = _z[0], setStatusFilter = _z[1];
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
                        status: statusFilter !== 'all' ? statusFilter : undefined,
                    };
                    return [4 /*yield*/, (0, accountingReportsApi_1.fetchClientPaymentsReport)(filters)];
                case 2:
                    result = _c.sent();
                    setData(result);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('ClientPaymentsReportPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea raportului');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [startDate, endDate, statusFilter]);
    react_1.default.useEffect(function () {
        loadReport();
    }, [loadReport]);
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
        }).format(value);
    };
    var getStatusBadge = function (status) {
        switch (status) {
            case 'paid':
                return <react_bootstrap_1.Badge bg="success">Plătit</react_bootstrap_1.Badge>;
            case "Pending:":
                return <react_bootstrap_1.Badge bg="warning">Pending</react_bootstrap_1.Badge>;
            case 'overdue':
                return <react_bootstrap_1.Badge bg="danger">"Întârziat"</react_bootstrap_1.Badge>;
            default:
                return <react_bootstrap_1.Badge bg="secondary">{status}</react_bootstrap_1.Badge>;
        }
    };
    return (<div className="client-payments-report-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>💳 Raport Plăți Client</h1>
          <p>"raport plati client platii efectuate pending varst"</p>
        </div>
        <HelpButton_1.HelpButton title="ajutor raport plati clienti" content={<div>
              <h5>💳 Ce este Raportul Plăți Clienți?</h5>
              <p>
                Raportul oferă o vedere completă asupra plăților clienților, inclusiv plăți efectuate, 
                plăți în așteptare și vârste creanțe pentru gestionarea eficientă a creanțelor.
              </p>
              <h5 className="mt-4">📊 Secțiuni raport</h5>
              <ul>
                <li><strong>Plăți Efectuate</strong> - Plăți completate în perioada selectată</li>
                <li><strong>"plati pending"</strong> - Plăți în așteptare (neachitate)</li>
                <li><strong>"varste creante"</strong> - Clasificare creanțe pe intervale de timp (0-30, 31-60, 61-90, 90+ zile)</li>
                <li><strong>"clienti cu intarzieri"</strong> - Clienți cu plăți restante</li>
              </ul>
              <h5 className="mt-4">🔍 Filtre disponibile</h5>
              <ul>
                <li><strong>"data de la"</strong> - Data de început a perioadei</li>
                <li><strong>"data pana la"</strong> - Data de sfârșit a perioadei</li>
                <li><strong>Status</strong> - Filtrare după status (Toate, Plătite, Pending, Restante)</li>
              </ul>
              <div className="alert alert-warning mt-4">
                <strong>⚠️ Important:</strong> Monitorizează regulat creanțele restante pentru a evita 
                pierderi financiare.
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
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Data Start</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Data End</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }}>
                <option value="all">"Toate"</option>
                <option value="paid">"Plătite"</option>
                <option value="pending">Pending</option>
                <option value="overdue">"Întârziate"</option>
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
                  <h5 className="text-muted">"total platit"</h5>
                  <h3 className="text-success">{formatCurrency((_b = (_a = data.summary) === null || _a === void 0 ? void 0 : _a.totalPaid) !== null && _b !== void 0 ? _b : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">"total pending"</h5>
                  <h3 className="text-warning">{formatCurrency((_d = (_c = data.summary) === null || _c === void 0 ? void 0 : _c.totalPending) !== null && _d !== void 0 ? _d : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">"total intarziat"</h5>
                  <h3 className="text-danger">{formatCurrency((_f = (_e = data.summary) === null || _e === void 0 ? void 0 : _e.totalOverdue) !== null && _f !== void 0 ? _f : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">Total Facturi</h5>
                  <h3>{(_h = (_g = data.summary) === null || _g === void 0 ? void 0 : _g.totalInvoices) !== null && _h !== void 0 ? _h : 0}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Aging Analysis */}
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">"varste creante"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">"Curent"</h6>
                    <h4 className="text-success">{formatCurrency((_k = (_j = data.aging) === null || _j === void 0 ? void 0 : _j.current) !== null && _k !== void 0 ? _k : 0)}</h4>
                  </div>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">0-30 zile</h6>
                    <h4 className="text-warning">{formatCurrency((_m = (_l = data.aging) === null || _l === void 0 ? void 0 : _l.days30) !== null && _m !== void 0 ? _m : 0)}</h4>
                  </div>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">31-60 zile</h6>
                    <h4 className="text-warning">{formatCurrency((_p = (_o = data.aging) === null || _o === void 0 ? void 0 : _o.days60) !== null && _p !== void 0 ? _p : 0)}</h4>
                  </div>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">61-90 zile</h6>
                    <h4 className="text-danger">{formatCurrency((_r = (_q = data.aging) === null || _q === void 0 ? void 0 : _q.days90) !== null && _r !== void 0 ? _r : 0)}</h4>
                  </div>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={2}>
                  <div className="text-center">
                    <h6 className="text-muted">Peste 90 zile</h6>
                    <h4 className="text-danger">{formatCurrency((_t = (_s = data.aging) === null || _s === void 0 ? void 0 : _s.over90) !== null && _t !== void 0 ? _t : 0)}</h4>
                  </div>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {/* Payments Table */}
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">"detalii plati"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped hover responsive>
                <thead>
                  <tr>
                    <th>"Factură"</th>
                    <th>Data</th>
                    <th>Client</th>
                    <th>CUI</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Plătit</th>
                    <th className="text-end">Rămas</th>
                    <th>"Scadență"</th>
                    <th>"zile intarziere"</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.payments && Array.isArray(data.payments) && data.payments.length > 0) ? (data.payments.map(function (payment) {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return (<tr key={payment.invoiceId}>
                        <td>{(_a = payment.invoiceNumber) !== null && _a !== void 0 ? _a : '-'}</td>
                        <td>{payment.invoiceDate ? new Date(payment.invoiceDate).toLocaleDateString('ro-RO') : '-'}</td>
                        <td>{(_b = payment.clientName) !== null && _b !== void 0 ? _b : '-'}</td>
                        <td>{(_c = payment.clientCUI) !== null && _c !== void 0 ? _c : '-'}</td>
                        <td className="text-end">{formatCurrency((_d = payment.totalAmount) !== null && _d !== void 0 ? _d : 0)}</td>
                        <td className="text-end text-success">{formatCurrency((_e = payment.amountPaid) !== null && _e !== void 0 ? _e : 0)}</td>
                        <td className="text-end text-danger">{formatCurrency((_f = payment.amountRemaining) !== null && _f !== void 0 ? _f : 0)}</td>
                        <td>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('ro-RO') : '-'}</td>
                        <td className="text-center">
                          {((_g = payment.daysOverdue) !== null && _g !== void 0 ? _g : 0) > 0 ? (<react_bootstrap_1.Badge bg="danger">{payment.daysOverdue}</react_bootstrap_1.Badge>) : (<span className="text-muted">-</span>)}
                        </td>
                        <td>{getStatusBadge((_h = payment.status) !== null && _h !== void 0 ? _h : "Pending:")}</td>
                      </tr>);
            })) : (<tr>
                      <td colSpan={10} className="text-center text-muted">"nu exista plati in perioada selectata"</td>
                    </tr>)}
                </tbody>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </>)}
    </div>);
};
exports.ClientPaymentsReportPage = ClientPaymentsReportPage;
