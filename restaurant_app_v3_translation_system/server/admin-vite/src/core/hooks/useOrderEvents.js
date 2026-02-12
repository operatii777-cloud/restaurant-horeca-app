"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Order Events Hook
 *
 * React hook for subscribing to order events.
 * Automatically syncs with orderStore.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOrderEvents = useOrderEvents;
exports.useOrderEvent = useOrderEvent;
var react_1 = require("react");
var orderEvents_1 = require("../sockets/orderEvents");
var orderStore_1 = require("../store/orderStore");
/**
 * Hook to sync order events with orderStore
 */
function useOrderEvents() {
    var setOrder = (0, orderStore_1.useOrderStore)(function (state) { return state.setOrder; });
    var removeOrder = (0, orderStore_1.useOrderStore)(function (state) { return state.removeOrder; });
    (0, react_1.useEffect)(function () {
        // Subscribe to all order events
        var unsubscribeCreated = (0, orderEvents_1.subscribeOrderEvent)('order:created', function (_a) {
            var order = _a.order;
            setOrder(order);
        });
        var unsubscribeUpdated = (0, orderEvents_1.subscribeOrderEvent)('order:updated', function (_a) {
            var order = _a.order;
            setOrder(order);
        });
        var unsubscribeReady = (0, orderEvents_1.subscribeOrderEvent)('order:ready', function (_a) {
            var order = _a.order;
            setOrder(order);
        });
        var unsubscribeDelivered = (0, orderEvents_1.subscribeOrderEvent)('order:delivered', function (_a) {
            var order = _a.order;
            setOrder(order);
        });
        var unsubscribePaid = (0, orderEvents_1.subscribeOrderEvent)('order:paid', function (_a) {
            var order = _a.order;
            setOrder(order);
        });
        var unsubscribeCancelled = (0, orderEvents_1.subscribeOrderEvent)('order:cancelled', function (_a) {
            var order = _a.order;
            // Remove cancelled orders from active view (or keep them, depending on UI needs)
            // For now, we update them so they show as cancelled
            setOrder(order);
        });
        return function () {
            unsubscribeCreated();
            unsubscribeUpdated();
            unsubscribeReady();
            unsubscribeDelivered();
            unsubscribePaid();
            unsubscribeCancelled();
        };
    }, [setOrder, removeOrder]);
}
/**
 * Hook to subscribe to specific order events
 */
function useOrderEvent(eventType, handler) {
    (0, react_1.useEffect)(function () {
        var unsubscribe = (0, orderEvents_1.subscribeOrderEvent)(eventType, handler);
        return unsubscribe;
    }, [eventType, handler]);
}
