// server/seeds/loadProductsSeeds.js
// ✅ Loader pentru Products Seed în database.js

const { buildProductsSeed } = require('./products_seed');

module.exports.seedProducts = function seedProducts(db) {
  console.log('▶ Seeding products database...');
  
  const products = buildProductsSeed(1500);
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    const insertProduct = db.prepare(`
      INSERT OR IGNORE INTO menu (
        id, name, category, price, description, weight,
        allergens, name_en, description_en, category_en, allergens_en,
        is_vegetarian, is_spicy, is_takeout_only,
        prep_time, spice_level,
        calories, protein, carbs, fat, fiber, sodium, sugar, salt,
        image_url, is_sellable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    products.forEach(product => {
      insertProduct.run(
        product.id,
        product.name,
        product.category,
        product.price,
        product.description,
        product.weight,
        product.allergens,
        product.name_en,
        product.description_en,
        product.category_en,
        product.allergens_en,
        product.is_vegetarian,
        product.is_spicy,
        product.is_takeout_only,
        product.prep_time,
        product.spice_level,
        product.calories,
        product.protein,
        product.carbs,
        product.fat,
        product.fiber,
        product.sodium,
        product.sugar,
        product.salt,
        product.image_url,
        product.is_sellable
      );
    });
    
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('❌ Eroare la commit products seed:', err);
      } else {
        console.log(`✔ Gata — ${products.length} produse seed-uite!`);
      }
    });
  });
};

