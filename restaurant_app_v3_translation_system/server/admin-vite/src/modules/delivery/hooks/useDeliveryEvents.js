"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Delivery Events Hook
 *
 * Hook to sync Delivery with order events.
 * Filters orders to show only delivery orders.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeliveryEvents = useDeliveryEvents;
var react_1 = require("react");
var orderEvents_1 = require("@/core/sockets/orderEvents");
var orderStore_1 = require("@/core/store/orderStore");
/**
 * Hook to sync Delivery with order events
 * Only processes delivery orders
 */
function useDeliveryEvents() {
    var setOrder = (0, orderStore_1.useOrderStore)(function (state) { return state.setOrder; });
    (0, react_1.useEffect)(function () {
        var handleOrderEvent = function (_a) {
            var order = _a.order;
            // Only process delivery orders
            if (order.type === "Delivery") {
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
