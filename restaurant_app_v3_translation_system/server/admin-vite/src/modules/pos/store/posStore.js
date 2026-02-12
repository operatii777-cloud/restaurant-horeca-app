"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Store
 *
 * Zustand store for POS interface.
 * Manages current order, mode, table, customer, and draft items.
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePosStore = void 0;
var zustand_1 = require("zustand");
exports.usePosStore = (0, zustand_1.create)(function (set, get) { return ({
    currentMode: 'TABLES',
    currentOrderId: null,
    draftItems: [],
    order: null,
    selectedTableId: null,
    customer: null,
    payments: [],
    splitBill: null,
    selectedGroupId: null,
    priceTier: 1,
    fiscalReceiptNumber: null,
    fiscalReceiptDate: null,
    isFiscalized: false,
    isStockConsumed: false,
    setMode: function (mode) { return set({ currentMode: mode }); },
    setTable: function (tableId) { return set({ selectedTableId: tableId }); },
    setCustomer: function (customer) { return set({ customer: customer }); },
    addItem: function (item) {
        var existing = get().draftItems.find(function (i) { return i.productId === item.productId; });
        var newItem = __assign(__assign({}, item), { id: item.id || "item-".concat(Date.now(), "-").concat(Math.random()) });
        if (existing) {
            set({
                draftItems: get().draftItems.map(function (i) {
                    return i.productId === item.productId
                        ? __assign(__assign({}, i), { qty: i.qty + item.qty, total: (i.qty + item.qty) * i.unitPrice }) : i;
                }),
            });
        }
        else {
            set({ draftItems: __spreadArray(__spreadArray([], get().draftItems, true), [newItem], false) });
        }
        get().updateTotals();
    },
    removeItem: function (productId) {
        set({ draftItems: get().draftItems.filter(function (i) { return i.productId !== productId; }) });
        get().updateTotals();
    },
    increaseQty: function (productId) {
        var item = get().draftItems.find(function (i) { return i.productId === productId; });
        if (item) {
            get().updateItemQty(productId, item.qty + 1);
        }
    },
    decreaseQty: function (productId) {
        var item = get().draftItems.find(function (i) { return i.productId === productId; });
        if (item && item.qty > 1) {
            get().updateItemQty(productId, item.qty - 1);
        }
        else if (item && item.qty === 1) {
            get().removeItem(productId);
        }
    },
    updateItemQty: function (productId, qty) {
        if (qty <= 0) {
            get().removeItem(productId);
        }
        else {
            set({
                draftItems: get().draftItems.map(function (i) {
                    return i.productId === productId
                        ? __assign(__assign({}, i), { qty: qty, total: qty * i.unitPrice }) : i;
                }),
            });
            get().updateTotals();
        }
    },
    addNote: function (productId, note) {
        get().updateItemNotes(productId, note);
    },
    updateItemNotes: function (productId, notes) {
        set({
            draftItems: get().draftItems.map(function (i) {
                return i.productId === productId ? __assign(__assign({}, i), { notes: notes }) : i;
            }),
        });
    },
    updateItemOptions: function (productId, options) {
        set({
            draftItems: get().draftItems.map(function (i) {
                return i.productId === productId ? __assign(__assign({}, i), { options: options }) : i;
            }),
        });
    },
    // Payments
    addPayment: function (payment) {
        var newPayment = __assign(__assign({}, payment), { id: payment.id || "payment-".concat(Date.now(), "-").concat(Math.random()), timestamp: payment.timestamp || new Date() });
        set({ payments: __spreadArray(__spreadArray([], get().payments, true), [newPayment], false) });
    },
    removePayment: function (paymentId) {
        set({ payments: get().payments.filter(function (p) { return p.id !== paymentId; }) });
    },
    clearPayments: function () {
        set({ payments: [] });
    },
    // Split Bill
    setSplitBill: function (splitPayload) {
        var _a;
        set({ splitBill: splitPayload, selectedGroupId: ((_a = splitPayload.groups[0]) === null || _a === void 0 ? void 0 : _a.id) || null });
    },
    clearSplitBill: function () {
        set({ splitBill: null, selectedGroupId: null });
    },
    setSelectedGroup: function (groupId) {
        set({ selectedGroupId: groupId });
    },
    setPriceTier: function (tier) {
        set({ priceTier: tier });
    },
    getGroupTotal: function (groupId) {
        var splitBill = get().splitBill;
        if (!splitBill)
            return 0;
        var group = splitBill.groups.find(function (g) { return g.id === groupId; });
        return (group === null || group === void 0 ? void 0 : group.total) || 0;
    },
    getGroupPaid: function (groupId) {
        return get()
            .payments.filter(function (p) { return p.groupId === groupId; })
            .reduce(function (sum, p) { return sum + p.amount; }, 0);
    },
    getGroupRemaining: function (groupId) {
        var total = get().getGroupTotal(groupId);
        var paid = get().getGroupPaid(groupId);
        var remaining = total - paid;
        return remaining > 0 ? Math.round(remaining * 100) / 100 : 0;
    },
    areAllGroupsPaid: function () {
        var splitBill = get().splitBill;
        if (!splitBill)
            return false;
        return splitBill.groups.every(function (group) {
            var remaining = get().getGroupRemaining(group.id);
            return remaining <= 0.01;
        });
    },
    // Fiscalization
    setFiscalData: function (data) {
        set({
            fiscalReceiptNumber: data.fiscalReceiptNumber,
            fiscalReceiptDate: data.fiscalReceiptDate,
            isFiscalized: true,
        });
    },
    markFiscalized: function () {
        set({ isFiscalized: true });
    },
    markStockConsumed: function () {
        set({ isStockConsumed: true });
    },
    // Order Management
    loadOrderFromServer: function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var posApi, order, draftItems, orderPayments, payments, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../api/posApi'); })];
                case 1:
                    posApi = (_b.sent()).posApi;
                    return [4 /*yield*/, posApi.getOrder(orderId)];
                case 2:
                    order = _b.sent();
                    draftItems = (order.items || []).map(function (item, index) { return ({
                        id: "item-".concat(orderId, "-\"Index\""),
                        productId: item.product_id || item.productId,
                        name: item.name || item.product_name || 'Produs',
                        qty: item.quantity || item.qty || 1,
                        unitPrice: item.price || item.unit_price || 0,
                        total: (item.quantity || item.qty || 1) * (item.price || item.unit_price || 0),
                        notes: item.notes,
                        options: item.options,
                    }); });
                    orderPayments = order.payments || order.payment || [];
                    payments = (Array.isArray(orderPayments) ? orderPayments : 'orderPayments').map(function (payment, index) { return ({
                        id: payment.id || "payment-".concat(orderId, "-\"Index\""),
                        type: payment.type || payment.method || 'cash',
                        amount: payment.amount || 0,
                        timestamp: payment.timestamp ? new Date(payment.timestamp) : new Date(),
                        reference: payment.reference,
                    }); });
                    set({
                        currentOrderId: order.id,
                        draftItems: draftItems,
                        payments: payments,
                        selectedTableId: order.table_id || order.table || null,
                        order: {
                            id: order.id,
                            tableId: order.table_id || order.table || null,
                            status: order.status || "Pending:",
                            items: draftItems,
                            payments: payments,
                            subtotal: order.subtotal || get().getSubtotal(),
                            tax: order.tax || get().getTax(),
                            total: order.total || ((_a = order.totals) === null || _a === void 0 ? void 0 : _a.total) || get().getTotal(),
                        },
                    });
                    get().updateTotals();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error('posStore Error loading order:', error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    }); },
    updateTotals: function () {
        var subtotal = get().getSubtotal();
        var tax = get().getTax();
        var total = subtotal + tax;
        set(function (state) { return ({
            order: state.order
                ? __assign(__assign({}, state.order), { subtotal: subtotal, tax: tax, total: total, items: state.draftItems }) : null,
        }); });
    },
    resetDraft: function () {
        set({
            draftItems: [],
            currentOrderId: null,
            selectedTableId: null,
            customer: null,
            payments: [],
            order: null,
            splitBill: null,
            selectedGroupId: null,
            fiscalReceiptNumber: null,
            fiscalReceiptDate: null,
            isFiscalized: false,
            isStockConsumed: false,
        });
    },
    // Computed
    getDraftTotal: function () {
        return get().draftItems.reduce(function (sum, item) { return sum + item.total; }, 0);
    },
    getDraftItemCount: function () {
        return get().draftItems.reduce(function (sum, item) { return sum + item.qty; }, 0);
    },
    getSubtotal: function () {
        return get().getDraftTotal();
    },
    getTax: function () {
        // VAT 19% (can be made configurable)
        var subtotal = get().getSubtotal();
        return Math.round(subtotal * 0.19 * 100) / 100;
    },
    getTotal: function () {
        return get().getSubtotal() + get().getTax();
    },
    getTotalPaid: function () {
        return get().payments.reduce(function (sum, payment) { return sum + payment.amount; }, 0);
    },
    getRemaining: function () {
        var total = get().getTotal();
        var paid = get().getTotalPaid();
        var remaining = total - paid;
        return remaining > 0 ? Math.round(remaining * 100) / 100 : 0;
    },
}); });
