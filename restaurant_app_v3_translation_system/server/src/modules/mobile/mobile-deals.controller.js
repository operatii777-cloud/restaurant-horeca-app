/**
 * MOBILE APP DEALS CONTROLLER
 * 
 * Deals personalizate pentru aplicația mobilă
 * (copiat din daily-offer.controller.js și adaptat pentru mobile)
 */

const { dbPromise } = require('../../../database');

/**
 * GET /api/mobile/deals/personalized
 * Obține oferte personalizate bazate pe istoricul comenzilor utilizatorului
 */
async function getPersonalizedDeals(req, res, next) {
  try {
    const db = await dbPromise;
    // Extrage din query (GET), body (POST) sau req.user (setat de middleware)
    const customerEmail = req.user?.email || req.query.customer_email || req.body.customer_email;
    const customerPhone = req.query.customer_phone || req.body.customer_phone;
    
    if (!customerEmail && !customerPhone) {
      return res.status(400).json({ success: false, error: 'Customer identifier required (customer_email or customer_phone)' });
    }
    
    // Obține istoricul comenzilor utilizatorului
    const orderHistory = await new Promise((resolve, reject) => {
      let query = `
        SELECT items, total, timestamp
        FROM orders
        WHERE platform = 'MOBILE_APP'
          AND status != 'cancelled'
      `;
      const params = [];
      
      if (customerEmail) {
        query += ' AND customer_email = ?';
        params.push(customerEmail);
      } else if (customerPhone) {
        query += ' AND customer_phone = ?';
        params.push(customerPhone);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT 20';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Analizează preferințele (categorii frecvente)
    const categoryFrequency = {};
    orderHistory.forEach(order => {
      try {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        items.forEach(item => {
          const category = item.category || 'Altele';
          categoryFrequency[category] = (categoryFrequency[category] || 0) + (item.quantity || 1);
        });
      } catch (e) {
        // Ignoră erorile de parsing
      }
    });
    
    // Obține oferte active (daily offers)
    const activeOffers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM daily_offers
        WHERE is_active = 1
        ORDER BY created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Filtrează oferte relevante bazate pe preferințe
    const personalizedOffers = [];
    
    for (const offer of activeOffers) {
      // Obține condițiile ofertei
      const conditions = await new Promise((resolve, reject) => {
        db.all(`
          SELECT * FROM daily_offer_conditions
          WHERE offer_id = ?
        `, [offer.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Verifică dacă oferta e relevantă pentru utilizator
      let isRelevant = false;
      for (const condition of conditions) {
        if (categoryFrequency[condition.category] && categoryFrequency[condition.category] >= condition.quantity) {
          isRelevant = true;
          break;
        }
      }
      
      if (isRelevant || activeOffers.length <= 3) {
        // Obține produsele de beneficiu
        const benefitProducts = await new Promise((resolve, reject) => {
          db.all(`
            SELECT p.id, p.name, p.price, p.image_url
            FROM catalog_products p
            INNER JOIN daily_offer_benefit_products bp ON p.id = bp.product_id
            WHERE bp.offer_id = ? AND p.is_active = 1
          `, [offer.id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
        
        personalizedOffers.push({
          id: offer.id,
          title: offer.title,
          description: offer.description,
          benefit_type: offer.benefit_type,
          benefit_category: offer.benefit_category,
          conditions: conditions,
          benefit_products: benefitProducts,
          relevance_score: isRelevant ? 100 : 50, // Scor de relevanță
        });
      }
    }
    
    // Sortează după relevanță
    personalizedOffers.sort((a, b) => b.relevance_score - a.relevance_score);
    
    res.json({
      success: true,
      deals: personalizedOffers,
      preferences: Object.keys(categoryFrequency).map(cat => ({
        category: cat,
        frequency: categoryFrequency[cat]
      })).sort((a, b) => b.frequency - a.frequency).slice(0, 5)
    });
  } catch (error) {
    console.error('❌ Error in getPersonalizedDeals:', error);
    next(error);
  }
}

/**
 * GET /api/mobile/deals/active
 * Obține toate ofertele active (non-personalizate)
 */
async function getActiveDeals(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Folosește logica din daily-offer.controller.js
    const { getDailyOffer } = require('../../promotions/daily-offer/daily-offer.controller');
    
    // Creează un mock req/res pentru a folosi funcția existentă
    const mockReq = { ...req };
    const mockRes = {
      json: (data) => {
        if (data.offer) {
          res.json({
            success: true,
            deals: [data.offer]
          });
        } else {
          res.json({
            success: true,
            deals: []
          });
        }
      }
    };
    
    await getDailyOffer(mockReq, mockRes, next);
  } catch (error) {
    console.error('❌ Error in getActiveDeals:', error);
    next(error);
  }
}

module.exports = {
  getPersonalizedDeals,
  getActiveDeals,
};
