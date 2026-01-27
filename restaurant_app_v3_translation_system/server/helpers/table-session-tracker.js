// helpers/table-session-tracker.js
// Auto-tracking pentru table_sessions când se creează/update orders

/**
 * Helper pentru auto-tracking table_sessions
 * 
 * Funcții:
 * - trackTableOccupied() - când se creează order nou
 * - trackTableFreed() - când se plătește order
 * - getActiveTableSession() - obține session activ pentru o masă
 */

/**
 * Marchează o masă ca ocupată (automat când se creează order)
 * 
 * @param {object} db - Database instance
 * @param {number} tableNumber - Numărul mesei
 * @param {number} orderId - ID-ul comenzii
 * @param {string} timestamp - Timestamp când s-a creat comanda
 * @returns {Promise<number>} Session ID
 */
async function trackTableOccupied(db, tableNumber, orderId, timestamp) {
    if (!tableNumber || tableNumber <= 0) {
        // Skip tracking pentru comenzi fără masă (delivery, takeaway)
        return null;
    }

    try {
        // Verifică dacă există deja session activ pentru această masă
        const existingSession = await new Promise((resolve, reject) => {
            db.get(`
                SELECT id FROM table_sessions
                WHERE table_id = ?
                  AND freed_at IS NULL
                ORDER BY occupied_at DESC
                LIMIT 1
            `, [tableNumber], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingSession) {
            console.log(`🔄 [Table Tracker] Masa ${tableNumber} deja ocupată (session ${existingSession.id})`);
            
            // Update session cu order_id dacă nu e setat
            await new Promise((resolve, reject) => {
                db.run(`
                    UPDATE table_sessions
                    SET order_id = ?
                    WHERE id = ?
                      AND order_id IS NULL
                `, [orderId, existingSession.id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            return existingSession.id;
        }

        // Creează session nou
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO table_sessions (
                    tenant_id,
                    table_id,
                    order_id,
                    occupied_at,
                    party_size
                ) VALUES (?, ?, ?, ?, ?)
            `, [1, tableNumber, orderId, timestamp, 1], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });

        console.log(`✅ [Table Tracker] Masa ${tableNumber} marcată ca ocupată (session ${result.id}, order ${orderId})`);
        return result.id;

    } catch (error) {
        console.error('❌ [Table Tracker] Eroare la trackTableOccupied:', error);
        // Nu throw error - nu vrem să blocăm crearea order-ului
        return null;
    }
}

/**
 * Marchează o masă ca liberată (automat când se plătește order)
 * 
 * @param {object} db - Database instance
 * @param {number} tableNumber - Numărul mesei
 * @param {number} orderId - ID-ul comenzii
 * @param {string} paidTimestamp - Timestamp când s-a plătit
 * @param {number} total - Total comandă (revenue)
 * @returns {Promise<number>} Session ID
 */
async function trackTableFreed(db, tableNumber, orderId, paidTimestamp, total) {
    if (!tableNumber || tableNumber <= 0) {
        return null;
    }

    try {
        // Găsește session-ul activ pentru această masă
        const session = await new Promise((resolve, reject) => {
            db.get(`
                SELECT id, occupied_at, order_id
                FROM table_sessions
                WHERE table_id = ?
                  AND freed_at IS NULL
                ORDER BY occupied_at DESC
                LIMIT 1
            `, [tableNumber], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!session) {
            // Nu există session activ - posibil comandă veche sau tracking nu a fost activ
            console.log(`⚠️  [Table Tracker] Nu există session activ pentru masa ${tableNumber}, creez unul retroactiv`);
            
            // Găsește timestamp-ul comenzii
            const order = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT timestamp FROM orders WHERE id = ?
                `, [orderId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!order) {
                console.error(`❌ [Table Tracker] Order ${orderId} nu există`);
                return null;
            }

            // Creează session retroactiv
            const duration_minutes = Math.round(
                (new Date(paidTimestamp) - new Date(order.timestamp)) / 60000
            );

            // Skip dacă duration e negativă sau prea mare (> 12 ore)
            if (duration_minutes < 0 || duration_minutes > 720) {
                console.error(`❌ [Table Tracker] Duration invalid: ${duration_minutes} min`);
                return null;
            }

            const result = await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO table_sessions (
                        tenant_id,
                        table_id,
                        order_id,
                        occupied_at,
                        freed_at,
                        duration_minutes,
                        revenue,
                        party_size
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [1, tableNumber, orderId, order.timestamp, paidTimestamp, duration_minutes, total || 0, 1], 
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                });
            });

            console.log(`✅ [Table Tracker] Session retroactiv creat: masa ${tableNumber}, ${duration_minutes} min, ${total} RON`);
            return result.id;
        }

        // Update session existent cu freed_at și duration
        const duration_minutes = Math.round(
            (new Date(paidTimestamp) - new Date(session.occupied_at)) / 60000
        );

        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE table_sessions
                SET freed_at = ?,
                    duration_minutes = ?,
                    revenue = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [paidTimestamp, duration_minutes, total || 0, session.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`✅ [Table Tracker] Masa ${tableNumber} liberată (session ${session.id}, ${duration_minutes} min, ${total} RON)`);
        return session.id;

    } catch (error) {
        console.error('❌ [Table Tracker] Eroare la trackTableFreed:', error);
        return null;
    }
}

/**
 * Obține session-ul activ pentru o masă
 */
async function getActiveTableSession(db, tableNumber) {
    try {
        return await new Promise((resolve, reject) => {
            db.get(`
                SELECT * FROM table_sessions
                WHERE table_id = ?
                  AND freed_at IS NULL
                ORDER BY occupied_at DESC
                LIMIT 1
            `, [tableNumber], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    } catch (error) {
        console.error('❌ [Table Tracker] Eroare la getActiveTableSession:', error);
        return null;
    }
}

module.exports = {
    trackTableOccupied,
    trackTableFreed,
    getActiveTableSession
};

