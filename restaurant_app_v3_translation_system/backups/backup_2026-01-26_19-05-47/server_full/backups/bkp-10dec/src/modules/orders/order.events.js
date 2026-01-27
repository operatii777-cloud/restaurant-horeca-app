/**
 * PHASE S9.1 - Order Event Bus
 * 
 * Unified event bus for order events.
 * Provides a clean, isolated event system for order lifecycle events.
 * 
 * Events:
 * - order:created
 * - order:updated
 * - order:item_ready
 * - order:ready
 * - order:delivered
 * - order:paid
 * - order:cancelled
 */

const EventEmitter = require('events');

class OrderEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Allow many listeners
  }
}

const orderEventBus = new OrderEventBus();

/**
 * Valid order event types
 */
const VALID_ORDER_EVENTS = new Set([
  'order:created',
  'order:updated',
  'order:item_ready',
  'order:ready',
  'order:delivered',
  'order:paid',
  'order:cancelled',
]);

/**
 * Emit an order event safely with validation
 * 
 * @param {string} eventType - Event type (must be in VALID_ORDER_EVENTS)
 * @param {Object} payload - Event payload (should contain 'order' and optional metadata)
 */
function emitOrderEvent(eventType, payload) {
  if (!VALID_ORDER_EVENTS.has(eventType)) {
    console.warn(`[OrderEventBus] Ignored invalid event type: ${eventType}`);
    return;
  }

  if (!payload || typeof payload !== 'object') {
    console.warn(`[OrderEventBus] Invalid payload for event ${eventType}`);
    return;
  }

  try {
    orderEventBus.emit(eventType, payload);
    
    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OrderEventBus] Emitted: ${eventType}`, {
        orderId: payload.order?.id,
        status: payload.order?.status,
      });
    }
  } catch (err) {
    console.error(`[OrderEventBus] Error emitting event ${eventType}:`, err);
  }
}

/**
 * Subscribe to order events
 * 
 * @param {string} eventType - Event type to listen to
 * @param {Function} handler - Event handler function
 * @returns {Function} Unsubscribe function
 */
function onOrderEvent(eventType, handler) {
  if (!VALID_ORDER_EVENTS.has(eventType)) {
    console.warn(`[OrderEventBus] Invalid event type for subscription: ${eventType}`);
    return () => {}; // Return no-op unsubscribe
  }

  orderEventBus.on(eventType, handler);
  
  // Return unsubscribe function
  return () => {
    orderEventBus.removeListener(eventType, handler);
  };
}

/**
 * Subscribe to all order events
 * 
 * @param {Function} handler - Event handler function
 * @returns {Function} Unsubscribe function
 */
function onAnyOrderEvent(handler) {
  const listeners = [];
  
  for (const eventType of VALID_ORDER_EVENTS) {
    orderEventBus.on(eventType, handler);
    listeners.push({ eventType, handler });
  }
  
  // Return unsubscribe function
  return () => {
    for (const { eventType, handler } of listeners) {
      orderEventBus.removeListener(eventType, handler);
    }
  };
}

module.exports = {
  orderEventBus,
  emitOrderEvent,
  onOrderEvent,
  onAnyOrderEvent,
  VALID_ORDER_EVENTS,
};

