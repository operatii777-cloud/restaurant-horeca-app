/**
 * PHASE S9.1 - Order Socket.IO Bridge
 * 
 * Optional bridge between Order Event Bus and Socket.IO.
 * This allows HTML legacy clients to receive order events via WebSocket.
 * 
 * IMPORTANT: This does NOT replace existing socket.io emissions.
 * It only adds new events alongside existing ones.
 */

const { orderEventBus } = require('./order.events');
const dbPromise = require('../../../database');

/**
 * Save notification to database
 * @param {Object} notification - Notification object to save
 */
async function saveNotification(notification) {
  try {
    const db = await dbPromise;
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO notifications (type, title, title_en, message, message_en, order_id, table_number, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        notification.type || 'general',
        notification.title || '',
        notification.title_en || notification.title || '',
        notification.message || '',
        notification.message_en || notification.message || '',
        notification.order_id || null,
        notification.table_number || null,
        notification.status || 'unread',
        notification.created_at || new Date().toISOString()
      ], function(err) {
        if (err) {
          console.error('❌ Error saving notification to DB:', err);
          reject(err);
        } else {
          console.log(`✅ Notification saved to DB with ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      });
    });
  } catch (error) {
    console.error('❌ Error in saveNotification:', error);
  }
}

/**
 * Setup socket.io bridge for order events
 * 
 * @param {Object} io - Socket.IO server instance
 */
function setupOrderSocketBridge(io) {
  if (!io) {
    console.warn('[OrderSocketBridge] Socket.IO instance not provided, bridge not set up');
    return;
  }
  
  console.log('[OrderSocketBridge] Setting up order event bridge to Socket.IO');
  
  // Bridge order:created
  orderEventBus.on('order:created', ({ order, ...extra }) => {
    io.emit('order:created', {
      order,
      ...extra,
    });
    
    // Also emit to specific rooms if needed
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:created', { order, ...extra });
    }
    
    if (order.type === 'delivery') {
      io.to('delivery').emit('order:created', { order, ...extra });
    }
    
    if (order.type === 'drive_thru') {
      io.to('drive-thru').emit('order:created', { order, ...extra });
    }
  });
  
  // Bridge order:updated
  orderEventBus.on('order:updated', ({ order, ...extra }) => {
    // Emit both formats for compatibility
    io.emit('order:updated', {
      order,
      ...extra,
    });
    
    // Also emit orderUpdated (without colon) for legacy frontend compatibility
    io.emit('orderUpdated', {
      order,
      ...extra,
    });
    
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:updated', { order, ...extra });
      io.to(`table:${order.table}`).emit('orderUpdated', { order, ...extra });
    }
  });
  
  // Bridge order:item_ready
  orderEventBus.on('order:item_ready', ({ order, ...extra }) => {
    io.emit('order:item_ready', {
      order,
      ...extra,
    });
    
    // Emit to kitchen/bar rooms
    io.to('kitchen').emit('order:item_ready', { order, ...extra });
    io.to('bar').emit('order:item_ready', { order, ...extra });
    
    // Emit to waiter room for takeaway orders (ospătarii trebuie să știe când comenzile takeaway sunt gata)
    if (order.type === 'takeaway' || order.type === 'TAKEAWAY') {
      io.to('waiter').emit('order:item_ready', { order, ...extra });
      
      // Trimite notificare specifică pentru ospătari
      const station = extra.station || extra.station_name || 'Bucătărie/Bar';
      const stationType = extra.station_type || (station.includes('Bar') || station.includes('bar') ? 'bar' : 'kitchen');
      const stationName = stationType === 'bar' ? 'Bar' : 'Bucătărie';
      
      const notification = {
        id: `notif_${order.id}_${Date.now()}`,
        title: `🍽️ Comandă gata la ${stationName}`,
        title_en: `🍽️ Order ready at ${stationName}`,
        message: `Comanda #${order.id} (Takeaway) este gata la ${stationName}.`,
        message_en: `Order #${order.id} (Takeaway) is ready at ${stationName}.`,
        type: stationType === 'bar' ? 'barReady' : 'kitchenReady',
        order_id: order.id,
        table_number: order.table_number || null,
        status: 'unread',
        created_at: new Date().toISOString(),
        timestamp: Date.now()
      };
      
      // ✅ Save notification to database so it persists across page refreshes
      saveNotification(notification);
      
      // Emit to waiter clients via Socket.IO
      io.to('waiter').emit('notification:new', notification);
    }
  });
  
  // Bridge order:ready
  orderEventBus.on('order:ready', ({ order, ...extra }) => {
    io.emit('order:ready', {
      order,
      ...extra,
    });
    
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:ready', { order, ...extra });
    }
    
    if (order.type === 'delivery') {
      io.to('delivery').emit('order:ready', { order, ...extra });
    }
  });
  
  // Bridge order:delivered
  orderEventBus.on('order:delivered', ({ order, ...extra }) => {
    io.emit('order:delivered', {
      order,
      ...extra,
    });
    
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:delivered', { order, ...extra });
    }
  });
  
  // S17.A - Bridge delivery:assigned (new event for dispatch)
  // This is handled in delivery.controller.js assignCourier function
  // But we can also listen here if needed for additional processing
  
  // Bridge order:paid
  orderEventBus.on('order:paid', ({ order, ...extra }) => {
    io.emit('order:paid', {
      order,
      ...extra,
    });
    
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:paid', { order, ...extra });
    }
  });
  
  // Bridge order:cancelled
  orderEventBus.on('order:cancelled', ({ order, ...extra }) => {
    io.emit('order:cancelled', {
      order,
      ...extra,
    });
    
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:cancelled', { order, ...extra });
    }
    
    if (order.type === 'delivery' && order.courier_id) {
      io.to(`courier_${order.courier_id}`).emit('order:cancelled', { order, ...extra });
    }
  });
  
  console.log('[OrderSocketBridge] Order event bridge set up successfully');
}

module.exports = {
  setupOrderSocketBridge,
};

