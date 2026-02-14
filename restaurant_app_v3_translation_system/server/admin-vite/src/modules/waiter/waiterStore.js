"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Waiter Store
 *
 * Zustand store for Waiter/Supervisor interface.
 * Filters orders to show unpaid orders for tables.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWaiterStore = void 0;
var zustand_1 = require("zustand");
var orderStore_1 = require("../../core/store/orderStore");
exports.useWaiterStore = (0, zustand_1.create)(function (get) { return ({
    getUnpaidOrders: function () {
        var allOrders = orderStore_1.useOrderStore.getState().getOrders();
        // Filter unpaid dine_in orders
        return allOrders.filter(function (order) {
            return order.type === 'dine_in' && !order.is_paid;
        });
    },
    getOrdersByTable: function (tableNumber) {
        return get().getUnpaidOrders().filter(function (order) { return String(order.table) === String(tableNumber); });
    },
    getOrdersByWaiter: function (waiterId) {
        return get().getUnpaidOrders().filter(function (order) { return order.waiter_id === waiterId; });
    },
    getUnpaidCount: function () {
        return get().getUnpaidOrders().length;
    },
    getTotalUnpaid: function () {
        return get().getUnpaidOrders().reduce(function (sum, order) { return sum + order.totals.total; }, 0);
    },
    getElapsedSeconds: function (order) {
        var _a;
        if (!((_a = order.timestamps) === null || _a === void 0 ? void 0 : _a.created_at))
            return 0;
        var created = new Date(order.timestamps.created_at).getTime();
        return Math.floor((Date.now() - created) / 1000);
    },
}); });
