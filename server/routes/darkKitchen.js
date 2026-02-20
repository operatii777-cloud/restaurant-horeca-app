const express = require('express');
const router = express.Router();

const virtualBrands = new Map();
const ghostMenus = new Map();
const kitchens = new Map();
const costAllocations = [];

// Seed kitchens
['Kitchen-Central', 'Kitchen-North', 'Kitchen-East'].forEach(k => {
  kitchens.set(k, { id: k, capacity: 100, currentLoad: Math.floor(Math.random() * 70), brands: [] });
});

// Seed virtual brands
[
  { id: 'VB-001', name: 'UrbanBurger', platform: 'Glovo', kitchen: 'Kitchen-Central' },
  { id: 'VB-002', name: 'PizzaCloud', platform: 'Bolt Food', kitchen: 'Kitchen-Central' },
  { id: 'VB-003', name: 'SushiDrop', platform: 'Tazz', kitchen: 'Kitchen-North' },
].forEach(b => {
  virtualBrands.set(b.id, { ...b, active: true, revenue: Math.floor(Math.random() * 10000), orders: Math.floor(Math.random() * 200) });
  const k = kitchens.get(b.kitchen);
  if (k) k.brands.push(b.id);
});

// GET /api/dark-kitchen/brands - List virtual brands
router.get('/brands', (req, res) => {
  const list = [...virtualBrands.values()];
  res.json({ brands: list, total: list.length });
});

// POST /api/dark-kitchen/brands - Create virtual brand
router.post('/brands', (req, res) => {
  const { name, platform, kitchen } = req.body;
  if (!name || !platform) return res.status(400).json({ error: 'name and platform required' });
  const id = 'VB-' + Date.now();
  const brand = { id, name, platform, kitchen: kitchen || 'Kitchen-Central', active: true, revenue: 0, orders: 0 };
  virtualBrands.set(id, brand);
  const k = kitchens.get(brand.kitchen);
  if (k) k.brands.push(id);
  res.json(brand);
});

// PUT /api/dark-kitchen/brands/:id - Update virtual brand
router.put('/brands/:id', (req, res) => {
  const brand = virtualBrands.get(req.params.id);
  if (!brand) return res.status(404).json({ error: 'Brand not found' });
  Object.assign(brand, req.body);
  res.json(brand);
});

// GET /api/dark-kitchen/ghost-menus - List ghost menus
router.get('/ghost-menus', (req, res) => {
  const result = {};
  ghostMenus.forEach((menu, brandId) => { result[brandId] = menu; });
  res.json(result);
});

// POST /api/dark-kitchen/ghost-menus/:brandId - Set ghost menu for brand
router.post('/ghost-menus/:brandId', (req, res) => {
  const { brandId } = req.params;
  if (!virtualBrands.has(brandId)) return res.status(404).json({ error: 'Brand not found' });
  ghostMenus.set(brandId, { brandId, items: req.body.items || [], updatedAt: new Date().toISOString() });
  res.json(ghostMenus.get(brandId));
});

// GET /api/dark-kitchen/kitchens - List shared kitchens
router.get('/kitchens', (req, res) => {
  const list = [...kitchens.values()];
  res.json({ kitchens: list });
});

// GET /api/dark-kitchen/performance - Performance per virtual brand
router.get('/performance', (req, res) => {
  const perf = [...virtualBrands.values()].map(b => ({
    brandId: b.id,
    name: b.name,
    platform: b.platform,
    revenue: b.revenue,
    orders: b.orders,
    avgOrderValue: b.orders > 0 ? (b.revenue / b.orders).toFixed(2) : 0,
    status: b.active ? 'ACTIVE' : 'INACTIVE',
  }));
  res.json({ performance: perf });
});

// POST /api/dark-kitchen/cost-allocation - Record cost allocation
router.post('/cost-allocation', (req, res) => {
  const { brandId, kitchenId, costType, amount, period } = req.body;
  const allocation = { id: 'COST-' + Date.now(), brandId, kitchenId, costType, amount, period, ts: new Date().toISOString() };
  costAllocations.push(allocation);
  res.json(allocation);
});

// GET /api/dark-kitchen/cost-allocation - Get cost allocations
router.get('/cost-allocation', (req, res) => {
  const { brandId } = req.query;
  let list = costAllocations;
  if (brandId) list = list.filter(c => c.brandId === brandId);
  res.json({ allocations: list });
});

module.exports = router;
