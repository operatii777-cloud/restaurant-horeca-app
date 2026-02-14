"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * MFA (Multi-Factor Authentication) Settings Page
 * Permite utilizatorilor să activeze/dezactiveze MFA
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
exports.MFAPage = void 0;
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
var httpClient_1 = require("@/shared/api/httpClient");
require("./MFAPage.css");
var MFAPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)({ mfaEnabled: false, mfaConfigured: false }), status = _a[0], setStatus = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)('idle'), setupStep = _c[0], setSetupStep = _c[1];
    var _d = (0, react_1.useState)(null), qrCode = _d[0], setQrCode = _d[1];
    var _e = (0, react_1.useState)(null), secret = _e[0], setSecret = _e[1];
    var _f = (0, react_1.useState)(''), mfaToken = _f[0], setMfaToken = _f[1];
    var _g = (0, react_1.useState)(null), alert = _g[0], setAlert = _g[1];
    var _h = (0, useApiQuery_1.useApiQuery)('/api/auth/mfa/status'), mfaStatus = _h.data, refetchStatus = _h.refetch;
    var setupMutation = (0, useApiMutation_1.useApiMutation)();
    var verifyMutation = (0, useApiMutation_1.useApiMutation)();
    var disableMutation = (0, useApiMutation_1.useApiMutation)();
    (0, react_1.useEffect)(function () {
        if (mfaStatus) {
            setStatus(mfaStatus);
            setLoading(false);
        }
    }, [mfaStatus]);
    var handleSetup = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    setAlert(null);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/auth/mfa/setup')];
                case 1:
                    response = _c.sent();
                    if (response.data.success) {
                        setQrCode(response.data.qrCode);
                        setSecret(response.data.secret);
                        setSetupStep('verify');
                        setAlert({ type: 'success', message: 'QR code generat cu succes! Scanează-l cu Google Authenticator.' });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _c.sent();
                    setAlert({ type: 'error', message: ((_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la generarea QR code' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleVerify = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!mfaToken || mfaToken.length !== 6) {
                        setAlert({ type: 'error', message: 'Token MFA invalid (trebuie 6 cifre)' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    setAlert(null);
                    return [4 /*yield*/, verifyMutation.mutate({
                            url: '/api/auth/mfa/verify',
                            method: 'POST',
                            data: { token: mfaToken }
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.success) return [3 /*break*/, 4];
                    setAlert({ type: 'success', message: 'MFA activat cu succes!' });
                    setSetupStep('idle');
                    setMfaToken('');
                    setQrCode(null);
                    setSecret(null);
                    return [4 /*yield*/, refetchStatus()];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _c.sent();
                    setAlert({ type: 'error', message: ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Token MFA invalid' });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDisable = function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, response, error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    password = prompt('Introdu parola pentru confirmare:');
                    if (!password)
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    setAlert(null);
                    return [4 /*yield*/, disableMutation.mutate({
                            url: '/api/auth/mfa/disable',
                            method: 'POST',
                            data: { password: password }
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.success) return [3 /*break*/, 4];
                    setAlert({ type: 'success', message: 'MFA dezactivat cu succes!' });
                    return [4 /*yield*/, refetchStatus()];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_3 = _c.sent();
                    setAlert({ type: 'error', message: ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Parolă incorectă sau eroare' });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="mfa-page">
        <PageHeader_1.PageHeader title="Autentificare Multi-Factor (MFA)" subtitle="securitate suplimentara pentru contul tau"/>
        <div className="mfa-page__loading">Încarcă...</div>
      </div>);
    }
    return (<div className="mfa-page">
      <PageHeader_1.PageHeader title="Autentificare Multi-Factor (MFA)" subtitle="securitate suplimentara pentru contul tau"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="mfa-page__content">
        {/* Status Card */}
        <div className="mfa-page__status-card">
          <h3>Status MFA</h3>
          <div className="mfa-page__status">
            <span className={"mfa-page__status-badge ".concat(status.mfaEnabled ? 'mfa-page__status-badge--enabled' : 'mfa-page__status-badge--disabled')}>
              {status.mfaEnabled ? '[Check] Activ' : '[Inactive] Inactiv'}
            </span>
            {status.mfaConfigured && !status.mfaEnabled && (<p className="mfa-page__status-note">MFA este configurat dar nu este activat. Completează configurarea.</p>)}
          </div>
        </div>

        {/* Setup Flow */}
        {setupStep === 'idle' && !status.mfaEnabled && (<div className="mfa-page__setup">
            <h3>Activează MFA</h3>
            <p>
              Autentificarea Multi-Factor (MFA) adaugă un nivel suplimentar de securitate. 
              După activare, vei avea nevoie de parolă + cod din Google Authenticator la fiecare login.
            </p>
            <button className="mfa-page__btn mfa-page__btn--primary" onClick={handleSetup} disabled={setupMutation.loading}>
              {setupMutation.loading ? '[Loading] Se generează...' : '[Secure] Activează MFA'}
            </button>
          </div>)}

        {/* QR Code & Verification */}
        {setupStep === 'verify' && (<div className="mfa-page__verify">
            <h3>Verifică și Activează MFA</h3>
            <ol className="mfa-page__steps">
              <li>Deschide Google Authenticator pe telefon</li>
              <li>Scanează codul QR de mai jos</li>
              <li>Introdu codul de 6 cifre din aplicație</li>
            </ol>

            {qrCode && (<div className="mfa-page__qr-container">
                <img src={qrCode} alt="mfa qr code" className="mfa-page__qr-code"/>
                {secret && (<div className="mfa-page__secret-backup">
                    <p><strong>Backup Secret:</strong></p>
                    <code className="mfa-page__secret-code">{secret}</code>
                    <p className="mfa-page__secret-note">
                      [Warning] Salvează acest secret într-un loc sigur pentru recovery!
                    </p>
                  </div>)}
              </div>)}

            <div className="mfa-page__token-input">
              <label htmlFor="mfa-token">Cod MFA (6 cifre):</label>
              <input id="mfa-token" type="text" maxLength={6} value={mfaToken} onChange={function (e) { return setMfaToken(e.target.value.replace(/\D/g, '')); }} placeholder="123456" className="mfa-page__token-field"/>
            </div>

            <div className="mfa-page__actions">
              <button className="mfa-page__btn mfa-page__btn--primary" onClick={handleVerify} disabled={mfaToken.length !== 6 || verifyMutation.loading}>
                {verifyMutation.loading ? '[Loading] Se verifică...' : '[Check] Verifică și Activează'}
              </button>
              <button className="mfa-page__btn mfa-page__btn--secondary" onClick={function () {
                setSetupStep('idle');
                setQrCode(null);
                setSecret(null);
                setMfaToken('');
            }}>Anulează</button>
            </div>
          </div>)}

        {/* Disable MFA */}
        {status.mfaEnabled && (<div className="mfa-page__disable">
            <h3>Dezactivează MFA</h3>
            <p>
              Dezactivarea MFA va elimina securitatea suplimentară. 
              Vei avea nevoie doar de parolă la login.
            </p>
            <button className="mfa-page__btn mfa-page__btn--danger" onClick={handleDisable} disabled={disableMutation.loading}>
              {disableMutation.loading ? '[Loading] Se dezactivează...' : '[Inactive] Dezactivează MFA'}
            </button>
          </div>)}

        {/* Info Section */}
        <div className="mfa-page__info">
          <h3>[Info] Despre MFA</h3>
          <ul>
            <li>[Check] Protecție suplimentară pentru contul tău</li>
            <li>[Check] Cod unic la fiecare login (se schimbă la 30 secunde)</li>
            <li>[Check] Compatibil cu Google Authenticator, Microsoft Authenticator, etc.</li>
            <li>[Check] Backup secret disponibil pentru recovery</li>
          </ul>
        </div>
      </div>
    </div>);
};
exports.MFAPage = MFAPage;
