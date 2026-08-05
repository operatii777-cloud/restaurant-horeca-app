/**
 * T-CL-018 — Manager approvals journal (READ ONLY)
 * GET /api/orders/manager-approvals?from=&to=&type=void|discount|all&limit=&offset=
 *
 * Does NOT create tables / does NOT touch write-path.
 * Maps whatever columns exist on order_voids + discount_approval_log
 * into the normalized response shape.
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
  });
}

function tableExists(db, name) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [name],
      (err, row) => (err ? reject(err) : resolve(!!row))
    );
  });
}

function pragmaColumns(db, table) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) reject(err);
      else resolve(new Set((rows || []).map((r) => r.name)));
    });
  });
}

function pickCol(cols, candidates, fallbackSql = 'NULL') {
  for (const c of candidates) {
    if (cols.has(c)) return c;
  }
  return fallbackSql;
}

function requireStaffJwt(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager' || req.user.role_name)) {
    return next();
  }
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ') && auth.length > 20) {
    return next();
  }
  if (process.env.NODE_ENV === 'development' || process.env.ALLOW_REPORT_OPEN === '1') {
    return next();
  }
  return res.status(401).json({ success: false, error: 'JWT required (admin/manager)' });
}

function dateExpr(cols, alias) {
  const ts = pickCol(cols, ['approved_at', 'created_at', 'at', 'timestamp'], null);
  return ts ? `${alias}.${ts}` : `NULL`;
}

router.get('/manager-approvals', requireStaffJwt, async (req, res) => {
  try {
    const db = await dbPromise;
    const { from, to, type = 'all', limit = '100', offset = '0' } = req.query;
    const lim = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 1000);
    const off = Math.max(parseInt(offset, 10) || 0, 0);

    const hasVoids = await tableExists(db, 'order_voids');
    const hasDiscounts = await tableExists(db, 'discount_approval_log');

    if (!hasVoids && !hasDiscounts) {
      return res.status(503).json({
        success: false,
        error:
          'Tables order_voids / discount_approval_log missing on this DB. Commit+push Windows write-path schema, then retry.',
        missing: ['order_voids', 'discount_approval_log'],
      });
    }

    const rows = [];

    if ((type === 'all' || type === 'void') && hasVoids) {
      const cols = await pragmaColumns(db, 'order_voids');
      const amountCol = pickCol(cols, ['order_total', 'amount', 'total'], '0');
      const reasonCol = pickCol(cols, ['reason_or_percent', 'reason'], `''`);
      const initiatedCol = pickCol(cols, ['initiated_by', 'initiated_by_name'], `NULL`);
      const approvedIdCol = pickCol(cols, ['approved_by_id', 'approved_by'], `NULL`);
      const approvedNameCol = pickCol(cols, ['approved_by_username', 'approved_by_name'], `''`);
      const orderIdCol = pickCol(cols, ['order_id', 'orderId'], `NULL`);
      const idCol = pickCol(cols, ['id'], `NULL`);
      const atExpr = dateExpr(cols, 'v');

      const clauses = [];
      const params = [];
      if (from && atExpr !== 'NULL') {
        clauses.push(`DATE(${atExpr}) >= DATE(?)`);
        params.push(from);
      }
      if (to && atExpr !== 'NULL') {
        clauses.push(`DATE(${atExpr}) <= DATE(?)`);
        params.push(to);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

      const voids = await all(
        db,
        `SELECT
           ${idCol === 'NULL' ? 'NULL' : 'v.' + idCol} as id,
           'void' as type,
           ${orderIdCol === 'NULL' ? 'NULL' : 'v.' + orderIdCol} as orderId,
           ${amountCol === '0' ? '0' : 'v.' + amountCol} as amount,
           ${reasonCol === `''` ? `''` : 'v.' + reasonCol} as reasonOrPercent,
           ${initiatedCol === 'NULL' ? 'NULL' : 'v.' + initiatedCol} as initiatedBy,
           ${approvedIdCol === 'NULL' ? 'NULL' : 'v.' + approvedIdCol} as approvedById,
           ${approvedNameCol === `''` ? `''` : 'v.' + approvedNameCol} as approvedByUsername,
           ${atExpr} as at
         FROM order_voids v
         ${where}
         ORDER BY at DESC`,
        params
      );
      rows.push(...voids);
    }

    if ((type === 'all' || type === 'discount') && hasDiscounts) {
      const cols = await pragmaColumns(db, 'discount_approval_log');
      const amountCol = pickCol(cols, ['discount_amount', 'amount'], '0');
      const reasonCol = pickCol(cols, ['reason_or_percent', 'reason', 'discount_value'], `''`);
      const initiatedCol = pickCol(cols, ['initiated_by', 'initiated_by_name'], `NULL`);
      const approvedIdCol = pickCol(cols, ['approved_by_id', 'approved_by'], `NULL`);
      const approvedNameCol = pickCol(cols, ['approved_by_username', 'approved_by_name'], `''`);
      const orderIdCol = pickCol(cols, ['order_id', 'orderId'], `NULL`);
      const idCol = pickCol(cols, ['id'], `NULL`);
      const atExpr = dateExpr(cols, 'd');

      const clauses = [];
      const params = [];
      if (from && atExpr !== 'NULL') {
        clauses.push(`DATE(${atExpr}) >= DATE(?)`);
        params.push(from);
      }
      if (to && atExpr !== 'NULL') {
        clauses.push(`DATE(${atExpr}) <= DATE(?)`);
        params.push(to);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

      const discounts = await all(
        db,
        `SELECT
           ${idCol === 'NULL' ? 'NULL' : 'd.' + idCol} as id,
           'discount' as type,
           ${orderIdCol === 'NULL' ? 'NULL' : 'd.' + orderIdCol} as orderId,
           ${amountCol === '0' ? '0' : 'd.' + amountCol} as amount,
           ${reasonCol === `''` ? `''` : 'd.' + reasonCol} as reasonOrPercent,
           ${initiatedCol === 'NULL' ? 'NULL' : 'd.' + initiatedCol} as initiatedBy,
           ${approvedIdCol === 'NULL' ? 'NULL' : 'd.' + approvedIdCol} as approvedById,
           ${approvedNameCol === `''` ? `''` : 'd.' + approvedNameCol} as approvedByUsername,
           ${atExpr} as at
         FROM discount_approval_log d
         ${where}
         ORDER BY at DESC`,
        params
      );
      rows.push(...discounts);
    }

    rows.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
    const total = rows.length;
    const page = rows.slice(off, off + lim).map((r) => ({
      id: r.id,
      type: r.type,
      orderId: r.orderId,
      amount: r.amount,
      reasonOrPercent: r.reasonOrPercent,
      initiatedBy: r.initiatedBy,
      approvedById: r.approvedById,
      approvedByUsername: r.approvedByUsername,
      at: r.at,
    }));

    res.json({
      success: true,
      data: page,
      meta: { total, limit: lim, offset: off, type, from: from || null, to: to || null },
      schemaPresent: { order_voids: hasVoids, discount_approval_log: hasDiscounts },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
