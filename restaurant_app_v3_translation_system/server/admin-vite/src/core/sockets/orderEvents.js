"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Order Events Adapter
 *
 * Adapter for order:* events from S9 Order Engine V2.
 * Provides subscription/unsubscription API for React components.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOrderEventBridge = initOrderEventBridge;
exports.subscribeOrderEvent = subscribeOrderEvent;
exports.unsubscribeOrderEvent = unsubscribeOrderEvent;
exports.subscribeOrderEvents = subscribeOrderEvents;
exports.subscribeAllOrderEvents = subscribeAllOrderEvents;
var socketClient_1 = require("./socketClient");
var handlers = {};
var initialized = false;
/**
 * Initialize order event bridge
 * Call this once in your app (e.g., in main.tsx or App.tsx)
 */
function initOrderEventBridge() {
    if (initialized) {
        console.warn('OrderEvents Bridge already initialized');
        return;
    }
    var socket = (0, socketClient_1.getSocket)();
    var events = [
        'order:created',
        'order:updated',
        'order:item_ready',
        'order:ready',
        'order:delivered',
        'order:paid',
        'order:cancelled',
    ];
    events.forEach(function (eventType) {
        socket.on(eventType, function (payload) {
            var _a;
            // Call all registered handlers for this event type
            (_a = handlers[eventType]) === null || _a === void 0 ? void 0 : _a.forEach(function (handler) {
                try {
                    handler(payload);
                }
                catch (error) {
                    console.error("'OrderEvents' Error in handler for ".concat(eventType, ":"), error);
                }
            });
        });
    });
    initialized = true;
    console.log('OrderEvents Order event bridge initialized');
}
/**
 * Subscribe to an order event
 *
 * @param type - Event type
 * @param handler - Event handler function
 * @returns Unsubscribe function
 */
function subscribeOrderEvent(type, handler) {
    if (!handlers[type]) {
        handlers[type] = new Set();
    }
    handlers[type].add(handler);
    // Return unsubscribe function
    return function () {
        unsubscribeOrderEvent(type, handler);
    };
}
/**
 * Unsubscribe from an order event
 */
function unsubscribeOrderEvent(type, handler) {
    var _a;
    (_a = handlers[type]) === null || _a === void 0 ? void 0 : _a.delete(handler);
}
/**
 * Subscribe to multiple order events
 */
function subscribeOrderEvents(types, handler) {
    var unsubscribers = types.map(function (type) { return subscribeOrderEvent(type, handler); });
    return function () {
        unsubscribers.forEach(function (unsub) { return unsub(); });
    };
}
/**
 * Subscribe to all order events
 */
function subscribeAllOrderEvents(handler) {
    var allTypes = [
        'order:created',
        'order:updated',
        'order:item_ready',
        'order:ready',
        'order:delivered',
        'order:paid',
        'order:cancelled',
    ];
    return subscribeOrderEvents(allTypes, handler);
}
