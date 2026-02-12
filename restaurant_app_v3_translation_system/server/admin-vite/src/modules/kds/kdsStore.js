"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - KDS Store
 *
 * Zustand store for KDS (Kitchen Display System).
 * Filters orders to show only kitchen items.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKdsStore = void 0;
var zustand_1 = require("zustand");
var orderStore_1 = require("../../core/store/orderStore");
exports.useKdsStore = (0, zustand_1.create)(function (_set, get) { return ({
    getKitchenOrders: function () {
        var allOrders = orderStore_1.useOrderStore.getState().getOrders();
        // DIRECT MAPPING: Rely on server-side filtering and just check for kitchen items
        // This matches legacy KDS behavior exactly
        return allOrders.filter(function (order) {
            // Check if order has kitchen items
            return order.items.some(function (item) { return item.station === 'kitchen'; });
        });
    },
    getPendingCount: function () {
        var orders = get().getKitchenOrders();
        return orders.filter(function (o) { return o.status === "Pending:"; }).length;
    },
    getPreparingCount: function () {
        var orders = get().getKitchenOrders();
        return orders.filter(function (o) { return o.status === 'preparing'; }).length;
    },
    getReadyCount: function () {
        var orders = get().getKitchenOrders();
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
        // Urgent if more than 20 minutes
        return elapsed > 20 * 60;
    },
}); });
