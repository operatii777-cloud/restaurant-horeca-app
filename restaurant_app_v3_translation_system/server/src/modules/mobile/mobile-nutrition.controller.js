/**
 * MOBILE APP NUTRITION CONTROLLER
 * 
 * Expune informații nutriționale pentru produse
 * (copiat din Restaurant App - tabela menu are deja câmpurile)
 */

const { dbPromise } = require('../../../database');

/**
 * GET /api/mobile/products/:id/nutrition
 * Obține informații nutriționale pentru un produs
 */
async function getProductNutrition(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    
    // Caută în catalog_products (prioritar)
    let product = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          id, name, price,
          calories, protein, carbs, fat, fiber, sodium, sugar, salt,
          is_vegetarian, is_spicy, allergens, ingredients
        FROM catalog_products
        WHERE id = ? AND is_active = 1
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Dacă nu găsește în catalog_products, caută în menu
    if (!product) {
      product = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            id, name, price,
            calories, protein, carbs, fat, fiber, sodium, sugar, salt,
            is_vegetarian, is_spicy, allergens, ingredients
          FROM menu
          WHERE id = ?
        `, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produs negăsit' });
    }
    
    // Parse allergens dacă e string JSON
    let allergens = [];
    if (product.allergens) {
      try {
        allergens = typeof product.allergens === 'string' 
          ? JSON.parse(product.allergens) 
          : product.allergens;
      } catch (e) {
        allergens = [];
      }
    }
    
    res.json({
      success: true,
      data: {
        product_id: product.id,
        product_name: product.name,
        // Nutritional info (per 100g sau per porție)
        calories: product.calories || 0,
        protein: product.protein || 0, // g
        carbs: product.carbs || 0, // g
        fat: product.fat || 0, // g
        fiber: product.fiber || 0, // g
        sodium: product.sodium || 0, // mg
        sugar: product.sugar || 0, // g
        salt: product.salt || 0, // g
        // Dietary info
        is_vegetarian: product.is_vegetarian === 1 || product.is_vegetarian === true,
        is_vegan: false, // TODO: Adaugă câmp în baza de date
        is_gluten_free: allergens && !allergens.includes('Gluten'),
        is_spicy: product.is_spicy === 1 || product.is_spicy === true,
        allergens: allergens,
        ingredients: product.ingredients || null,
      }
    });
  } catch (error) {
    console.error('❌ Error in getProductNutrition:', error);
    next(error);
  }
}

/**
 * GET /api/mobile/products/nutrition/filter
 * Filtrează produse după preferințe nutriționale
 */
async function filterProductsByNutrition(req, res, next) {
  try {
    const db = await dbPromise;
    const { 
      vegetarian, 
      vegan, 
      gluten_free, 
      max_calories, 
      max_fat,
      category 
    } = req.query;
    
    let query = `
      SELECT 
        id, name, price, category, image_url,
        calories, protein, carbs, fat, fiber,
        is_vegetarian, is_spicy, allergens
      FROM catalog_products
      WHERE is_active = 1
    `;
    
    const params = [];
    
    if (vegetarian === 'true') {
      query += ' AND is_vegetarian = 1';
    }
    
    if (gluten_free === 'true') {
      query += ' AND (allergens IS NULL OR allergens NOT LIKE "%Gluten%")';
    }
    
    if (max_calories) {
      query += ' AND (calories IS NULL OR calories <= ?)';
      params.push(parseFloat(max_calories));
    }
    
    if (max_fat) {
      query += ' AND (fat IS NULL OR fat <= ?)';
      params.push(parseFloat(max_fat));
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY name';
    
    const products = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        image_url: p.image_url,
        nutrition: {
          calories: p.calories || 0,
          protein: p.protein || 0,
          carbs: p.carbs || 0,
          fat: p.fat || 0,
          fiber: p.fiber || 0,
        },
        is_vegetarian: p.is_vegetarian === 1,
        is_spicy: p.is_spicy === 1,
      }))
    });
  } catch (error) {
    console.error('❌ Error in filterProductsByNutrition:', error);
    next(error);
  }
}

module.exports = {
  getProductNutrition,
  filterProductsByNutrition,
};
