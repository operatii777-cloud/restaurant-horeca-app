/**
 * 🔴 FIX 4 - Order Timeout Service
 * 
 * Serviciu pentru auto-cancelarea comenzilor cu status 'awaiting_acceptance'
 * după timeout (default: 5 minute)
 */

const { dbPromise } = require('../../database');

const TIMEOUT_MINUTES = parseInt(process.env.ORDER_ACCEPTANCE_TIMEOUT_MINUTES || '5', 10);

/**
 * Verifică și anulează automat comenzile expirate (awaiting_acceptance > TIMEOUT_MINUTES)
 */
async function checkAndCancelExpiredOrders() {
  try {
    const db = await dbPromise;
    
    // Calculează timestamp-ul limită (acum - TIMEOUT_MINUTES minute)
    const timeoutDate = new Date();
    timeoutDate.setMinutes(timeoutDate.getMinutes() - TIMEOUT_MINUTES);
    const timeoutTimestamp = timeoutDate.toISOString().replace('T', ' ').substring(0, 19);
    
    // Găsește comenzile expirate
    const expiredOrders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, timestamp, customer_name, customer_phone, total
        FROM orders
        WHERE status = 'awaiting_acceptance'
          AND datetime(timestamp) < datetime(?)
      `, [timeoutTimestamp], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (expiredOrders.length === 0) {
      return { cancelled: 0, orders: [] };
    }
    
    // Anulează comenzile expirate
    const cancelledOrders = [];
    for (const order of expiredOrders) {
      try {
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE orders 
            SET status = 'cancelled',
                general_notes = ?,
                updated_at = datetime('now')
            WHERE id = ?
          `, [`Timeout: Comandă neacceptată în ${TIMEOUT_MINUTES} minute`, order.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        // Emit Socket.io event pentru client
        if (global.io) {
          global.io.emit('order:timeout', { 
            orderId: order.id,
            status: 'cancelled',
            reason: `Timeout: Comandă neacceptată în ${TIMEOUT_MINUTES} minute`,
            timestamp: new Date().toISOString()
          });
        }
        
        cancelledOrders.push(order.id);
        console.log(`⏱️ [Order Timeout] Order #${order.id} auto-cancelled (timeout: ${TIMEOUT_MINUTES} min)`);
      } catch (error) {
        console.error(`❌ [Order Timeout] Error cancelling order #${order.id}:`, error.message);
      }
    }
    
    return { 
      cancelled: cancelledOrders.length, 
      orders: cancelledOrders 
    };
  } catch (error) {
    console.error('❌ [Order Timeout] Error checking expired orders:', error.message);
    return { cancelled: 0, orders: [], error: error.message };
  }
}

/**
 * Inițializează cron job pentru verificarea comenzilor expirate
 * Verifică la fiecare minut
 */
function initializeTimeoutChecker() {
  // Verifică la pornirea serverului
  checkAndCancelExpiredOrders().catch(err => {
    console.warn('⚠️ [Order Timeout] Error in initial check:', err.message);
  });
  
  // Verifică la fiecare minut
  const cron = require('node-cron');
  cron.schedule('* * * * *', async () => {
    try {
      await checkAndCancelExpiredOrders();
    } catch (error) {
      console.warn('⚠️ [Order Timeout] Error in cron check:', error.message);
    }
  });
  
  console.log(`✅ [Order Timeout] Timeout checker initialized (timeout: ${TIMEOUT_MINUTES} minutes, check: every minute)`);
}

module.exports = {
  checkAndCancelExpiredOrders,
  initializeTimeoutChecker,
  TIMEOUT_MINUTES
};
