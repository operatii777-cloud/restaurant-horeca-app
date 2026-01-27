/**
 * ORDER STATUS NOTIFICATIONS MIDDLEWARE
 * 
 * Emite notificări Socket.IO când statusul comenzilor se schimbă
 * Special pentru comenzile din aplicația mobilă
 */

/**
 * Emite notificări pentru schimbări de status
 */
function emitOrderStatusNotifications(order, oldStatus, newStatus) {
  if (!global.io) return;
  
  // Event general pentru status change
  global.io.emit('order:status-changed', {
    orderId: order.id,
    oldStatus,
    newStatus,
    status: newStatus,
    platform: order.platform,
    type: order.type,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    timestamp: new Date().toISOString(),
  });
  
  // Dacă comanda e din aplicația mobilă
  if (order.platform === 'MOBILE_APP') {
    // Dacă status devine 'ready' pentru pickup/takeout
    if (newStatus === 'ready' && (order.type === 'pickup' || order.type === 'takeout')) {
      global.io.emit('order:ready-for-pickup', {
        orderId: order.id,
        type: order.type,
        platform: 'MOBILE_APP',
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Dacă status devine 'ready' pentru delivery
    if (newStatus === 'ready' && order.type === 'delivery') {
      global.io.emit('order:ready-for-pickup', {
        orderId: order.id,
        type: 'delivery',
        platform: 'MOBILE_APP',
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = {
  emitOrderStatusNotifications,
};
