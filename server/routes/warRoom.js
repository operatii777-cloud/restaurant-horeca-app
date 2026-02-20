const express = require('express');
const router = express.Router();

// NOTE: In-memory state is used here for demo/development purposes.
// In production, replace with a persistent database (e.g., SQLite/PostgreSQL).
const liveOrders = [];
const alerts = [];
let metrics = {
  activeOrders: 0,
  avgPrepTime: 12,
  deliverySLA: 95,
  kitchenDelay: 0,
  revenueToday: 0,
  refundSpike: false,
  voidSpike: false,
  locations: {},
};

function checkAlerts() {
  if (metrics.kitchenDelay > 15) {
    alerts.push({ type: 'KITCHEN_DELAY', message: `Kitchen delay: ${metrics.kitchenDelay} min`, severity: 'HIGH', ts: new Date().toISOString() });
  }
  if (metrics.refundSpike) {
    alerts.push({ type: 'REFUND_SPIKE', message: 'Abnormal refund spike detected', severity: 'HIGH', ts: new Date().toISOString() });
  }
  if (metrics.voidSpike) {
    alerts.push({ type: 'VOID_SPIKE', message: 'Abnormal void spike detected', severity: 'MEDIUM', ts: new Date().toISOString() });
  }
}

// Seed some demo data
['LocationA', 'LocationB', 'LocationC'].forEach(loc => {
  metrics.locations[loc] = {
    activeOrders: Math.floor(Math.random() * 20),
    revenue: Math.floor(Math.random() * 10000),
    avgPrepTime: 10 + Math.floor(Math.random() * 10),
    staffOnDuty: 3 + Math.floor(Math.random() * 4),
    criticalStock: Math.random() > 0.8,
  };
});

// GET /api/war-room/live - Live metrics snapshot
router.get('/live', (req, res) => {
  metrics.activeOrders = Object.values(metrics.locations).reduce((s, l) => s + l.activeOrders, 0);
  metrics.revenueToday = Object.values(metrics.locations).reduce((s, l) => s + l.revenue, 0);
  checkAlerts();
  res.json({ metrics, activeAlerts: alerts.slice(-10), timestamp: new Date().toISOString() });
});

// GET /api/war-room/orders - Live order feed
router.get('/orders', (req, res) => {
  const { location } = req.query;
  let orders = liveOrders;
  if (location) orders = orders.filter(o => o.location === location);
  res.json({ orders: orders.slice(-50) });
});

// POST /api/war-room/orders - Create live order
router.post('/orders', (req, res) => {
  const { location, items, tableNumber, channel } = req.body;
  const order = {
    id: 'ORD-' + Date.now(),
    location: location || 'LocationA',
    items: items || [],
    tableNumber,
    channel: channel || 'POS',
    status: 'RECEIVED',
    createdAt: new Date().toISOString(),
    prepStartAt: null,
    completedAt: null,
    prepTimeMin: null,
  };
  liveOrders.push(order);
  if (metrics.locations[order.location]) metrics.locations[order.location].activeOrders++;
  res.json(order);
});

// PUT /api/war-room/orders/:id/status - Update order status
router.put('/orders/:id/status', (req, res) => {
  const order = liveOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status;
  if (req.body.status === 'PREPARING') order.prepStartAt = new Date().toISOString();
  if (req.body.status === 'COMPLETED') {
    order.completedAt = new Date().toISOString();
    order.prepTimeMin = order.prepStartAt
      ? Math.round((new Date(order.completedAt) - new Date(order.prepStartAt)) / 60000)
      : null;
    if (metrics.locations[order.location]) metrics.locations[order.location].activeOrders = Math.max(0, metrics.locations[order.location].activeOrders - 1);
  }
  res.json(order);
});

// GET /api/war-room/alerts - Active alerts
router.get('/alerts', (req, res) => {
  checkAlerts();
  res.json({ alerts: alerts.slice(-20) });
});

// POST /api/war-room/alerts/trigger - Manually trigger an alert (testing)
router.post('/alerts/trigger', (req, res) => {
  const { type, message, severity } = req.body;
  const alert = { type, message, severity: severity || 'MEDIUM', ts: new Date().toISOString() };
  alerts.push(alert);
  res.json(alert);
});

// GET /api/war-room/locations - All locations summary
router.get('/locations', (req, res) => {
  res.json({ locations: metrics.locations });
});

// PUT /api/war-room/metrics - Update metrics
router.put('/metrics', (req, res) => {
  Object.assign(metrics, req.body);
  checkAlerts();
  res.json(metrics);
});

module.exports = router;
