"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - KDS Events Hook
 *
 * Hook to sync KDS with order events.
 * Filters orders to show only kitchen items.
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
exports.useKdsEvents = useKdsEvents;
var react_1 = require("react");
var axios_1 = require("axios");
var orderEvents_1 = require("@/core/sockets/orderEvents");
var orderStore_1 = require("@/core/store/orderStore");
var orderMapper_1 = require("@/core/utils/orderMapper");
var API_BASE = import.meta.env.VITE_API_URL || '/api';
/**
 * Hook to sync KDS with order events
 * Only processes orders that have kitchen items
 */
function useKdsEvents() {
    var _this = this;
    var setOrder = (0, orderStore_1.useOrderStore)(function (state) { return state.setOrder; });
    var setOrders = (0, orderStore_1.useOrderStore)(function (state) { return state.setOrders; });
    // Initial fetch of unfinished kitchen orders
    (0, react_1.useEffect)(function () {
        var fetchInitialOrders = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, canonicalOrders, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get('/api/orders/orders-display/kitchen')];
                    case 1:
                        response = _a.sent();
                        if (response.data && Array.isArray(response.data.orders)) {
                            canonicalOrders = response.data.orders.map(orderMapper_1.mapRawOrderToCanonical);
                            setOrders(canonicalOrders);
                            console.log("\u2705 [KDS] Loaded ".concat(canonicalOrders.length, " initial orders"));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ [KDS] Error fetching initial orders:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchInitialOrders();
    }, [setOrders]);
    (0, react_1.useEffect)(function () {
        var handleOrderEvent = function (_a) {
            var _b;
            var order = _a.order;
            // If the order is already canonical (from WebSocket payload S10), use it directly
            // Otherwise map it (if legacy event)
            var canonicalOrder = order.id ? (0, orderMapper_1.mapRawOrderToCanonical)(order) : order;
            // Only process orders that have kitchen items
            var hasKitchenItems = (_b = canonicalOrder.items) === null || _b === void 0 ? void 0 : _b.some(function (item) { return item.station === 'kitchen'; });
            if (hasKitchenItems) {
                setOrder(canonicalOrder);
            }
        };
        var unsubscribeCreated = (0, orderEvents_1.subscribeOrderEvent)('order:created', handleOrderEvent);
        var unsubscribeUpdated = (0, orderEvents_1.subscribeOrderEvent)('order:updated', handleOrderEvent);
        var unsubscribeItemReady = (0, orderEvents_1.subscribeOrderEvent)('order:item_ready', handleOrderEvent);
        var unsubscribeReady = (0, orderEvents_1.subscribeOrderEvent)('order:ready', handleOrderEvent);
        var unsubscribeCancelled = (0, orderEvents_1.subscribeOrderEvent)('order:cancelled', handleOrderEvent);
        return function () {
            unsubscribeCreated();
            unsubscribeUpdated();
            unsubscribeItemReady();
            unsubscribeReady();
            unsubscribeCancelled();
        };
    }, [setOrder]);
}
