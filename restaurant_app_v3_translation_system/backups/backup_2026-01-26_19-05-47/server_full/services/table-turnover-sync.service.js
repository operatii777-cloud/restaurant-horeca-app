/**
 * TABLE TURNOVER AUTO-SYNC SERVICE
 * 
 * Sincronizează automat orders → table_sessions
 * Rulează periodic (de ex. la fiecare minut) și verifică:
 * 1. Orders noi cu table_number → creează sesiuni în table_sessions
 * 2. Orders plătite → actualizează sesiuni cu freed_at
 * 
 * AVANTAJ: Zero modificări în codul existent!
 * Data: 28 Octombrie 2025
 * Versiune: 1.0.0
 */

const { trackTableOccupied, trackTableFreed } = require('../helpers/table-session-tracker');

class TableTurnoverSyncService {
    constructor(db) {
        this.db = db;
        this.lastSyncId = 0; // Ultimul order ID procesat
        this.syncInterval = null;
        this.isRunning = false;
    }

    /**
     * Pornește serviciul de sincronizare
     * @param {number} intervalMs - Interval în milisecunde (default: 30000 = 30s)
     */
    start(intervalMs = 30000) {
        if (this.isRunning) {
            console.log('⚠️  [Table Sync] Service deja pornit');
            return;
        }

        console.log(`✅ [Table Sync] Service pornit (interval: ${intervalMs/1000}s)`);
        this.isRunning = true;

        // Sincronizare inițială
        this.syncOrders().catch(err => {
            console.error('❌ [Table Sync] Eroare sincronizare inițială:', err);
        });

        // Sincronizare periodică
        this.syncInterval = setInterval(() => {
            this.syncOrders().catch(err => {
                console.error('❌ [Table Sync] Eroare sincronizare periodică:', err);
            });
        }, intervalMs);
    }

    /**
     * Oprește serviciul
     */
    stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            this.isRunning = false;
            console.log('✅ [Table Sync] Service oprit');
        }
    }

    /**
     * Sincronizează orders noi și plătite
     */
    async syncOrders() {
        try {
            // STEP 1: Găsește orders noi (cu ID > lastSyncId și table_number valid)
            const newOrders = await this.getNewOrders();
            
            for (const order of newOrders) {
                await this.processNewOrder(order);
            }

            // STEP 2: Găsește orders plătite (cu paid_timestamp și fără freed_at în table_sessions)
            const paidOrders = await this.getPaidOrders();
            
            for (const order of paidOrders) {
                await this.processPaidOrder(order);
            }

            if (newOrders.length > 0 || paidOrders.length > 0) {
                console.log(`✅ [Table Sync] Sincronizat: ${newOrders.length} noi, ${paidOrders.length} plătite`);
            }

        } catch (error) {
            console.error('❌ [Table Sync] Eroare la sincronizare:', error);
        }
    }

    /**
     * Obține orders noi (neproceate încă)
     */
    getNewOrders() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT o.id, o.table_number, o.timestamp, o.total
                FROM orders o
                WHERE o.id > ?
                  AND o.table_number IS NOT NULL
                  AND o.table_number != ''
                  AND CAST(o.table_number AS INTEGER) > 0
                  AND CAST(o.table_number AS INTEGER) <= 200
                  AND NOT EXISTS (
                      SELECT 1 FROM table_sessions ts 
                      WHERE ts.order_id = o.id
                  )
                ORDER BY o.id ASC
                LIMIT 50
            `, [this.lastSyncId], (err, rows) => {
                if (err) reject(err);
                else {
                    // Actualizează lastSyncId
                    if (rows.length > 0) {
                        this.lastSyncId = Math.max(...rows.map(r => r.id));
                    }
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Obține orders plătite recent (fără freed_at în table_sessions)
     */
    getPaidOrders() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT o.id, o.table_number, o.paid_timestamp, o.total
                FROM orders o
                WHERE o.paid_timestamp IS NOT NULL
                  AND o.table_number IS NOT NULL
                  AND o.table_number != ''
                  AND CAST(o.table_number AS INTEGER) > 0
                  AND EXISTS (
                      SELECT 1 FROM table_sessions ts 
                      WHERE ts.order_id = o.id
                        AND ts.freed_at IS NULL
                  )
                ORDER BY o.paid_timestamp DESC
                LIMIT 50
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Procesează un order nou (creează sesiune)
     */
    async processNewOrder(order) {
        try {
            const tableNumber = parseInt(order.table_number);
            
            if (isNaN(tableNumber) || tableNumber <= 0 || tableNumber > 200) {
                console.log(`⚠️  [Table Sync] Skip order ${order.id}: table_number invalid (${order.table_number})`);
                return;
            }

            await trackTableOccupied(
                this.db,
                tableNumber,
                order.id,
                order.timestamp,
                1 // party_size default
            );

            console.log(`✅ [Table Sync] Order ${order.id}: masă ${tableNumber} OCUPATĂ`);

        } catch (error) {
            console.error(`❌ [Table Sync] Eroare procesare order ${order.id}:`, error);
        }
    }

    /**
     * Procesează un order plătit (marchează sesiune ca liberată)
     */
    async processPaidOrder(order) {
        try {
            const tableNumber = parseInt(order.table_number);
            
            if (isNaN(tableNumber) || tableNumber <= 0 || tableNumber > 200) {
                console.log(`⚠️  [Table Sync] Skip paid order ${order.id}: table_number invalid`);
                return;
            }

            await trackTableFreed(
                this.db,
                tableNumber,
                order.id,
                order.paid_timestamp,
                order.total || 0
            );

            console.log(`✅ [Table Sync] Order ${order.id}: masă ${tableNumber} LIBERĂ (${order.total || 0} RON)`);

        } catch (error) {
            console.error(`❌ [Table Sync] Eroare procesare paid order ${order.id}:`, error);
        }
    }

    /**
     * Obține statistici despre serviciu
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            lastSyncId: this.lastSyncId,
            interval: this.syncInterval ? 'active' : 'stopped'
        };
    }
}

module.exports = TableTurnoverSyncService;

