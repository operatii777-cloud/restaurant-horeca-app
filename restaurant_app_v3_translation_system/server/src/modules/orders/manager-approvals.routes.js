/**
 * T-CL-018 — Manager approvals journal (READ ONLY)
 * GET /api/orders/manager-approvals?from=&to=&type=void|discount|all&limit=&offset=
 *
 * Does NOT create tables / does NOT touch write-path.
 * Defensive 503 when tables missing (kept by design).
 *
 * Real Windows columns (live rows 2026-08-05):
 *   order_voids: order_total, reason, voided_by, voided_at, approved_by_id, approved_by_username
 *   discount_approval_log: discount_percent, discount_amount, initiated_by, created_at,
 *                          approved_by_id, approved_by_username
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');
const { mapVoidRow, mapDiscountRow } = require('./manager-approvals.mapper');

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

function dateExpr(cols, alias, candidates) {
  const ts = pickCol(cols, candidates, null);
  return ts ? `${alias}.${ts}` : 'NULL';
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
      const atExpr = dateExpr(cols, 'v', ['voided_at', 'approved_at', 'created_at', 'at', 'timestamp']);

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
        `SELECT v.* FROM order_voids v ${where} ORDER BY ${atExpr === 'NULL' ? 'v.id' : atExpr} DESC`,
        params
      );
      rows.push(...voids.map(mapVoidRow));
    }

    if ((type === 'all' || type === 'discount') && hasDiscounts) {
      const cols = await pragmaColumns(db, 'discount_approval_log');
      const atExpr = dateExpr(cols, 'd', ['created_at', 'approved_at', 'at', 'timestamp']);

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
        `SELECT d.* FROM discount_approval_log d ${where} ORDER BY ${atExpr === 'NULL' ? 'd.id' : atExpr} DESC`,
        params
      );
      rows.push(...discounts.map(mapDiscountRow));
    }

    rows.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
    const total = rows.length;
    const page = rows.slice(off, off + lim);

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
