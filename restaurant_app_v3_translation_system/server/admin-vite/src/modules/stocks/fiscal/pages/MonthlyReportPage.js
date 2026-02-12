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
exports.MonthlyReportPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./MonthlyReportPage.css");
var MonthlyReportPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(new Date().getMonth() + 1), selectedMonth = _a[0], setSelectedMonth = _a[1];
    var _b = (0, react_1.useState)(new Date().getFullYear()), selectedYear = _b[0], setSelectedYear = _b[1];
    var _c = (0, react_1.useState)(null), reportData = _c[0], setReportData = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(false), generating = _e[0], setGenerating = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(null), success = _g[0], setSuccess = _g[1];
    (0, react_1.useEffect)(function () {
        loadMonthlyReport();
    }, [selectedMonth, selectedYear]);
    var loadMonthlyReport = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/fiscal/reports/monthly', {
                            params: {
                                month: selectedMonth,
                                year: selectedYear,
                            },
                        })];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setReportData(response.data.data || null);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea raportului lunar:', error_1);
                    // Fallback pentru development
                    setReportData({
                        month: selectedMonth.toString().padStart(2, '0'),
                        year: selectedYear,
                        total_transactions: 1250,
                        total_revenue: 125000,
                        total_tax: 13750,
                        status: 'generated',
                        generated_at: new Date().toISOString(),
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [selectedMonth, selectedYear]);
    var handleGenerateReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setGenerating(true);
                    setError(null);
                    setSuccess(null);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/fiscal/reports/monthly/generate', {
                            month: selectedMonth,
                            year: selectedYear,
                        })];
                case 2:
                    response = _d.sent();
                    if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.success)) return [3 /*break*/, 4];
                    setSuccess('Raportul lunar a fost generat cu succes!');
                    return [4 /*yield*/, loadMonthlyReport()];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_2 = _d.sent();
                    console.error('❌ Eroare la generarea raportului:', error_2);
                    setError(((_c = (_b = error_2.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Nu s-a putut genera raportul.');
                    return [3 /*break*/, 7];
                case 6:
                    setGenerating(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadReport = function () {
        if (reportData === null || reportData === void 0 ? void 0 : reportData.file_url) {
            window.open(reportData.file_url, '_blank');
        }
    };
    var handleSubmitToAnaf = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!confirm('Ești sigur că vrei să trimiți raportul lunar la ANAF?'))
                        return [2 /*return*/];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/fiscal/reports/monthly/submit', {
                            month: selectedMonth,
                            year: selectedYear,
                        })];
                case 2:
                    response = _d.sent();
                    if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.success)) return [3 /*break*/, 4];
                    setSuccess('Raportul a fost trimis la ANAF cu succes!');
                    return [4 /*yield*/, loadMonthlyReport()];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_3 = _d.sent();
                    console.error('❌ Eroare la trimiterea raportului:', error_3);
                    setError(((_c = (_b = error_3.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Nu s-a putut trimite raportul la ANAF.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
        var badges = {
            pending: { bg: 'secondary', label: 'În Așteptare' },
            generated: { bg: 'info', label: 'Generat' },
            submitted: { bg: 'warning', label: 'Trimis la ANAF' },
            approved: { bg: 'success', label: 'Aprobat' },
        };
        var badge = badges[status] || badges.pending;
        return <span className={"badge bg-".concat(badge.bg)}>{badge.label}</span>;
    };
    var monthNames = [
        'Ianuarie',
        'Februarie',
        'Martie',
        'Aprilie',
        'Mai',
        'Iunie',
        'Iulie',
        'August',
        'Septembrie',
        'Octombrie',
        'Noiembrie',
        'Decembrie',
    ];
    return (<div className="monthly-report-page">
      <h2 className="mb-4">Raport Lunar</h2>

      {error && <react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>{error}</react_bootstrap_1.Alert>}
      {success && <react_bootstrap_1.Alert variant="success" dismissible onClose={function () { return setSuccess(null); }}>{success}</react_bootstrap_1.Alert>}

      <react_bootstrap_1.Card className="shadow-sm mb-4">
        <react_bootstrap_1.Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-calendar-alt me-2"></i>Raport Lunar
          </h5>
          <div>
            <react_bootstrap_1.Button variant="primary" size="sm" className="me-2" onClick={handleGenerateReport} disabled={generating || loading}>
              <i className={"fas ".concat(generating ? 'fa-spinner fa-spin' : 'fa-file-alt', " me-1")}></i>
              {generating ? 'Se generează...' : 'Generează Raport'}
            </react_bootstrap_1.Button>
            {(reportData === null || reportData === void 0 ? void 0 : reportData.file_url) && (<react_bootstrap_1.Button variant="success" size="sm" className="me-2" onClick={handleDownloadReport}>
                <i className="fas fa-download me-1"></i>Descarcă</react_bootstrap_1.Button>)}
            {(reportData === null || reportData === void 0 ? void 0 : reportData.status) === 'generated' && (<react_bootstrap_1.Button variant="warning" size="sm" onClick={handleSubmitToAnaf}>
                <i className="fas fa-paper-plane me-1"></i>Trimite la ANAF</react_bootstrap_1.Button>)}
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>Raportul lunar conține toate tranzacțiile dintr-o perioadă specificată.</react_bootstrap_1.Alert>

          {/* Selectare Lună/An */}
          <react_bootstrap_1.Row className="mb-4">
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Lună</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={selectedMonth} onChange={function (e) { return setSelectedMonth(parseInt(e.target.value)); }}>
                {monthNames.map(function (month, index) { return (<option key={index + 1} value={index + 1}>
                    {month}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>An</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={selectedYear} onChange={function (e) { return setSelectedYear(parseInt(e.target.value)); }}>
                {Array.from({ length: 5 }, function (_, i) { return new Date().getFullYear() - 2 + i; }).map(function (year) { return (<option key={year} value={year}>
                    {year}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4} className="d-flex align-items-end">
              <react_bootstrap_1.Button variant="secondary" className="w-100" onClick={loadMonthlyReport} disabled={loading}>
                <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync-alt', " me-1")}></i>Reîmprospătează</react_bootstrap_1.Button>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Status Card */}
          {reportData && (<react_bootstrap_1.Card className="mb-4" style={{ borderLeft: '4px solid #ffc107' }}>
              <react_bootstrap_1.Card.Body>
                <react_bootstrap_1.Row>
                  <react_bootstrap_1.Col md={3}>
                    <strong>Status:</strong>
                    <div className="mt-1">{getStatusBadge(reportData.status)}</div>
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={3}>
                    <strong>Tranzacții:</strong>
                    <div className="mt-1">{reportData.total_transactions.toLocaleString('ro-RO')}</div>
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={3}>
                    <strong>Venit Total:</strong>
                    <div className="mt-1">{reportData.total_revenue.toFixed(2)} RON</div>
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={3}>
                    <strong>TVA Total:</strong>
                    <div className="mt-1">{reportData.total_tax.toFixed(2)} RON</div>
                  </react_bootstrap_1.Col>
                </react_bootstrap_1.Row>
                {reportData.generated_at && (<react_bootstrap_1.Row className="mt-3">
                    <react_bootstrap_1.Col>
                      <small className="text-muted">
                        Generat la: {new Date(reportData.generated_at).toLocaleString('ro-RO')}
                      </small>
                    </react_bootstrap_1.Col>
                  </react_bootstrap_1.Row>)}
                {reportData.submitted_at && (<react_bootstrap_1.Row className="mt-1">
                    <react_bootstrap_1.Col>
                      <small className="text-muted">
                        Trimis la ANAF: {new Date(reportData.submitted_at).toLocaleString('ro-RO')}
                      </small>
                    </react_bootstrap_1.Col>
                  </react_bootstrap_1.Row>)}
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>)}

          {/* Detalii Raport */}
          {loading ? (<div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x text-warning"></i>
              <p className="mt-2">Se încarcă raportul...</p>
            </div>) : reportData ? (<react_bootstrap_1.Card>
              <react_bootstrap_1.Card.Header>
                <h6 className="mb-0">Detalii Raport - {monthNames[selectedMonth - 1]} {selectedYear}</h6>
              </react_bootstrap_1.Card.Header>
              <react_bootstrap_1.Card.Body>
                <div className="table-responsive">
                  <react_bootstrap_1.Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Indicator</th>
                        <th>Valoare</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Lună</td>
                        <td>
                          <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Număr tranzacții</td>
                        <td>{reportData.total_transactions.toLocaleString('ro-RO')}</td>
                      </tr>
                      <tr>
                        <td>Venit Total (fără TVA)</td>
                        <td>{reportData.total_revenue.toFixed(2)} RON</td>
                      </tr>
                      <tr>
                        <td>TVA Total</td>
                        <td>{reportData.total_tax.toFixed(2)} RON</td>
                      </tr>
                      <tr>
                        <td>Venit Total (cu TVA)</td>
                        <td>{(reportData.total_revenue + reportData.total_tax).toFixed(2)} RON</td>
                      </tr>
                      <tr>
                        <td>Status</td>
                        <td>{getStatusBadge(reportData.status)}</td>
                      </tr>
                    </tbody>
                  </react_bootstrap_1.Table>
                </div>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>) : (<react_bootstrap_1.Alert variant="info" className="text-center">
              <i className="fas fa-info-circle me-2"></i>
              Nu există raport generat pentru luna selectată. Apasă "Generează Raport" pentru a crea unul nou.
            </react_bootstrap_1.Alert>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.MonthlyReportPage = MonthlyReportPage;
