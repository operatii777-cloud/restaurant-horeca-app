/**
 * ENTERPRISE CONTROLLER
 * Phase: E2 - Loyalty & Rewards Controller
 * 
 * Handles rewards management, loyalty points, and VIP levels
 */

const { dbPromise } = require('../../../../database');

// Helper to get DB with timeout
async function getDb() {
    try {
        return await Promise.race([
            dbPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
        ]);
    } catch (dbError) {
        console.warn('⚠️ Database not ready for loyalty:', dbError.message);
        throw dbError;
    }
}

// Helper functions (using dbPromise)
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
 * Get all rewards
 */
async function getAllRewards(req, res) {
    try {
        const rewards = await dbAll('SELECT * FROM rewards ORDER BY id ASC');
        res.json(rewards || []);
    } catch (error) {
        console.error('❌ Eroare la încărcarea rewards:', error);
        res.status(500).json({ error: error.message || 'Eroare la încărcarea recompenselor' });
    }
}

/**
 * Get a single reward by ID
 */
async function getRewardById(req, res) {
    try {
        const { id } = req.params;
        const reward = await dbGet('SELECT * FROM rewards WHERE id = ?', [id]);
        
        if (!reward) {
            return res.status(404).json({ error: 'Recompensa nu există' });
        }
        
        res.json(reward);
    } catch (error) {
        console.error('❌ Eroare la încărcarea reward:', error);
        res.status(500).json({ error: error.message || 'Eroare la încărcarea recompensei' });
    }
}

/**
 * Create a new reward
 */
async function createReward(req, res) {
    try {
        const {
            name,
            description,
            reward_type = 'points',
            points_required = 0,
            discount_percentage = 0,
            discount_fixed = 0,
            free_product_id = null,
            vip_level_required = 'Bronze',
            is_active = true,
            combinations_required = 1, // Legacy field from admin.html
            product_combinations = null // Legacy field from admin.html
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Numele recompensei este obligatoriu' });
        }

        // Handle legacy product_combinations field
        let finalDescription = description || '';
        if (product_combinations && typeof product_combinations === 'object') {
            finalDescription = JSON.stringify(product_combinations);
        }

        const result = await dbRun(
            `INSERT INTO rewards (
                name, description, reward_type, points_required,
                discount_percentage, discount_fixed, free_product_id,
                vip_level_required, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                name,
                finalDescription,
                reward_type,
                points_required,
                discount_percentage,
                discount_fixed,
                free_product_id,
                vip_level_required,
                is_active ? 1 : 0
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Recompensa a fost adăugată cu succes.',
            id: result.lastID
        });
    } catch (error) {
        console.error('❌ Eroare la crearea reward:', error);
        res.status(500).json({ error: error.message || 'Eroare la crearea recompensei' });
    }
}

/**
 * Update an existing reward
 */
async function updateReward(req, res) {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            reward_type,
            points_required,
            discount_percentage,
            discount_fixed,
            free_product_id,
            vip_level_required,
            is_active,
            product_combinations = null // Legacy field
        } = req.body;

        // Check if reward exists
        const existing = await dbGet('SELECT id FROM rewards WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Recompensa nu există' });
        }

        // Handle legacy product_combinations field
        let finalDescription = description;
        if (product_combinations && typeof product_combinations === 'object') {
            finalDescription = JSON.stringify(product_combinations);
        }

        // Build update query dynamically
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (finalDescription !== undefined) {
            updates.push('description = ?');
            params.push(finalDescription);
        }
        if (reward_type !== undefined) {
            updates.push('reward_type = ?');
            params.push(reward_type);
        }
        if (points_required !== undefined) {
            updates.push('points_required = ?');
            params.push(points_required);
        }
        if (discount_percentage !== undefined) {
            updates.push('discount_percentage = ?');
            params.push(discount_percentage);
        }
        if (discount_fixed !== undefined) {
            updates.push('discount_fixed = ?');
            params.push(discount_fixed);
        }
        if (free_product_id !== undefined) {
            updates.push('free_product_id = ?');
            params.push(free_product_id);
        }
        if (vip_level_required !== undefined) {
            updates.push('vip_level_required = ?');
            params.push(vip_level_required);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nu s-au furnizat câmpuri pentru actualizare' });
        }

        params.push(id);

        await dbRun(
            `UPDATE rewards SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        res.json({
            success: true,
            message: 'Recompensa a fost actualizată cu succes.'
        });
    } catch (error) {
        console.error('❌ Eroare la actualizarea reward:', error);
        res.status(500).json({ error: error.message || 'Eroare la actualizarea recompensei' });
    }
}

/**
 * Delete a reward
 */
async function deleteReward(req, res) {
    try {
        const { id } = req.params;

        // Check if reward exists
        const existing = await dbGet('SELECT id FROM rewards WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Recompensa nu există' });
        }

        await dbRun('DELETE FROM rewards WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Recompensa a fost ștearsă cu succes.'
        });
    } catch (error) {
        console.error('❌ Eroare la ștergerea reward:', error);
        res.status(500).json({ error: error.message || 'Eroare la ștergerea recompensei' });
    }
}

/**
 * Get loyalty points for a client
 */
async function getClientPoints(req, res) {
    try {
        const { clientToken } = req.params;

        // Get current points balance
        const pointsHistory = await dbAll(
            `SELECT 
                COALESCE(SUM(points_earned), 0) - COALESCE(SUM(points_used), 0) as balance
            FROM points_history
            WHERE client_token = ?`,
            [clientToken]
        );

        const balance = pointsHistory[0]?.balance || 0;

        // Get VIP level
        const vipLevel = await dbGet(
            `SELECT level_name, min_points, benefits, color
            FROM vip_levels
            WHERE min_points <= ?
            ORDER BY min_points DESC
            LIMIT 1`,
            [balance]
        );

        res.json({
            balance: balance,
            vip_level: vipLevel || null
        });
    } catch (error) {
        console.error('❌ Eroare la încărcarea punctelor:', error);
        res.status(500).json({ error: error.message || 'Eroare la încărcarea punctelor' });
    }
}

/**
 * Get points history for a client
 */
async function getClientPointsHistory(req, res) {
    try {
        const { clientToken } = req.params;

        const history = await dbAll(
            `SELECT * FROM points_history
            WHERE client_token = ?
            ORDER BY created_at DESC
            LIMIT 100`,
            [clientToken]
        );

        res.json(history || []);
    } catch (error) {
        console.error('❌ Eroare la încărcarea istoricului punctelor:', error);
        res.status(500).json({ error: error.message || 'Eroare la încărcarea istoricului' });
    }
}

module.exports = {
    getAllRewards,
    getRewardById,
    createReward,
    updateReward,
    deleteReward,
    getClientPoints,
    getClientPointsHistory
};

