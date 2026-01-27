/**
 * Gift Cards API Routes
 * Sistem complet de carduri cadou digitale
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const crypto = require('crypto');

// Generare cod unic pentru gift card
function generateGiftCardCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[crypto.randomInt(chars.length)];
  }
  return code;
}

// GET /api/gift-cards
// Listează toate cardurile cadou
router.get('/', async (req, res) => {
  try {
    const { status, search, limit = 50 } = req.query;
    const db = await dbPromise;
    
    let sql = `
      SELECT gc.*, 
        (SELECT COUNT(*) FROM gift_card_transactions WHERE gift_card_id = gc.id) as transaction_count,
        (SELECT SUM(amount) FROM gift_card_transactions WHERE gift_card_id = gc.id AND transaction_type = 'redeem') as total_redeemed
      FROM gift_cards gc
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      sql += ` AND gc.status = ?`;
      params.push(status);
    }
    
    if (search) {
      sql += ` AND (gc.code LIKE ? OR gc.recipient_name LIKE ? OR gc.recipient_email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ` ORDER BY gc.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const cards = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Statistici
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_cards,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_cards,
          SUM(initial_value) as total_issued,
          SUM(current_balance) as total_outstanding,
          SUM(initial_value - current_balance) as total_redeemed
        FROM gift_cards
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    res.json({ success: true, cards, stats });
    
  } catch (error) {
    console.error('Gift cards list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gift-cards
// Creează un nou card cadou
router.post('/', async (req, res) => {
  try {
    const {
      initial_value,
      recipient_name,
      recipient_email,
      purchaser_name,
      purchaser_email,
      message,
      expiry_days = 365
    } = req.body;
    
    if (!initial_value || initial_value <= 0) {
      return res.status(400).json({ success: false, error: 'Valoarea trebuie să fie pozitivă' });
    }
    
    const db = await dbPromise;
    const code = generateGiftCardCode();
    const expiryDate = new Date(Date.now() + expiry_days * 24 * 60 * 60 * 1000).toISOString();
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO gift_cards 
        (code, initial_value, current_balance, recipient_name, recipient_email, 
         purchaser_name, purchaser_email, message, expiry_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        code, initial_value, initial_value, recipient_name, recipient_email,
        purchaser_name, purchaser_email, message, expiryDate, req.user?.id || null
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    // Înregistrează tranzacția de cumpărare
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO gift_card_transactions 
        (gift_card_id, transaction_type, amount, balance_after, notes, created_by)
        VALUES (?, 'purchase', ?, ?, 'Card cadou emis', ?)
      `, [result.id, initial_value, initial_value, req.user?.id || null], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ 
      success: true, 
      giftCard: {
        id: result.id,
        code,
        initial_value,
        current_balance: initial_value,
        expiry_date: expiryDate
      }
    });
    
  } catch (error) {
    console.error('Create gift card error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/gift-cards/validate/:code
// Validează un card și returnează balanța
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const db = await dbPromise;
    
    const card = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM gift_cards 
        WHERE code = ? AND status = 'active' AND (expiry_date IS NULL OR expiry_date > datetime('now'))
      `, [code.toUpperCase().replace(/[^A-Z0-9]/g, '')], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!card) {
      return res.json({ 
        success: false, 
        valid: false, 
        error: 'Card invalid, expirat sau deja utilizat' 
      });
    }
    
    res.json({
      success: true,
      valid: true,
      balance: card.current_balance,
      recipient_name: card.recipient_name
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gift-cards/redeem
// Utilizează un card cadou
router.post('/redeem', async (req, res) => {
  try {
    const { code, amount, order_id } = req.body;
    const db = await dbPromise;
    
    if (!code || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Date invalide' });
    }
    
    const card = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM gift_cards 
        WHERE code = ? AND status = 'active' AND (expiry_date IS NULL OR expiry_date > datetime('now'))
      `, [code.toUpperCase().replace(/[^A-Z0-9]/g, '')], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!card) {
      return res.status(400).json({ success: false, error: 'Card invalid' });
    }
    
    if (card.current_balance < amount) {
      return res.status(400).json({ 
        success: false, 
        error: `Sold insuficient. Disponibil: ${card.current_balance} RON` 
      });
    }
    
    const newBalance = card.current_balance - amount;
    const newStatus = newBalance <= 0 ? 'used' : 'active';
    
    // Actualizează cardul
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE gift_cards 
        SET current_balance = ?, status = ?, last_used_date = datetime('now')
        WHERE id = ?
      `, [newBalance, newStatus, card.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Înregistrează tranzacția
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO gift_card_transactions 
        (gift_card_id, order_id, transaction_type, amount, balance_after, created_by)
        VALUES (?, ?, 'redeem', ?, ?, ?)
      `, [card.id, order_id || null, amount, newBalance, req.user?.id || null], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      amount_redeemed: amount,
      new_balance: newBalance,
      card_status: newStatus
    });
    
  } catch (error) {
    console.error('Redeem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/gift-cards/:id/transactions
// Istoric tranzacții pentru un card
router.get('/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const transactions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT gct.*, o.id as order_number
        FROM gift_card_transactions gct
        LEFT JOIN orders o ON gct.order_id = o.id
        WHERE gct.gift_card_id = ?
        ORDER BY gct.created_at DESC
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, transactions });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gift-cards/:id/cancel
// Anulează un card
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE gift_cards SET status = 'cancelled' WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Card anulat' });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

