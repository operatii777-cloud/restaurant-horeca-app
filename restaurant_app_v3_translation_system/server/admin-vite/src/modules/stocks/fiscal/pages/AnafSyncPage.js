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
exports.AnafSyncPage = void 0;
// ﻿import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./AnafSyncPage.css");
var AnafSyncPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(false), syncing = _b[0], setSyncing = _b[1];
    var _c = (0, react_1.useState)(false), retransmitting = _c[0], setRetransmitting = _c[1];
    var _d = (0, react_1.useState)(null), status = _d[0], setStatus = _d[1];
    var _e = (0, react_1.useState)(null), feedback = _e[0], setFeedback = _e[1];
    (0, react_1.useEffect)(function () {
        checkAnafSyncStatus();
    }, []);
    var checkAnafSyncStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/fiscal/anaf-sync-status')];
                case 2:
                    response = _a.sent();
                    if (response.data) {
                        setStatus({
                            status: response.data.status || 'unknown',
                            sent_reports: response.data.sent_reports || 0,
                            pending_reports: response.data.pending_reports || 0,
                            last_sync: response.data.last_sync || null,
                            next_sync: response.data.next_sync || null,
                            message: response.data.message,
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('❌ Eroare la verificarea stării ANAF:', error_1);
                    // Fallback status
                    setStatus({
                        status: 'unknown',
                        sent_reports: 0,
                        pending_reports: 0,
                        last_sync: null,
                        next_sync: null,
                        message: 'Nu s-a putut verifica starea',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var retransmitMonthlyReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!confirm('Ești sigur că vrei să retransmiți raportul lunar?')) {
                        return [2 /*return*/];
                    }
                    setRetransmitting(true);
                    setFeedback(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/fiscal/retransmit-monthly')];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setFeedback({
                            type: 'success',
                            message: 'Raportul lunar a fost retransmis cu succes!',
                        });
                        checkAnafSyncStatus(); // Actualizează starea
                    }
                    else {
                        setFeedback({
                            type: 'error',
                            message: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la retransmiterea raportului.',
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _e.sent();
                    console.error('❌ Eroare la retransmiterea raportului:', error_2);
                    setFeedback({
                        type: 'error',
                        message: ((_d = (_c = error_2.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la retransmiterea raportului.',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setRetransmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var syncAllReports = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!confirm('Ești sigur că vrei să sincronizezi toate rapoartele cu ANAF?')) {
                        return [2 /*return*/];
                    }
                    setSyncing(true);
                    setFeedback(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/fiscal/sync-all')];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setFeedback({
                            type: 'success',
                            message: 'Toate rapoartele au fost sincronizate cu succes!',
                        });
                        checkAnafSyncStatus(); // Actualizează starea
                    }
                    else {
                        setFeedback({
                            type: 'error',
                            message: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la sincronizarea rapoartelor.',
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _e.sent();
                    console.error('❌ Eroare la sincronizarea rapoartelor:', error_3);
                    setFeedback({
                        type: 'error',
                        message: ((_d = (_c = error_3.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la sincronizarea rapoartelor.',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setSyncing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getStatusAlert = function () {
        if (!status) {
            return (<react_bootstrap_1.Alert variant="info">
          <i className="fas fa-info-circle me-2"></i>Se încarcă starea transmiterii...</react_bootstrap_1.Alert>);
        }
        var variant = 'info';
        var icon = 'fas fa-info-circle';
        var text = 'Stare necunoscută';
        if (status.status === 'synced') {
            variant = 'success';
            icon = 'fas fa-check-circle';
            text = 'Toate rapoartele sunt transmise';
        }
        else if (status.status === 'pending') {
            variant = 'warning';
            icon = 'fas fa-clock';
            text = 'Există rapoarte în așteptare';
        }
        else if (status.status === 'error') {
            variant = 'danger';
            icon = 'fas fa-exclamation-triangle';
            text = 'Eroare la transmitere';
        }
        return (<react_bootstrap_1.Alert variant={variant}>
        <i className={"".concat(icon, " me-2")}></i>
        <strong>Stare Transmitere:</strong> {text}
        {status.message && (<>
            <br />
            <small>{status.message}</small>
          </>)}
      </react_bootstrap_1.Alert>);
    };
    return (<div className="anaf-sync-page">
      <react_bootstrap_1.Card className="shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-warning text-dark">
          <i className="fas fa-sync-alt me-1"></i> Sincronizare / Transmitere ANAF
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : feedback.type === 'warning' ? 'warning' : 'danger'} dismissible onClose={function () { return setFeedback(null); }}>
              {feedback.message}
            </react_bootstrap_1.Alert>)}

          <div className="row">
            <div className="col-md-6">
              <h6>Vizualizare stare transmitere rapoarte</h6>
              <div className="mb-3">
                {loading ? (<react_bootstrap_1.Alert variant="info">
                    <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă starea transmiterii...</react_bootstrap_1.Alert>) : (getStatusAlert())}

                {status && (<>
                    <div className="row mt-3">
                      <div className="col-6">
                        <strong>Rapoarte Transmise:</strong> {status.sent_reports}
                      </div>
                      <div className="col-6">
                        <strong>Rapoarte în așteptare:</strong> {status.pending_reports}
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-6">
                        <strong>Ultima Sincronizare:</strong> {status.last_sync || 'Niciodată'}
                      </div>
                      <div className="col-6">
                        <strong>Următoarea sincronizare:</strong> {status.next_sync || 'Nu este programată'}
                      </div>
                    </div>
                  </>)}
              </div>
              <react_bootstrap_1.Button variant="warning" onClick={checkAnafSyncStatus} disabled={loading}>
                <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync', " me-1")}></i>
                {loading ? 'Se verifică...' : 'Verifică Stare Transmitere'}
              </react_bootstrap_1.Button>
            </div>

            <div className="col-md-6">
              <h6>Acțiuni disponibile</h6>
              <div className="d-grid gap-2">
                <react_bootstrap_1.Button variant="danger" onClick={retransmitMonthlyReport} disabled={retransmitting}>
                  <i className={"fas ".concat(retransmitting ? 'fa-spinner fa-spin' : 'fa-redo', " me-1")}></i>
                  {retransmitting ? 'Se retransmite...' : 'Retransmite raport lunar'}
                </react_bootstrap_1.Button>
                <react_bootstrap_1.Button variant="info" onClick={syncAllReports} disabled={syncing}>
                  <i className={"fas ".concat(syncing ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt', " me-1")}></i>
                  {syncing ? 'Se sincronizează...' : 'Sincronizează toate rapoartele'}
                </react_bootstrap_1.Button>
              </div>
            </div>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.AnafSyncPage = AnafSyncPage;
