/**
 * ORDER TRACKING HOOKS - Table Turnover & Utilization
 * 
 * Acest modul oferă hook-uri generice pentru tracking-ul meselor.
 * Integrarea este SIMPLĂ - adaugă doar 2 linii de cod:
 * 
 * HOOK 1: Când se creează o comandă → onOrderCreated()
 * HOOK 2: Când se plătește o comandă → onOrderPaid()
 * 
 * Data: 28 Octombrie 2025
 * Versiune: 1.0.0
 */

const { trackTableOccupied, trackTableFreed } = require('./table-session-tracker');

/**
 * HOOK 1: CALL THIS când se creează o comandă nouă
 * 
 * @param {Object} db - Database connection
 * @param {Object} orderData - Date comandă
 * @param {number} orderData.orderId - ID comandă
 * @param {number} orderData.tableNumber - Număr masă
 * @param {number} [orderData.partySize=1] - Număr persoane
 * @param {string} [orderData.createdAt] - Timestamp creare (opțional, default: now)
 * 
 * @example
 * // În funcția care creează orders:
 * const { onOrderCreated } = require('./helpers/order-tracking-hooks');
 * 
 * db.run('INSERT INTO orders ...', [...], function(err) {
 *     if (!err) {
 *         onOrderCreated(db, {
 *             orderId: this.lastID,
 *             tableNumber: data.tableNumber,
 *             partySize: data.partySize || 1
 *         });
 *     }
 * });
 */
async function onOrderCreated(db, orderData) {
    try {
        const { orderId, tableNumber, partySize = 1, createdAt } = orderData;
        
        // Validare
        if (!orderId || !tableNumber || tableNumber <= 0) {
            console.log(`⚠️  [Order Tracking] Skip: order ${orderId}, table ${tableNumber} invalid`);
            return;
        }
        
        const timestamp = createdAt || new Date().toISOString();
        
        // Track masa ca ocupată (NON-BLOCKING)
        await trackTableOccupied(db, tableNumber, orderId, timestamp, partySize);
        
        console.log(`✅ [Order Tracking] Masă ${tableNumber} marcată OCUPATĂ (order ${orderId})`);
        
    } catch (error) {
        // Logăm eroarea dar NU oprește flow-ul aplicației
        console.error(`❌ [Order Tracking] Eroare la tracking ocupare:`, error);
    }
}

/**
 * HOOK 2: CALL THIS când se plătește o comandă
 * 
 * @param {Object} db - Database connection
 * @param {Object} paymentData - Date plată
 * @param {number} paymentData.orderId - ID comandă
 * @param {number} paymentData.tableNumber - Număr masă
 * @param {number} paymentData.total - Total plătit
 * @param {string} [paymentData.paidAt] - Timestamp plată (opțional, default: now)
 * 
 * @example
 * // În funcția care procesează plata:
 * const { onOrderPaid } = require('./helpers/order-tracking-hooks');
 * 
 * db.run('UPDATE orders SET status = "paid" ...', [...], function(err) {
 *     if (!err) {
 *         onOrderPaid(db, {
 *             orderId: orderId,
 *             tableNumber: tableNumber,
 *             total: totalAmount
 *         });
 *     }
 * });
 */
async function onOrderPaid(db, paymentData) {
    try {
        const { orderId, tableNumber, total, paidAt } = paymentData;
        
        // Validare
        if (!orderId || !tableNumber || tableNumber <= 0) {
            console.log(`⚠️  [Order Tracking] Skip: order ${orderId}, table ${tableNumber} invalid`);
            return;
        }
        
        const timestamp = paidAt || new Date().toISOString();
        
        // Track masa ca liberă (NON-BLOCKING)
        await trackTableFreed(db, tableNumber, orderId, timestamp, total || 0);
        
        console.log(`✅ [Order Tracking] Masă ${tableNumber} marcată LIBERĂ (order ${orderId}, ${total} RON)`);
        
    } catch (error) {
        // Logăm eroarea dar NU oprește flow-ul aplicației
        console.error(`❌ [Order Tracking] Eroare la tracking eliberare:`, error);
    }
}

/**
 * HELPER: Obține statistici table turnover pentru debugging
 */
async function getTableTurnoverStats(db) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                COUNT(*) as total_servings,
                COUNT(DISTINCT table_id) as tables_used,
                ROUND(AVG(duration_minutes), 1) as avg_duration,
                SUM(revenue) as total_revenue
            FROM table_sessions
            WHERE freed_at IS NOT NULL
              AND DATE(occupied_at) = DATE('now')
        `, [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

module.exports = {
    onOrderCreated,
    onOrderPaid,
    getTableTurnoverStats
};

