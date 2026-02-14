"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - Payments List Component
 *
 * Displays list of payments for an order.
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
exports.PaymentsList = PaymentsList;
var react_1 = require("react");
var paymentApi_1 = require("../api/paymentApi");
require("./PaymentsList.css");
function PaymentsList(_a) {
    var _this = this;
    var payments = _a.payments, onRefresh = _a.onRefresh;
    //   const { t } = useTranslation();
    var handleCancel = function (paymentId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Sigur vrei să anulezi această plată?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, paymentApi_1.paymentApi.cancelPayment(paymentId)];
                case 2:
                    _a.sent();
                    if (onRefresh) {
                        onRefresh();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('PaymentsList Error cancelling payment:', error_1);
                    alert('Eroare la anularea plății');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (payments.length === 0) {
        return (<div className="payments-list-empty">
        <p>"nu exista plati pentru aceasta comanda"</p>
      </div>);
    }
    var totalPaid = payments
        .filter(function (p) { return p.status === 'CAPTURED'; })
        .reduce(function (sum, p) { return sum + p.amount; }, 0);
    return (<div className="payments-list">
      <div className="payments-list-header">
        <h4>"Plăți"</h4>
        <span className="payments-list-total">Total plătit: {totalPaid.toFixed(2)} RON</span>
      </div>
      <div className="payments-list-items">
        {payments.map(function (payment) { return (<div key={payment.id} className="payments-list-item">
            <div className="payments-list-item-info">
              <div className="payments-list-item-method">
                {payment.method} - {payment.amount.toFixed(2)} {payment.currency}
              </div>
              <div className="payments-list-item-status">
                <span className={"payments-status-badge payments-status-badge--".concat(payment.status.toLowerCase())}>
                  {payment.status}
                </span>
              </div>
            </div>
            {payment.status === 'PENDING' && (<button className="payments-list-item-cancel" onClick={function () { return handleCancel(payment.id); }}>"Anulează"</button>)}
          </div>); })}
      </div>
    </div>);
}
