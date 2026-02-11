/**
 * 🔍 COMPETITOR PRICE TRACKING
 * 
 * Funcționalități:
 * - Adăugare competitori și produsele lor
 * - Comparație prețuri
 * - Alertă la modificări prețuri
 * - Analiză poziționare piață
 */

const express = require('express');
const router = express.Router();
const { DB_PATH } = require('../config/db-constants');

// Obține conexiunea la DB
const getDb = () => {
  try {
    const { getDbConnection } = require('../database');
    return getDbConnection();
  } catch (e) {
    const sqlite3 = require('sqlite3').verbose();
    return new sqlite3.Database(DB_PATH);
  }
};

/**
 * Inițializare tabele competitor (dacă nu există)
 */
const initTables = async (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabel competitori
      db.run(`
        CREATE TABLE IF NOT EXISTS competitors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          location TEXT,
          website TEXT,
          phone TEXT,
          category TEXT DEFAULT 'Restaurant',
          notes TEXT,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Tabel prețuri competitori
      db.run(`
        CREATE TABLE IF NOT EXISTS competitor_prices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          competitor_id INTEGER NOT NULL,
          product_name TEXT NOT NULL,
          our_product_id INTEGER,
          price REAL NOT NULL,
          currency TEXT DEFAULT 'RON',
          category TEXT,
          notes TEXT,
          source TEXT DEFAULT 'manual',
          recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (competitor_id) REFERENCES competitors(id)
        )
      `);
      
      // Tabel istoric prețuri
      db.run(`
        CREATE TABLE IF NOT EXISTS competitor_price_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          competitor_price_id INTEGER NOT NULL,
          old_price REAL,
          new_price REAL NOT NULL,
          change_percent REAL,
          recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (competitor_price_id) REFERENCES competitor_prices(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

/**
 * GET /api/competitors
 * Lista competitorilor
 */
router.get('/', async (req, res) => {
  const db = getDb();
  await initTables(db);
  
  try {
    const query = `
      SELECT 
        c.*,
        COUNT(cp.id) as products_tracked,
        AVG(cp.price) as avg_price
      FROM competitors c
      LEFT JOIN competitor_prices cp ON c.id = cp.competitor_id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    
    const competitors = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, competitors });
    
  } catch (error) {
    console.error('❌ Get Competitors Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/competitors
 * Adaugă competitor nou
 */
router.post('/', async (req, res) => {
  const db = getDb();
  await initTables(db);
  
  const { name, location, website, phone, category, notes } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, error: 'Numele este obligatoriu' });
  }
  
  try {
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO competitors (name, location, website, phone, category, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, location, website, phone, category, notes], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({ 
      success: true, 
      competitor_id: result.id,
      message: `Competitor "${name}" adăugat cu succes!` 
    });
    
  } catch (error) {
    console.error('❌ Add Competitor Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/competitors/:id/prices
 * Prețurile unui competitor
 */
router.get('/:id/prices', async (req, res) => {
  const db = getDb();
  await initTables(db);
  
  const { id } = req.params;
  
  try {
    const query = `
      SELECT 
        cp.*,
        m.name as our_product_name,
        m.price as our_price,
        CASE 
          WHEN m.price > 0 THEN ROUND(((cp.price - m.price) / m.price) * 100, 1)
          ELSE NULL
        END as price_diff_percent
      FROM competitor_prices cp
      LEFT JOIN menu m ON cp.our_product_id = m.id
      WHERE cp.competitor_id = ?
      ORDER BY cp.category, cp.product_name
    `;
    
    const prices = await new Promise((resolve, reject) => {
      db.all(query, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, prices });
    
  } catch (error) {
    console.error('❌ Get Prices Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/competitors/:id/prices
 * Adaugă preț competitor
 */
router.post('/:id/prices', async (req, res) => {
  const db = getDb();
  await initTables(db);
  
  const { id } = req.params;
  const { product_name, price, our_product_id, category, notes, source } = req.body;
  
  if (!product_name || !price) {
    return res.status(400).json({ 
      success: false, 
      error: 'product_name și price sunt obligatorii' 
    });
  }
  
  try {
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO competitor_prices 
        (competitor_id, product_name, price, our_product_id, category, notes, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [id, product_name, price, our_product_id, category, notes, source || 'manual'], 
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({ 
      success: true, 
      price_id: result.id,
      message: 'Preț adăugat cu succes!' 
    });
    
  } catch (error) {
    console.error('❌ Add Price Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/competitors/prices/:priceId
 * Actualizează preț (și salvează în istoric)
 */
router.put('/prices/:priceId', async (req, res) => {
  const db = getDb();
  await initTables(db);
  
  const { priceId } = req.params;
  const { price } = req.body;
  
  if (!price) {
    return res.status(400).json({ success: false, error: 'price este obligatoriu' });
  }
  
  try {
    // Obține prețul vechi
    const oldPrice = await new Promise((resolve, reject) => {
      db.get('SELECT price FROM competitor_prices WHERE id = ?', [priceId], (err, row) => {
        if (err) reject(err);
        else resolve(row?.price);
      });
    });
    
    if (oldPrice === undefined) {
      return res.status(404).json({ success: false, error: 'Preț negăsit' });
    }
    
    // Calculează diferența
    const changePercent = ((price - oldPrice) / oldPrice) * 100;
    
    // Salvează în istoric
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO competitor_price_history 
        (competitor_price_id, old_price, new_price, change_percent)
        VALUES (?, ?, ?, ?)
      `, [priceId, oldPrice, price, changePercent], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Actualizează prețul curent
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE competitor_prices 
        SET price = ?, recorded_at = datetime('now')
        WHERE id = ?
      `, [price, priceId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ 
      success: true,
      old_price: oldPrice,
      new_price: price,
      change_percent: changePercent.toFixed(1),
      message: `Preț actualizat: ${oldPrice} → ${price} RON (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)` 
    });
    
  } catch (error) {
    console.error('❌ Update Price Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/competitors/comparison
 * Comparație generală prețuri
 */
router.get('/comparison', async (req, res) => {
  const db = getDb();
  await initTables(db);
  
  try {
    // Obține produsele noastre cu prețuri competitori
    const query = `
      SELECT 
        m.id as our_product_id,
        m.name as our_product_name,
        m.price as our_price,
        m.category,
        c.name as competitor_name,
        cp.price as competitor_price,
        ROUND(((cp.price - m.price) / m.price) * 100, 1) as price_diff_percent,
        CASE 
          WHEN cp.price > m.price THEN 'cheaper'
          WHEN cp.price < m.price THEN 'more_expensive'
          ELSE 'same'
        END as position
      FROM menu m
      LEFT JOIN competitor_prices cp ON cp.our_product_id = m.id
      LEFT JOIN competitors c ON cp.competitor_id = c.id
      WHERE m.is_active = 1
        AND cp.id IS NOT NULL
      ORDER BY m.category, m.name, c.name
    `;
    
    const comparison = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Statistici
    const stats = {
      total_products_tracked: new Set(comparison.map(c => c.our_product_id)).size,
      we_are_cheaper: comparison.filter(c => c.position === 'cheaper').length,
      we_are_same: comparison.filter(c => c.position === 'same').length,
      we_are_more_expensive: comparison.filter(c => c.position === 'more_expensive').length,
      avg_price_diff: comparison.length > 0 
        ? (comparison.reduce((sum, c) => sum + (c.price_diff_percent || 0), 0) / comparison.length).toFixed(1)
        : 0,
    };
    
    // Grupare pe categorii
    const byCategory = comparison.reduce((acc, item) => {
      const cat = item.category || 'Altele';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
    
    res.json({
      success: true,
      stats,
      comparison,
      by_category: byCategory,
      insights: generateInsights(stats, comparison),
    });
    
  } catch (error) {
    console.error('❌ Comparison Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/competitors/alerts
 * Alerte modificări prețuri
 */
router.get('/alerts', async (req, res) => {
  const db = getDb();
  await initTables(db);
  
  const { days = 7 } = req.query;
  
  try {
    const query = `
      SELECT 
        cph.*,
        cp.product_name,
        cp.category,
        c.name as competitor_name,
        m.name as our_product_name,
        m.price as our_current_price
      FROM competitor_price_history cph
      JOIN competitor_prices cp ON cph.competitor_price_id = cp.id
      JOIN competitors c ON cp.competitor_id = c.id
      LEFT JOIN menu m ON cp.our_product_id = m.id
      WHERE cph.recorded_at >= DATE('now', '-${parseInt(days)} days')
        AND ABS(cph.change_percent) >= 5
      ORDER BY cph.recorded_at DESC
    `;
    
    const alerts = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Categorizeză alertele
    const categorized = {
      significant_increases: alerts.filter(a => a.change_percent >= 10),
      significant_decreases: alerts.filter(a => a.change_percent <= -10),
      moderate_changes: alerts.filter(a => Math.abs(a.change_percent) >= 5 && Math.abs(a.change_percent) < 10),
    };
    
    res.json({
      success: true,
      period_days: parseInt(days),
      total_alerts: alerts.length,
      alerts,
      categorized,
    });
    
  } catch (error) {
    console.error('❌ Alerts Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper: Generează insights din date
 */
function generateInsights(stats, comparison) {
  const insights = [];
  
  if (stats.we_are_cheaper > stats.we_are_more_expensive) {
    insights.push({
      type: 'positive',
      icon: '✅',
      message: `Sunteți mai ieftini decât competitorii la ${stats.we_are_cheaper} produse. Bună poziționare competitivă!`,
    });
  }
  
  if (stats.we_are_more_expensive > stats.we_are_cheaper) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      message: `Sunteți mai scumpi la ${stats.we_are_more_expensive} produse. Verificați strategia de prețuri.`,
    });
  }
  
  const avgDiff = parseFloat(stats.avg_price_diff);
  if (avgDiff > 10) {
    insights.push({
      type: 'info',
      icon: '💡',
      message: `Prețurile competitorilor sunt în medie cu ${avgDiff}% mai mici. Considerați ajustări sau diferențiere prin calitate.`,
    });
  } else if (avgDiff < -10) {
    insights.push({
      type: 'info',
      icon: '💡',
      message: `Prețurile voastre sunt în medie cu ${Math.abs(avgDiff)}% mai mici. Potențial de creștere marjă!`,
    });
  }
  
  return insights;
}

module.exports = router;

