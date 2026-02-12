"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Drive-Thru Store
 *
 * Zustand store for Drive-Thru interface.
 * Filters orders to show only drive-thru orders.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDriveThruStore = void 0;
var zustand_1 = require("zustand");
var orderStore_1 = require("../../core/store/orderStore");
exports.useDriveThruStore = (0, zustand_1.create)(function (_set, get) { return ({
    getDriveThruOrders: function () {
        var allOrders = orderStore_1.useOrderStore.getState().getOrders();
        // Filter only drive-thru orders
        return allOrders.filter(function (order) { return order.type === 'drive_thru'; });
    },
    getOrdersByLane: function (laneNumber) {
        return get().getDriveThruOrders().filter(function (order) { var _a; return ((_a = order.drive_thru) === null || _a === void 0 ? void 0 : _a.lane_number) === String(laneNumber); });
    },
    getOrdersByStatus: function (status) {
        return get().getDriveThruOrders().filter(function (o) { return o.status === status; });
    },
    getPendingCount: function () {
        return get().getOrdersByStatus("Pending:").length;
    },
    getReadyCount: function () {
        return get().getOrdersByStatus('ready_for_pickup').length;
    },
    getServedCount: function () {
        return get().getOrdersByStatus('served').length;
    },
    getElapsedSeconds: function (order) {
        var _a;
        if (!((_a = order.timestamps) === null || _a === void 0 ? void 0 : _a.created_at))
            return 0;
        var created = new Date(order.timestamps.created_at).getTime();
        return Math.floor((Date.now() - created) / 1000);
    },
}); });
