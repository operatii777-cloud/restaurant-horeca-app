/**
 * MOBILE APP LOYALTY CONTROLLER
 * 
 * Loyalty Program pentru aplicația mobilă:
 * - Puncte pentru comenzi
 * - Niveluri (Bronze, Silver, Gold, Platinum)
 * - Recompense și vouchers
 * - Birthday rewards
 */

const { dbPromise } = require('../../../database');

/**
 * GET /api/loyalty/points
 * Obține punctele utilizatorului
 */
async function getPoints(req, res, next) {
  try {
    const db = await dbPromise;
    // Extrage din query (GET), body (POST) sau req.user (setat de middleware)
    const userId = req.user?.id || req.query.user_id || req.body.user_id;
    const customerEmail = req.user?.email || req.query.customer_email || req.body.customer_email;
    const customerPhone = req.query.customer_phone || req.body.customer_phone;
    
    if (!userId && !customerEmail && !customerPhone) {
      return res.status(400).json({ success: false, error: 'User identifier required (customer_email, customer_phone or user_id)' });
    }
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS loyalty_points (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          customer_email TEXT,
          customer_phone TEXT,
          total_points INTEGER DEFAULT 0,
          used_points INTEGER DEFAULT 0,
          level TEXT DEFAULT 'Bronze',
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Găsește sau creează entry pentru utilizator
    let loyalty = await new Promise((resolve, reject) => {
      let query = 'SELECT * FROM loyalty_points WHERE ';
      const params = [];
      
      if (userId) {
        query += 'user_id = ?';
        params.push(userId);
      } else if (customerEmail) {
        query += 'customer_email = ?';
        params.push(customerEmail);
      } else if (customerPhone) {
        query += 'customer_phone = ?';
        params.push(customerPhone);
      }
      
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!loyalty) {
      // Creează entry nou
      const loyaltyId = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO loyalty_points (user_id, customer_email, customer_phone, total_points, level)
          VALUES (?, ?, ?, 0, 'Bronze')
        `, [userId || null, customerEmail || null, customerPhone || null], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      
      loyalty = {
        id: loyaltyId,
        user_id: userId,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        total_points: 0,
        used_points: 0,
        level: 'Bronze',
      };
    }
    
    // Calculează nivelul bazat pe puncte
    const level = calculateLevel(loyalty.total_points - loyalty.used_points);
    if (level !== loyalty.level) {
      await new Promise((resolve, reject) => {
        db.run('UPDATE loyalty_points SET level = ? WHERE id = ?', [level, loyalty.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      loyalty.level = level;
    }
    
    res.json({
      success: true,
      data: {
        total_points: loyalty.total_points || 0,
        used_points: loyalty.used_points || 0,
        available_points: (loyalty.total_points || 0) - (loyalty.used_points || 0),
        level: loyalty.level,
        discount_percent: getDiscountForLevel(loyalty.level),
      }
    });
  } catch (error) {
    console.error('❌ Error in getPoints:', error);
    next(error);
  }
}

/**
 * POST /api/loyalty/add-points
 * Adaugă puncte pentru o comandă
 */
async function addPoints(req, res, next) {
  try {
    const db = await dbPromise;
    const { order_id, points, order_total } = req.body;
    // Extrage din query (GET), body (POST) sau req.user (setat de middleware)
    const userId = req.user?.id || req.query.user_id || req.body.user_id;
    const customerEmail = req.user?.email || req.query.customer_email || req.body.customer_email;
    const customerPhone = req.query.customer_phone || req.body.customer_phone;
    
    if (!order_id || !points) {
      return res.status(400).json({ success: false, error: 'order_id and points required' });
    }
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS loyalty_points_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          loyalty_points_id INTEGER,
          order_id INTEGER,
          points INTEGER,
          order_total REAL,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (loyalty_points_id) REFERENCES loyalty_points(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Găsește loyalty entry
    let loyalty = await new Promise((resolve, reject) => {
      let query = 'SELECT * FROM loyalty_points WHERE ';
      const params = [];
      
      if (userId) {
        query += 'user_id = ?';
        params.push(userId);
      } else if (customerEmail) {
        query += 'customer_email = ?';
        params.push(customerEmail);
      } else if (customerPhone) {
        query += 'customer_phone = ?';
        params.push(customerPhone);
      }
      
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!loyalty) {
      // Creează entry nou
      const loyaltyId = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO loyalty_points (user_id, customer_email, customer_phone, total_points, level)
          VALUES (?, ?, ?, 0, 'Bronze')
        `, [userId || null, customerEmail || null, customerPhone || null], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      
      loyalty = {
        id: loyaltyId,
        total_points: 0,
        level: 'Bronze',
      };
    }
    
    // Adaugă puncte
    const newTotalPoints = (loyalty.total_points || 0) + points;
    const newLevel = calculateLevel(newTotalPoints - (loyalty.used_points || 0));
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE loyalty_points 
        SET total_points = ?, level = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [newTotalPoints, newLevel, loyalty.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Salvează în istoric
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO loyalty_points_history (loyalty_points_id, order_id, points, order_total)
        VALUES (?, ?, ?, ?)
      `, [loyalty.id, order_id, points, order_total || 0], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      message: 'Points added successfully',
      data: {
        total_points: newTotalPoints,
        level: newLevel,
        discount_percent: getDiscountForLevel(newLevel),
      }
    });
  } catch (error) {
    console.error('❌ Error in addPoints:', error);
    next(error);
  }
}

/**
 * GET /api/loyalty/vouchers
 * Obține vouchers-urile disponibile
 */
async function getVouchers(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS loyalty_vouchers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          discount_percent REAL,
          discount_amount REAL,
          min_order_value REAL DEFAULT 0,
          valid_from TEXT,
          valid_until TEXT,
          max_uses INTEGER,
          used_count INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    const vouchers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM loyalty_vouchers
        WHERE is_active = 1
          AND (valid_until IS NULL OR valid_until >= date('now'))
          AND (max_uses IS NULL OR used_count < max_uses)
        ORDER BY created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      vouchers: vouchers.map(v => ({
        id: v.id,
        code: v.code,
        discount_percent: v.discount_percent,
        discount_amount: v.discount_amount,
        min_order_value: v.min_order_value || 0,
        valid_until: v.valid_until,
      }))
    });
  } catch (error) {
    console.error('❌ Error in getVouchers:', error);
    next(error);
  }
}

/**
 * POST /api/loyalty/use-voucher
 * Folosește un voucher
 */
async function useVoucher(req, res, next) {
  try {
    const db = await dbPromise;
    const { voucher_code } = req.body;
    // Extrage din query (GET), body (POST) sau req.user (setat de middleware)
    const userId = req.user?.id || req.query.user_id || req.body.user_id;
    const customerEmail = req.user?.email || req.query.customer_email || req.body.customer_email;
    const customerPhone = req.query.customer_phone || req.body.customer_phone;
    
    if (!voucher_code) {
      return res.status(400).json({ success: false, error: 'voucher_code required' });
    }
    
    // Notă: voucher_code nu necesită customer_email pentru validare, dar îl putem folosi pentru logging
    
    const voucher = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM loyalty_vouchers
        WHERE code = ? AND is_active = 1
      `, [voucher_code], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Voucher not found' });
    }
    
    // Verifică validitatea
    if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
      return res.status(400).json({ success: false, error: 'Voucher expired' });
    }
    
    if (voucher.max_uses && voucher.used_count >= voucher.max_uses) {
      return res.status(400).json({ success: false, error: 'Voucher limit reached' });
    }
    
    // Incrementează used_count
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE loyalty_vouchers
        SET used_count = used_count + 1
        WHERE id = ?
      `, [voucher.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      voucher: {
        code: voucher.code,
        discount_percent: voucher.discount_percent,
        discount_amount: voucher.discount_amount,
      }
    });
  } catch (error) {
    console.error('❌ Error in useVoucher:', error);
    next(error);
  }
}

/**
 * Calculează nivelul bazat pe puncte
 */
function calculateLevel(availablePoints) {
  if (availablePoints >= 10000) return 'Platinum';
  if (availablePoints >= 5000) return 'Gold';
  if (availablePoints >= 1000) return 'Silver';
  return 'Bronze';
}

/**
 * Obține discount-ul pentru nivel
 */
function getDiscountForLevel(level) {
  switch (level) {
    case 'Platinum':
      return 0.25; // 25%
    case 'Gold':
      return 0.20; // 20%
    case 'Silver':
      return 0.15; // 15%
    default:
      return 0.10; // 10%
  }
}

module.exports = {
  getPoints,
  addPoints,
  getVouchers,
  useVoucher,
};
