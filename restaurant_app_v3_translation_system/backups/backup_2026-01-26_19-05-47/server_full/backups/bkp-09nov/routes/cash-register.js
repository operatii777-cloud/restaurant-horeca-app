const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper function to run queries
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

// ==================== GET CURRENT SESSION ====================
router.get('/current', async (req, res) => {
    try {
        const session = await runQuery(
            `SELECT * FROM cash_sessions 
             WHERE status = 'open' 
             ORDER BY opened_at DESC 
             LIMIT 1`
        );

        if (session.length === 0) {
            return res.status(404).json({ message: 'No active session' });
        }

        // Get payment methods breakdown
        const paymentMethods = await runQuery(
            `SELECT 
                payment_method as name,
                COUNT(*) as count,
                SUM(total_amount) as amount
             FROM orders 
             WHERE DATE(timestamp) = DATE(?)
             AND status != 'cancelled'
             GROUP BY payment_method`,
            [session[0].opened_at]
        );

        // Get totals
        const totals = await runQuery(
            `SELECT 
                SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as total_cash,
                SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END) as total_card,
                SUM(total_amount) as total_revenue,
                COUNT(*) as total_orders
             FROM orders 
             WHERE DATE(timestamp) = DATE(?)
             AND status != 'cancelled'`,
            [session[0].opened_at]
        );

        res.json({
            ...session[0],
            payment_methods: paymentMethods,
            total_cash: totals[0]?.total_cash || 0,
            total_card: totals[0]?.total_card || 0,
            total_revenue: totals[0]?.total_revenue || 0,
            total_orders: totals[0]?.total_orders || 0
        });
    } catch (err) {
        console.error('Error fetching current session:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== GET ALL SESSIONS ====================
router.get('/sessions', async (req, res) => {
    try {
        const sessions = await runQuery(
            `SELECT * FROM cash_sessions 
             ORDER BY opened_at DESC 
             LIMIT 100`
        );
        res.json(sessions);
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== OPEN CASH SESSION ====================
router.post('/open', async (req, res) => {
    try {
        const { initial_fund, operator_name, notes } = req.body;

        // Check if there's already an open session
        const existingSession = await runQuery(
            `SELECT * FROM cash_sessions WHERE status = 'open'`
        );

        if (existingSession.length > 0) {
            return res.status(400).json({ 
                error: 'There is already an open session. Please close it first.' 
            });
        }

        // Create new session
        const result = await runQuerySingle(
            `INSERT INTO cash_sessions 
             (initial_fund, operator_name, notes, opened_at, status) 
             VALUES (?, ?, ?, datetime('now', 'localtime'), 'open')`,
            [initial_fund, operator_name, notes]
        );

        res.status(201).json({ 
            id: result.id, 
            message: 'Cash session opened successfully' 
        });
    } catch (err) {
        console.error('Error opening cash session:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== CLOSE CASH SESSION ====================
router.post('/close', async (req, res) => {
    try {
        const { final_cash, difference, difference_notes } = req.body;

        // Get current open session
        const session = await runQuery(
            `SELECT * FROM cash_sessions WHERE status = 'open' LIMIT 1`
        );

        if (session.length === 0) {
            return res.status(404).json({ error: 'No open session found' });
        }

        // Update session
        await runQuerySingle(
            `UPDATE cash_sessions 
             SET final_cash = ?,
                 difference = ?,
                 difference_notes = ?,
                 closed_at = datetime('now', 'localtime'),
                 status = 'closed'
             WHERE id = ?`,
            [final_cash, difference, difference_notes, session[0].id]
        );

        res.json({ message: 'Cash session closed successfully' });
    } catch (err) {
        console.error('Error closing cash session:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== GET SESSION BY ID ====================
router.get('/sessions/:id', async (req, res) => {
    try {
        const session = await runQuery(
            `SELECT * FROM cash_sessions WHERE id = ?`,
            [req.params.id]
        );

        if (session.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session[0]);
    } catch (err) {
        console.error('Error fetching session:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

