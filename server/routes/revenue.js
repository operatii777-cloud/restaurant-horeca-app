const express = require('express');
const router = express.Router();

const menuItems = [
  { id: 'M1', name: 'Steak', price: 85, cost: 35, sales: 120, category: 'Main' },
  { id: 'M2', name: 'Pizza Margherita', price: 42, cost: 10, sales: 300, category: 'Main' },
  { id: 'M3', name: 'Truffle Risotto', price: 95, cost: 40, sales: 40, category: 'Main' },
  { id: 'M4', name: 'Caesar Salad', price: 28, cost: 8, sales: 180, category: 'Salad' },
  { id: 'M5', name: 'Tiramisu', price: 22, cost: 6, sales: 220, category: 'Dessert' },
  { id: 'M6', name: 'Grilled Chicken', price: 55, cost: 18, sales: 160, category: 'Main' },
  { id: 'M7', name: 'Mushroom Soup', price: 18, cost: 5, sales: 90, category: 'Starter' },
  { id: 'M8', name: 'Lobster Bisque', price: 65, cost: 38, sales: 25, category: 'Starter' },
];

const abTests = [];
const priceChanges = [];

function engineerMenu(items) {
  const avgSales = items.reduce((s, i) => s + i.sales, 0) / items.length;
  const avgMargin = items.reduce((s, i) => s + (i.price - i.cost) / i.price, 0) / items.length;
  return items.map(item => {
    const margin = (item.price - item.cost) / item.price;
    const highSales = item.sales >= avgSales;
    const highMargin = margin >= avgMargin;
    let category;
    if (highSales && highMargin) category = 'STAR';
    else if (highSales && !highMargin) category = 'PLOWHORSE';
    else if (!highSales && highMargin) category = 'PUZZLE';
    else category = 'DOG';
    return { ...item, margin: parseFloat((margin * 100).toFixed(1)), menuCategory: category };
  });
}

function detectCannibalization(items) {
  const pairs = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i].category === items[j].category) {
        const priceDiff = Math.abs(items[i].price - items[j].price) / Math.max(items[i].price, items[j].price);
        if (priceDiff < 0.15) {
          pairs.push({ item1: items[i].name, item2: items[j].name, priceDiff: (priceDiff * 100).toFixed(1) + '%', risk: 'HIGH' });
        }
      }
    }
  }
  return pairs;
}

// GET /api/revenue/menu-engineering - Menu engineering matrix
router.get('/menu-engineering', (req, res) => {
  const engineered = engineerMenu(menuItems);
  const stars = engineered.filter(i => i.menuCategory === 'STAR');
  const dogs = engineered.filter(i => i.menuCategory === 'DOG');
  const puzzles = engineered.filter(i => i.menuCategory === 'PUZZLE');
  const plowhorses = engineered.filter(i => i.menuCategory === 'PLOWHORSE');
  res.json({ items: engineered, summary: { stars: stars.length, dogs: dogs.length, puzzles: puzzles.length, plowhorses: plowhorses.length } });
});

// GET /api/revenue/cannibalization - Product cannibalization detection
router.get('/cannibalization', (req, res) => {
  res.json({ pairs: detectCannibalization(menuItems) });
});

// GET /api/revenue/margins - Real-time margin tracking
router.get('/margins', (req, res) => {
  const totalRevenue = menuItems.reduce((s, i) => s + i.price * i.sales, 0);
  const totalCost = menuItems.reduce((s, i) => s + i.cost * i.sales, 0);
  const overallMargin = ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1);
  const byItem = menuItems.map(i => ({
    id: i.id, name: i.name,
    revenue: i.price * i.sales,
    cost: i.cost * i.sales,
    margin: ((i.price - i.cost) / i.price * 100).toFixed(1) + '%',
  }));
  res.json({ totalRevenue, totalCost, overallMargin: overallMargin + '%', byItem });
});

// GET /api/revenue/elasticity - Price elasticity detection
router.get('/elasticity', (req, res) => {
  const elasticity = menuItems.map(i => ({
    id: i.id, name: i.name,
    elasticity: -(0.5 + Math.random() * 1.5).toFixed(2),
    suggestion: 'Can increase by 5-10% without significant volume drop',
  }));
  res.json({ elasticity });
});

// POST /api/revenue/ab-test - Start A/B price test
router.post('/ab-test', (req, res) => {
  const { itemId, priceA, priceB, duration } = req.body;
  const item = menuItems.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const test = {
    id: 'AB-' + Date.now(), itemId, itemName: item.name,
    priceA, priceB, duration: duration || 7,
    status: 'RUNNING',
    startedAt: new Date().toISOString(),
    results: null,
  };
  abTests.push(test);
  res.json(test);
});

// GET /api/revenue/ab-tests - List A/B tests
router.get('/ab-tests', (req, res) => res.json({ tests: abTests }));

// GET /api/revenue/remove-suggestions - Suggest items to remove
router.get('/remove-suggestions', (req, res) => {
  const engineered = engineerMenu(menuItems);
  const dogs = engineered.filter(i => i.menuCategory === 'DOG');
  res.json({ suggestions: dogs.map(d => ({ ...d, reason: 'Low sales AND low margin - candidate for removal' })) });
});

// GET /api/revenue/summary - Overall revenue summary
router.get('/summary', (req, res) => {
  const totalRevenue = menuItems.reduce((s, i) => s + i.price * i.sales, 0);
  const totalCost = menuItems.reduce((s, i) => s + i.cost * i.sales, 0);
  res.json({
    totalRevenue, totalCost,
    grossProfit: totalRevenue - totalCost,
    grossMargin: ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1) + '%',
    totalItems: menuItems.length,
    abTestsActive: abTests.filter(t => t.status === 'RUNNING').length,
  });
});

module.exports = router;
