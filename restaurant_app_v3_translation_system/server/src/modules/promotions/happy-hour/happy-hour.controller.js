/**
 * Happy Hour Controller
 * Handles Happy Hour promotions logic
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/happyhour/active
 * Returns active Happy Hour settings for the current time
 */
async function getActiveHappyHour(req, res, next) {
  try {
    const db = await dbPromise;
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Duminică) - 6 (Sâmbătă)
    const currentHour = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    // Check if table exists
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='happy_hour_settings'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
    
    if (!tableExists) {
      console.log('⚠️ Tabela happy_hour_settings nu există, returnez empty response');
      return res.json({
        active: false,
        settings: []
      });
    }
    
    // Get all active Happy Hour settings
    const settings = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM happy_hour_settings
        WHERE is_active = 1
        ORDER BY created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    if (!settings || settings.length === 0) {
      return res.json({
        active: false,
        settings: []
      });
    }

    // Filter settings that are active right now
    const activeSettings = settings.filter(hh => {
      // Parse days_of_week
      let daysArray = hh.days_of_week;
      if (typeof daysArray === 'string' && daysArray.startsWith('[')) {
        try {
          daysArray = JSON.parse(daysArray);
        } catch (e) {
          daysArray = [daysArray];
        }
      } else if (typeof daysArray === 'string') {
        daysArray = [daysArray.trim()];
      }

      // Check if current day is in the days array
      const dayMappings = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 0,
        'luni': 1, 'marti': 2, 'miercuri': 3, 'joi': 4, 'vineri': 5, 'sambata': 6, 'duminica': 0
      };

      const isRelevantDay = daysArray.includes('all') || 
        daysArray.some(day => {
          const mappedDay = dayMappings[String(day).toLowerCase().trim()];
          return mappedDay === currentDay;
        });

      if (!isRelevantDay) {
        return false;
      }

      // Check time range
      const [startH, startM] = hh.start_time.split(':').map(Number);
      const [endH, endM] = hh.end_time.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      return currentHour >= startMinutes && currentHour <= endMinutes;
    });

    res.json({
      active: activeSettings.length > 0,
      settings: activeSettings
    });
  } catch (error) {
    console.error('❌ Error in getActiveHappyHour:', error);
    // Return safe default instead of crashing
    res.json({
      active: false,
      settings: []
    });
  }
}

/**
 * POST /api/happyhour/calculate-discounts
 * Calculates discounts for cart items based on active Happy Hour
 */
async function calculateDiscounts(req, res, next) {
  try {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.json({
        hasDiscount: false,
        totalDiscount: 0,
        items: [],
        happyHourSettings: null
      });
    }

    const db = await dbPromise;
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours() * 60 + now.getMinutes();

    // Get active Happy Hour settings
    const settings = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM happy_hour_settings
        WHERE is_active = 1
        ORDER BY created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    if (!settings || settings.length === 0) {
      return res.json({
        hasDiscount: false,
        totalDiscount: 0,
        items: [],
        happyHourSettings: null
      });
    }

    // Find active Happy Hour for current time
    let activeHappyHour = null;
    for (const hh of settings) {
      let daysArray = hh.days_of_week;
      if (typeof daysArray === 'string' && daysArray.startsWith('[')) {
        try {
          daysArray = JSON.parse(daysArray);
        } catch (e) {
          daysArray = [daysArray];
        }
      } else if (typeof daysArray === 'string') {
        daysArray = [daysArray.trim()];
      }

      const dayMappings = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 0,
        'luni': 1, 'marti': 2, 'miercuri': 3, 'joi': 4, 'vineri': 5, 'sambata': 6, 'duminica': 0
      };

      const isRelevantDay = daysArray.includes('all') ||
        daysArray.some(day => {
          const mappedDay = dayMappings[String(day).toLowerCase().trim()];
          return mappedDay === currentDay;
        });

      if (isRelevantDay) {
        const [startH, startM] = hh.start_time.split(':').map(Number);
        const [endH, endM] = hh.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (currentHour >= startMinutes && currentHour <= endMinutes) {
          activeHappyHour = hh;
          break;
        }
      }
    }

    if (!activeHappyHour) {
      return res.json({
        hasDiscount: false,
        totalDiscount: 0,
        items: [],
        happyHourSettings: null
      });
    }

    // Get products to check categories
    // Caută în catalog_products (prioritar), apoi în menu
    const productIds = cartItems.map(item => item.productId).filter(Boolean);
    let products = [];
    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      
      // Încearcă mai întâi în catalog_products
      products = await new Promise((resolve, reject) => {
        db.all(`
          SELECT p.id, c.name as category, p.name
          FROM catalog_products p
          LEFT JOIN catalog_categories c ON p.category_id = c.id
          WHERE p.id IN (${placeholders}) AND p.is_active = 1
        `, productIds, (err, rows) => {
          if (err) {
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });
      
      // Dacă nu găsește toate produsele în catalog_products, caută în menu
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      
      if (missingIds.length > 0) {
        const missingPlaceholders = missingIds.map(() => '?').join(',');
        const missingProducts = await new Promise((resolve, reject) => {
          db.all(`
            SELECT id, category, name FROM menu
            WHERE id IN (${missingPlaceholders}) AND (is_active = 1 OR is_active IS NULL)
          `, missingIds, (err, rows) => {
            if (err) {
              resolve([]);
            } else {
              resolve(rows || []);
            }
          });
        });
        
        products = [...products, ...missingProducts];
      }
    }

    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = p;
    });

    // Parse applicable categories and products
    let applicableCategories = [];
    let applicableProducts = [];

    if (activeHappyHour.applicable_categories) {
      try {
        applicableCategories = JSON.parse(activeHappyHour.applicable_categories);
      } catch (e) {
        applicableCategories = activeHappyHour.applicable_categories.split(',').map(c => c.trim());
      }
    }

    if (activeHappyHour.applicable_products) {
      try {
        applicableProducts = JSON.parse(activeHappyHour.applicable_products);
      } catch (e) {
        applicableProducts = activeHappyHour.applicable_products.split(',').map(p => parseInt(p.trim())).filter(Boolean);
      }
    }

    // Calculate discounts for each cart item
    const discountedItems = cartItems.map(item => {
      if (item.isFree) {
        return {
          ...item,
          originalPrice: item.finalPrice,
          finalPrice: item.finalPrice,
          discount: 0
        };
      }

      const product = productMap[item.productId];
      if (!product) {
        return {
          ...item,
          originalPrice: item.finalPrice,
          finalPrice: item.finalPrice,
          discount: 0
        };
      }

      // Check if product is eligible for discount
      const isEligible = 
        applicableProducts.includes(item.productId) ||
        (applicableCategories.length > 0 && applicableCategories.includes(product.category));

      if (!isEligible) {
        return {
          ...item,
          originalPrice: item.finalPrice,
          finalPrice: item.finalPrice,
          discount: 0
        };
      }

      // Calculate discount
      let discount = 0;
      if (activeHappyHour.discount_percentage > 0) {
        discount = (item.finalPrice * activeHappyHour.discount_percentage) / 100;
      } else if (activeHappyHour.discount_fixed > 0) {
        discount = activeHappyHour.discount_fixed;
      }

      const finalPrice = Math.max(0, item.finalPrice - discount);

      return {
        ...item,
        originalPrice: item.finalPrice,
        finalPrice: finalPrice,
        discount: discount
      };
    });

    const totalDiscount = discountedItems.reduce((sum, item) => sum + (item.discount * item.quantity), 0);

    res.json({
      hasDiscount: totalDiscount > 0,
      totalDiscount: totalDiscount,
      items: discountedItems,
      happyHourSettings: activeHappyHour
    });
  } catch (error) {
    console.error('Error in calculateDiscounts:', error);
    // Return safe default instead of crashing
    res.json({
      hasDiscount: false,
      totalDiscount: 0,
      items: [],
      happyHourSettings: null
    });
  }
}

module.exports = {
  getActiveHappyHour,
  calculateDiscounts
};

