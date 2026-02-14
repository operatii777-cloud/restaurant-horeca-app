"use strict";
/**
 * PHASE S10 - Delivery Store
 *
 * Zustand store for Delivery interface.
 * Filters orders to show only delivery orders.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeliveryStore = void 0;
var zustand_1 = require("zustand");
var orderStore_1 = require("../../core/store/orderStore");
exports.useDeliveryStore = (0, zustand_1.create)(function (get) { return ({
    getDeliveryOrders: function () {
        var allOrders = orderStore_1.useOrderStore.getState().getOrders();
        // Filter only delivery orders
        return allOrders.filter(function (order) { return order.type === "Delivery"; });
    },
    getOrdersByStatus: function (status) {
        return get().getDeliveryOrders().filter(function (o) { return o.status === status; });
    },
    getReadyCount: function () {
        return get().getOrdersByStatus('ready').length;
    },
    getDeliveredCount: function () {
        return get().getOrdersByStatus('delivered').length;
    },
    getPaidCount: function () {
        return get().getOrdersByStatus('paid').length;
    },
    getElapsedSeconds: function (order) {
        var _a;
        if (!((_a = order.timestamps) === null || _a === void 0 ? void 0 : _a.created_at))
            return 0;
        var created = new Date(order.timestamps.created_at).getTime();
        return Math.floor((Date.now() - created) / 1000);
    },
}); });
