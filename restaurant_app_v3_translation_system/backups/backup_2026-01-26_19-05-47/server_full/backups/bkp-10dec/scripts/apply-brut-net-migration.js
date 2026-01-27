/**
 * Apply BRUT/NET Migration to recipe_ingredients table
 * Data: 03 Decembrie 2025
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../restaurant.db');
const db = new sqlite3.Database(DB_PATH);

console.log('📦 Apply BRUT/NET Migration\n');

db.serialize(() => {
  // Check if columns exist
  db.all("PRAGMA table_info(recipe_ingredients)", (err, columns) => {
    if (err) {
      console.error('❌ Error:', err.message);
      db.close();
      return;
    }
    
    const hasQuantityGross = columns.some(col => col.name === 'quantity_gross');
    const hasQuantityNet = columns.some(col => col.name === 'quantity_net');
    const hasWaste = columns.some(col => col.name === 'waste_percentage');
    
    console.log('Current columns:', columns.map(c => c.name).join(', '));
    console.log('\n🔍 Checking columns:');
    console.log(`  - quantity_gross: ${hasQuantityGross ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  - quantity_net: ${hasQuantityNet ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  - waste_percentage: ${hasWaste ? '✅ EXISTS' : '❌ MISSING'}\n`);
    
    const steps = [];
    
    if (!hasQuantityGross) {
      steps.push(new Promise((resolve, reject) => {
        db.run('ALTER TABLE recipe_ingredients ADD COLUMN quantity_gross REAL', err => {
          if (err) reject(err);
          else {
            console.log('✅ Added quantity_gross');
            resolve();
          }
        });
      }));
    }
    
    if (!hasQuantityNet) {
      steps.push(new Promise((resolve, reject) => {
        db.run('ALTER TABLE recipe_ingredients ADD COLUMN quantity_net REAL', err => {
          if (err) reject(err);
          else {
            console.log('✅ Added quantity_net');
            resolve();
          }
        });
      }));
    }
    
    if (!hasWaste) {
      steps.push(new Promise((resolve, reject) => {
        db.run('ALTER TABLE recipe_ingredients ADD COLUMN waste_percentage REAL DEFAULT 0', err => {
          if (err) reject(err);
          else {
            console.log('✅ Added waste_percentage');
            resolve();
          }
        });
      }));
    }
    
    if (steps.length === 0) {
      console.log('✅ All columns already exist! Migration complete.\n');
      db.close();
      return;
    }
    
    Promise.all(steps)
      .then(() => {
        // Populate values from existing 'quantity' column
        return new Promise((resolve, reject) => {
          db.run(`
            UPDATE recipe_ingredients
            SET quantity_gross = COALESCE(quantity, 0),
                quantity_net = COALESCE(quantity, 0),
                waste_percentage = 0
            WHERE quantity_gross IS NULL OR quantity_net IS NULL
          `, err => {
            if (err) reject(err);
            else {
              console.log('✅ Populated initial values from quantity column');
              resolve();
            }
          });
        });
      })
      .then(() => {
        console.log('\n🎉 Migration completed successfully!\n');
        db.close();
      })
      .catch(err => {
        console.error('❌ Migration error:', err.message);
        db.close();
      });
  });
});

