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
exports.FiscalReportZPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var dompurify_1 = require("dompurify");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./FiscalReportZPage.css");
var FiscalReportZPage = function () {
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), reportDate = _b[0], setReportDate = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), checkingStatus = _d[0], setCheckingStatus = _d[1];
    var _e = (0, react_1.useState)(null), status = _e[0], setStatus = _e[1];
    var _f = (0, react_1.useState)(null), reportData = _f[0], setReportData = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    (0, react_1.useEffect)(function () {
        checkReportZStatus();
    }, [reportDate]);
    var checkReportZStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportResponse, openOrders, totalOrders, ordersResponse, orders, err_1, hasExistingReport, err_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setCheckingStatus(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 7, 8, 9]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/fiscal/z-report', {
                            params: {
                                date: reportDate,
                            },
                        })];
                case 2:
                    reportResponse = _d.sent();
                    openOrders = 0;
                    totalOrders = 0;
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/orders/all', {
                            params: {
                                dateFrom: reportDate,
                                dateTo: reportDate,
                            },
                        })];
                case 4:
                    ordersResponse = _d.sent();
                    orders = ((_a = ordersResponse.data) === null || _a === void 0 ? void 0 : _a.orders) || [];
                    totalOrders = orders.length;
                    openOrders = orders.filter(function (o) {
                        return o.status && !['paid', 'cancelled'].includes(o.status);
                    }).length;
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _d.sent();
                    console.warn('Could not fetch orders for status check:', err_1);
                    return [3 /*break*/, 6];
                case 6:
                    hasExistingReport = ((_b = reportResponse.data) === null || _b === void 0 ? void 0 : _b.success) && ((_c = reportResponse.data) === null || _c === void 0 ? void 0 : _c.data);
                    setStatus({
                        canGenerate: !hasExistingReport && openOrders === 0,
                        openOrders: openOrders,
                        totalOrders: totalOrders,
                        message: hasExistingReport
                            ? 'Raport Z deja generat pentru această zi'
                            : openOrders > 0
                                ? "Exist\u0103 ".concat(openOrders, " comenzi deschise")
                                : 'Gata pentru generare Raport Z',
                    });
                    return [3 /*break*/, 9];
                case 7:
                    err_2 = _d.sent();
                    console.error('❌ Eroare la verificarea statusului:', err_2);
                    // Fallback status
                    setStatus({
                        canGenerate: true,
                        openOrders: 0,
                        totalOrders: 0,
                        message: 'Status verificat',
                    });
                    return [3 /*break*/, 9];
                case 8:
                    setCheckingStatus(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var generateReportZ = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(status === null || status === void 0 ? void 0 : status.canGenerate)) {
                        if ((status === null || status === void 0 ? void 0 : status.openOrders) > 0) {
                            alert("\u274C NU PO\u021AI GENERA RAPORT Z!\n\nExist\u0103 ".concat(status.openOrders, " comenzi deschise pentru ").concat(reportDate, ".\n\nToate comenzile trebuie s\u0103 fie achitate sau anulate \u00EEnainte de a genera Raportul Z fiscal."));
                        }
                        else if ((status === null || status === void 0 ? void 0 : status.totalOrders) === 0) {
                            alert("\u26A0\uFE0F Nu exist\u0103 comenzi pentru ziua ".concat(reportDate, "."));
                        }
                        return [2 /*return*/];
                    }
                    // Confirmare dublă
                    if (!confirm("E\u0219ti sigur c\u0103 vrei s\u0103 generezi Raportul Z pentru ".concat(reportDate, "?\n\nAceast\u0103 ac\u021Biune \u00EEnchide ziua fiscal\u0103 \u0219i NU POATE FI ANULAT\u0102."))) {
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError(null);
                    setReportData(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/fiscal/z-report', {
                            date: reportDate,
                        })];
                case 2:
                    response = _c.sent();
                    if (response.data) {
                        setReportData(response.data);
                    }
                    else {
                        setError('Nu s-au putut încărca datele raportului Z.');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _c.sent();
                    console.error('❌ Eroare la generarea raportului Z:', err_3);
                    setError(((_b = (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la generarea raportului Z.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var displayVATBreakdown = function (vatBreakdown) {
        if (!vatBreakdown || vatBreakdown.length === 0) {
            return "<p class=\"text-muted\">Nu exist\u0103 defalcare TVA disponibil\u0103</p>";
        }
        return "\n      <table class=\"table table-sm table-striped\">\n        <thead>\n          <tr>\n            <th>Cota TVA (%)</th>\n            <th>Baza (RON)</th>\n            <th>TVA (RON)</th>\n          </tr>\n        </thead>\n        <tbody>\n          ".concat(vatBreakdown
            .map(function (item) { return "\n            <tr>\n              <td>".concat(item.rate, "%</td>\n              <td>").concat(item.base.toFixed(2), "</td>\n              <td>").concat(item.amount.toFixed(2), "</td>\n            </tr>\n          "); })
            .join(''), "\n        </tbody>\n      </table>\n    ");
    };
    var displayReceiptsList = function (receipts) {
        if (!receipts || receipts.length === 0) {
            return "<p class=\"text-muted\">Nu exist\u0103 bonuri pentru aceast\u0103 zi</p>";
        }
        return "\n      <table class=\"table table-sm table-striped\">\n        <thead>\n          <tr>\n            <th>Num\u0103r bon</th>\n            <th>Data</th>\n            <th>Suma</th>\n            <th>Metod\u0103 Plat\u0103</th>\n          </tr>\n        </thead>\n        <tbody>\n          ".concat(receipts
            .map(function (receipt) { return "\n            <tr>\n              <td>".concat(receipt.number, "</td>\n              <td>").concat(new Date(receipt.date).toLocaleDateString('ro-RO'), "</td>\n              <td>").concat(receipt.amount.toFixed(2), " RON</td>\n              <td>").concat(receipt.payment_method, "</td>\n            </tr>\n          "); })
            .join(''), "\n        </tbody>\n      </table>\n    ");
    };
    return (<div className="fiscal-report-z-page">
      <react_bootstrap_1.Card className="shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-danger text-white">
          <i className="fas fa-file-alt me-1"></i> Raport Z
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <p className="text-muted">Raportul Z se generează la sfârșitul zilei.</p>

          <react_bootstrap_1.Alert variant="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Atenție!</strong> Raportul Z închide ziua fiscală și nu poate fi anulat.</react_bootstrap_1.Alert>

          {/* Status Card */}
          <react_bootstrap_1.Card className="mb-3" style={{ borderLeft: '4px solid #ffc107' }}>
            <react_bootstrap_1.Card.Body>
              <h6 className="card-title">
                <i className="fas fa-clipboard-check me-2"></i>Status Comenzi
              </h6>
              <div>
                {checkingStatus ? (<div className="text-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Se verifică...</span>
                    </div>
                    <span className="ms-2">Verificare comenzi...</span>
                  </div>) : status ? (status.canGenerate ? (<react_bootstrap_1.Alert variant="success" className="mb-0">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>Gata pentru Raport Z</strong>
                      <br />
                      {status.totalOrders > 0
                ? "Toate cele ".concat(status.totalOrders, " comenzi sunt \u00EEnchise (achitate sau anulate).")
                : 'Nu există comenzi pentru această zi.'}
                    </react_bootstrap_1.Alert>) : (<react_bootstrap_1.Alert variant="danger" className="mb-0">
                      <i className="fas fa-times-circle me-2"></i>
                      <strong>Nu se poate genera Raport Z</strong>
                      <br />
                      ⚠️ Există {status.openOrders} comenzi deschise pentru {reportDate}.
                      <br />Toate comenzile trebuie să fie achitate sau anulate.</react_bootstrap_1.Alert>)) : (<p className="text-muted mb-0">Status necunoscut</p>)}
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          <div className="row">
            <div className="col-md-6">
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Selectează data pentru raport</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="date" value={reportDate} onChange={function (e) {
            setReportDate(e.target.value);
            setReportData(null);
            setError(null);
        }}/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Button variant="danger" onClick={generateReportZ} disabled={loading || !(status === null || status === void 0 ? void 0 : status.canGenerate)}>
                <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-file-alt', " me-1")}></i>
                {loading ? 'Se generează...' : 'Generează Raport Z'}
              </react_bootstrap_1.Button>
            </div>

            <div className="col-md-6">
              {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
                  {error}
                </react_bootstrap_1.Alert>)}

              {reportData && (<react_bootstrap_1.Card className="mt-3">
                  <react_bootstrap_1.Card.Header className="bg-danger text-white">
                    <h6 className="mb-0">Raport Z Generat - {reportData.reportDate}</h6>
                  </react_bootstrap_1.Card.Header>
                  <react_bootstrap_1.Card.Body>
                    <react_bootstrap_1.Alert variant="success">
                      <i className="fas fa-check-circle me-2"></i>Ziua fiscală a fost închisă cu succes!</react_bootstrap_1.Alert>

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Număr Raport Z:</strong> Z-{reportData.zNumber}
                      </div>
                      <div className="col-6">
                        <strong>Ora generării:</strong>' '
                        {new Date(reportData.timestamp).toLocaleString('ro-RO')}
                      </div>
                    </div>

                    <hr />

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total Bonuri:</strong> {reportData.summary.totalReceipts}
                      </div>
                      <div className="col-6">
                        <strong>Total Valoare:</strong> {reportData.summary.totalAmount.toFixed(2)} RON
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total Cash:</strong> {reportData.summary.totalCash.toFixed(2)} RON
                      </div>
                      <div className="col-6">
                        <strong>Total Card:</strong> {reportData.summary.totalCard.toFixed(2)} RON
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total TVA:</strong> {reportData.summary.totalVAT.toFixed(2)} RON
                      </div>
                      <div className="col-6">
                        <strong>Net (fără TVA):</strong> {reportData.summary.netAmount.toFixed(2)} RON
                      </div>
                    </div>

                    <hr />

                    <h6 className="mt-3">Defalcare TVA pe cote</h6>
                    <div dangerouslySetInnerHTML={{
                __html: dompurify_1.default.sanitize(displayVATBreakdown(reportData.summary.vatBreakdown)),
            }}/>

                    <hr />

                    <react_bootstrap_1.Alert variant="info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Raportul a fost salvat permanent</strong>
                      <br />Poți vizualiza rapoartele Z generate în secțiunea <strong>Arhivă</strong> din tab-ul fiscal.
                    </react_bootstrap_1.Alert>

                    <hr />

                    <h6 className="mt-3">
                      Toate Vânzările Zilei ({((_a = reportData.receipts) === null || _a === void 0 ? void 0 : _a.length) || 0} bonuri)
                    </h6>
                    <div dangerouslySetInnerHTML={{
                __html: dompurify_1.default.sanitize(displayReceiptsList(reportData.receipts || [])),
            }}/>
                  </react_bootstrap_1.Card.Body>
                </react_bootstrap_1.Card>)}
            </div>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.FiscalReportZPage = FiscalReportZPage;
