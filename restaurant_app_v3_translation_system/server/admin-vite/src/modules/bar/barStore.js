"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Bar Store
 *
 * Zustand store for Bar Display.
 * Filters orders to show only bar items.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBarStore = void 0;
var zustand_1 = require("zustand");
var orderStore_1 = require("../../core/store/orderStore");
exports.useBarStore = (0, zustand_1.create)(function (_set, get) { return ({
    getBarOrders: function () {
        var allOrders = orderStore_1.useOrderStore.getState().getOrders();
        // Filter orders that have bar items
        // DIRECT MAPPING: Rely on server-side filtering and just check for bar items
        // This matches legacy Bar behavior exactly
        return allOrders.filter(function (order) {
            // Check if order has bar items
            return order.items.some(function (item) { return item.station === 'bar'; });
        });
    },
    getPendingCount: function () {
        var orders = get().getBarOrders();
        return orders.filter(function (o) { return o.status === "Pending:"; }).length;
    },
    getPreparingCount: function () {
        var orders = get().getBarOrders();
        return orders.filter(function (o) { return o.status === 'preparing'; }).length;
    },
    getReadyCount: function () {
        var orders = get().getBarOrders();
        return orders.filter(function (o) { return o.status === 'ready'; }).length;
    },
    getElapsedSeconds: function (order) {
        var _a;
        if (!((_a = order.timestamps) === null || _a === void 0 ? void 0 : _a.created_at))
            return 0;
        var created = new Date(order.timestamps.created_at).getTime();
        return Math.floor((Date.now() - created) / 1000);
    },
    isOrderUrgent: function (order) {
        var elapsed = get().getElapsedSeconds(order);
        // Urgent if more than 15 minutes (bar is faster than kitchen)
        return elapsed > 15 * 60;
    },
}); });
