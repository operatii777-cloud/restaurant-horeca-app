/**
 * Courier Cashback Wallet API (T-CL-020)
 * /api/courier-wallet
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
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

async function ensureWallet(db, courierId) {
  let wallet = await get(db, 'SELECT * FROM courier_wallets WHERE courier_id = ?', [courierId]);
  if (!wallet) {
    const created = await run(db, 'INSERT INTO courier_wallets (courier_id, balance) VALUES (?, 0)', [courierId]);
    wallet = await get(db, 'SELECT * FROM courier_wallets WHERE id = ?', [created.id]);
  }
  return wallet;
}

async function applyTransaction(db, { courierId, type, amount, referenceType, referenceId, description, createdBy }) {
  const wallet = await ensureWallet(db, courierId);
  const delta = type === 'debit' || type === 'redeem' || type === 'adjustment_down' ? -Math.abs(amount) : Math.abs(amount);
  const balanceAfter = Number(wallet.balance || 0) + delta;
  if (balanceAfter < -0.001 && (type === 'debit' || type === 'redeem')) {
    throw new Error('Sold insuficient în wallet');
  }

  await run(
    db,
    `UPDATE courier_wallets SET
       balance = ?,
       lifetime_earned = lifetime_earned + ?,
       lifetime_redeemed = lifetime_redeemed + ?,
       updated_at = datetime('now')
     WHERE id = ?`,
    [
      balanceAfter,
      delta > 0 ? delta : 0,
      delta < 0 ? Math.abs(delta) : 0,
      wallet.id,
    ]
  );

  const tx = await run(
    db,
    `INSERT INTO courier_wallet_transactions
     (courier_id, wallet_id, type, amount, balance_after, reference_type, reference_id, description, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [courierId, wallet.id, type, delta, balanceAfter, referenceType || null, referenceId || null, description || null, createdBy || null]
  );

  return { transactionId: tx.id, balance: balanceAfter };
}

// Cashback rules — BEFORE /:courierId
router.get('/rules', async (req, res) => {
  try {
    const db = await dbPromise;
    const rules = await all(db, 'SELECT * FROM courier_cashback_rules ORDER BY id DESC');
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const db = await dbPromise;
    const { name, percent = 0, fixed_amount = 0, min_delivery_fee = 0, is_active = 1 } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name required' });
    const result = await run(
      db,
      `INSERT INTO courier_cashback_rules (name, percent, fixed_amount, min_delivery_fee, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [name, percent, fixed_amount, min_delivery_fee, is_active ? 1 : 0]
    );
    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/courier-wallet — list wallets
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const rows = await all(
      db,
      `SELECT w.*, c.name as courier_name, c.phone as courier_phone
       FROM courier_wallets w
       LEFT JOIN couriers c ON c.id = w.courier_id
       ORDER BY w.updated_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/courier-wallet/:courierId
router.get('/:courierId', async (req, res) => {
  try {
    const db = await dbPromise;
    const courierId = parseInt(req.params.courierId, 10);
    if (Number.isNaN(courierId)) {
      return res.status(400).json({ success: false, error: 'Invalid courier id' });
    }
    const wallet = await ensureWallet(db, courierId);
    const transactions = await all(
      db,
      `SELECT * FROM courier_wallet_transactions
       WHERE courier_id = ? ORDER BY created_at DESC LIMIT 100`,
      [courierId]
    );
    res.json({ success: true, data: { wallet, transactions } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/courier-wallet/:courierId/credit — cashback / top-up
router.post('/:courierId/credit', async (req, res) => {
  try {
    const db = await dbPromise;
    const courierId = parseInt(req.params.courierId, 10);
    const { amount, description, reference_type, reference_id, created_by, type = 'cashback' } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'amount must be > 0' });
    }
    const result = await applyTransaction(db, {
      courierId,
      type,
      amount: Number(amount),
      referenceType: reference_type,
      referenceId: reference_id,
      description: description || 'Cashback credit',
      createdBy: created_by,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/courier-wallet/:courierId/redeem
router.post('/:courierId/redeem', async (req, res) => {
  try {
    const db = await dbPromise;
    const courierId = parseInt(req.params.courierId, 10);
    const { amount, description, created_by } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'amount must be > 0' });
    }
    const result = await applyTransaction(db, {
      courierId,
      type: 'redeem',
      amount: Number(amount),
      description: description || 'Redeem cashback',
      createdBy: created_by,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes('Sold insuficient') ? 400 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/courier-wallet/:courierId/cashback-from-delivery
 * Credits wallet based on active cashback rule + delivery fee
 */
router.post('/:courierId/cashback-from-delivery', async (req, res) => {
  try {
    const db = await dbPromise;
    const courierId = parseInt(req.params.courierId, 10);
    const { delivery_fee = 0, tip_amount = 0, delivery_id, order_id } = req.body;

    const rule = await get(db, 'SELECT * FROM courier_cashback_rules WHERE is_active = 1 ORDER BY id DESC LIMIT 1');
    if (!rule) {
      return res.json({ success: true, data: { credited: 0, message: 'No active cashback rule' } });
    }

    const fee = Number(delivery_fee) || 0;
    if (fee < (rule.min_delivery_fee || 0)) {
      return res.json({ success: true, data: { credited: 0, message: 'Below min delivery fee' } });
    }

    const cashback = (fee * (Number(rule.percent) || 0)) / 100 + (Number(rule.fixed_amount) || 0);
    if (cashback <= 0) {
      return res.json({ success: true, data: { credited: 0 } });
    }

    const result = await applyTransaction(db, {
      courierId,
      type: 'cashback',
      amount: cashback,
      referenceType: 'delivery',
      referenceId: delivery_id || order_id || null,
      description: `Cashback ${rule.percent}% + ${rule.fixed_amount} (fee ${fee}, tip ${tip_amount})`,
    });

    res.status(201).json({ success: true, data: { ...result, credited: cashback, rule_id: rule.id } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
