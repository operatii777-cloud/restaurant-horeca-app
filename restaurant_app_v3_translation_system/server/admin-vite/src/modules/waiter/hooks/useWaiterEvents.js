"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Waiter Events Hook
 *
 * Hook to sync Waiter with order events.
 * Filters orders to show only unpaid dine_in orders.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWaiterEvents = useWaiterEvents;
var react_1 = require("react");
var orderEvents_1 = require("@/core/sockets/orderEvents");
var orderStore_1 = require("@/core/store/orderStore");
/**
 * Hook to sync Waiter with order events
 * Only processes unpaid dine_in orders
 */
function useWaiterEvents() {
    var setOrder = (0, orderStore_1.useOrderStore)(function (state) { return state.setOrder; });
    (0, react_1.useEffect)(function () {
        var handleOrderEvent = function (_a) {
            var order = _a.order;
            // Only process dine_in orders
            if (order.type === 'dine_in') {
                setOrder(order);
            }
        };
        var unsubscribeCreated = (0, orderEvents_1.subscribeOrderEvent)('order:created', handleOrderEvent);
        var unsubscribeUpdated = (0, orderEvents_1.subscribeOrderEvent)('order:updated', handleOrderEvent);
        var unsubscribePaid = (0, orderEvents_1.subscribeOrderEvent)('order:paid', handleOrderEvent);
        var unsubscribeCancelled = (0, orderEvents_1.subscribeOrderEvent)('order:cancelled', handleOrderEvent);
        return function () {
            unsubscribeCreated();
            unsubscribeUpdated();
            unsubscribePaid();
            unsubscribeCancelled();
        };
    }, [setOrder]);
}
