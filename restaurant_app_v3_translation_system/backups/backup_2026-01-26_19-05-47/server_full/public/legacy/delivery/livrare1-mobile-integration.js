/**
 * MOBILE APP INTEGRATION - livrare1.html
 * 
 * Adaugă suport pentru comenzile din aplicația mobilă:
 * - Notificări pentru comenzi pickup
 * - Notificări pentru comenzi delivery
 * - Tracking status changes
 */

// Adaugă listeners pentru comenzile mobile (după inițializarea socket-ului)
function initializeMobileOrderListeners() {
  // Listener pentru comenzi pickup din aplicația mobilă
  socket.on('mobile:pickup-order', (orderData) => {
    console.log('📱 [Mobile] Nouă comandă pickup:', orderData);
    
    // Afișează notificare
    showMobileOrderNotification({
      type: 'pickup',
      orderId: orderData.orderId,
      customerName: orderData.customer_name,
      customerPhone: orderData.customer_phone,
      total: orderData.total,
      message: `Comandă pickup #${orderData.orderId} - ${orderData.customer_name || 'Client'}`,
    });
    
    // Sună notificare
    playSound('/notif1.mp3');
    
    // Reîncarcă comenzile
    loadCompletedOrders();
  });
  
  // Listener pentru comenzi delivery din aplicația mobilă
  socket.on('mobile:delivery-order', (orderData) => {
    console.log('📱 [Mobile] Nouă comandă delivery:', orderData);
    
    // Afișează notificare
    showMobileOrderNotification({
      type: 'delivery',
      orderId: orderData.orderId,
      customerName: orderData.customer_name,
      customerPhone: orderData.customer_phone,
      deliveryAddress: orderData.delivery_address,
      total: orderData.total,
      message: `Comandă delivery #${orderData.orderId} - ${orderData.delivery_address || 'Adresă necunoscută'}`,
    });
    
    // Sună notificare
    playSound('/notif1.mp3');
    
    // Reîncarcă comenzile
    loadCompletedOrders();
  });
  
  // Listener pentru status changes (pentru tracking)
  socket.on('order:status-changed', (data) => {
    console.log('📱 [Mobile] Status schimbat:', data);
    
    // Dacă comanda e din aplicația mobilă, actualizează UI
    if (data.platform === 'MOBILE_APP') {
      updateMobileOrderStatus(data.orderId, data.status);
    }
  });
  
  // Listener pentru comenzi gata (pickup)
  socket.on('order:ready-for-pickup', (data) => {
    console.log('📱 [Mobile] Comandă gata pentru pickup:', data);
    
    if (data.platform === 'MOBILE_APP' && (data.type === 'pickup' || data.type === 'takeout')) {
      showMobileOrderNotification({
        type: 'ready',
        orderId: data.orderId,
        customerName: data.customer_name,
        message: `✅ Comandă #${data.orderId} gata pentru ridicare`,
      });
      
      playSound('/notif1.mp3');
      loadCompletedOrders();
    }
  });
  
  // Listener pentru alocare curier (delivery)
  socket.on('delivery:assigned', (data) => {
    console.log('📱 [Mobile] Curier alocat:', data);
    
    if (data.platform === 'MOBILE_APP') {
      showMobileOrderNotification({
        type: 'courier-assigned',
        orderId: data.orderId,
        courierName: data.courier_name,
        message: `🚴 Curier alocat pentru comanda #${data.orderId}`,
      });
      
      loadCompletedOrders();
    }
  });
}

/**
 * Afișează notificare pentru comenzi mobile
 */
function showMobileOrderNotification(data) {
  // Creează element de notificare
  const notification = document.createElement('div');
  notification.className = 'mobile-order-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${data.type === 'pickup' ? '#28a745' : data.type === 'delivery' ? '#007bff' : '#ffc107'};
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start;">
      <div>
        <strong style="font-size: 16px;">${data.message}</strong>
        ${data.customerName ? `<div style="margin-top: 5px; font-size: 14px;">Client: ${data.customerName}</div>` : ''}
        ${data.deliveryAddress ? `<div style="margin-top: 5px; font-size: 14px;">Adresă: ${data.deliveryAddress}</div>` : ''}
        ${data.total ? `<div style="margin-top: 5px; font-size: 14px;">Total: ${data.total.toFixed(2)} RON</div>` : ''}
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        margin-left: 10px;
      ">✕</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Elimină automat după 10 secunde
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}

/**
 * Actualizează status-ul unei comenzi mobile în UI
 */
function updateMobileOrderStatus(orderId, status) {
  // Găsește elementul comenzii în listă
  const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
  if (orderElement) {
    // Actualizează badge-ul de status
    const statusBadge = orderElement.querySelector('.order-status');
    if (statusBadge) {
      statusBadge.textContent = getStatusText(status);
      statusBadge.className = `order-status status-${status}`;
    }
  }
}

/**
 * Obține text pentru status
 */
function getStatusText(status) {
  const statusMap = {
    'pending': 'În așteptare',
    'preparing': 'Se prepară',
    'ready': 'Gata',
    'assigned': 'Curier alocat',
    'picked_up': 'Preluată',
    'en_route': 'Pe drum',
    'delivered': 'Livrată',
    'completed': 'Finalizată',
    'cancelled': 'Anulată',
  };
  return statusMap[status] || status;
}

// Adaugă CSS pentru animații
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Inițializează listeners când socket-ul e gata
if (typeof socket !== 'undefined' && socket.connected) {
  initializeMobileOrderListeners();
} else {
  // Așteaptă conexiunea socket
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof socket !== 'undefined') {
      socket.on('connect', () => {
        initializeMobileOrderListeners();
      });
    }
  });
}
