const express = require('express');
const router = express.Router();
const db = require('../config/database');

const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const runQuerySingle = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

// GET all vouchers
router.get('/', async (req, res) => {
    try {
        const vouchers = await runQuery(`
            SELECT * FROM vouchers
            ORDER BY created_at DESC
        `);
        res.json(vouchers);
    } catch (err) {
        console.error('Error fetching vouchers:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET single voucher
router.get('/:id', async (req, res) => {
    try {
        const voucher = await runQuery(`
            SELECT * FROM vouchers WHERE id = ?
        `, [req.params.id]);

        if (voucher.length === 0) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.json(voucher[0]);
    } catch (err) {
        console.error('Error fetching voucher:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST create new voucher
router.post('/', async (req, res) => {
    try {
        const { 
            code, 
            type, 
            value, 
            start_date, 
            expiry_date, 
            max_uses, 
            description 
        } = req.body;

        if (!code || !type || !value || !expiry_date) {
            return res.status(400).json({ 
                error: 'code, type, value, and expiry_date are required' 
            });
        }

        // Check if code already exists
        const existing = await runQuery(`
            SELECT id FROM vouchers WHERE code = ?
        `, [code]);

        if (existing.length > 0) {
            return res.status(400).json({ 
                error: 'Voucher code already exists' 
            });
        }

        const result = await runQuerySingle(`
            INSERT INTO vouchers 
            (code, type, value, start_date, expiry_date, max_uses, used_count, description, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'active', datetime('now', 'localtime'))
        `, [code, type, value, start_date, expiry_date, max_uses || 1, description]);

        res.status(201).json({ 
            id: result.id, 
            message: 'Voucher created successfully' 
        });
    } catch (err) {
        console.error('Error creating voucher:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update voucher
router.put('/:id', async (req, res) => {
    try {
        const { 
            code, 
            type, 
            value, 
            start_date, 
            expiry_date, 
            max_uses, 
            description,
            status 
        } = req.body;

        const updateFields = [];
        const updateValues = [];

        if (code) {
            updateFields.push('code = ?');
            updateValues.push(code);
        }
        if (type) {
            updateFields.push('type = ?');
            updateValues.push(type);
        }
        if (value !== undefined) {
            updateFields.push('value = ?');
            updateValues.push(value);
        }
        if (start_date) {
            updateFields.push('start_date = ?');
            updateValues.push(start_date);
        }
        if (expiry_date) {
            updateFields.push('expiry_date = ?');
            updateValues.push(expiry_date);
        }
        if (max_uses) {
            updateFields.push('max_uses = ?');
            updateValues.push(max_uses);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updateValues.push(req.params.id);

        await runQuerySingle(`
            UPDATE vouchers 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);

        res.json({ message: 'Voucher updated successfully' });
    } catch (err) {
        console.error('Error updating voucher:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE voucher
router.delete('/:id', async (req, res) => {
    try {
        await runQuerySingle(`DELETE FROM vouchers WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Voucher deleted successfully' });
    } catch (err) {
        console.error('Error deleting voucher:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST validate voucher
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'code is required' });
        }

        const voucher = await runQuery(`
            SELECT * FROM vouchers 
            WHERE code = ? 
            AND status = 'active'
            AND (start_date IS NULL OR DATE(start_date) <= DATE('now'))
            AND DATE(expiry_date) >= DATE('now')
            AND used_count < max_uses
        `, [code]);

        if (voucher.length === 0) {
            return res.status(404).json({ 
                valid: false,
                message: 'Voucher not found, expired, or already used' 
            });
        }

        res.json({
            valid: true,
            voucher: voucher[0]
        });
    } catch (err) {
        console.error('Error validating voucher:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST use voucher
router.post('/use', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'code is required' });
        }

        // Validate voucher first
        const voucher = await runQuery(`
            SELECT * FROM vouchers 
            WHERE code = ? 
            AND status = 'active'
            AND (start_date IS NULL OR DATE(start_date) <= DATE('now'))
            AND DATE(expiry_date) >= DATE('now')
            AND used_count < max_uses
        `, [code]);

        if (voucher.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Voucher not found, expired, or already used' 
            });
        }

        // Increment used_count
        const newUsedCount = voucher[0].used_count + 1;
        const newStatus = newUsedCount >= voucher[0].max_uses ? 'used' : 'active';

        await runQuerySingle(`
            UPDATE vouchers 
            SET used_count = ?,
                status = ?
            WHERE id = ?
        `, [newUsedCount, newStatus, voucher[0].id]);

        res.json({
            success: true,
            message: 'Voucher used successfully',
            voucher: {
                ...voucher[0],
                used_count: newUsedCount,
                status: newStatus
            }
        });
    } catch (err) {
        console.error('Error using voucher:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

