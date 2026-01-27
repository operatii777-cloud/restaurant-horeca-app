/**
 * IMPORT INGREDIENT CATALOG - Pre-Populate pentru restaurante noi
 * Data: 03 Decembrie 2025
 * Scop: Reduce setup de la 40-80h la 2h per client nou
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../restaurant.db');

async function importCatalogToRestaurant() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    console.log('📦 IMPORT INGREDIENT CATALOG');
    console.log('==============================\n');
    
    // Verifică dacă ingredient_catalog_global există
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ingredient_catalog_global'", [], (err, row) => {
      if (err) {
        return reject(err);
      }
      
      if (!row) {
        console.log('⚠️ Tabelul ingredient_catalog_global nu există!');
        console.log('Rulează migration: node migrations/010_ingredient_catalog_global.sql');
        return reject(new Error('ingredient_catalog_global table not found'));
      }
      
      // Contorizează ingredientele din catalog
      db.get('SELECT COUNT(*) as count FROM ingredient_catalog_global', [], (err, result) => {
        if (err) return reject(err);
        
        console.log(`✅ Catalog global conține: ${result.count} ingrediente\n`);
        
        if (result.count === 0) {
          console.log('⚠️ Catalogul e gol! Trebuie să populate mai întâi.');
          return reject(new Error('Catalog is empty'));
        }
        
        // Import în tabelul local "ingredients"
        console.log('📥 Import în tabelul local ingredients...\n');
        
        const importQuery = `
          INSERT INTO ingredients (
            name, name_en, category, unit, 
            allergens, additives,
            energy_kcal, protein, carbs, fat, salt,
            min_stock, is_active
          )
          SELECT 
            name_ro, name_en, category, standard_unit,
            allergens, additives,
            energy_kcal, protein, carbs, fat, salt,
            0, 1
          FROM ingredient_catalog_global
          WHERE id NOT IN (
            SELECT catalog_id FROM ingredients WHERE catalog_id IS NOT NULL
          )
        `;
        
        db.run(importQuery, [], function(err) {
          if (err) {
            console.error('❌ Eroare la import:', err.message);
            return reject(err);
          }
          
          const imported = this.changes;
          console.log(`✅ Importate ${imported} ingrediente noi!\n`);
          
          // Statistici
          db.get('SELECT COUNT(*) as total FROM ingredients WHERE is_active = 1', [], (err, stats) => {
            if (err) return reject(err);
            
            console.log('==============================');
            console.log('📊 STATISTICI FINALE');
            console.log('==============================');
            console.log(`Total ingrediente active: ${stats.total}`);
            console.log(`Nou importate: ${imported}`);
            console.log(`Sursă: Catalog Global`);
            console.log('==============================\n');
            
            console.log('✅ IMPORT FINALIZAT CU SUCCES!\n');
            console.log('📋 NEXT STEPS:');
            console.log('1. Deschide Admin → Ingrediente');
            console.log('2. Adaugă DOAR prețurile (restul e completat)');
            console.log('3. Selectează furnizori');
            console.log('4. Durată estimată: 1-2 ore (vs 40-80h manual!)\n');
            
            db.close();
            resolve({ imported, total: stats.total });
          });
        });
      });
    });
  });
}

// RUN
if (require.main === module) {
  importCatalogToRestaurant()
    .then(result => {
      console.log(`🎉 Import complet: ${result.imported} ingrediente noi!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error.message);
      process.exit(1);
    });
}

module.exports = { importCatalogToRestaurant };

