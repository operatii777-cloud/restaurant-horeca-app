/**
 * Manager Approvals Journal API (T-CL-018)
 * GET /api/manager-approvals — unified void + discount approval journal
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

/**
 * GET /api/manager-approvals
 * Query: type=void|discount|all, startDate, endDate, limit
 */
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const { type = 'all', startDate, endDate, limit = 200 } = req.query;
    const lim = Math.min(parseInt(limit, 10) || 200, 1000);
    const entries = [];

    const dateFilter = (alias) => {
      const clauses = [];
      const params = [];
      if (startDate) {
        clauses.push(`DATE(COALESCE(${alias}.approved_at, ${alias}.created_at)) >= DATE(?)`);
        params.push(startDate);
      }
      if (endDate) {
        clauses.push(`DATE(COALESCE(${alias}.approved_at, ${alias}.created_at)) <= DATE(?)`);
        params.push(endDate);
      }
      return { clauses, params };
    };

    if (type === 'all' || type === 'void') {
      const df = dateFilter('v');
      const voids = await all(
        db,
        `SELECT v.*, o.table_number, o.type as order_type, o.total as order_total
         FROM order_voids v
         LEFT JOIN orders o ON o.id = v.order_id
         WHERE 1=1 ${df.clauses.length ? 'AND ' + df.clauses.join(' AND ') : ''}
         ORDER BY COALESCE(v.approved_at, v.created_at) DESC
         LIMIT ?`,
        [...df.params, lim]
      );
      for (const row of voids) {
        entries.push({
          id: `void-${row.id}`,
          journal_type: 'void',
          record_id: row.id,
          order_id: row.order_id,
          order_item_id: row.order_item_id,
          action: row.void_type || 'void',
          amount: row.amount,
          reason: row.reason,
          initiated_by: row.initiated_by,
          initiated_by_name: row.initiated_by_name,
          approved_by: row.approved_by,
          approved_by_name: row.approved_by_name,
          approved_at: row.approved_at || row.created_at,
          pin_verified: !!row.pin_verified,
          source: row.source,
          created_at: row.created_at,
          table_number: row.table_number,
          order_type: row.order_type,
        });
      }
    }

    if (type === 'all' || type === 'discount') {
      const df = dateFilter('d');
      const discounts = await all(
        db,
        `SELECT d.*, o.table_number, o.type as order_type, o.total as order_total
         FROM discount_approval_log d
         LEFT JOIN orders o ON o.id = d.order_id
         WHERE 1=1 ${df.clauses.length ? 'AND ' + df.clauses.join(' AND ') : ''}
         ORDER BY COALESCE(d.approved_at, d.created_at) DESC
         LIMIT ?`,
        [...df.params, lim]
      );
      for (const row of discounts) {
        entries.push({
          id: `discount-${row.id}`,
          journal_type: 'discount',
          record_id: row.id,
          order_id: row.order_id,
          order_item_id: row.order_item_id,
          action: row.discount_type || 'discount',
          amount: row.discount_amount,
          reason: row.reason,
          initiated_by: row.initiated_by,
          initiated_by_name: row.initiated_by_name,
          approved_by: row.approved_by,
          approved_by_name: row.approved_by_name,
          approved_at: row.approved_at || row.created_at,
          pin_verified: !!row.pin_verified,
          source: row.source,
          created_at: row.created_at,
          table_number: row.table_number,
          order_type: row.order_type,
          discount_value: row.discount_value,
        });
      }

      // Backfill from order_discounts when journal is empty / for legacy rows
      if (discounts.length === 0) {
        const legacy = await all(
          db,
          `SELECT od.*, o.table_number, o.type as order_type,
                  u.name as approved_by_name
           FROM order_discounts od
           LEFT JOIN orders o ON o.id = od.order_id
           LEFT JOIN users u ON u.id = od.approved_by
           ORDER BY COALESCE(od.approved_at, od.created_at) DESC
           LIMIT ?`,
          [lim]
        ).catch(() => []);
        for (const row of legacy) {
          entries.push({
            id: `order-discount-${row.id}`,
            journal_type: 'discount',
            record_id: row.id,
            order_id: row.order_id,
            order_item_id: row.order_item_id,
            action: row.type || 'discount',
            amount: row.amount,
            reason: row.reason,
            initiated_by: row.approved_by,
            initiated_by_name: row.approved_by_name,
            approved_by: row.approved_by,
            approved_by_name: row.approved_by_name,
            approved_at: row.approved_at || row.created_at,
            pin_verified: false,
            source: 'legacy_order_discounts',
            created_at: row.created_at,
            table_number: row.table_number,
            order_type: row.order_type,
            discount_value: row.value,
          });
        }
      }
    }

    entries.sort((a, b) => {
      const ta = new Date(a.approved_at || a.created_at || 0).getTime();
      const tb = new Date(b.approved_at || b.created_at || 0).getTime();
      return tb - ta;
    });

    res.json({
      success: true,
      data: entries.slice(0, lim),
      count: Math.min(entries.length, lim),
    });
  } catch (error) {
    console.error('GET /api/manager-approvals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/manager-approvals/voids
 * Record a manager-approved void
 */
router.post('/voids', async (req, res) => {
  try {
    const db = await dbPromise;
    const {
      order_id,
      order_item_id,
      void_type = 'item',
      reason,
      amount = 0,
      initiated_by,
      initiated_by_name,
      approved_by,
      approved_by_name,
      pin_verified = 1,
      source = 'POS',
      metadata,
    } = req.body;

    if (!order_id && !order_item_id) {
      return res.status(400).json({ success: false, error: 'order_id or order_item_id required' });
    }

    const result = await run(
      db,
      `INSERT INTO order_voids
       (order_id, order_item_id, void_type, reason, amount, initiated_by, initiated_by_name,
        approved_by, approved_by_name, approved_at, pin_verified, source, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)`,
      [
        order_id || null,
        order_item_id || null,
        void_type,
        reason || null,
        amount,
        initiated_by || null,
        initiated_by_name || null,
        approved_by || null,
        approved_by_name || null,
        pin_verified ? 1 : 0,
        source,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    console.error('POST /api/manager-approvals/voids:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/manager-approvals/discounts
 * Record a manager-approved discount
 */
router.post('/discounts', async (req, res) => {
  try {
    const db = await dbPromise;
    const {
      order_id,
      order_item_id,
      order_discount_id,
      discount_definition_id,
      discount_type,
      discount_value,
      discount_amount,
      reason,
      initiated_by,
      initiated_by_name,
      approved_by,
      approved_by_name,
      pin_verified = 1,
      source = 'POS',
      metadata,
    } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, error: 'order_id required' });
    }

    const result = await run(
      db,
      `INSERT INTO discount_approval_log
       (order_id, order_item_id, order_discount_id, discount_definition_id, discount_type,
        discount_value, discount_amount, reason, initiated_by, initiated_by_name,
        approved_by, approved_by_name, approved_at, pin_verified, source, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)`,
      [
        order_id,
        order_item_id || null,
        order_discount_id || null,
        discount_definition_id || null,
        discount_type || null,
        discount_value || null,
        discount_amount || 0,
        reason || null,
        initiated_by || null,
        initiated_by_name || null,
        approved_by || null,
        approved_by_name || null,
        pin_verified ? 1 : 0,
        source,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    console.error('POST /api/manager-approvals/discounts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/manager-approvals/summary
 */
router.get('/summary', async (req, res) => {
  try {
    const db = await dbPromise;
    const voids = await get(db, 'SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM order_voids').catch(() => ({ c: 0, total: 0 }));
    const discounts = await get(db, 'SELECT COUNT(*) as c, COALESCE(SUM(discount_amount),0) as total FROM discount_approval_log').catch(() => ({ c: 0, total: 0 }));
    res.json({
      success: true,
      data: {
        voids_count: voids?.c || 0,
        voids_total: voids?.total || 0,
        discounts_count: discounts?.c || 0,
        discounts_total: discounts?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
