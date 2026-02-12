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
exports.FiscalReportXPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var dompurify_1 = require("dompurify");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./FiscalReportXPage.css");
var FiscalReportXPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), reportDate = _a[0], setReportDate = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), reportData = _c[0], setReportData = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var generateReportX = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    setReportData(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/fiscal/x-report', {
                            params: {
                                date: reportDate,
                            },
                        })];
                case 2:
                    response = _c.sent();
                    if (response.data) {
                        setReportData(response.data);
                    }
                    else {
                        setError('Nu s-au putut încărca datele raportului X.');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('❌ Eroare la generarea raportului X:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la generarea raportului X.');
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
    return (<div className="fiscal-report-x-page">
      <react_bootstrap_1.Card className="shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-primary text-white">
          <i className="fas fa-file-alt me-1"></i> Raport X
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <p className="text-muted">Raportul X se generează pentru a afișa totalurile intermediare.</p>

          <div className="row">
            <div className="col-md-6">
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Selectează data pentru raport</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="date" value={reportDate} onChange={function (e) { return setReportDate(e.target.value); }}/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Button variant="primary" onClick={generateReportX} disabled={loading}>
                <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-file-alt', " me-1")}></i>
                {loading ? 'Se generează...' : 'Generează Raport X'}
              </react_bootstrap_1.Button>
            </div>

            <div className="col-md-6">
              {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
                  {error}
                </react_bootstrap_1.Alert>)}

              {reportData && (<react_bootstrap_1.Card className="mt-3">
                  <react_bootstrap_1.Card.Header className="bg-primary text-white">
                    <h6 className="mb-0">Rezultate Raport X - {reportData.reportDate}</h6>
                  </react_bootstrap_1.Card.Header>
                  <react_bootstrap_1.Card.Body>
                    <react_bootstrap_1.Alert variant="info">
                      <i className="fas fa-info-circle me-2"></i>
                      {reportData.note || 'Raport X - Intermediar'}
                    </react_bootstrap_1.Alert>

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Număr raport X</strong> X-{reportData.xNumber}
                      </div>
                      <div className="col-6">
                        <strong>Ora generării</strong>' '
                        {new Date(reportData.timestamp).toLocaleString('ro-RO')}
                      </div>
                    </div>

                    <hr />

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total bonuri fiscale</strong> {reportData.summary.totalReceipts}
                      </div>
                      <div className="col-6">
                        <strong>Total Valoare:</strong> {reportData.summary.totalAmount.toFixed(2)} RON
                      </div>
                    </div>

                    <hr />

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total intrări cash</strong> {reportData.summary.totalCash.toFixed(2)} RON
                      </div>
                      <div className="col-6">
                        <strong>Total intrări card</strong> {reportData.summary.totalCard.toFixed(2)} RON
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
                      <strong>Raportul a fost salvat permanent.</strong>
                      <br />Poți vizualiza rapoartele X generate în secțiunea <strong>Arhivă</strong> din tab-ul fiscal.
                    </react_bootstrap_1.Alert>
                  </react_bootstrap_1.Card.Body>
                </react_bootstrap_1.Card>)}
            </div>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.FiscalReportXPage = FiscalReportXPage;
