"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - Retry Actions Bar Component
 *
 * Action buttons for retry, cancel, and refresh (S11 Part 3).
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
exports.RetryActionsBar = RetryActionsBar;
var react_1 = require("react");
var efacturaApi_1 = require("@/core/api/efacturaApi");
require("./RetryActionsBar.css");
function RetryActionsBar(_a) {
    var invoice = _a.invoice, onUpdate = _a.onUpdate;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    function handleRetry() {
        return __awaiter(this, void 0, void 0, function () {
            var updated, err_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        setLoading(true);
                        setError(null);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, efacturaApi_1.efacturaApi.retryInvoice(invoice.id)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, efacturaApi_1.efacturaApi.refreshStatus(invoice.id)];
                    case 3:
                        updated = _c.sent();
                        onUpdate(updated);
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _c.sent();
                        setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la retry');
                        console.error('RetryActionsBar Error retrying invoice:', err_1);
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function handleCancel() {
        return __awaiter(this, void 0, void 0, function () {
            var updated, err_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!confirm('Sigur vrei să anulezi această factură?')) {
                            return [2 /*return*/];
                        }
                        setLoading(true);
                        setError(null);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, efacturaApi_1.efacturaApi.cancelInvoice(invoice.id)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, efacturaApi_1.efacturaApi.refreshStatus(invoice.id)];
                    case 3:
                        updated = _c.sent();
                        onUpdate(updated);
                        return [3 /*break*/, 6];
                    case 4:
                        err_2 = _c.sent();
                        setError(((_b = (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la anulare');
                        console.error('RetryActionsBar Error cancelling invoice:', err_2);
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function handleRefresh() {
        return __awaiter(this, void 0, void 0, function () {
            var updated, err_3;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        setLoading(true);
                        setError(null);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, efacturaApi_1.efacturaApi.refreshStatus(invoice.id)];
                    case 2:
                        updated = _c.sent();
                        onUpdate(updated);
                        return [3 /*break*/, 5];
                    case 3:
                        err_3 = _c.sent();
                        setError(((_b = (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la reîncărcare');
                        console.error('RetryActionsBar Error refreshing invoice:', err_3);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    var canRetry = ['ERROR', 'REJECTED', 'PENDING_SUBMIT'].includes(invoice.status);
    var canCancel = ['GENERATED', 'PENDING_SUBMIT', 'SUBMITTED'].includes(invoice.status);
    return (<div className="retry-actions-bar">
      {error && (<div className="retry-error">
          <strong>Eroare:</strong> {error}
        </div>)}

      <div className="retry-actions">
        {canRetry && (<button className="retry-btn retry-btn--retry" onClick={handleRetry} disabled={loading}>
            {loading ? '⏳ Se procesează...' : '🔄 Retry e-Factura'}
          </button>)}

        {canCancel && (<button className="retry-btn retry-btn--cancel" onClick={handleCancel} disabled={loading}>
            {loading ? '⏳ Se procesează...' : '❌ Anulează'}
          </button>)}

        <button className="retry-btn retry-btn--refresh" onClick={handleRefresh} disabled={loading}>
          {loading ? '⏳ Se reîncarcă...' : '🔄 Reîncarcă Status'}
        </button>
      </div>
    </div>);
}
