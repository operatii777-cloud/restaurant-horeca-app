"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 3.C - Sync Engine for Offline POS
 *
 * Handles syncing of offline orders and payments to server
 * Conflict resolution
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
exports.isOnline = isOnline;
exports.syncAll = syncAll;
exports.startAutoSync = startAutoSync;
var indexeddb_1 = require("../db/indexeddb");
var httpClient_1 = require("@/shared/api/httpClient");
/**
 * Check if online
 */
function isOnline() {
    return navigator.onLine;
}
/**
 * Sync all pending items
 */
function syncAll() {
    return __awaiter(this, void 0, void 0, function () {
        var result, unsyncedOrders, _i, unsyncedOrders_1, order, response, error_1, pendingItems, _a, pendingItems_1, item, data, response, error_2, error_3;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!isOnline()) {
                        return [2 /*return*/, { success: false, synced: 0, failed: 0, conflicts: 0 }];
                    }
                    result = {
                        success: true,
                        synced: 0,
                        failed: 0,
                        conflicts: 0,
                    };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 27, , 28]);
                    return [4 /*yield*/, (0, indexeddb_1.getUnsyncedOrders)()];
                case 2:
                    unsyncedOrders = _d.sent();
                    _i = 0, unsyncedOrders_1 = unsyncedOrders;
                    _d.label = 3;
                case 3:
                    if (!(_i < unsyncedOrders_1.length)) return [3 /*break*/, 11];
                    order = unsyncedOrders_1[_i];
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 9, , 10]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/orders', {
                            type: order.type,
                            items: JSON.parse(order.items),
                            table_number: order.table_number,
                            total: order.total,
                        })];
                case 5:
                    response = _d.sent();
                    if (!(response.data && response.data.id)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, indexeddb_1.markOrderSynced)(order.localId, response.data.id)];
                case 6:
                    _d.sent();
                    result.synced++;
                    return [3 /*break*/, 8];
                case 7:
                    result.failed++;
                    _d.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_1 = _d.sent();
                    // Check for conflicts (e.g., table already occupied)
                    if (((_b = error_1.response) === null || _b === void 0 ? void 0 : _b.status) === 409) {
                        result.conflicts++;
                    }
                    else {
                        result.failed++;
                    }
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11: return [4 /*yield*/, (0, indexeddb_1.getPendingSyncItems)()];
                case 12:
                    pendingItems = _d.sent();
                    _a = 0, pendingItems_1 = pendingItems;
                    _d.label = 13;
                case 13:
                    if (!(_a < pendingItems_1.length)) return [3 /*break*/, 26];
                    item = pendingItems_1[_a];
                    _d.label = 14;
                case 14:
                    _d.trys.push([14, 24, , 25]);
                    data = JSON.parse(item.data);
                    response = void 0;
                    if (!(item.action === 'create')) return [3 /*break*/, 16];
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/".concat(item.type, "s"), data)];
                case 15:
                    response = _d.sent();
                    return [3 /*break*/, 20];
                case 16:
                    if (!(item.action === 'update')) return [3 /*break*/, 18];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/".concat(item.type, "s/").concat(item.entityId), data)];
                case 17:
                    response = _d.sent();
                    return [3 /*break*/, 20];
                case 18: return [4 /*yield*/, httpClient_1.httpClient.delete("/api/".concat(item.type, "s/").concat(item.entityId))];
                case 19:
                    response = _d.sent();
                    _d.label = 20;
                case 20:
                    if (!response.data) return [3 /*break*/, 22];
                    return [4 /*yield*/, (0, indexeddb_1.markSyncItemSynced)(item.id)];
                case 21:
                    _d.sent();
                    result.synced++;
                    return [3 /*break*/, 23];
                case 22:
                    result.failed++;
                    _d.label = 23;
                case 23: return [3 /*break*/, 25];
                case 24:
                    error_2 = _d.sent();
                    if (((_c = error_2.response) === null || _c === void 0 ? void 0 : _c.status) === 409) {
                        result.conflicts++;
                    }
                    else {
                        result.failed++;
                    }
                    return [3 /*break*/, 25];
                case 25:
                    _a++;
                    return [3 /*break*/, 13];
                case 26: return [3 /*break*/, 28];
                case 27:
                    error_3 = _d.sent();
                    console.error('Sync error:', error_3);
                    result.success = false;
                    return [3 /*break*/, 28];
                case 28: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Auto-sync when online
 */
function startAutoSync(intervalMs) {
    var _this = this;
    if (intervalMs === void 0) { intervalMs = 30000; }
    if (!isOnline()) {
        return;
    }
    var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isOnline()) return [3 /*break*/, 2];
                    return [4 /*yield*/, syncAll()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    clearInterval(interval);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); }, intervalMs);
    // Also sync on online event
    window.addEventListener('online', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, syncAll()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    return interval;
}
