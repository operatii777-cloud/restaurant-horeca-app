/**
 * Daily Offer Controller
 * Handles Daily Offer promotions logic
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/daily-offer
 * Returns active daily offer
 */
async function getDailyOffer(req, res, next) {
  try {
    const db = await dbPromise;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get active daily offer
    const offer = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM daily_offers
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!offer) {
      return res.json({
        offer: null
      });
    }

    // Get conditions
    const conditions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM daily_offer_conditions
        WHERE offer_id = ?
        ORDER BY id
      `, [offer.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Get benefit products
    const benefitProductIds = await new Promise((resolve, reject) => {
      db.all(`
        SELECT product_id FROM daily_offer_benefit_products
        WHERE offer_id = ?
      `, [offer.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const benefitProductIdsList = benefitProductIds.map(bp => bp.product_id);

    // Get products for each condition
    const conditionsWithProducts = await Promise.all(
      conditions.map(async (condition) => {
        let categoryProducts = [];
        if (condition.category) {
          // IMPORTANT: Kiosk and Public Ordering use 'menu' table as source of truth
          // Prioritize 'menu' table to avoid ID conflicts with 'catalog_products'
          categoryProducts = await new Promise((resolve, reject) => {
            db.all(`
              SELECT id, name, price, category, image_url
              FROM menu
              WHERE category = ? AND (is_active = 1 OR is_active IS NULL)
              ORDER BY name
            `, [condition.category], (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            });
          });

          // Fallback to catalog_products only if menu is empty for this category
          if (!categoryProducts || categoryProducts.length === 0) {
            categoryProducts = await new Promise((resolve, reject) => {
              db.all(`
                SELECT p.id, p.name, p.price, c.name as category, p.image_url
                FROM catalog_products p
                LEFT JOIN catalog_categories c ON p.category_id = c.id
                WHERE c.name = ? AND p.is_active = 1
                ORDER BY p.name
              `, [condition.category], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
              });
            });
          }
        }

        return {
          ...condition,
          products: categoryProducts
        };
      })
    );

    // Get benefit products
    let benefitProducts = [];
    if (benefitProductIdsList.length > 0) {
      if (offer.benefit_type === 'category' && offer.benefit_category) {
        // IMPORTANT: Priority to 'menu' table for Kiosk/Public Ordering
        benefitProducts = await new Promise((resolve, reject) => {
          db.all(`
            SELECT id, name, price, category, image_url
            FROM menu
            WHERE category = ? AND (is_active = 1 OR is_active IS NULL)
            ORDER BY name
          `, [offer.benefit_category], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

        if (!benefitProducts || benefitProducts.length === 0) {
          benefitProducts = await new Promise((resolve, reject) => {
            db.all(`
              SELECT p.id, p.name, p.price, c.name as category, p.image_url
              FROM catalog_products p
              LEFT JOIN catalog_categories c ON p.category_id = c.id
              WHERE c.name = ? AND p.is_active = 1
              ORDER BY p.name
            `, [offer.benefit_category], (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            });
          });
        }
      } else if (offer.benefit_type === 'specific' && benefitProductIdsList.length > 0) {
        // Priority to 'menu' table
        benefitProducts = await new Promise((resolve, reject) => {
          db.all(`
            SELECT id, name, price, category, image_url
            FROM menu
            WHERE id IN (${benefitProductIdsList.map(() => '?').join(',')}) AND (is_active = 1 OR is_active IS NULL)
            ORDER BY name
          `, benefitProductIdsList, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

        if (!benefitProducts || benefitProducts.length === 0) {
          benefitProducts = await new Promise((resolve, reject) => {
            db.all(`
              SELECT p.id, p.name, p.price, c.name as category, p.image_url
              FROM catalog_products p
              LEFT JOIN catalog_categories c ON p.category_id = c.id
              WHERE p.id IN (${benefitProductIdsList.map(() => '?').join(',')}) AND p.is_active = 1
              ORDER BY p.name
            `, benefitProductIdsList, (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            });
          });
        }
      }
    }

    res.json({
      offer: {
        ...offer,
        conditions: conditionsWithProducts,
        benefit_products: benefitProducts
      }
    });
  } catch (error) {
    console.error('Error in getDailyOffer:', error);
    // Return safe default instead of crashing
    res.json({
      offer: null
    });
  }
}

/**
 * POST /api/daily-offer/check
 * Checks if cart is eligible for daily offer discount
 */
async function checkDailyOffer(req, res, next) {
  try {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.json({
        hasOffer: false,
        discountItem: null
      });
    }

    const db = await dbPromise;

    // Get active daily offer
    const offer = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM daily_offers
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!offer) {
      return res.json({
        hasOffer: false,
        discountItem: null
      });
    }

    // Get conditions
    const conditions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM daily_offer_conditions
        WHERE offer_id = ?
        ORDER BY id
      `, [offer.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Check if cart meets all conditions
    const cartByCategory = {};
    cartItems.forEach(item => {
      if (!cartByCategory[item.category]) {
        cartByCategory[item.category] = 0;
      }
      cartByCategory[item.category] += item.quantity;
    });

    let allConditionsMet = true;
    for (const condition of conditions) {
      const cartQuantity = cartByCategory[condition.category] || 0;
      if (cartQuantity < condition.quantity) {
        allConditionsMet = false;
        break;
      }
    }

    if (!allConditionsMet) {
      return res.json({
        hasOffer: false,
        discountItem: null
      });
    }

    // Find a product that can be discounted (first product from benefit category/products)
    let discountItem = null;

    if (offer.benefit_type === 'category' && offer.benefit_category) {
      // Find first product from benefit category in cart
      const benefitProduct = cartItems.find(item => item.category === offer.benefit_category);
      if (benefitProduct) {
        discountItem = {
          itemId: benefitProduct.id,
          category: benefitProduct.category,
          name: benefitProduct.name || 'Produs'
        };
      }
    } else if (offer.benefit_type === 'specific') {
      // Get benefit product IDs
      const benefitProductIds = await new Promise((resolve, reject) => {
        db.all(`
          SELECT product_id FROM daily_offer_benefit_products
          WHERE offer_id = ?
        `, [offer.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      const benefitProductIdsList = benefitProductIds.map(bp => bp.product_id);

      // Find first benefit product in cart
      const benefitProduct = cartItems.find(item => benefitProductIdsList.includes(item.id));
      if (benefitProduct) {
        discountItem = {
          itemId: benefitProduct.id,
          category: benefitProduct.category,
          name: benefitProduct.name || 'Produs'
        };
      }
    }

    res.json({
      hasOffer: discountItem !== null,
      discountItem: discountItem
    });
  } catch (error) {
    console.error('Error in checkDailyOffer:', error);
    // Return safe default instead of crashing
    res.json({
      hasOffer: false,
      discountItem: null
    });
  }
}

/**
 * POST /api/daily-offer
 * Creează sau actualizează daily offer
 */
async function createOrUpdateDailyOffer(req, res, next) {
  try {
    const {
      id,
      title,
      description,
      title_en,
      description_en,
      is_active,
      conditions,
      benefit_type,
      benefit_category,
      benefit_quantity,
      benefit_products
    } = req.body;

    const db = await dbPromise;

    console.log('📝 [DailyOffer] POST /api/daily-offer - Request body:', JSON.stringify(req.body));

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'title și description sunt obligatorii'
      });
    }

    // Dezactivează temporar foreign key constraints
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = OFF', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    let offerId;

    if (id) {
      // Actualizează oferta existentă
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE daily_offers 
           SET title = ?, description = ?, title_en = ?, description_en = ?, 
               is_active = ?, benefit_type = ?, benefit_category = ?, benefit_quantity = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [title, description, title_en || null, description_en || null, is_active ? 1 : 0,
           benefit_type || 'category', benefit_category || null, benefit_quantity || null, id],
          function(err) {
            if (err) {
              console.error('❌ [DailyOffer] Error updating offer:', err);
              reject(err);
            } else {
              console.log('✅ [DailyOffer] Offer updated:', id);
              resolve();
            }
          }
        );
      });
      offerId = id;
    } else {
      // Creează ofertă nouă
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO daily_offers 
           (title, description, title_en, description_en, is_active, benefit_type, benefit_category, benefit_quantity, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [title, description, title_en || null, description_en || null, is_active ? 1 : 0,
           benefit_type || 'category', benefit_category || null, benefit_quantity || null],
          function(err) {
            if (err) {
              console.error('❌ [DailyOffer] Error creating offer:', err);
              reject(err);
            } else {
              console.log('✅ [DailyOffer] Offer created:', this.lastID);
              resolve({ id: this.lastID });
            }
          }
        );
      });
      offerId = result.id;
    }

    // Șterge condițiile vechi
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM daily_offer_conditions WHERE offer_id = ?', [offerId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Adaugă condițiile noi
    if (conditions && Array.isArray(conditions) && conditions.length > 0) {
      for (const condition of conditions) {
        if (condition.category && condition.quantity) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO daily_offer_conditions (offer_id, category, quantity) VALUES (?, ?, ?)',
              [offerId, condition.category, condition.quantity],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }
    }

    // Șterge produsele de beneficiu vechi
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM daily_offer_benefit_products WHERE offer_id = ?', [offerId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Adaugă produsele de beneficiu noi
    if (benefit_products && Array.isArray(benefit_products) && benefit_products.length > 0) {
      for (const productId of benefit_products) {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO daily_offer_benefit_products (offer_id, product_id) VALUES (?, ?)',
            [offerId, productId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    // Reactivează foreign key constraints
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      message: 'Oferta zilei salvată cu succes',
      id: offerId
    });
  } catch (error) {
    console.error('❌ [DailyOffer] Error in createOrUpdateDailyOffer:', error);
    console.error('❌ [DailyOffer] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la salvarea ofertei zilei',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = {
  getDailyOffer,
  checkDailyOffer,
  createOrUpdateDailyOffer
};

