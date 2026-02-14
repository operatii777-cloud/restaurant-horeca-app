"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Accounting Export Page
 *
 * UI pentru Export Contabilitate:
 * - Export Saga CSV
 * - Export WinMentor
 * - Export SAF-T
 * - Setări Export Automat
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
exports.AccountingExportPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./AccountingExportPage.css");
var AccountingExportPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var _c = (0, react_1.useState)(null), success = _c[0], setSuccess = _c[1];
    var _d = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    }), startDate = _d[0], setStartDate = _d[1];
    var _e = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), endDate = _e[0], setEndDate = _e[1];
    var _f = (0, react_1.useState)('saga'), exportType = _f[0], setExportType = _f[1];
    var handleExport = function (type) { return __awaiter(void 0, void 0, void 0, function () {
        var endpoint, filename, response, blob, url, a, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(type);
                    setError(null);
                    setSuccess(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    endpoint = '';
                    filename = '';
                    switch (type) {
                        case 'saga':
                            endpoint = '/api/accounting/export/saga';
                            filename = "saga-export-".concat(startDate, "-").concat(endDate, ".csv");
                            break;
                        case 'winmentor':
                            endpoint = '/api/accounting/export/winmentor';
                            filename = "winmentor-export-".concat(startDate, "-").concat(endDate, ".csv");
                            break;
                        case 'saft':
                            endpoint = '/api/accounting/export/saft';
                            filename = "saft-export-".concat(startDate, "-").concat(endDate, ".xml");
                            break;
                    }
                    return [4 /*yield*/, httpClient_1.httpClient.get(endpoint, {
                            params: {
                                dateFrom: startDate,
                                dateTo: endDate,
                            },
                            responseType: 'blob',
                        })];
                case 2:
                    response = _c.sent();
                    blob = new Blob([response.data]);
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    setSuccess("Export ".concat(type.toUpperCase(), " realizat cu succes!"));
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('AccountingExportPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || "Eroare la export ".concat(type.toUpperCase()));
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="accounting-export-page">
      <div className="page-header">
        <h1>📤 Export Contabilitate</h1>
        <p>"export date pentru sisteme contabilitate saga winm"</p>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      {success && (<react_bootstrap_1.Alert variant="success" dismissible onClose={function () { return setSuccess(null); }} className="mt-3">
          {success}
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
              <react_bootstrap_1.Form.Label>Tip Export</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={exportType} onChange={function (e) { return setExportType(e.target.value); }}>
                <option value="saga">Saga CSV</option>
                <option value="winmentor">WinMentor</option>
                <option value="saft">SAF-T (XML)</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Export Options */}
      <react_bootstrap_1.Tabs defaultActiveKey="saga" className="mb-4">
        <react_bootstrap_1.Tab eventKey="saga" title="📊 Saga CSV">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Export Saga CSV</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <p>"export date in format csv compatibil cu saga conta"</p>
              <ul>
                <li>Format: CSV (separator ;)</li>
                <li>Encoding: UTF-8</li>
                <li>"include facturi nir rapoarte z"</li>
              </ul>
              <react_bootstrap_1.Button variant="primary" onClick={function () { return handleExpor[saga]; }} disabled={loading === 'saga'}>
                <i className={"fas ".concat(loading === 'saga' ? 'fa-spinner fa-spin' : 'fa-download', " me-2")}></i>
                {loading === 'saga' ? 'Se exportă...' : 'Export Saga CSV'}
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="winmentor" title="📋 WinMentor">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Export WinMentor</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <p>"export date in format compatibil cu winmentor cont"</p>
              <ul>
                <li>Format: CSV (separator ,)</li>
                <li>Encoding: UTF-8</li>
                <li>"include facturi nir rapoarte z"</li>
              </ul>
              <react_bootstrap_1.Button variant="primary" onClick={function () { return handleExpor[winmentor]; }} disabled={loading === 'winmentor'}>
                <i className={"fas ".concat(loading === 'winmentor' ? 'fa-spinner fa-spin' : 'fa-download', " me-2")}></i>
                {loading === 'winmentor' ? 'Se exportă...' : 'Export WinMentor'}
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="saft" title="📄 SAF-T">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Export SAF-T (Standard Audit File for Tax)</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <p>"export date in format saf t xml pentru anaf"</p>
              <ul>
                <li>Format: XML (SAF-T Standard)</li>
                <li>Encoding: UTF-8</li>
                <li>"include toate documentele fiscale"</li>
                <li>Conform: Standard ANAF</li>
              </ul>
              <react_bootstrap_1.Button variant="primary" onClick={function () { return handleExpor[saft]; }} disabled={loading === 'saft'}>
                <i className={"fas ".concat(loading === 'saft' ? 'fa-spinner fa-spin' : 'fa-download', " me-2")}></i>
                {loading === 'saft' ? 'Se exportă...' : 'Export SAF-T XML'}
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>
      </react_bootstrap_1.Tabs>

      {/* Auto Export Settings */}
      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">"setari export automat"</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Check type="switch" id="auto-export-enabled" label="activeaza export automat" className="mb-3"/>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Label>"frecventa export"</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select>
                  <option value="daily">Zilnic</option>
                  <option value="weekly">"Săptămânal"</option>
                  <option value="monthly">Lunar</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Label>Format Implicit</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select>
                  <option value="saga">Saga CSV</option>
                  <option value="winmentor">WinMentor</option>
                  <option value="saft">SAF-T XML</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Label>"email notificare"</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="email" placeholder='[email@examplecom]'/>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
            <react_bootstrap_1.Button variant="success" className="mt-3">
              <i className="fas fa-save me-2"></i>"salveaza setari"</react_bootstrap_1.Button>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.AccountingExportPage = AccountingExportPage;
