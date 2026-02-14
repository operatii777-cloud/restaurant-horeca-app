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
exports.AnafIntegrationPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./AnafIntegrationPage.css");
var AnafIntegrationPage = function () {
    var t = { t: function (s) { return s; } }.t;
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), config = _b[0], setConfig = _b[1];
    var _c = (0, react_1.useState)([]), transmissionLog = _c[0], setTransmissionLog = _c[1];
    var _d = (0, react_1.useState)(''), cuiInput = _d[0], setCuiInput = _d[1];
    var _e = (0, react_1.useState)(null), cuiResult = _e[0], setCuiResult = _e[1];
    var _f = (0, react_1.useState)(false), validatingCui = _f[0], setValidatingCui = _f[1];
    var _g = (0, react_1.useState)(new Date().toISOString().split('T')[0]), raportZDate = _g[0], setRaportZDate = _g[1];
    var _h = (0, react_1.useState)(false), transmitting = _h[0], setTransmitting = _h[1];
    var _j = (0, react_1.useState)(null), transmissionResult = _j[0], setTransmissionResult = _j[1];
    var _k = (0, react_1.useState)(null), feedback = _k[0], setFeedback = _k[1];
    (0, react_1.useEffect)(function () {
        loadAnafConfig();
        loadTransmissionLog();
    }, []);
    var loadAnafConfig = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/anaf/config')];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setConfig(response.data.data);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea configurației ANAF:', error_1);
                    // Fallback pentru development
                    setConfig({
                        company_name: 'Restaurant Demo',
                        cui: 'RO12345678',
                        invoice_series: 'FAC',
                        invoice_current_number: 1,
                        anaf_enabled: false,
                        anaf_test_mode: true,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var loadTransmissionLog = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/anaf/transmission-log', {
                            params: { limit: 10 },
                        })];
                case 1:
                    response = _b.sent();
                    if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data)) {
                        setTransmissionLog(response.data.data);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    console.error('❌ Eroare la încărcarea istoricului transmisiilor:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var validateCUI = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!cuiInput.trim()) {
                        setFeedback({ type: 'error', message: 'Introduceți un CUI' });
                        return [2 /*return*/];
                    }
                    setValidatingCui(true);
                    setCuiResult(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/anaf/validate-cui/".concat(cuiInput.trim()))];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setCuiResult(response.data);
                        if (response.data.valid) {
                            setFeedback({ type: 'success', message: 'CUI valid!' });
                        }
                        else {
                            setFeedback({ type: 'warning', message: 'CUI invalid sau nu există în baza ANAF' });
                        }
                    }
                    else {
                        setFeedback({ type: 'error', message: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la validare' });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _e.sent();
                    console.error('❌ Eroare la validarea CUI:', error_3);
                    setFeedback({ type: 'error', message: ((_d = (_c = error_3.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la validarea CUI' });
                    return [3 /*break*/, 5];
                case 4:
                    setValidatingCui(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var transmitRaportZ = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_4;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!raportZDate) {
                        setFeedback({ type: 'error', message: 'Selectați data raportului' });
                        return [2 /*return*/];
                    }
                    setTransmitting(true);
                    setTransmissionResult(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/anaf/transmit-raport-z', {
                            date: raportZDate,
                        })];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setTransmissionResult(response.data);
                        if (response.data.simulated) {
                            setFeedback({ type: 'warning', message: 'Transmisie SIMULATĂ (mod sandbox activ)' });
                        }
                        else {
                            setFeedback({ type: 'success', message: 'Raport Z transmis cu succes!' });
                        }
                        loadTransmissionLog();
                    }
                    else {
                        setFeedback({ type: 'error', message: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la transmitere' });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _e.sent();
                    console.error('❌ Eroare la transmiterea raportului Z:', error_4);
                    setFeedback({ type: 'error', message: ((_d = (_c = error_4.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la transmiterea raportului Z' });
                    return [3 /*break*/, 5];
                case 4:
                    setTransmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function () {
        if (!config)
            return null;
        return config.anaf_enabled ? (<react_bootstrap_1.Badge bg="success" className="p-2">
        <i className="fas fa-check-circle me-2"></i>PRODUCȚIE</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="warning" className="p-2">
        <i className="fas fa-flask me-2"></i>SANDBOX
      </react_bootstrap_1.Badge>);
    };
    var getTransmissionStatusBadge = function (status) {
        if (status === null || status === void 0 ? void 0 : status.includes('SIMULATĂ')) {
            return <react_bootstrap_1.Badge bg="warning">SIMULATĂ</react_bootstrap_1.Badge>;
        }
        else if ((status === null || status === void 0 ? void 0 : status.includes('ACCEPTED')) || (status === null || status === void 0 ? void 0 : status.includes('ACCEPTAT'))) {
            return <react_bootstrap_1.Badge bg="success">ACCEPTAT</react_bootstrap_1.Badge>;
        }
        else if ((status === null || status === void 0 ? void 0 : status.includes('REJECTED')) || (status === null || status === void 0 ? void 0 : status.includes('RESPINS'))) {
            return <react_bootstrap_1.Badge bg="danger">RESPINS</react_bootstrap_1.Badge>;
        }
        return <react_bootstrap_1.Badge bg="secondary">{status || 'Unknown'}</react_bootstrap_1.Badge>;
    };
    return (<div className="anaf-integration-page">
      <PageHeader_1.PageHeader title="🏛️ ANAF Integration" description="Integrare completă cu ANAF: validare CUI, transmitere rapoarte, configurare"/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'warning'} dismissible onClose={function () { return setFeedback(null); }} className="mt-3">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      {/* Status Card */}
      <react_bootstrap_1.Alert variant="warning" className="mt-3">
        <h5 className="alert-heading">
          <i className="fas fa-info-circle me-2"></i>Mod Sandbox Activ
        </h5>
        <p className="mb-2">Integrarea ANAF este în <strong>MOD SANDBOX</strong> (test mode).</p>
        <ul className="mb-0">
          <li><strong>✅ Validare CUI:</strong> Funcțională (API public ANAF fără certificat)</li>
          <li><strong>⚠️ Transmitere Rapoarte:</strong> SIMULATĂ (nu se transmit real la ANAF)</li>
          <li><strong>📄 eFatura:</strong> Generare XML (nu se transmite fără certificat digital)</li>
        </ul>
        <hr />
        <p className="mb-0">
          <strong>Pentru producție:</strong> Este necesar certificat digital calificat de la ANAF + configurare OAuth2.
        </p>
      </react_bootstrap_1.Alert>

      {/* Validare CUI */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-building me-2"></i>Validare CUI (LIVE - API ANAF Public)
          </h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <react_bootstrap_1.Form.Control type="text" value={cuiInput} onChange={function (e) { return setCuiInput(e.target.value); }} placeholder={t('ex: RO12345678 sau 12345678')}/>
                <react_bootstrap_1.Button variant="primary" onClick={validateCUI} disabled={validatingCui}>
                  <i className={"fas ".concat(validatingCui ? 'fa-spinner fa-spin' : 'fa-search', " me-2")}></i>validează CUI</react_bootstrap_1.Button>
              </div>
            </div>
          </div>
          {cuiResult && (<div className="mt-3">
              {cuiResult.valid ? (<react_bootstrap_1.Alert variant="success">
                  <h5 className="alert-heading">
                    <i className="fas fa-check-circle me-2"></i>CUI valid</h5>
                  {cuiResult.data && (<>
                      <p className="mb-1"><strong>Denumire:</strong> {cuiResult.data.denumire}</p>
                      <p className="mb-1"><strong>CUI:</strong> {cuiResult.data.cui}</p>
                      <p className="mb-1"><strong>Adresă:</strong> {cuiResult.data.adresa || '-'}</p>
                      <p className="mb-0"><strong>Plătitor TVA:</strong> {cuiResult.data.scpTVA ? '✅ DA' : '❌ NU'}</p>
                    </>)}
                </react_bootstrap_1.Alert>) : (<react_bootstrap_1.Alert variant="danger">
                  <i className="fas fa-times-circle me-2"></i>
                  <strong>CUI invalid sau nu există în baza ANAF</strong>
                </react_bootstrap_1.Alert>)}
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Transmisii Simulate */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-paper-plane me-2"></i>Transmisii ANAF (SIMULATE)
          </h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <div className="row">
            <div className="col-md-6">
              <react_bootstrap_1.Form.Label>Data raport Z</react_bootstrap_1.Form.Label>
              <div className="input-group">
                <react_bootstrap_1.Form.Control type="date" value={raportZDate} onChange={function (e) { return setRaportZDate(e.target.value); }}/>
                <react_bootstrap_1.Button variant="warning" onClick={transmitRaportZ} disabled={transmitting}>
                  <i className={"fas ".concat(transmitting ? 'fa-spinner fa-spin' : 'fa-file-invoice', " me-2")}></i>
                  Transmite Raport Z (Simulate)
                </react_bootstrap_1.Button>
              </div>
            </div>
          </div>
          {transmissionResult && (<div className="mt-3">
              {transmissionResult.simulated ? (<react_bootstrap_1.Alert variant="warning">
                  <h5 className="alert-heading">
                    <i className="fas fa-flask me-2"></i>transmisie simulată</h5>
                  <p className="mb-1"><strong>Upload ID:</strong> {transmissionResult.upload_id}</p>
                  <p className="mb-1"><strong>Status:</strong> {transmissionResult.status}</p>
                  <p className="mb-0">{transmissionResult.message}</p>
                </react_bootstrap_1.Alert>) : (<react_bootstrap_1.Alert variant={transmissionResult.success ? 'success' : 'danger'}>
                  {transmissionResult.message || transmissionResult.error}
                </react_bootstrap_1.Alert>)}
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Istoric Transmisii */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-history me-2"></i>Istoric Transmisii ANAF
          </h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {transmissionLog.length === 0 ? (<p className="text-muted text-center">Nicio transmisie înregistrată</p>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Dată</th>
                  <th>Status</th>
                  <th>XML</th>
                </tr>
              </thead>
              <tbody>
                {transmissionLog.map(function (log) { return (<tr key={log.id}>
                    <td>{log.transmission_type}</td>
                    <td>{new Date(log.transmission_date).toLocaleString('ro-RO')}</td>
                    <td>{getTransmissionStatusBadge(log.status_message)}</td>
                    <td>
                      {log.request_xml ? (<small className="text-muted">{log.request_xml.substring(0, 100)}...</small>) : ('—')}
                    </td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Configurare ANAF */}
      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-cog me-2"></i>Configurare ANAF
          </h5>
          {getStatusBadge()}
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {loading ? (<div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>) : config ? (<div className="row">
              <div className="col-md-6">
                <p className="mb-2"><strong>Companie:</strong> {config.company_name}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-2"><strong>CUI:</strong> {config.cui}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-2"><strong>Serie Facturi:</strong> {config.invoice_series}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-2"><strong>Nr. curent:</strong> {config.invoice_current_number}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>ANAF Enabled:</strong> {config.anaf_enabled ? '✅ DA' : '❌ NU (Sandbox)'}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Test Mode:</strong> {config.anaf_test_mode ? '✅ DA' : '❌ NU'}
                </p>
              </div>
            </div>) : (<p className="text-muted">nu s-au putut încărca datele de configurare</p>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.AnafIntegrationPage = AnafIntegrationPage;
