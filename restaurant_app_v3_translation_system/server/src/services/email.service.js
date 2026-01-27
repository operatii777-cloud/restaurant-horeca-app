/**
 * 🔴 FIX 3 - Email Notification Service
 * 
 * Serviciu pentru trimiterea notificărilor email către restaurant
 * Fail-safe: dacă email eșuează, NU blochează comanda
 */

const nodemailer = require('nodemailer');
const { dbPromise } = require('../../database');

let transporter = null;

/**
 * Inițializează transporter-ul de email
 * Folosește SMTP din env variables sau configurări default
 */
function initializeEmailTransporter() {
  if (transporter) return transporter;

  // Configurare SMTP din env variables
  const smtpConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true pentru 465, false pentru alte porturi
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
  };

  // Dacă nu există user/pass, nu inițializăm (email-ul va fi dezactivat)
  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.log('⚠️ [Email Service] SMTP credentials not configured, email notifications disabled');
    return null;
  }

  transporter = nodemailer.createTransport(smtpConfig);

  // Verifică conexiunea (opțional, pentru debugging)
  transporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️ [Email Service] SMTP connection failed:', error.message);
      transporter = null; // Dezactivează dacă conexiunea eșuează
    } else {
      console.log('✅ [Email Service] SMTP connection verified');
    }
  });

  return transporter;
}

/**
 * Obține adresa email a restaurantului din setări
 * Fallback: folosește EMAIL_RESTAURANT din env sau email din auth
 */
async function getRestaurantEmail() {
  try {
    const db = await dbPromise;

    // Încearcă să obțină email din setările restaurantului
    const settings = await new Promise((resolve, reject) => {
      db.get('SELECT restaurant_email FROM restaurant_settings WHERE id = 1', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (settings && settings.restaurant_email) {
      return settings.restaurant_email;
    }

    // Fallback: folosește EMAIL_RESTAURANT din env
    if (process.env.EMAIL_RESTAURANT) {
      return process.env.EMAIL_RESTAURANT;
    }

    // Fallback final: folosește EMAIL_USER (probabil același email pentru notificări)
    return process.env.EMAIL_USER || null;
  } catch (error) {
    console.warn('⚠️ [Email Service] Error getting restaurant email:', error.message);
    // Fallback: folosește EMAIL_RESTAURANT sau EMAIL_USER din env
    return process.env.EMAIL_RESTAURANT || process.env.EMAIL_USER || null;
  }
}

/**
 * Formatează lista de produse pentru email
 */
function formatOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Nu sunt produse în comandă.';
  }

  try {
    // Parse items dacă este string JSON
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

    return parsedItems.map((item, index) => {
      const productName = item.product_name || item.name || `Produs #${index + 1}`;
      const quantity = item.quantity || 1;
      const price = item.price || item.final_price || 0;
      const total = (parseFloat(price) * parseInt(quantity)).toFixed(2);

      return `  ${index + 1}. ${productName} x${quantity} = ${total} RON`;
    }).join('\n');
  } catch (error) {
    console.warn('⚠️ [Email Service] Error formatting items:', error.message);
    return 'Eroare la formatarea produselor.';
  }
}

/**
 * Generează template-ul email pentru comandă nouă
 */
function generateOrderEmailTemplate(order) {
  const orderId = order.id || order.order_id || 'N/A';
  const orderType = order.type || 'dine_in';
  const orderTypeText = {
    'dine_in': 'La masă',
    'takeaway': 'Takeaway',
    'pickup': 'Pickup',
    'delivery': 'Livrare',
    'drive_thru': 'Drive-thru'
  }[orderType] || orderType;

  const customerName = order.customer_name || order.customer?.name || 'Client';
  const customerPhone = order.customer_phone || order.customer?.phone || 'N/A';
  const customerEmail = order.customer_email || order.customer?.email || 'N/A';

  const tableNumber = order.table_number || order.table || null;
  const deliveryAddress = order.delivery_address || order.delivery?.address || null;

  const total = order.total || 0;
  const paymentMethod = order.payment_method || 'cash';
  const paymentMethodText = {
    'cash': 'Numerar',
    'card': 'Card',
    'online': 'Online'
  }[paymentMethod] || paymentMethod;

  const timestamp = order.timestamp || order.created_at || new Date().toISOString();
  const orderDate = new Date(timestamp).toLocaleString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Parse items
  let itemsText = 'Nu sunt produse în comandă.';
  try {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    itemsText = formatOrderItems(items);
  } catch (error) {
    console.warn('⚠️ [Email Service] Error parsing items:', error.message);
  }

  // Construiește subiectul
  const subject = `🆕 Comandă nouă #${orderId} - ${orderTypeText} - ${total.toFixed(2)} RON`;

  // 🔴 FIX 4 - Adaugă link-uri pentru accept/refuz în email
  const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3001';
  const acceptLink = `${baseUrl}/api/orders/${orderId}/accept`;
  const rejectLink = `${baseUrl}/api/orders/${orderId}/reject`;

  // Construiește corpul email-ului (text simplu, clar)
  const body = `
===========================================
  COMANDĂ NOUĂ #${orderId}
===========================================

Tip comandă: ${orderTypeText}
Data: ${orderDate}
Total: ${total.toFixed(2)} RON
Plată: ${paymentMethodText}

-------------------------------------------
  CLIENT
-------------------------------------------
Nume: ${customerName}
Telefon: ${customerPhone}
Email: ${customerEmail}

-------------------------------------------
  DETALII
-------------------------------------------
${tableNumber ? `Masă: ${tableNumber}` : ''}
${deliveryAddress ? `Adresă livrare: ${deliveryAddress}` : ''}
${order.general_notes || order.notes ? `Notă: ${order.general_notes || order.notes}` : ''}

-------------------------------------------
  PRODUSE
-------------------------------------------
${itemsText}

-------------------------------------------
  ACȚIUNI RAPIDE
-------------------------------------------
Acceptă comanda: ${acceptLink}
Refuză comanda: ${rejectLink}

⚠️ Notă: Comanda va fi anulată automat dacă nu este acceptată în ${process.env.ORDER_ACCEPTANCE_TIMEOUT_MINUTES || '5'} minute.

-------------------------------------------
Acest email a fost generat automat de sistemul Restaurant App.
===========================================
`;

  return { subject, body };
}

/**
 * 🔴 FIX 3 - Trimite notificare email pentru comandă nouă
 * 
 * Fail-safe: dacă email eșuează, NU blochează comanda (doar log warning)
 */
async function sendOrderNotificationEmail(order) {
  try {
    // Verifică dacă email-ul este configurat
    const emailTransporter = initializeEmailTransporter();
    if (!emailTransporter) {
      console.log('⚠️ [Email Service] Email transporter not available, skipping notification');
      return { success: false, error: 'Email not configured' };
    }

    // Obține adresa email a restaurantului
    const restaurantEmail = await getRestaurantEmail();
    if (!restaurantEmail) {
      console.warn('⚠️ [Email Service] Restaurant email not configured, skipping notification');
      return { success: false, error: 'Restaurant email not configured' };
    }

    // Generează template-ul email
    const { subject, body } = generateOrderEmailTemplate(order);

    // Trimite email
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@restaurant-app.ro',
      to: restaurantEmail,
      subject: subject,
      text: body,
      // HTML version (opțional, pentru viitor)
      // html: generateOrderEmailHTML(order)
    });

    console.log(`✅ [Email Service] Order notification sent to ${restaurantEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // ⚠️ IMPORTANT: NU aruncă eroarea, doar log warning
    // Email-ul nu trebuie să blocheze comanda
    console.warn('⚠️ [Email Service] Failed to send order notification email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderNotificationEmail,
  initializeEmailTransporter,
  getRestaurantEmail
};
