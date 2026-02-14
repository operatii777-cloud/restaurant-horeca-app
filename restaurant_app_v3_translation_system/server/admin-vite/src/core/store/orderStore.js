"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Global Order Store
 *
 * Zustand store for managing orders across all React modules.
 * Provides centralized cache for active orders.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOrderStore = void 0;
var zustand_1 = require("zustand");
exports.useOrderStore = (0, zustand_1.create)(function (set, get) { return ({
    orders: new Map(),
    setOrder: function (order) {
        set(function (state) {
            var newOrders = new Map(state.orders);
            newOrders.set(order.id, order);
            return { orders: newOrders };
        });
    },
    setOrders: function (orders) {
        set(function () {
            var newOrders = new Map();
            orders.forEach(function (order) {
                newOrders.set(order.id, order);
            });
            return { orders: newOrders };
        });
    },
    removeOrder: function (orderId) {
        set(function (state) {
            var newOrders = new Map(state.orders);
            newOrders.delete(orderId);
            return { orders: newOrders };
        });
    },
    getOrder: function (orderId) {
        return get().orders.get(orderId);
    },
    getOrders: function () {
        return Array.from(get().orders.values());
    },
    getOrdersByStatus: function (status) {
        return Array.from(get().orders.values()).filter(function (order) { return order.status === status; });
    },
    getOrdersByType: function (type) {
        return Array.from(get().orders.values()).filter(function (order) { return order.type === type; });
    },
    clearOrders: function () {
        set({ orders: new Map() });
    },
    getOrderCount: function () {
        return get().orders.size;
    },
    getOrderCountByStatus: function (status) {
        return get().getOrdersByStatus(status).length;
    },
}); });
