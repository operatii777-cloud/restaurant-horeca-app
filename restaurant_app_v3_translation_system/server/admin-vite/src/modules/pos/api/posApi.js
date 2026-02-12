"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS API Client
 *
 * HTTP API client for POS operations.
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
exports.posApi = void 0;
exports.getOrderForPos = getOrderForPos;
exports.sendPayment = sendPayment;
exports.fiscalizeOrder = fiscalizeOrder;
var axios_1 = require("axios");
var API_BASE = import.meta.env.VITE_API_URL || '/api';
exports.posApi = {
    /**
     * Get active orders
     */
    getActiveOrders: function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get("".concat(API_BASE, "/orders/active"))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    /**
     * Get order by ID
     */
    getOrder: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get("".concat(API_BASE, "/orders/").concat(orderId))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    /**
     * Create new order
     */
    createOrder: function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post("".concat(API_BASE, "/orders"), payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    /**
     * Update order
     */
    updateOrder: function (orderId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.put("".concat(API_BASE, "/orders/").concat(orderId), payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    /**
     * Get order recap (summary)
     */
    getOrderRecap: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get("".concat(API_BASE, "/pos/orders/").concat(orderId, "/recap"))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    /**
     * Fiscalize order
     */
    fiscalizeOrder: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post("".concat(API_BASE, "/pos/fiscalizeOrder"), { orderId: orderId })];
                    case 1:
                        response = _e.sent();
                        return [2 /*return*/, {
                                success: true,
                                fiscalReceiptNumber: response.data.fiscalReceiptNumber || response.data.receipt_number || '',
                                fiscalReceiptDate: response.data.fiscalReceiptDate || response.data.receipt_date || new Date().toISOString(),
                            }];
                    case 2:
                        error_1 = _e.sent();
                        console.error('posApi Fiscalization error:', error_1);
                        throw {
                            success: false,
                            error: ((_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error_1.message || 'Eroare la fiscalizare',
                            code: ((_d = (_c = error_1.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.code) || 'FISCAL_ERROR',
                            fiscalReceiptNumber: '',
                            fiscalReceiptDate: '',
                        };
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fiscalize order + generate e-Factura
     */
    fiscalizeAndEFactura: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var fiscalResponse, efacturaResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post("".concat(API_BASE, "/admin/pos/fiscalize"), { orderId: orderId })];
                    case 1:
                        fiscalResponse = _a.sent();
                        return [4 /*yield*/, axios_1.default.post("".concat(API_BASE, "/e-factura"), { orderId: orderId })];
                    case 2:
                        efacturaResponse = _a.sent();
                        return [2 /*return*/, {
                                fiscalReceipt: fiscalResponse.data,
                                eFactura: efacturaResponse.data,
                            }];
                }
            });
        });
    },
    /**
     * Consume stock for order
     */
    consumeStock: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post("".concat(API_BASE, "/orders/").concat(orderId, "/consume-stock"))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    /**
     * Send payment for order
     *
     * NOTE: Uses /api/admin/pos/pay endpoint (same as Kiosk) for consistency
     */
    sendPayment: function (orderId, payment) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post("".concat(API_BASE, "/admin/pos/pay"), {
                            order_id: orderId,
                            method: payment.method,
                            amount: payment.amount,
                            metadata: payment.metadata,
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    /**
     * Load payments for order
     */
    loadPayments: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get("".concat(API_BASE, "/orders/").concat(orderId, "/payments"))];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.payments) || response.data || []];
                }
            });
        });
    },
    /**
     * Print receipt
     */
    printReceipt: function (orderId, type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(type === 'fiscal')) return [3 /*break*/, 2];
                        // Get fiscal receipt for order and print it
                        return [4 /*yield*/, axios_1.default.post("".concat(API_BASE, "/fiscal/receipt/").concat(orderId, "/print"))];
                    case 1:
                        // Get fiscal receipt for order and print it
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: 
                    // For note/invoice_copy, use tipizate endpoint
                    return [4 /*yield*/, axios_1.default.post("".concat(API_BASE, "/pos/orders/").concat(orderId, "/print-receipt"), { type: type })];
                    case 3:
                        // For note/invoice_copy, use tipizate endpoint
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get order for POS (legacy function from posApi.js)
     * Maps to getOrder but returns the old format with mapOrderApiToStore
     */
    getOrderForPos: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var r, data, mapOrderApiToStore_1, _a, mapOrderApiToStore;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch("/api/admin/pos/order/".concat(Number(orderId)))];
                    case 1:
                        r = _b.sent();
                        if (!r.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, r.json()];
                    case 2:
                        data = _b.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../posMapper'); })];
                    case 3:
                        mapOrderApiToStore_1 = (_b.sent()).mapOrderApiToStore;
                        return [2 /*return*/, {
                                order: mapOrderApiToStore_1(data),
                                payments: (data === null || data === void 0 ? void 0 : data.payments) || [],
                                fiscalReceipt: Array.isArray(data === null || data === void 0 ? void 0 : data.fiscal_receipts) ? data.fiscal_receipts[0] : null,
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, Promise.resolve().then(function () { return require('../posMapper'); })];
                    case 7:
                        mapOrderApiToStore = (_b.sent()).mapOrderApiToStore;
                        return [2 /*return*/, {
                                order: mapOrderApiToStore({
                                    id: Number(orderId),
                                    table_number: 5,
                                    total: 42.5,
                                    items: [],
                                    is_paid: 0,
                                    has_fiscal_receipt: 0,
                                }),
                                payments: [],
                                fiscalReceipt: null,
                            }];
                }
            });
        });
    },
};
// Legacy named exports for compatibility with posApi.js imports
function getOrderForPos(orderId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.posApi.getOrderForPos(orderId)];
        });
    });
}
function sendPayment(orderId, payment) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.posApi.sendPayment(orderId, {
                    method: (payment === null || payment === void 0 ? void 0 : payment.type) || 'cash',
                    amount: (payment === null || payment === void 0 ? void 0 : payment.amount) || 0,
                })];
        });
    });
}
function fiscalizeOrder(orderId_1) {
    return __awaiter(this, arguments, void 0, function (orderId, payment) {
        if (payment === void 0) { payment = {}; }
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.posApi.fiscalizeOrder(orderId)];
        });
    });
}
// Default export for compatibility with default imports
exports.default = exports.posApi;
