const express = require('express');
const router = express.Router();

const transactions = [];
const pspConfig = {
  stripe: { fee: 0.029, enabled: true, priority: 1 },
  adyen: { fee: 0.025, enabled: true, priority: 2 },
  worldline: { fee: 0.022, enabled: true, priority: 3 },
};

function smartRoutePSP(amount, currency) {
  const available = Object.entries(pspConfig)
    .filter(([, cfg]) => cfg.enabled)
    .sort((a, b) => a[1].fee - b[1].fee);
  if (available.length === 0) throw new Error('No PSP available');
  return available[0][0];
}

function fraudScore(paymentData) {
  let score = 0;
  if (paymentData.amount > 5000) score += 20;
  if (paymentData.currency !== 'RON' && paymentData.currency !== 'EUR') score += 10;
  return score;
}

// POST /api/payments/charge - Process payment with smart routing
router.post('/charge', (req, res) => {
  const { amount, currency, method, guestId, orderId, bnpl } = req.body;
  if (!amount || !currency) return res.status(400).json({ error: 'amount and currency required' });

  const fraud = fraudScore(req.body);
  if (fraud >= 70) return res.status(402).json({ error: 'Payment blocked by fraud engine', fraudScore: fraud });

  let psp;
  try { psp = smartRoutePSP(amount, currency); }
  catch (e) { return res.status(503).json({ error: e.message }); }

  const tx = {
    id: 'TXN-' + Date.now(),
    guestId, orderId,
    amount, currency,
    psp,
    fee: pspConfig[psp].fee * amount,
    method: bnpl ? 'BNPL' : (method || 'card'),
    fraudScore: fraud,
    status: 'COMPLETED',
    ts: new Date().toISOString(),
  };
  transactions.push(tx);
  res.json(tx);
});

// POST /api/payments/refund - Refund a transaction
router.post('/refund', (req, res) => {
  const { transactionId, amount, reason } = req.body;
  const tx = transactions.find(t => t.id === transactionId);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const refund = {
    id: 'REF-' + Date.now(),
    originalTxId: transactionId,
    amount: amount || tx.amount,
    reason,
    psp: tx.psp,
    status: 'REFUNDED',
    ts: new Date().toISOString(),
  };
  transactions.push(refund);
  res.json(refund);
});

// GET /api/payments/transactions - List transactions
router.get('/transactions', (req, res) => {
  const { guestId, status } = req.query;
  let list = transactions;
  if (guestId) list = list.filter(t => t.guestId === guestId);
  if (status) list = list.filter(t => t.status === status);
  res.json({ transactions: list, total: list.length });
});

// GET /api/payments/psp-config - PSP configuration
router.get('/psp-config', (req, res) => res.json(pspConfig));

// PUT /api/payments/psp-config/:psp - Update PSP config
router.put('/psp-config/:psp', (req, res) => {
  const { psp } = req.params;
  if (!pspConfig[psp]) return res.status(404).json({ error: 'PSP not found' });
  Object.assign(pspConfig[psp], req.body);
  res.json(pspConfig[psp]);
});

// POST /api/payments/gift-card - Issue gift card
router.post('/gift-card', (req, res) => {
  const { amount, currency, guestId } = req.body;
  const card = {
    id: 'GC-' + Date.now(),
    code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    amount, currency,
    guestId,
    status: 'ACTIVE',
    issuedAt: new Date().toISOString(),
  };
  transactions.push(card);
  res.json(card);
});

// GET /api/payments/analytics - Payment analytics
router.get('/analytics', (req, res) => {
  const completed = transactions.filter(t => t.status === 'COMPLETED');
  const refunded = transactions.filter(t => t.status === 'REFUNDED');
  const totalRevenue = completed.reduce((sum, t) => sum + (t.amount || 0), 0);
  const pspStats = {};
  completed.forEach(t => {
    if (!t.psp) return;
    pspStats[t.psp] = pspStats[t.psp] || { count: 0, total: 0, fees: 0 };
    pspStats[t.psp].count++;
    pspStats[t.psp].total += t.amount || 0;
    pspStats[t.psp].fees += t.fee || 0;
  });
  res.json({ totalRevenue, refundCount: refunded.length, pspStats, totalTransactions: completed.length });
});

module.exports = router;
