const express = require('express');
const router = express.Router();

// NOTE: In-memory state is used here for demo/development purposes.
// In production, replace with a persistent database (e.g., SQLite/PostgreSQL).
const inventory = new Map();
const suppliers = new Map();
const transfers = [];
const purchaseOrders = [];

// Seed demo data
['LocationA', 'LocationB', 'LocationC'].forEach(loc => {
  inventory.set(loc, {
    tomatoes: Math.floor(Math.random() * 100),
    chicken: Math.floor(Math.random() * 50),
    flour: Math.floor(Math.random() * 200),
    olive_oil: Math.floor(Math.random() * 30),
  });
});
['Supplier1', 'Supplier2', 'Supplier3'].forEach((s, i) => {
  suppliers.set(s, { name: s, reliabilityScore: 80 + i * 5, avgDeliveryDays: 2 + i, priceTrend: 'stable' });
});

// GET /api/supply-chain/inventory - All locations inventory
router.get('/inventory', (req, res) => {
  const result = {};
  inventory.forEach((stock, loc) => { result[loc] = stock; });
  res.json(result);
});

// GET /api/supply-chain/inventory/:location - Single location
router.get('/inventory/:location', (req, res) => {
  const stock = inventory.get(req.params.location);
  if (!stock) return res.status(404).json({ error: 'Location not found' });
  res.json({ location: req.params.location, stock });
});

// POST /api/supply-chain/inventory/:location - Update stock
router.post('/inventory/:location', (req, res) => {
  const { location } = req.params;
  const existing = inventory.get(location) || {};
  inventory.set(location, { ...existing, ...req.body });
  res.json({ location, stock: inventory.get(location) });
});

// GET /api/supply-chain/surplus - Detect surplus across locations
router.get('/surplus', (req, res) => {
  const thresholds = { tomatoes: 80, chicken: 40, flour: 150, olive_oil: 25 };
  const surplus = [];
  inventory.forEach((stock, loc) => {
    Object.entries(stock).forEach(([item, qty]) => {
      if (thresholds[item] && qty > thresholds[item]) {
        surplus.push({ location: loc, item, qty, surplus: qty - thresholds[item] });
      }
    });
  });
  res.json({ surplus });
});

// GET /api/supply-chain/transfer-suggestions - Smart transfer suggestions
router.get('/transfer-suggestions', (req, res) => {
  const thresholds = { tomatoes: 80, chicken: 40, flour: 150, olive_oil: 25 };
  const minimums = { tomatoes: 20, chicken: 10, flour: 50, olive_oil: 5 };
  const suggestions = [];
  const items = new Set();
  inventory.forEach(stock => Object.keys(stock).forEach(k => items.add(k)));

  items.forEach(item => {
    const locs = [];
    inventory.forEach((stock, loc) => locs.push({ loc, qty: stock[item] || 0 }));
    const surplus = locs.filter(l => l.qty > (thresholds[item] || 50));
    const deficit = locs.filter(l => l.qty < (minimums[item] || 10));
    surplus.forEach(s => deficit.forEach(d => {
      const transfer = Math.min(s.qty - (thresholds[item] || 50), (minimums[item] || 10) - d.qty + 10);
      if (transfer > 0) suggestions.push({ from: s.loc, to: d.loc, item, qty: transfer });
    }));
  });
  res.json({ suggestions });
});

// POST /api/supply-chain/transfer - Execute transfer
router.post('/transfer', (req, res) => {
  const { from, to, item, qty } = req.body;
  const fromStock = inventory.get(from);
  const toStock = inventory.get(to);
  if (!fromStock || !toStock) return res.status(404).json({ error: 'Location not found' });
  if ((fromStock[item] || 0) < qty) return res.status(400).json({ error: 'Insufficient stock' });
  fromStock[item] -= qty;
  toStock[item] = (toStock[item] || 0) + qty;
  const t = { id: 'TRF-' + Date.now(), from, to, item, qty, ts: new Date().toISOString() };
  transfers.push(t);
  res.json(t);
});

// GET /api/supply-chain/suppliers - List suppliers with scoring
router.get('/suppliers', (req, res) => {
  const list = [...suppliers.values()];
  res.json({ suppliers: list });
});

// POST /api/supply-chain/purchase-order - Create PO
router.post('/purchase-order', (req, res) => {
  const { supplier, items, location } = req.body;
  const po = {
    id: 'PO-' + Date.now(),
    supplier, items, location,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    expectedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
  };
  purchaseOrders.push(po);
  res.json(po);
});

// GET /api/supply-chain/purchase-orders - List POs
router.get('/purchase-orders', (req, res) => res.json({ purchaseOrders }));

module.exports = router;
