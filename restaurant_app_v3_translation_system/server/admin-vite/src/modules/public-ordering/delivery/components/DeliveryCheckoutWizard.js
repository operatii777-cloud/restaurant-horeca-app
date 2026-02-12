"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Delivery Checkout Wizard
 * Orchestrates the 3-step checkout process
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
exports.DeliveryCheckoutWizard = DeliveryCheckoutWizard;
var react_1 = require("react");
var DeliveryAddressStep_1 = require("./DeliveryAddressStep");
var DeliveryPaymentStep_1 = require("./DeliveryPaymentStep");
var DeliveryConfirmationStep_1 = require("./DeliveryConfirmationStep");
var useDeliveryOrderApi_1 = require("../hooks/useDeliveryOrderApi");
function DeliveryCheckoutWizard(_a) {
    var _this = this;
    var isOpen = _a.isOpen, cart = _a.cart, onClose = _a.onClose, onOrderCreated = _a.onOrderCreated;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(1), step = _b[0], setStep = _b[1];
    var _c = (0, react_1.useState)(null), addressData = _c[0], setAddressData = _c[1];
    var _d = (0, react_1.useState)(null), paymentMethod = _d[0], setPaymentMethod = _d[1];
    var _e = (0, react_1.useState)(null), orderId = _e[0], setOrderId = _e[1];
    var _f = (0, react_1.useState)(false), isSubmitting = _f[0], setIsSubmitting = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var createDeliveryOrder = (0, useDeliveryOrderApi_1.useDeliveryOrderApi)().createDeliveryOrder;
    if (!isOpen)
        return null;
    var handleAddressSubmit = function (data) {
        //   const { t } = useTranslation();
        setAddressData(data);
        setStep(2);
        setError(null);
    };
    var handlePaymentSubmit = function (method) { return __awaiter(_this, void 0, void 0, function () {
        var createdOrderId, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!addressData) {
                        setError('Datele de adresă lipsesc');
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, createDeliveryOrder(cart, addressData, method)];
                case 2:
                    createdOrderId = _a.sent();
                    setOrderId(createdOrderId);
                    setPaymentMethod(method);
                    setStep(3);
                    onOrderCreated();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message || 'Eroare la trimiterea comenzii. Te rugăm să încerci din nou.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleClose = function () {
        setStep(1);
        setAddressData(null);
        setPaymentMethod(null);
        setOrderId(null);
        setError(null);
        onClose();
    };
    var handleBack = function () {
        if (step === 2) {
            setStep(1);
        }
        else if (step === 1) {
            handleClose();
        }
    };
    return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-[20px]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">"finalizare comanda"</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-xl">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={"flex items-center ".concat(step >= 1 ? 'text-[#FF6B35]' : 'text-gray-400')}>
              <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold ".concat(step >= 1 ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-500')}>
                {step > 1 ? <i className="fas fa-check"></i> : '1'}
              </div>
              <span className="ml-2 text-sm font-semibold">Adresă</span>
            </div>
            <div className={"w-12 h-1 ".concat(step >= 2 ? 'bg-[#FF6B35]' : 'bg-gray-200')}></div>
            <div className={"flex items-center ".concat(step >= 2 ? 'text-[#FF6B35]' : 'text-gray-400')}>
              <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold ".concat(step >= 2 ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-500')}>
                {step > 2 ? <i className="fas fa-check"></i> : '2'}
              </div>
              <span className="ml-2 text-sm font-semibold">Plată</span>
            </div>
            <div className={"w-12 h-1 ".concat(step >= 3 ? 'bg-[#FF6B35]' : 'bg-gray-200')}></div>
            <div className={"flex items-center ".concat(step >= 3 ? 'text-[#FF6B35]' : 'text-gray-400')}>
              <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold ".concat(step >= 3 ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-500')}>
                3
              </div>
              <span className="ml-2 text-sm font-semibold">Confirmare</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (<div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>)}

          {step === 1 && (<DeliveryAddressStep_1.DeliveryAddressStep initialData={addressData || undefined} onSubmit={handleAddressSubmit} onBack={handleBack}/>)}

          {step === 2 && (<DeliveryPaymentStep_1.DeliveryPaymentStep cart={cart} onBack={handleBack} onSubmit={handlePaymentSubmit}/>)}

          {step === 3 && orderId && paymentMethod && (<DeliveryConfirmationStep_1.DeliveryConfirmationStep orderId={orderId} paymentMethod={paymentMethod} total={cart.total} onClose={handleClose}/>)}

          {isSubmitting && (<div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-[20px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
                <p className="text-gray-700 font-semibold">Se trimite comanda...</p>
              </div>
            </div>)}
        </div>
      </div>
    </div>);
}
