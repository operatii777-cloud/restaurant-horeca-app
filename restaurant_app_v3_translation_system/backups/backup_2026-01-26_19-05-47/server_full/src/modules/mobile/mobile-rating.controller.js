/**
 * MOBILE APP RATING CONTROLLER
 * 
 * Rating system pentru comenzi și produse
 * (copiat din Restaurant App - feedback și order_feedback)
 */

const { dbPromise } = require('../../../database');

/**
 * POST /api/mobile/orders/:id/rating
 * Trimite rating pentru o comandă
 */
async function submitOrderRating(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { rating, comment, customer_name } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating trebuie să fie între 1 și 5' });
    }
    
    // Verifică dacă comanda există
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Comandă negăsită' });
    }
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS order_feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          comment TEXT,
          customer_name TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          platform TEXT DEFAULT 'MOBILE_APP',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id)
        )
      `, [], (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
        else resolve();
      });
    });
    
    // Verifică dacă există deja rating pentru această comandă
    const existingRating = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM order_feedback
        WHERE order_id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existingRating) {
      // Actualizează rating-ul existent
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE order_feedback
          SET rating = ?, comment = ?, customer_name = ?
          WHERE order_id = ?
        `, [rating, comment || null, customer_name || null, id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      // Creează rating nou
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO order_feedback (order_id, rating, comment, customer_name, customer_email, customer_phone, platform)
          VALUES (?, ?, ?, ?, ?, ?, 'MOBILE_APP')
        `, [
          id,
          rating,
          comment || null,
          customer_name || null,
          order.customer_email || null,
          order.customer_phone || null
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    res.json({
      success: true,
      message: 'Rating trimis cu succes'
    });
  } catch (error) {
    console.error('❌ Error in submitOrderRating:', error);
    next(error);
  }
}

/**
 * POST /api/mobile/products/:id/rating
 * Trimite rating pentru un produs
 */
async function submitProductRating(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { rating, comment, customer_name, order_id } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating trebuie să fie între 1 și 5' });
    }
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS product_ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          order_id INTEGER,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          comment TEXT,
          customer_name TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          platform TEXT DEFAULT 'MOBILE_APP',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, [], (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
        else resolve();
      });
    });
    
    // Obține informații despre comandă dacă e furnizată
    let customerEmail = null;
    let customerPhone = null;
    
    if (order_id) {
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT customer_email, customer_phone FROM orders WHERE id = ?', [order_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (order) {
        customerEmail = order.customer_email;
        customerPhone = order.customer_phone;
      }
    }
    
    // Inserează rating
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO product_ratings (product_id, order_id, rating, comment, customer_name, customer_email, customer_phone, platform)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'MOBILE_APP')
      `, [
        id,
        order_id || null,
        rating,
        comment || null,
        customer_name || null,
        customerEmail,
        customerPhone
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      message: 'Rating pentru produs trimis cu succes'
    });
  } catch (error) {
    console.error('❌ Error in submitProductRating:', error);
    next(error);
  }
}

/**
 * GET /api/mobile/products/:id/ratings
 * Obține rating-urile pentru un produs
 */
async function getProductRatings(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS product_ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          order_id INTEGER,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          comment TEXT,
          customer_name TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          platform TEXT DEFAULT 'MOBILE_APP',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, [], (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
        else resolve();
      });
    });
    
    // Obține rating-urile
    const ratings = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id, rating, comment, customer_name, created_at
        FROM product_ratings
        WHERE product_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculează statistici
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_ratings,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
        FROM product_ratings
        WHERE product_id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    res.json({
      success: true,
      data: {
        product_id: parseInt(id),
        statistics: {
          total_ratings: stats.total_ratings || 0,
          average_rating: parseFloat((stats.average_rating || 0).toFixed(2)),
          distribution: {
            5: stats.five_star || 0,
            4: stats.four_star || 0,
            3: stats.three_star || 0,
            2: stats.two_star || 0,
            1: stats.one_star || 0,
          }
        },
        ratings: ratings.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          customer_name: r.customer_name ? r.customer_name.charAt(0) + '***' : 'Anonim', // Anonimizare
          created_at: r.created_at,
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error in getProductRatings:', error);
    next(error);
  }
}

module.exports = {
  submitOrderRating,
  submitProductRating,
  getProductRatings,
};
