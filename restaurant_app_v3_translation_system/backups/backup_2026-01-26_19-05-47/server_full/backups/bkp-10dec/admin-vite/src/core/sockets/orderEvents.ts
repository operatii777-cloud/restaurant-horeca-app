/**
 * PHASE S10 - Order Events Adapter
 * 
 * Adapter for order:* events from S9 Order Engine V2.
 * Provides subscription/unsubscription API for React components.
 */

import { getSocket } from './socketClient';
import type { OrderEventType, OrderEventPayload, CanonicalOrder } from '../../types/order';

type OrderEventHandler = (payload: OrderEventPayload) => void;

const handlers: Partial<Record<OrderEventType, Set<OrderEventHandler>>> = {};

let initialized = false;

/**
 * Initialize order event bridge
 * Call this once in your app (e.g., in main.tsx or App.tsx)
 */
export function initOrderEventBridge() {
  if (initialized) {
    console.warn('[OrderEvents] Bridge already initialized');
    return;
  }
  
  const socket = getSocket();
  
  const events: OrderEventType[] = [
    'order:created',
    'order:updated',
    'order:item_ready',
    'order:ready',
    'order:delivered',
    'order:paid',
    'order:cancelled',
  ];
  
  events.forEach((eventType) => {
    socket.on(eventType, (payload: OrderEventPayload) => {
      // Call all registered handlers for this event type
      handlers[eventType]?.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`[OrderEvents] Error in handler for ${eventType}:`, error);
        }
      });
    });
  });
  
  initialized = true;
  console.log('[OrderEvents] Order event bridge initialized');
}

/**
 * Subscribe to an order event
 * 
 * @param type - Event type
 * @param handler - Event handler function
 * @returns Unsubscribe function
 */
export function subscribeOrderEvent(
  type: OrderEventType,
  handler: OrderEventHandler
): () => void {
  if (!handlers[type]) {
    handlers[type] = new Set();
  }
  
  handlers[type]!.add(handler);
  
  // Return unsubscribe function
  return () => {
    unsubscribeOrderEvent(type, handler);
  };
}

/**
 * Unsubscribe from an order event
 */
export function unsubscribeOrderEvent(
  type: OrderEventType,
  handler: OrderEventHandler
) {
  handlers[type]?.delete(handler);
}

/**
 * Subscribe to multiple order events
 */
export function subscribeOrderEvents(
  types: OrderEventType[],
  handler: OrderEventHandler
): () => void {
  const unsubscribers = types.map((type) => subscribeOrderEvent(type, handler));
  
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

/**
 * Subscribe to all order events
 */
export function subscribeAllOrderEvents(
  handler: OrderEventHandler
): () => void {
  const allTypes: OrderEventType[] = [
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

