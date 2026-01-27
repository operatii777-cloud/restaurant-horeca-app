/**
 * MOBILE APP NOTIFICATIONS CONTROLLER
 * 
 * Trimite notificări către aplicația mobilă prin Socket.IO
 * (fără Firebase, folosim Socket.IO direct)
 */

/**
 * Trimite notificare către un utilizator
 * 
 * @param {Object} options
 * @param {number} options.userId - ID utilizator
 * @param {string} options.customerEmail - Email client (alternativ)
 * @param {string} options.customerPhone - Telefon client (alternativ)
 * @param {string} options.title - Titlu notificare
 * @param {string} options.body - Mesaj notificare
 * @param {string} options.type - Tip notificare (order_status, offer, etc.)
 * @param {Object} options.data - Date suplimentare
 */
function sendNotification(options) {
  if (!global.io) {
    console.warn('⚠️ Socket.IO not initialized, cannot send notification');
    return;
  }

  const {
    userId,
    customerEmail,
    customerPhone,
    title,
    body,
    type = 'general',
    data = {},
  } = options;

  const notificationData = {
    title,
    body,
    type,
    ...data,
    timestamp: new Date().toISOString(),
  };

  // Emite către toți clienții conectați (Socket.IO va filtra pe client)
  // Clientul va verifica dacă notificarea e pentru el
  global.io.emit('mobile:notification', notificationData);

  console.log(`📱 Notification sent: ${title} - ${body}`);
}

/**
 * Trimite notificare pentru status comandă
 */
function sendOrderStatusNotification(orderId, status, customerEmail, customerPhone) {
  let statusText = 'Status necunoscut';
  switch (status) {
    case 'preparing':
      statusText = 'Comanda ta se prepară';
      break;
    case 'ready':
      statusText = 'Comanda ta este gata!';
      break;
    case 'delivered':
      statusText = 'Comanda ta a fost livrată!';
      break;
    case 'cancelled':
      statusText = 'Comanda ta a fost anulată';
      break;
  }

  sendNotification({
    customerEmail,
    customerPhone,
    title: `Comandă #${orderId}`,
    body: statusText,
    type: 'order_status',
    data: {
      order_id: orderId,
      status: status,
    },
  });
}

/**
 * Trimite notificare pentru ofertă
 */
function sendOfferNotification(customerEmail, customerPhone, offerTitle, offerDescription) {
  sendNotification({
    customerEmail,
    customerPhone,
    title: 'Ofertă specială!',
    body: offerTitle,
    type: 'offer',
    data: {
      offer_title: offerTitle,
      offer_description: offerDescription,
    },
  });
}

/**
 * Trimite notificare pentru loyalty points
 */
function sendLoyaltyNotification(customerEmail, customerPhone, points, level) {
  sendNotification({
    customerEmail,
    customerPhone,
    title: 'Puncte noi!',
    body: `Ai câștigat ${points} puncte. Nivel: ${level}`,
    type: 'loyalty',
    data: {
      points: points,
      level: level,
    },
  });
}

module.exports = {
  sendNotification,
  sendOrderStatusNotification,
  sendOfferNotification,
  sendLoyaltyNotification,
};
