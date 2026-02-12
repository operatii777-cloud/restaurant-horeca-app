"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SagaExportPage = SagaExportPage;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var httpClient_1 = require("@/shared/api/httpClient");
require("./SagaExportPage.css");
function SagaExportPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)('nir'), exportType = _a[0], setExportType = _a[1];
    var _b = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    }), startDate = _b[0], setStartDate = _b[1];
    var _c = (0, react_1.useState)(function () { return new Date().toISOString().split('T')[0]; }), endDate = _c[0], setEndDate = _c[1];
    var _d = (0, react_1.useState)('371'), debitAccount = _d[0], setDebitAccount = _d[1];
    var _e = (0, react_1.useState)('401'), creditAccount = _e[0], setCreditAccount = _e[1];
    var _f = (0, react_1.useState)(9), defaultVatRate = _f[0], setDefaultVatRate = _f[1];
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)(null), success = _j[0], setSuccess = _j[1];
    var _k = (0, react_1.useState)([]), exportHistory = _k[0], setExportHistory = _k[1];
    var _l = (0, react_1.useState)({
        unitName: '',
        cui: '',
        address: '',
        gestion: ''
    }), brandConfig = _l[0], setBrandConfig = _l[1];
    var _m = (0, react_1.useState)(false), showBrandConfig = _m[0], setShowBrandConfig = _m[1];
    var handleExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, blob, url, link, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    setSuccess(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/saga/export', {
                            type: exportType,
                            startDate: startDate,
                            endDate: endDate,
                            debitAccount: debitAccount,
                            creditAccount: creditAccount,
                            defaultVatRate: defaultVatRate,
                            brand: brandConfig,
                        }, {
                            responseType: 'blob',
                        })];
                case 2:
                    response = _c.sent();
                    blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
                    url = URL.createObjectURL(blob);
                    link = document.createElement('a');
                    link.href = url;
                    link.download = "saga-".concat(exportType, "-").concat(startDate, "-").concat(endDate, ".csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    setSuccess("Export finalizat cu succes! Fi\u0219ier: saga-".concat(exportType, "-").concat(startDate, "-").concat(endDate, ".csv"));
                    loadExportHistory();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('SAGA export error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la exportul SAGA.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var loadExportHistory = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/saga/history')];
                case 1:
                    response = _a.sent();
                    if (response.data.success) {
                        setExportHistory(response.data.history || []);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('Error loading export history:', err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadBrandConfig = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/saga/brand-config')];
                case 1:
                    response = _a.sent();
                    if (response.data.success && response.data.config) {
                        setBrandConfig(response.data.config);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error('Error loading brand config:', err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var saveBrandConfig = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/saga/brand-config', brandConfig)];
                case 1:
                    _c.sent();
                    setSuccess('Configurare brand salvată cu succes!');
                    setShowBrandConfig(false);
                    return [3 /*break*/, 3];
                case 2:
                    err_4 = _c.sent();
                    setError(((_b = (_a = err_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la salvarea configurației brand.');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadExportHistory();
        loadBrandConfig();
    }, []);
    return (<div className="saga-export-page">
      <PageHeader_1.PageHeader title="📊 Export SAGA" description="Export date pentru sistemul SAGA (NIR și Vânzări)"/>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </react_bootstrap_1.Alert>)}

      {success && (<react_bootstrap_1.Alert variant="success" dismissible onClose={function () { return setSuccess(null); }}>
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Row>
        <react_bootstrap_1.Col md={8}>
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header>
              <h5>Configurare Export</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Form>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Tip Export</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={exportType} onChange={function (e) { return setExportType(e.target.value); }}>
                    <option value="nir">NIR (Notă Intrare-Recepție)</option>
                    <option value="sales">"Vânzări"</option>
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Row>
                  <react_bootstrap_1.Col md={6}>
                    <react_bootstrap_1.Form.Group className="mb-3">
                      <react_bootstrap_1.Form.Label>Data Start</react_bootstrap_1.Form.Label>
                      <react_bootstrap_1.Form.Control type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
                    </react_bootstrap_1.Form.Group>
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={6}>
                    <react_bootstrap_1.Form.Group className="mb-3">
                      <react_bootstrap_1.Form.Label>Data End</react_bootstrap_1.Form.Label>
                      <react_bootstrap_1.Form.Control type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
                    </react_bootstrap_1.Form.Group>
                  </react_bootstrap_1.Col>
                </react_bootstrap_1.Row>

                <react_bootstrap_1.Row>
                  <react_bootstrap_1.Col md={6}>
                    <react_bootstrap_1.Form.Group className="mb-3">
                      <react_bootstrap_1.Form.Label>"cont debit"</react_bootstrap_1.Form.Label>
                      <react_bootstrap_1.Form.Control type="text" value={debitAccount} onChange={function (e) { return setDebitAccount(e.target.value); }} placeholder="371"/>
                    </react_bootstrap_1.Form.Group>
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={6}>
                    <react_bootstrap_1.Form.Group className="mb-3">
                      <react_bootstrap_1.Form.Label>Cont Credit</react_bootstrap_1.Form.Label>
                      <react_bootstrap_1.Form.Control type="text" value={creditAccount} onChange={function (e) { return setCreditAccount(e.target.value); }} placeholder="401"/>
                    </react_bootstrap_1.Form.Group>
                  </react_bootstrap_1.Col>
                </react_bootstrap_1.Row>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Cota TVA Implicită (%)</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" value={defaultVatRate} onChange={function (e) { return setDefaultVatRate(parseFloat(e.target.value) || 9); }} min="0" max="25" step="0.1"/>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Button variant="primary" onClick={handleExport} disabled={loading} className="w-100">
                  {loading ? (<>
                      <span className="spinner-border spinner-border-sm me-2"></span>"se genereaza"</>) : (<>
                      <i className="fas fa-download me-2"></i>
                      Export CSV
                    </>)}
                </react_bootstrap_1.Button>
              </react_bootstrap_1.Form>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>

        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Configurare Brand</h5>
              <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return setShowBrandConfig(!showBrandConfig); }}>
                <i className={"fas fa-".concat(showBrandConfig ? 'chevron-up' : 'chevron-down')}></i>
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Header>
            {showBrandConfig && (<react_bootstrap_1.Card.Body>
                <react_bootstrap_1.Form>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Nume Unitate</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="text" value={brandConfig.unitName} onChange={function (e) { return setBrandConfig(__assign(__assign({}, brandConfig), { unitName: e.target.value })); }} placeholder="nume unitate"/>
                  </react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>CUI</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="text" value={brandConfig.cui} onChange={function (e) { return setBrandConfig(__assign(__assign({}, brandConfig), { cui: e.target.value })); }} placeholder="CUI"/>
                  </react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Adresă</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="text" value={brandConfig.address} onChange={function (e) { return setBrandConfig(__assign(__assign({}, brandConfig), { address: e.target.value })); }} placeholder="Adresă"/>
                  </react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Gestiune</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="text" value={brandConfig.gestion} onChange={function (e) { return setBrandConfig(__assign(__assign({}, brandConfig), { gestion: e.target.value })); }} placeholder="Gestiune"/>
                  </react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Button variant="primary" size="sm" onClick={saveBrandConfig} className="w-100">
                    <i className="fas fa-save me-2"></i>"salveaza configurare"</react_bootstrap_1.Button>
                </react_bootstrap_1.Form>
              </react_bootstrap_1.Card.Body>)}
          </react_bootstrap_1.Card>

          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5>Istoric Exporturi</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {exportHistory.length === 0 ? (<p className="text-muted text-center">"nu exista exporturi inregistrate"</p>) : (<div className="table-responsive">
                  <react_bootstrap_1.Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Tip</th>
                        <th>Perioadă</th>
                        <th>Linii</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportHistory.slice(0, 10).map(function (item) { return (<tr key={item.id}>
                          <td>{item.type.toUpperCase()}</td>
                          <td>
                            {new Date(item.start_date).toLocaleDateString('ro-RO')} -' '
                            {new Date(item.end_date).toLocaleDateString('ro-RO')}
                          </td>
                          <td>{item.rows_count}</td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </div>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>
    </div>);
}
