/**
 * Real-time Food Cost Dashboard API
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

// GET /api/food-cost/realtime
router.get('/realtime', async (req, res) => {
  try {
    const db = await dbPromise;
    const target = 30;
    
    const today = await new Promise((resolve, reject) => {
      db.get(`SELECT COALESCE(SUM(total), 0) as revenue, COALESCE(SUM(cogs), 0) as cost, COUNT(*) as orders
        FROM orders WHERE date(created_at) = date('now') AND status IN ('paid', 'completed', 'delivered')`, 
        (err, row) => err ? reject(err) : resolve(row || {}));
    });
    
    const week = await new Promise((resolve, reject) => {
      db.get(`SELECT COALESCE(SUM(total), 0) as revenue, COALESCE(SUM(cogs), 0) as cost, COUNT(*) as orders
        FROM orders WHERE date(created_at) >= date('now', '-7 days') AND status IN ('paid', 'completed', 'delivered')`, 
        (err, row) => err ? reject(err) : resolve(row || {}));
    });
    
    const month = await new Promise((resolve, reject) => {
      db.get(`SELECT COALESCE(SUM(total), 0) as revenue, COALESCE(SUM(cogs), 0) as cost, COUNT(*) as orders
        FROM orders WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status IN ('paid', 'completed', 'delivered')`, 
        (err, row) => err ? reject(err) : resolve(row || {}));
    });
    
    const calc = (d) => ({
      ...d,
      cost_pct: d.revenue > 0 ? ((d.cost / d.revenue) * 100).toFixed(1) : 0,
      profit: d.revenue - d.cost,
      avg_ticket: d.orders > 0 ? (d.revenue / d.orders).toFixed(2) : 0
    });
    
    res.json({ success: true, target, today: calc(today), week: calc(week), month: calc(month) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/food-cost/trends
router.get('/trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const db = await dbPromise;
    
    const trends = await new Promise((resolve, reject) => {
      db.all(`SELECT date(created_at) as date, SUM(total) as revenue, SUM(cogs) as cost, COUNT(*) as orders
        FROM orders WHERE date(created_at) >= date('now', '-' || ? || ' days') AND status IN ('paid', 'completed', 'delivered')
        GROUP BY date(created_at) ORDER BY date`, [days], (err, rows) => err ? reject(err) : resolve(rows || []));
    });
    
    res.json({ success: true, trends: trends.map(d => ({ ...d, pct: d.revenue > 0 ? ((d.cost / d.revenue) * 100).toFixed(1) : 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/food-cost/by-category
router.get('/by-category', async (req, res) => {
  try {
    const db = await dbPromise;
    const cats = await new Promise((resolve, reject) => {
      db.all(`SELECT m.category, COUNT(*) as products,
        SUM(m.price) as total_price, 
        SUM((SELECT SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0)) FROM recipes r LEFT JOIN ingredients i ON r.ingredient_id = i.id WHERE r.product_id = m.id)) as total_cost
        FROM menu m WHERE m.is_sellable = 1 GROUP BY m.category`, (err, rows) => err ? reject(err) : resolve(rows || []));
    });
    res.json({ success: true, categories: cats.map(c => ({ ...c, avg_cost_pct: c.total_price > 0 ? ((c.total_cost / c.total_price) * 100).toFixed(1) : 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/food-cost/top-margin
router.get('/top-margin', async (req, res) => {
  try {
    const db = await dbPromise;
    const products = await new Promise((resolve, reject) => {
      db.all(`SELECT m.id, m.name, m.category, m.price,
        COALESCE((SELECT SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0)) FROM recipes r LEFT JOIN ingredients i ON r.ingredient_id = i.id WHERE r.product_id = m.id), 0) as cost
        FROM menu m WHERE m.is_sellable = 1 AND m.price > 0 ORDER BY (m.price - cost) DESC LIMIT 20`, (err, rows) => err ? reject(err) : resolve(rows || []));
    });
    res.json({ success: true, products: products.map(p => ({ ...p, margin: p.price - p.cost, pct: ((p.price - p.cost) / p.price * 100).toFixed(1) })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/food-cost/alerts
router.get('/alerts', async (req, res) => {
  try {
    const db = await dbPromise;
    const highCost = await new Promise((resolve, reject) => {
      db.all(`SELECT m.id, m.name, m.price,
        COALESCE((SELECT SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0)) FROM recipes r LEFT JOIN ingredients i ON r.ingredient_id = i.id WHERE r.product_id = m.id), 0) as cost
        FROM menu m WHERE m.is_sellable = 1 AND m.price > 0 
        HAVING cost > 0 AND (cost / m.price) > 0.4 ORDER BY (cost / m.price) DESC LIMIT 10`, (err, rows) => err ? reject(err) : resolve(rows || []));
    });
    res.json({ success: true, alerts: highCost.map(p => ({ ...p, pct: ((p.cost / p.price) * 100).toFixed(1), suggested: (p.cost / 0.3).toFixed(2) })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;



