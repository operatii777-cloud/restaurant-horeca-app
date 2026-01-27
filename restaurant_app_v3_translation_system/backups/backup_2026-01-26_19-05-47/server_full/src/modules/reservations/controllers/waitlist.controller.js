/**
 * ENTERPRISE CONTROLLER
 * Phase: E3 - Waitlist Controller
 * 
 * Handles waitlist management for table reservations
 */

const { dbPromise } = require('../../../../database');
// PHASE PRODUCTION-READY: Use centralized validators
const { validateReservation, validatePhone, validateEmail } = require('../../../utils/validators');
const { AppError, createValidationError } = require('../../../utils/error-handler');

// Helper to get DB with timeout
async function getDb() {
    try {
        return await Promise.race([
            dbPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
        ]);
    } catch (dbError) {
        console.warn('⚠️ Database not ready for waitlist:', dbError.message);
        throw dbError;
    }
}

// Helper functions
async function dbAll(query, params = []) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function dbGet(query, params = []) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function dbRun(query, params = []) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

/**
 * Get all waitlist entries
 */
async function getWaitlist(req, res) {
    try {
        const { date, status = 'waiting' } = req.query;
        const locationId = req.locationId || 1;
        const tenantId = req.tenantId || 1;

        let query = `
            SELECT 
                w.*,
                t.table_number,
                t.capacity
            FROM waitlist w
            LEFT JOIN tables t ON t.id = w.table_id
            WHERE w.location_id = ? AND w.tenant_id = ?
        `;
        const params = [locationId, tenantId];

        if (date) {
            query += ` AND DATE(w.requested_date) = ?`;
            params.push(date);
        }

        if (status) {
            query += ` AND w.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY w.created_at ASC`;

        const entries = await dbAll(query, params);

        res.json({
            success: true,
            data: entries || []
        });
    } catch (error) {
        console.error('❌ Eroare la încărcarea waitlist:', error);
        res.status(500).json({ error: error.message || 'Eroare la încărcarea waitlist' });
    }
}

/**
 * Add customer to waitlist
 */
async function addToWaitlist(req, res) {
    try {
        const {
            customerName,
            customerPhone,
            customerEmail,
            partySize,
            requestedDate,
            requestedTime,
            specialRequests,
            preferredArea
        } = req.body;

        // PHASE PRODUCTION-READY: Use centralized validators
        const reservationData = {
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            party_size: partySize,
            reservation_date: requestedDate,
            reservation_time: requestedTime
        };
        
        const validation = validateReservation(reservationData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: validation.errors
                }
            });
        }

        const locationId = req.locationId || 1;
        const tenantId = req.tenantId || 1;

        // Check if customer is already on waitlist for this date/time
        const existing = await dbGet(
            `SELECT id FROM waitlist 
            WHERE customer_phone = ? 
                AND DATE(requested_date) = ? 
                AND status = 'waiting'
                AND location_id = ?`,
            [customerPhone, requestedDate, locationId]
        );

        if (existing) {
            return res.status(409).json({
                error: 'Clientul este deja pe waitlist pentru această dată'
            });
        }

        // Get position in queue
        const position = await dbGet(
            `SELECT COUNT(*) as count FROM waitlist 
            WHERE DATE(requested_date) = ? 
                AND status = 'waiting'
                AND location_id = ?`,
            [requestedDate, locationId]
        );

        const result = await dbRun(
            `INSERT INTO waitlist (
                customer_name, customer_phone, customer_email,
                party_size, requested_date, requested_time,
                special_requests, preferred_area, status,
                position, location_id, tenant_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                customerName,
                customerPhone,
                customerEmail || null,
                partySize,
                requestedDate,
                requestedTime,
                specialRequests || null,
                preferredArea || null,
                (position?.count || 0) + 1,
                locationId,
                tenantId
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Client adăugat pe waitlist',
            data: {
                id: result.lastID,
                position: (position?.count || 0) + 1
            }
        });
    } catch (error) {
        console.error('❌ Eroare la adăugarea în waitlist:', error);
        res.status(500).json({ error: error.message || 'Eroare la adăugarea în waitlist' });
    }
}

/**
 * Update waitlist entry status
 */
async function updateWaitlistStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, tableId, notes } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status este obligatoriu' });
        }

        const validStatuses = ['waiting', 'notified', 'seated', 'cancelled', 'no_show'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Status invalid. Valide: ${validStatuses.join(', ')}` });
        }

        const updateData = { status };
        if (tableId) updateData.table_id = tableId;
        if (notes) updateData.notes = notes;

        const updates = [];
        const params = [];

        if (updateData.status) {
            updates.push('status = ?');
            params.push(updateData.status);
        }
        if (updateData.table_id) {
            updates.push('table_id = ?');
            params.push(updateData.table_id);
        }
        if (updateData.notes) {
            updates.push('notes = ?');
            params.push(updateData.notes);
        }

        if (status === 'seated') {
            updates.push('seated_at = CURRENT_TIMESTAMP');
        } else if (status === 'cancelled' || status === 'no_show') {
            updates.push('cancelled_at = CURRENT_TIMESTAMP');
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await dbRun(
            `UPDATE waitlist SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // If seated, update positions of remaining waitlist entries
        if (status === 'seated') {
            await dbRun(
                `UPDATE waitlist 
                SET position = position - 1 
                WHERE DATE(requested_date) = (
                    SELECT DATE(requested_date) FROM waitlist WHERE id = ?
                )
                AND status = 'waiting'
                AND position > (
                    SELECT position FROM waitlist WHERE id = ?
                )`,
                [id, id]
            );
        }

        res.json({
            success: true,
            message: 'Status waitlist actualizat'
        });
    } catch (error) {
        console.error('❌ Eroare la actualizarea waitlist:', error);
        res.status(500).json({ error: error.message || 'Eroare la actualizarea waitlist' });
    }
}

/**
 * Remove from waitlist
 */
async function removeFromWaitlist(req, res) {
    try {
        const { id } = req.params;

        // Get position before deletion
        const entry = await dbGet('SELECT position, requested_date FROM waitlist WHERE id = ?', [id]);
        
        if (!entry) {
            return res.status(404).json({ error: 'Intrare waitlist nu există' });
        }

        await dbRun('DELETE FROM waitlist WHERE id = ?', [id]);

        // Update positions of remaining entries
        await dbRun(
            `UPDATE waitlist 
            SET position = position - 1 
            WHERE DATE(requested_date) = DATE(?)
            AND status = 'waiting'
            AND position > ?`,
            [entry.requested_date, entry.position]
        );

        res.json({
            success: true,
            message: 'Client eliminat de pe waitlist'
        });
    } catch (error) {
        console.error('❌ Eroare la eliminarea din waitlist:', error);
        res.status(500).json({ error: error.message || 'Eroare la eliminarea din waitlist' });
    }
}

/**
 * Notify next customer in waitlist
 */
async function notifyNextCustomer(req, res) {
    try {
        const { date } = req.query;
        const locationId = req.locationId || 1;

        const targetDate = date || new Date().toISOString().split('T')[0];

        // Get next customer in waitlist
        const nextCustomer = await dbGet(
            `SELECT * FROM waitlist 
            WHERE DATE(requested_date) = ? 
                AND status = 'waiting'
                AND location_id = ?
            ORDER BY position ASC, created_at ASC
            LIMIT 1`,
            [targetDate, locationId]
        );

        if (!nextCustomer) {
            return res.status(404).json({
                error: 'Nu există clienți pe waitlist pentru această dată'
            });
        }

        // Update status to 'notified'
        await dbRun(
            `UPDATE waitlist 
            SET status = 'notified', notified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
            [nextCustomer.id]
        );

        // TODO: Send SMS/Email notification
        // await sendWaitlistNotification(nextCustomer);

        res.json({
            success: true,
            message: 'Client notificat',
            data: {
                ...nextCustomer,
                status: 'notified'
            }
        });
    } catch (error) {
        console.error('❌ Eroare la notificarea clientului:', error);
        res.status(500).json({ error: error.message || 'Eroare la notificare' });
    }
}

module.exports = {
    getWaitlist,
    addToWaitlist,
    updateWaitlistStatus,
    removeFromWaitlist,
    notifyNextCustomer
};

