/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/cash-register.js
 */

const { dbPromise } = require('../../../../database');

const runQuery = async (sql, params = []) => {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const runQuerySingle = async (sql, params = []) => {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

// GET /api/cash-register/current
async function getCurrentSession(req, res, next) {
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
    } catch (error) {
        next(error);
    }
}

// GET /api/cash-register/sessions
async function getSessions(req, res, next) {
    try {
        const sessions = await runQuery(
            `SELECT * FROM cash_sessions 
             ORDER BY opened_at DESC 
             LIMIT 100`
        );
        res.json(sessions);
    } catch (error) {
        next(error);
    }
}

// GET /api/cash-register/sessions/:id
async function getSessionById(req, res, next) {
    try {
        const session = await runQuery(
            `SELECT * FROM cash_sessions WHERE id = ?`,
            [req.params.id]
        );

        if (session.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session[0]);
    } catch (error) {
        next(error);
    }
}

// POST /api/cash-register/open
async function openSession(req, res, next) {
    try {
        const { initial_fund, operator_name, notes } = req.body;

        const existingSession = await runQuery(
            `SELECT * FROM cash_sessions WHERE status = 'open'`
        );

        if (existingSession.length > 0) {
            return res.status(400).json({ 
                error: 'There is already an open session. Please close it first.' 
            });
        }

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
    } catch (error) {
        next(error);
    }
}

// POST /api/cash-register/close
async function closeSession(req, res, next) {
    try {
        const { final_cash, difference, difference_notes } = req.body;

        const session = await runQuery(
            `SELECT * FROM cash_sessions WHERE status = 'open' LIMIT 1`
        );

        if (session.length === 0) {
            return res.status(404).json({ error: 'No open session found' });
        }

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
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCurrentSession,
    getSessions,
    getSessionById,
    openSession,
    closeSession,
};

