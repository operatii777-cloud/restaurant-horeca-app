/**
 * POPULATE INGREDIENT CATALOG - Top 50 ingrediente HoReCa
 * Data: 03 Decembrie 2025
 * Expansibil la 1000+ cu script automat
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../restaurant.db');

const ingredients = [
  // CEREALE & FĂINOASE
  {
    name_ro: 'Făină de grâu tip 000', name_en: 'All-purpose flour', category: 'Cereale', subcategory: 'Făinoase', standard_unit: 'kg',
    allergens: '["Gluten"]', allergen_category: 'Cereale cu gluten', additives: '[]',
    energy_kcal: 364, protein: 10.0, carbs: 76.0, sugars: 1.0, fat: 1.0, saturated_fat: 0.2, fiber: 2.7, salt: 0.01,
    source: 'USDA', is_verified: 1, storage_temperature: 'Temperatura camerei (loc uscat)', shelf_life_days: 365
  },
  {
    name_ro: 'Făină de grâu integrală', name_en: 'Whole wheat flour', category: 'Cereale', subcategory: 'Făinoase', standard_unit: 'kg',
    allergens: '["Gluten"]', allergen_category: 'Cereale cu gluten', additives: '[]',
    energy_kcal: 340, protein: 13.0, carbs: 72.0, sugars: 0.4, fat: 2.5, saturated_fat: 0.4, fiber: 10.7, salt: 0.01,
    source: 'USDA', is_verified: 1, storage_temperature: 'Temperatura camerei (loc uscat)', shelf_life_days: 180
  },
  {
    name_ro: 'Orez alb', name_en: 'White rice', category: 'Cereale', subcategory: 'Boabe', standard_unit: 'kg',
    allergens: '[]', allergen_category: '', additives: '[]',
    energy_kcal: 130, protein: 2.7, carbs: 28.0, sugars: 0.1, fat: 0.3, saturated_fat: 0.1, fiber: 0.4, salt: 0.01,
    source: 'USDA', is_verified: 1, storage_temperature: 'Temperatura camerei (loc uscat)', shelf_life_days: 730
  },
  {
    name_ro: 'Paste (spaghete)', name_en: 'Spaghetti pasta', category: 'Cereale', subcategory: 'Paste', standard_unit: 'kg',
    allergens: '["Gluten","Ouă"]', allergen_category: 'Cereale cu gluten', additives: '[]',
    energy_kcal: 371, protein: 13.0, carbs: 74.0, sugars: 2.7, fat: 1.5, saturated_fat: 0.3, fiber: 3.2, salt: 0.01,
    source: 'USDA', is_verified: 1, storage_temperature: 'Temperatura camerei (loc uscat)', shelf_life_days: 730
  },
  {
    name_ro: 'Pâine albă (feliată)', name_en: 'White bread', category: 'Cereale', subcategory: 'Pâine', standard_unit: 'kg',
    allergens: '["Gluten"]', allergen_category: 'Cereale cu gluten', 
    additives: '[{"code":"E471","name":"Mono și digliceride","function":"emulsifiant"}]',
    energy_kcal: 265, protein: 9.0, carbs: 49.0, sugars: 5.0, fat: 3.2, saturated_fat: 0.7, fiber: 2.7, salt: 1.2,
    source: 'USDA', is_verified: 1, storage_temperature: 'Temperatura camerei', shelf_life_days: 7
  },
  
  // LACTATE
  {
    name_ro: 'Lapte integral 3.5%', name_en: 'Whole milk', category: 'Lactate', subcategory: 'Lapte', standard_unit: 'l',
    allergens: '["Lapte"]', allergen_category: 'Lapte', additives: '[]',
    energy_kcal: 61, protein: 3.2, carbs: 4.8, sugars: 4.8, fat: 3.5, saturated_fat: 2.3, fiber: 0, salt: 0.1,
    source: 'USDA', is_verified: 1, storage_temperature: '2-4°C (frigider)', shelf_life_days: 5
  },
  {
    name_ro: 'Smântână 20%', name_en: 'Sour cream', category: 'Lactate', subcategory: 'Smântână', standard_unit: 'kg',
    allergens: '["Lapte"]', allergen_category: 'Lapte', additives: '[]',
    energy_kcal: 193, protein: 3.0, carbs: 4.3, sugars: 4.1, fat: 19.0, saturated_fat: 12.0, fiber: 0, salt: 0.09,
    source: 'USDA', is_verified: 1, storage_temperature: '2-4°C (frigider)', shelf_life_days: 14
  },
  {
    name_ro: 'Unt 82% grăsime', name_en: 'Butter', category: 'Lactate', subcategory: 'Unt', standard_unit: 'kg',
    allergens: '["Lapte"]', allergen_category: 'Lapte', additives: '[]',
    energy_kcal: 717, protein: 0.9, carbs: 0.1, sugars: 0.1, fat: 81.0, saturated_fat: 51.0, fiber: 0, salt: 0.71,
    source: 'USDA', is_verified: 1, storage_temperature: '2-4°C (frigider)', shelf_life_days: 180
  },
  {
    name_ro: 'Brânză telemea', name_en: 'Feta cheese', category: 'Lactate', subcategory: 'Brânzeturi', standard_unit: 'kg',
    allergens: '["Lapte"]', allergen_category: 'Lapte', additives: '[]',
    energy_kcal: 264, protein: 14.0, carbs: 4.1, sugars: 4.1, fat: 21.0, saturated_fat: 15.0, fiber: 0, salt: 1.5,
    source: 'USDA', is_verified: 1, storage_temperature: '2-4°C (frigider în saramură)', shelf_life_days: 60
  },
  {
    name_ro: 'Mozzarella', name_en: 'Mozzarella cheese', category: 'Lactate', subcategory: 'Brânzeturi', standard_unit: 'kg',
    allergens: '["Lapte"]', allergen_category: 'Lapte', additives: '[]',
    energy_kcal: 280, protein: 18.0, carbs: 2.2, sugars: 1.0, fat: 22.0, saturated_fat: 14.0, fiber: 0, salt: 0.62,
    source: 'USDA', is_verified: 1, storage_temperature: '2-4°C (frigider)', shelf_life_days: 21
  },
  
  // Continue cu restul... (pentru moment 10 pentru test rapid)
];

async function populateCatalog() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    console.log('📦 POPULATE INGREDIENT CATALOG');
    console.log('================================\n');
    
    let inserted = 0;
    let errors = 0;
    
    const insertNext = (index) => {
      if (index >= ingredients.length) {
        console.log(`\n================================`);
        console.log(`✅ Inserted: ${inserted}`);
        console.log(`❌ Errors: ${errors}`);
        console.log(`================================\n`);
        db.close();
        return resolve({ inserted, errors });
      }
      
      const ing = ingredients[index];
      
      db.run(`
        INSERT INTO ingredient_catalog_global (
          name_ro, name_en, category, subcategory, standard_unit,
          allergens, allergen_category, additives,
          energy_kcal, protein, carbs, sugars, fat, saturated_fat, fiber, salt,
          source, is_verified, storage_temperature, shelf_life_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ing.name_ro, ing.name_en, ing.category, ing.subcategory, ing.standard_unit,
        ing.allergens, ing.allergen_category, ing.additives,
        ing.energy_kcal, ing.protein, ing.carbs, ing.sugars, ing.fat, ing.saturated_fat, ing.fiber, ing.salt,
        ing.source, ing.is_verified, ing.storage_temperature, ing.shelf_life_days
      ], (err) => {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log(`⚠️  ${ing.name_ro} - already exists (skipped)`);
          } else {
            console.error(`❌ ${ing.name_ro} - Error: ${err.message}`);
            errors++;
          }
        } else {
          console.log(`✅ ${ing.name_ro}`);
          inserted++;
        }
        insertNext(index + 1);
      });
    };
    
    insertNext(0);
  });
}

// RUN
if (require.main === module) {
  populateCatalog()
    .then(result => {
      console.log(`🎉 Catalog populated: ${result.inserted} ingredients!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Population failed:', error.message);
      process.exit(1);
    });
}

module.exports = { populateCatalog };

