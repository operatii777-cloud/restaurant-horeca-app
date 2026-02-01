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

/**
 * BAR Categories constant (pentru filtrare KDS/Bar)
 */
const BAR_CATEGORIES = [
  'Cafea/Ciocolată/Ceai',
  'Răcoritoare',
  'Băuturi și Coctailuri',
  'Vinuri',
  'Băuturi Spirtoase'
];

class OrderEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Allow many listeners
  }
  
  /**
   * Emite eveniment order:created cu toate notificările necesare
   * Centralizează emiterea pentru uniformitate
   */
  emitOrderCreated(order, io = null) {
    // Emite evenimentul principal
    this.emit('order:created', { order });
    
    // Dacă avem Socket.IO, emite către toate room-urile
    if (io) {
      // Emite către toți clienții
      io.emit('order:created', { order });
      
      // Filtrează items pentru KDS (exclude băuturi)
      const kitchenItems = (order.items || []).filter(item => {
        const category = item.category || item.category_name || '';
        return !BAR_CATEGORIES.includes(category);
      });
      
      if (kitchenItems.length > 0) {
        io.to('kitchen').emit('order:created', {
          order: {
            ...order,
            items: kitchenItems
          }
        });
      }
      
      // Filtrează items pentru Bar (doar băuturi)
      const barItems = (order.items || []).filter(item => {
        const category = item.category || item.category_name || '';
        return BAR_CATEGORIES.includes(category);
      });
      
      if (barItems.length > 0) {
        io.to('bar').emit('order:created', {
          order: {
            ...order,
            items: barItems
          }
        });
      }
      
      // Notificări pentru ospătari (pentru takeaway)
      if (order.type === 'takeaway' || order.type === 'TAKEAWAY') {
        io.to('waiter').emit('order:created', { order });
        
        // Emite notificare specifică pentru ospătari
        io.to('waiter').emit('notification:new', {
          id: `notif_${order.id}_${Date.now()}`,
          title: '🍽️ Comandă nouă Takeaway',
          title_en: '🍽️ New Takeaway Order',
          message: `Comanda #${order.id} (Takeaway) a fost creată.`,
          message_en: `Order #${order.id} (Takeaway) has been created.`,
          type: 'new_order',
          order_id: order.id,
          status: 'unread',
          created_at: new Date().toISOString(),
          timestamp: Date.now()
        });
      }
      
      // Emite pentru delivery (dacă e cazul)
      if (order.type === 'delivery' || order.type === 'DELIVERY') {
        io.emit('delivery:new-order', {
          orderId: order.id,
          platform: order.platform || 'UNKNOWN',
          customerName: order.customer_name || '',
          deliveryAddress: order.delivery_address || '',
          total: order.total || 0,
          timestamp: new Date()
        });
      }
    }
  }
  
  /**
   * Filtrează order pentru KDS (exclude băuturi)
   */
  _filterForKitchen(order) {
    return {
      ...order,
      items: (order.items || []).filter(item => {
        const category = item.category || item.category_name || '';
        return !BAR_CATEGORIES.includes(category);
      })
    };
  }
  
  /**
   * Filtrează order pentru Bar (doar băuturi)
   */
  _filterForBar(order) {
    return {
      ...order,
      items: (order.items || []).filter(item => {
        const category = item.category || item.category_name || '';
        return BAR_CATEGORIES.includes(category);
      })
    };
  }
  
  /**
   * Emite evenimentul order:ready
   * Când o comandă este marcată ca "ready", este trimisă către waiter room (livrare1.html)
   * pentru comenzile takeaway/pickup
   */
  emitOrderReady(order, io = null) {
    if (!order || !order.id) {
      console.warn('[OrderEventBus] Invalid order for emitOrderReady');
      return;
    }
    
    // Emite prin event bus
    this.emit('order:ready', { order });
    
    // Emite prin Socket.IO dacă este disponibil
    if (io) {
      // Emite general
      io.emit('order:ready', { order });
      
      // Pentru comenzile takeaway/pickup, trimite către waiter room (livrare1.html)
      if (order.type === 'takeaway' || order.type === 'pickup' || order.type === 'TAKEAWAY' || order.type === 'PICKUP') {
        io.to('waiter').emit('order:ready', { order });
        
        // Trimite notificare specifică pentru ospătari
        io.to('waiter').emit('notification:new', {
          id: `notif_${order.id}_${Date.now()}`,
          title: '🍽️ Comandă gata',
          title_en: '🍽️ Order ready',
          message: `Comanda #${order.id} (${order.type === 'takeaway' || order.type === 'TAKEAWAY' ? 'Takeaway' : 'Pickup'}) este gata.`,
          message_en: `Order #${order.id} (${order.type === 'takeaway' || order.type === 'TAKEAWAY' ? 'Takeaway' : 'Pickup'}) is ready.`,
          type: 'orderReady',
          order_id: order.id,
          table_number: order.table || null,
          status: 'unread',
          created_at: new Date().toISOString(),
          timestamp: Date.now()
        });
      }
      
      // Pentru comenzile delivery, trimite către delivery room
      if (order.type === 'delivery' || order.type === 'DELIVERY') {
        io.to('delivery').emit('order:ready', { order });
      }
      
      // Pentru comenzile la masă, trimite către masa specifică
      if (order.table) {
        io.to(`table:${order.table}`).emit('order:ready', { order });
      }
    }
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
  BAR_CATEGORIES,
};

