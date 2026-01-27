/**
 * PHASE S9.1 - Orders Module
 * 
 * Unified order management module with:
 * - Event Bus for order lifecycle events
 * - Canonical Order Mapper for consistent data structure
 * - Order Service for loading and emitting events
 * - Socket.IO Bridge (optional)
 */

const { orderEventBus, emitOrderEvent, onOrderEvent, onAnyOrderEvent, VALID_ORDER_EVENTS } = require('./order.events');
const { mapDbOrderToCanonical, normalizeOrderType, normalizeOrderStatus, parseOrderItems, parseItemOptions } = require('./order.mapper');
const { loadOrderWithItems, emitOrderEventWithLoad, loadOrdersWithItems } = require('./order.service');
const { setupOrderSocketBridge } = require('./order.socket-bridge');

module.exports = {
  // Events
  orderEventBus,
  emitOrderEvent,
  onOrderEvent,
  onAnyOrderEvent,
  VALID_ORDER_EVENTS,
  
  // Mapper
  mapDbOrderToCanonical,
  normalizeOrderType,
  normalizeOrderStatus,
  parseOrderItems,
  parseItemOptions,
  
  // Service
  loadOrderWithItems,
  emitOrderEventWithLoad,
  loadOrdersWithItems,
  
  // Socket Bridge
  setupOrderSocketBridge,
};

