const express = require('express');
const router = express.Router();

const apiKeys = new Map();
const plugins = [];
const usageLogs = [];

// Seed some plugins
[
  { id: 'PLG-001', name: 'Loyalty Boost', author: 'DevCo', price: 99, category: 'Marketing', installs: 145 },
  { id: 'PLG-002', name: 'Smart Reservations', author: 'TechLabs', price: 149, category: 'Operations', installs: 89 },
  { id: 'PLG-003', name: 'Food Cost AI', author: 'AI Foods', price: 199, category: 'Analytics', installs: 67 },
].forEach(p => plugins.push(p));

// GET /api/api-economy/docs - API documentation (public portal)
router.get('/docs', (req, res) => {
  res.json({
    version: '1.0.0',
    title: 'Horeca Platform API',
    description: 'Public developer API for the Horeca restaurant platform',
    endpoints: [
      { path: '/api/guests', method: 'POST', description: 'Create or lookup a guest' },
      { path: '/api/payments/charge', method: 'POST', description: 'Process a payment' },
      { path: '/api/war-room/live', method: 'GET', description: 'Get live operations metrics' },
      { path: '/api/supply-chain/inventory', method: 'GET', description: 'Get inventory levels' },
      { path: '/api/revenue/menu-engineering', method: 'GET', description: 'Get menu engineering matrix' },
    ],
    authentication: 'API Key in X-API-Key header',
    rateLimit: '1000 requests/hour',
    pricingTiers: [
      { name: 'Free', requests: 1000, price: 0 },
      { name: 'Starter', requests: 10000, price: 29 },
      { name: 'Pro', requests: 100000, price: 99 },
      { name: 'Enterprise', requests: 'unlimited', price: 499 },
    ],
  });
});

// POST /api/api-economy/keys - Generate API key
router.post('/keys', (req, res) => {
  const { appName, tier, email } = req.body;
  if (!appName || !email) return res.status(400).json({ error: 'appName and email required' });
  const key = 'hrc_' + Buffer.from(Math.random().toString(36)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  const record = { id: 'KEY-' + Date.now(), appName, email, tier: tier || 'Free', key, active: true, createdAt: new Date().toISOString(), requestCount: 0 };
  apiKeys.set(record.id, record);
  res.json({ ...record, key: key.substring(0, 10) + '...' + key.slice(-4) }); // Mask key
});

// GET /api/api-economy/keys - List API keys (admin)
router.get('/keys', (req, res) => {
  const list = [...apiKeys.values()].map(k => ({ ...k, key: k.key.substring(0, 10) + '...' }));
  res.json({ keys: list });
});

// GET /api/api-economy/plugins - Plugin marketplace
router.get('/plugins', (req, res) => {
  const { category } = req.query;
  let list = plugins;
  if (category) list = list.filter(p => p.category === category);
  res.json({ plugins: list, total: list.length });
});

// POST /api/api-economy/plugins - Submit new plugin
router.post('/plugins', (req, res) => {
  const { name, author, price, category, description } = req.body;
  if (!name || !author) return res.status(400).json({ error: 'name and author required' });
  const plugin = { id: 'PLG-' + Date.now(), name, author, price: price || 0, category: category || 'General', description, installs: 0, status: 'PENDING_REVIEW', submittedAt: new Date().toISOString() };
  plugins.push(plugin);
  res.json(plugin);
});

// GET /api/api-economy/usage - API usage statistics
router.get('/usage', (req, res) => {
  const totalRequests = [...apiKeys.values()].reduce((s, k) => s + k.requestCount, 0);
  const revenue = [...apiKeys.values()].reduce((s, k) => {
    const tiers = { Free: 0, Starter: 29, Pro: 99, Enterprise: 499 };
    return s + (tiers[k.tier] || 0);
  }, 0);
  res.json({ totalKeys: apiKeys.size, totalRequests, monthlyRevenue: revenue, logs: usageLogs.slice(-10) });
});

// GET /api/api-economy/revenue-share - Revenue share model
router.get('/revenue-share', (req, res) => {
  const pluginRevenue = plugins.reduce((s, p) => s + p.price * p.installs, 0);
  res.json({
    totalPluginRevenue: pluginRevenue,
    platformShare: (pluginRevenue * 0.3).toFixed(2),
    developerShare: (pluginRevenue * 0.7).toFixed(2),
    shareModel: '70% developer / 30% platform',
  });
});

module.exports = router;
