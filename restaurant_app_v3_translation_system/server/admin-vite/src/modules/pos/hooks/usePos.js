"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - POS Hook
 *
 * Main hook for POS operations, exposing payment sheet controls and order management
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
exports.usePos = usePos;
var react_1 = require("react");
var posStore_1 = require("../store/posStore");
var posApi_1 = require("../api/posApi");
function usePos() {
    var _this = this;
    var _a = (0, posStore_1.usePosStore)(), currentOrderId = _a.currentOrderId, draftItems = _a.draftItems, payments = _a.payments, order = _a.order, splitBill = _a.splitBill, areAllGroupsPaid = _a.areAllGroupsPaid, isFiscalized = _a.isFiscalized, isStockConsumed = _a.isStockConsumed, fiscalReceiptNumber = _a.fiscalReceiptNumber, fiscalReceiptDate = _a.fiscalReceiptDate, getTotal = _a.getTotal, getTotalPaid = _a.getTotalPaid, getRemaining = _a.getRemaining, getSubtotal = _a.getSubtotal, getTax = _a.getTax, getDraftTotal = _a.getDraftTotal, getDraftItemCount = _a.getDraftItemCount, loadOrderFromServer = _a.loadOrderFromServer, resetDraft = _a.resetDraft, setFiscalData = _a.setFiscalData, markFiscalized = _a.markFiscalized, markStockConsumed = _a.markStockConsumed;
    var _b = (0, react_1.useState)(false), fiscalizing = _b[0], setFiscalizing = _b[1];
    var _c = (0, react_1.useState)(false), consumingStock = _c[0], setConsumingStock = _c[1];
    var getOrder = (0, react_1.useCallback)(function () {
        if (!currentOrderId)
            return null;
        return order || {
            id: currentOrderId,
            items: draftItems,
            payments: payments,
            subtotal: getSubtotal(),
            tax: getTax(),
            total: getTotal(),
        };
    }, [currentOrderId, order, draftItems, payments, getSubtotal, getTax, getTotal]);
    var getRemainingToPay = (0, react_1.useCallback)(function () {
        return getRemaining();
    }, [getRemaining]);
    var openPaymentSheet = (0, react_1.useCallback)(function () {
        // Payment sheet is controlled by parent component (PosPage)
        // This hook just provides the state
        return true;
    }, []);
    var closePaymentSheet = (0, react_1.useCallback)(function () {
        // Payment sheet is controlled by parent component (PosPage)
        return true;
    }, []);
    var handlePaymentCompleted = (0, react_1.useCallback)(function (orderAfterPayment) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentOrderId) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, loadOrderFromServer(currentOrderId)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('usePos Error reloading order after payment:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, orderAfterPayment];
            }
        });
    }); }, [currentOrderId, loadOrderFromServer]);
    var isReadyForFiscalization = (0, react_1.useCallback)(function () {
        if (isFiscalized)
            return false; // Already fiscalized
        if (splitBill) {
            return areAllGroupsPaid();
        }
        return getRemainingToPay() <= 0.01;
    }, [isFiscalized, splitBill, areAllGroupsPaid, getRemainingToPay]);
    var hasAllGroupsPaid = (0, react_1.useCallback)(function () {
        if (!splitBill)
            return false;
        return areAllGroupsPaid();
    }, [splitBill, areAllGroupsPaid]);
    var fiscalize = (0, react_1.useCallback)(function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var fiscalResult, stockError_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (fiscalizing || isFiscalized) {
                        throw new Error('Comanda este deja fiscalizată sau se procesează');
                    }
                    setFiscalizing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    return [4 /*yield*/, posApi_1.posApi.fiscalizeOrder(orderId)];
                case 2:
                    fiscalResult = _a.sent();
                    if (!fiscalResult.success) {
                        throw new Error(fiscalResult.error || 'Eroare la fiscalizare');
                    }
                    // Step 2: Store fiscal data
                    setFiscalData({
                        fiscalReceiptNumber: fiscalResult.fiscalReceiptNumber,
                        fiscalReceiptDate: fiscalResult.fiscalReceiptDate,
                    });
                    markFiscalized();
                    // Step 3: Consume stock
                    setConsumingStock(true);
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, 6, 7]);
                    return [4 /*yield*/, posApi_1.posApi.consumeStock(orderId)];
                case 4:
                    _a.sent();
                    markStockConsumed();
                    return [3 /*break*/, 7];
                case 5:
                    stockError_1 = _a.sent();
                    console.error('usePos Stock consumption error:', stockError_1);
                    return [3 /*break*/, 7];
                case 6:
                    setConsumingStock(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/, fiscalResult];
                case 8:
                    error_2 = _a.sent();
                    console.error('usePos Fiscalization error:', error_2);
                    throw error_2;
                case 9:
                    setFiscalizing(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [fiscalizing, isFiscalized, setFiscalData, markFiscalized, markStockConsumed]);
    return {
        // Order state
        order: getOrder(),
        currentOrderId: currentOrderId,
        draftItems: draftItems,
        payments: payments,
        splitBill: splitBill,
        // Computed values
        orderTotal: getTotal(),
        subtotal: getSubtotal(),
        tax: getTax(),
        totalPaid: getTotalPaid(),
        remainingToPay: getRemainingToPay(),
        draftTotal: getDraftTotal(),
        draftItemCount: getDraftItemCount(),
        // Fiscalization state
        isFiscalized: isFiscalized,
        isStockConsumed: isStockConsumed,
        fiscalReceiptNumber: fiscalReceiptNumber,
        fiscalReceiptDate: fiscalReceiptDate,
        fiscalizing: fiscalizing,
        consumingStock: consumingStock,
        // Actions
        openPaymentSheet: openPaymentSheet,
        closePaymentSheet: closePaymentSheet,
        handlePaymentCompleted: handlePaymentCompleted,
        loadOrder: loadOrderFromServer,
        resetDraft: resetDraft,
        fiscalize: fiscalize,
        // Helpers
        isOrderFullyPaid: getRemainingToPay() <= 0.01,
        hasItems: draftItems.length > 0,
        isReadyForFiscalization: isReadyForFiscalization(),
        hasAllGroupsPaid: hasAllGroupsPaid(),
    };
}
