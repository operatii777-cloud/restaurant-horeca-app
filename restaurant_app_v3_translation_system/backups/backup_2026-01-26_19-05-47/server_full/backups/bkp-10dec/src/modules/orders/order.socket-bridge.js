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
    io.emit('order:updated', {
      order,
      ...extra,
    });
    
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:updated', { order, ...extra });
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

