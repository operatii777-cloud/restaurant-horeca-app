/**
 * MOBILE APP REFERRAL CONTROLLER
 * 
 * Referral program pentru aplicația mobilă
 * (bazat pe loyalty points system)
 */

const { dbPromise } = require('../../../database');
const crypto = require('crypto');

/**
 * POST /api/mobile/referral/generate-code
 * Generează cod de referral pentru utilizator
 */
async function generateReferralCode(req, res, next) {
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
        CREATE TABLE IF NOT EXISTS referral_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          customer_email TEXT,
          customer_phone TEXT,
          referral_code TEXT UNIQUE NOT NULL,
          is_active INTEGER DEFAULT 1,
          total_referrals INTEGER DEFAULT 0,
          total_bonus_earned REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, [], (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
        else resolve();
      });
    });
    
    // Verifică dacă există deja cod
    let referral = await new Promise((resolve, reject) => {
      let query = 'SELECT * FROM referral_codes WHERE ';
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
    
    if (!referral) {
      // Generează cod nou (6 caractere alfanumerice)
      const code = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 6);
      
      const referralId = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO referral_codes (user_id, customer_email, customer_phone, referral_code)
          VALUES (?, ?, ?, ?)
        `, [userId || null, customerEmail || null, customerPhone || null, code], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      
      referral = {
        id: referralId,
        referral_code: code,
        total_referrals: 0,
        total_bonus_earned: 0,
      };
    }
    
    res.json({
      success: true,
      data: {
        referral_code: referral.referral_code,
        total_referrals: referral.total_referrals || 0,
        total_bonus_earned: referral.total_bonus_earned || 0,
        referral_link: `${process.env.APP_URL || 'https://restaurant.app'}/referral/${referral.referral_code}`,
      }
    });
  } catch (error) {
    console.error('❌ Error in generateReferralCode:', error);
    next(error);
  }
}

/**
 * POST /api/mobile/referral/use
 * Folosește un cod de referral
 */
async function useReferralCode(req, res, next) {
  try {
    const db = await dbPromise;
    const { referral_code } = req.body;
    // Extrage din query (GET), body (POST) sau req.user (setat de middleware)
    const userId = req.user?.id || req.query.user_id || req.body.user_id;
    const customerEmail = req.user?.email || req.query.customer_email || req.body.customer_email;
    const customerPhone = req.query.customer_phone || req.body.customer_phone;
    
    if (!referral_code) {
      return res.status(400).json({ success: false, error: 'Referral code required' });
    }
    
    if (!userId && !customerEmail && !customerPhone) {
      return res.status(400).json({ success: false, error: 'User identifier required (customer_email, customer_phone or user_id)' });
    }
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS referral_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          referral_code TEXT NOT NULL,
          referrer_user_id INTEGER,
          referrer_email TEXT,
          referrer_phone TEXT,
          referred_user_id INTEGER,
          referred_email TEXT,
          referred_phone TEXT,
          bonus_points_referrer INTEGER DEFAULT 0,
          bonus_points_referred INTEGER DEFAULT 0,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME
        )
      `, [], (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
        else resolve();
      });
    });
    
    // Găsește codul de referral
    const referral = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM referral_codes
        WHERE referral_code = ? AND is_active = 1
      `, [referral_code], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!referral) {
      return res.status(404).json({ success: false, error: 'Cod de referral invalid' });
    }
    
    // Verifică dacă utilizatorul nu încearcă să folosească propriul cod
    if ((userId && referral.user_id === userId) ||
        (customerEmail && referral.customer_email === customerEmail) ||
        (customerPhone && referral.customer_phone === customerPhone)) {
      return res.status(400).json({ success: false, error: 'Nu poți folosi propriul cod de referral' });
    }
    
    // Verifică dacă codul a fost deja folosit de acest utilizator
    const existingUsage = await new Promise((resolve, reject) => {
      let query = 'SELECT * FROM referral_usage WHERE referral_code = ? AND status != "cancelled" AND (';
      const params = [referral_code];
      
      if (userId) {
        query += 'referred_user_id = ?';
        params.push(userId);
      } else if (customerEmail) {
        query += 'referred_email = ?';
        params.push(customerEmail);
      } else if (customerPhone) {
        query += 'referred_phone = ?';
        params.push(customerPhone);
      }
      
      query += ')';
      
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existingUsage) {
      return res.status(400).json({ success: false, error: 'Acest cod a fost deja folosit' });
    }
    
    // Creează înregistrare de utilizare
    const usageId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO referral_usage (
          referral_code, referrer_user_id, referrer_email, referrer_phone,
          referred_user_id, referred_email, referred_phone,
          bonus_points_referrer, bonus_points_referred
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        referral_code,
        referral.user_id,
        referral.customer_email,
        referral.customer_phone,
        userId || null,
        customerEmail || null,
        customerPhone || null,
        100, // Bonus pentru referrer (100 puncte)
        50,  // Bonus pentru referred (50 puncte)
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // Adaugă puncte bonus pentru referrer (dacă există loyalty entry)
    if (referral.user_id || referral.customer_email || referral.customer_phone) {
      // TODO: Integrare cu loyalty points system
      // await addLoyaltyPoints(referrerIdentifier, null, 0, 100);
    }
    
    // Adaugă puncte bonus pentru referred
    // TODO: Integrare cu loyalty points system
    // await addLoyaltyPoints(referredIdentifier, null, 0, 50);
    
    // Actualizează statisticile codului
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE referral_codes
        SET total_referrals = total_referrals + 1,
            total_bonus_earned = total_bonus_earned + 100,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [referral.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      message: 'Cod de referral folosit cu succes',
      data: {
        bonus_points: 50, // Puncte primite de utilizator
        referrer_bonus: 100, // Puncte primite de referrer
      }
    });
  } catch (error) {
    console.error('❌ Error in useReferralCode:', error);
    next(error);
  }
}

/**
 * GET /api/mobile/referral/stats
 * Obține statistici despre referral-uri
 */
async function getReferralStats(req, res, next) {
  try {
    const db = await dbPromise;
    // Extrage din query (GET), body (POST) sau req.user (setat de middleware)
    const userId = req.user?.id || req.query.user_id || req.body.user_id;
    const customerEmail = req.user?.email || req.query.customer_email || req.body.customer_email;
    const customerPhone = req.query.customer_phone || req.body.customer_phone;
    
    if (!userId && !customerEmail && !customerPhone) {
      return res.status(400).json({ success: false, error: 'User identifier required (customer_email, customer_phone or user_id)' });
    }
    
    // Găsește codul de referral
    let referral = await new Promise((resolve, reject) => {
      let query = 'SELECT * FROM referral_codes WHERE ';
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
    
    if (!referral) {
      return res.json({
        success: true,
        data: {
          has_referral_code: false,
          total_referrals: 0,
          total_bonus_earned: 0,
        }
      });
    }
    
    // Obține utilizările
    const usages = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM referral_usage
        WHERE referral_code = ? AND status = 'completed'
        ORDER BY created_at DESC
      `, [referral.referral_code], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: {
        referral_code: referral.referral_code,
        total_referrals: referral.total_referrals || 0,
        total_bonus_earned: referral.total_bonus_earned || 0,
        recent_referrals: usages.slice(0, 10).map(u => ({
          date: u.created_at,
          bonus_earned: u.bonus_points_referrer || 0,
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error in getReferralStats:', error);
    next(error);
  }
}

module.exports = {
  generateReferralCode,
  useReferralCode,
  getReferralStats,
};
