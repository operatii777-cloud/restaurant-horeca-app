// server/seeds/loadProductsSeeds.js
// ✅ Loader pentru Products Seed în database.js

const { buildProductsSeed } = require('./products_seed');

module.exports.seedProducts = function seedProducts(db) {
  return new Promise((resolve, reject) => {
    console.log('▶ Seeding products database...');
    
    try {
      const products = buildProductsSeed(); // Fără limită, folosește toate produsele
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            console.error('❌ Eroare la BEGIN TRANSACTION:', err);
            return reject(err);
          }
          
          const insertProduct = db.prepare(`
            INSERT OR IGNORE INTO menu (
              id, name, category, price, description, weight,
              allergens, name_en, description_en, category_en, allergens_en,
              is_vegetarian, is_spicy, is_takeout_only,
              prep_time, spice_level,
              calories, protein, carbs, fat, fiber, sodium, sugar, salt,
              image_url, is_sellable, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
          `);
          
          let inserted = 0;
          let errors = 0;
          
          products.forEach((product, index) => {
            insertProduct.run(
              product.id || (index + 1),
              product.name,
              product.category,
              product.price,
              product.description || '',
              product.weight || '',
              product.allergens || '',
              product.name_en || product.name,
              product.description_en || product.description || '',
              product.category_en || product.category,
              product.allergens_en || product.allergens || '',
              product.is_vegetarian ? 1 : 0,
              product.is_spicy ? 1 : 0,
              product.is_takeout_only ? 1 : 0,
              product.prep_time || 0,
              product.spice_level || 0,
              product.calories || 0,
              product.protein || 0,
              product.carbs || 0,
              product.fat || 0,
              product.fiber || 0,
              product.sodium || 0,
              product.sugar || 0,
              product.salt || 0,
              product.image_url || '',
              product.is_sellable !== false ? 1 : 0,
              (err) => {
                if (err) {
                  errors++;
                  if (errors <= 5) { // Log doar primele 5 erori
                    console.error(`❌ Eroare la inserarea produsului ${product.name}:`, err.message);
                  }
                } else {
                  inserted++;
                }
              }
            );
          });
          
          insertProduct.finalize((err) => {
            if (err) {
              console.error('❌ Eroare la finalizarea insertProduct:', err);
              db.run('ROLLBACK', () => reject(err));
              return;
            }
            
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('❌ Eroare la commit products seed:', err);
                return reject(err);
              } else {
                console.log(`✅ Gata — ${inserted} produse seed-uite!${errors > 0 ? ` (${errors} erori)` : ''}`);
                resolve(inserted);
              }
            });
          });
        });
      });
    } catch (error) {
      console.error('❌ Eroare în seedProducts:', error);
      reject(error);
    }
  });
};

