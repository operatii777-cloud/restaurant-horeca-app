"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - Payment Sheet Component
 *
 * Main payment modal/drawer for processing payments.
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
exports.PaymentSheet = PaymentSheet;
var react_1 = require("react");
var paymentApi_1 = require("../api/paymentApi");
var useOrderPayments_1 = require("../hooks/useOrderPayments");
var PaymentMethodSelector_1 = require("./PaymentMethodSelector");
var PaymentAmountInput_1 = require("./PaymentAmountInput");
var PaymentsList_1 = require("./PaymentsList");
require("./PaymentSheet.css");
function PaymentSheet(_a) {
    var _this = this;
    var orderId = _a.orderId, totalAmount = _a.totalAmount, onClose = _a.onClose, onPaid = _a.onPaid;
    //   const { t } = useTranslation();
    var _b = (0, useOrderPayments_1.useOrderPayments)(orderId), payments = _b.payments, totalPaid = _b.totalPaid, refreshPayments = _b.refreshPayments;
    var _c = (0, react_1.useState)(null), selectedMethod = _c[0], setSelectedMethod = _c[1];
    var _d = (0, react_1.useState)(0), amount = _d[0], setAmount = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var remaining = totalAmount - totalPaid;
    var isPaid = remaining <= 0.01;
    var handleAddPayment = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedMethod || amount <= 0) {
                        setError('Selectează metoda de plată și suma');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, paymentApi_1.paymentApi.createPayment(orderId, {
                            amount: amount,
                            method: selectedMethod,
                            currency: 'RON',
                        })];
                case 2:
                    _c.sent();
                    // Reset form
                    setSelectedMethod(null);
                    setAmount(remaining);
                    // Refresh payments
                    return [4 /*yield*/, refreshPayments()];
                case 3:
                    // Refresh payments
                    _c.sent();
                    // Check if order is now paid
                    if (onPaid && remaining - amount <= 0.01) {
                        setTimeout(function () {
                            onPaid();
                        }, 500);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _c.sent();
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la adăugarea plății');
                    console.error('PaymentSheet Error adding payment:', err_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="payment-sheet-overlay" onClick={onClose}>
      <div className="payment-sheet" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="payment-sheet-header">
          <h2>Plată Comandă #{orderId}</h2>
          <button className="payment-sheet-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-sheet-content">
          <div className="payment-sheet-summary">
            <div className="payment-summary-row">
              <span>"total comanda"</span>
              <strong>{totalAmount.toFixed(2)} RON</strong>
            </div>
            <div className="payment-summary-row">
              <span>"Plătit:"</span>
              <strong>{totalPaid.toFixed(2)} RON</strong>
            </div>
            <div className="payment-summary-row payment-summary-row--remaining">
              <span>"rest de plata"</span>
              <strong>{remaining.toFixed(2)} RON</strong>
            </div>
          </div>

          {isPaid ? (<div className="payment-sheet-paid">
              <p className="payment-sheet-paid-message">✓ Comanda este plătită complet</p>
              <button className="payment-sheet-paid-btn" onClick={onClose}>"Închide"</button>
            </div>) : (<>
              <PaymentMethodSelector_1.PaymentMethodSelector selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod}/>

              {selectedMethod && (<PaymentAmountInput_1.PaymentAmountInput totalAmount={totalAmount} alreadyPaid={totalPaid} defaultAmount={remaining} onAmountChange={setAmount}/>)}

              {error && <div className="payment-sheet-error">{error}</div>}

              <button className="payment-sheet-add-btn" onClick={handleAddPayment} disabled={!selectedMethod || amount <= 0 || loading}>
                {loading ? '⏳ Se procesează...' : 'Adaugă Plată'}
              </button>
            </>)}

          <PaymentsList_1.PaymentsList payments={payments} onRefresh={refreshPayments}/>
        </div>
      </div>
    </div>);
}
