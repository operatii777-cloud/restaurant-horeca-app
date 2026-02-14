"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Drive-Thru Events Hook
 *
 * Hook to sync Drive-Thru with order events.
 * Filters orders to show only drive-thru orders.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDriveThruEvents = useDriveThruEvents;
var react_1 = require("react");
var orderEvents_1 = require("@/core/sockets/orderEvents");
var orderStore_1 = require("@/core/store/orderStore");
/**
 * Hook to sync Drive-Thru with order events
 * Only processes drive-thru orders
 */
function useDriveThruEvents() {
    var setOrder = (0, orderStore_1.useOrderStore)(function (state) { return state.setOrder; });
    (0, react_1.useEffect)(function () {
        var handleOrderEvent = function (_a) {
            var order = _a.order;
            // Only process drive-thru orders
            if (order.type === 'drive_thru') {
                setOrder(order);
            }
        };
        var unsubscribeCreated = (0, orderEvents_1.subscribeOrderEvent)('order:created', handleOrderEvent);
        var unsubscribeUpdated = (0, orderEvents_1.subscribeOrderEvent)('order:updated', handleOrderEvent);
        var unsubscribeReady = (0, orderEvents_1.subscribeOrderEvent)('order:ready', handleOrderEvent);
        var unsubscribeDelivered = (0, orderEvents_1.subscribeOrderEvent)('order:delivered', handleOrderEvent);
        var unsubscribePaid = (0, orderEvents_1.subscribeOrderEvent)('order:paid', handleOrderEvent);
        var unsubscribeCancelled = (0, orderEvents_1.subscribeOrderEvent)('order:cancelled', handleOrderEvent);
        return function () {
            unsubscribeCreated();
            unsubscribeUpdated();
            unsubscribeReady();
            unsubscribeDelivered();
            unsubscribePaid();
            unsubscribeCancelled();
        };
    }, [setOrder]);
}
