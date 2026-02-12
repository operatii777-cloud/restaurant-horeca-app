"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Suppliers Report Page
 *
 * Raport Furnizori:
 * - Datorii la Furnizori
 * - Evaluare Furnizori
 * - Prețuri Medii
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
exports.SuppliersReportPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var accountingReportsApi_1 = require("../api/accountingReportsApi");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./SuppliersReportPage.css");
var SuppliersReportPage = function () {
    var _a, _b, _c, _d, _e, _f;
    //   const { t } = useTranslation();
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)(null), data = _j[0], setData = _j[1];
    var _k = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 3);
        return date.toISOString().split('T')[0];
    }), startDate = _k[0], setStartDate = _k[1];
    var _l = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _l[0], setEndDate = _l[1];
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
                    return [4 /*yield*/, (0, accountingReportsApi_1.fetchSuppliersReport)(filters)];
                case 2:
                    result = _c.sent();
                    setData(result);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('SuppliersReportPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea raportului');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [startDate, endDate]);
    react_1.default.useEffect(function () {
        loadReport();
    }, [loadReport]);
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
        }).format(value);
    };
    var getRatingStars = function (rating) {
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            stars.push(<i key={i} className={"fas fa-star ".concat(i <= rating ? 'text-warning' : 'text-muted')}></i>);
        }
        return stars;
    };
    return (<div className="suppliers-report-page">
      <div className="page-header">
        <h1>🏢 Raport Furnizori</h1>
        <p>"raport furnizori datorii evaluare furnizori si ana"</p>
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
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">Total Furnizori</h5>
                  <h3>{(_b = (_a = data.summary) === null || _a === void 0 ? void 0 : _a.totalSuppliers) !== null && _b !== void 0 ? _b : 0}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">Total Datorii</h5>
                  <h3 className="text-danger">{formatCurrency((_d = (_c = data.summary) === null || _c === void 0 ? void 0 : _c.totalDebt) !== null && _d !== void 0 ? _d : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Card className="text-center">
                <react_bootstrap_1.Card.Body>
                  <h5 className="text-muted">Preț Mediu</h5>
                  <h3>{formatCurrency((_f = (_e = data.summary) === null || _e === void 0 ? void 0 : _e.averagePrice) !== null && _f !== void 0 ? _f : 0)}</h3>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Suppliers Table */}
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">"datorii la furnizori"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Furnizor</th>
                    <th>CUI</th>
                    <th className="text-end">"datorie totala"</th>
                    <th className="text-end">"numar facturi"</th>
                    <th className="text-end">Preț Mediu</th>
                    <th>"ultima comanda"</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.suppliers && Array.isArray(data.suppliers) && data.suppliers.length > 0) ? (data.suppliers.map(function (supplier) {
                var _a, _b, _c, _d, _e, _f, _g;
                return (<tr key={supplier.supplierId}>
                        <td><strong>{(_a = supplier.supplierName) !== null && _a !== void 0 ? _a : '-'}</strong></td>
                        <td>{(_b = supplier.supplierCUI) !== null && _b !== void 0 ? _b : '-'}</td>
                        <td className="text-end">
                          <span className={((_c = supplier.totalDebt) !== null && _c !== void 0 ? _c : 0) > 0 ? 'text-danger' : 'text-success'}>
                            {formatCurrency((_d = supplier.totalDebt) !== null && _d !== void 0 ? _d : 0)}
                          </span>
                        </td>
                        <td className="text-end">{(_e = supplier.invoicesCount) !== null && _e !== void 0 ? _e : 0}</td>
                        <td className="text-end">{formatCurrency((_f = supplier.averagePrice) !== null && _f !== void 0 ? _f : 0)}</td>
                        <td>{supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString('ro-RO') : '-'}</td>
                        <td>{getRatingStars((_g = supplier.rating) !== null && _g !== void 0 ? _g : 0)}</td>
                      </tr>);
            })) : (<tr>
                      <td colSpan={7} className="text-center text-muted">"nu exista furnizori in perioada selectata"</td>
                    </tr>)}
                </tbody>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {/* Price Analysis */}
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">"analiza preturi medii"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Furnizor</th>
                    <th className="text-end">Preț Mediu</th>
                    <th className="text-end">"pret min"</th>
                    <th className="text-end">"pret max"</th>
                    <th className="text-end">"Variație"</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.priceAnalysis && Array.isArray(data.priceAnalysis) && data.priceAnalysis.length > 0) ? (data.priceAnalysis.map(function (item, index) {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return (<tr key={index}>
                        <td><strong>{(_a = item.productName) !== null && _a !== void 0 ? _a : '-'}</strong></td>
                        <td>{(_b = item.supplierName) !== null && _b !== void 0 ? _b : '-'}</td>
                        <td className="text-end">{formatCurrency((_c = item.averagePrice) !== null && _c !== void 0 ? _c : 0)}</td>
                        <td className="text-end text-success">{formatCurrency((_d = item.minPrice) !== null && _d !== void 0 ? _d : 0)}</td>
                        <td className="text-end text-danger">{formatCurrency((_e = item.maxPrice) !== null && _e !== void 0 ? _e : 0)}</td>
                        <td className="text-end">
                          <react_bootstrap_1.Badge bg={((_f = item.priceVariance) !== null && _f !== void 0 ? _f : 0) > 20 ? 'danger' : ((_g = item.priceVariance) !== null && _g !== void 0 ? _g : 0) > 10 ? 'warning' : 'success'}>
                            {((_h = item.priceVariance) !== null && _h !== void 0 ? _h : 0).toFixed(1)}%
                          </react_bootstrap_1.Badge>
                        </td>
                      </tr>);
            })) : (<tr>
                      <td colSpan={6} className="text-center text-muted">"nu exista date de analiza preturi"</td>
                    </tr>)}
                </tbody>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </>)}
    </div>);
};
exports.SuppliersReportPage = SuppliersReportPage;
