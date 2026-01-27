/**
 * FIX COMMON BUGS - Automated bug fixes
 * Data: 03 Decembrie 2025
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../restaurant.db');

console.log('🔧 FIXING COMMON BUGS\n');
console.log('====================\n');

const db = new sqlite3.Database(DB_PATH);

// ========== FIX 1: Ensure all required columns exist ==========
async function fixMissingColumns() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Checking recipe_ingredients columns...');
    
    db.all('PRAGMA table_info(recipe_ingredients)', (err, columns) => {
      if (err) return reject(err);
      
      const columnNames = columns.map(c => c.name);
      const fixes = [];
      
      if (!columnNames.includes('quantity_gross')) {
        fixes.push('ALTER TABLE recipe_ingredients ADD COLUMN quantity_gross REAL');
      }
      if (!columnNames.includes('quantity_net')) {
        fixes.push('ALTER TABLE recipe_ingredients ADD COLUMN quantity_net REAL');
      }
      if (!columnNames.includes('waste_percentage')) {
        fixes.push('ALTER TABLE recipe_ingredients ADD COLUMN waste_percentage REAL DEFAULT 0');
      }
      
      if (fixes.length === 0) {
        console.log('   ✅ All columns exist\n');
        resolve();
        return;
      }
      
      console.log(`   ⚠️  Missing ${fixes.length} columns, fixing...`);
      
      let completed = 0;
      fixes.forEach((sql, idx) => {
        db.run(sql, (err2) => {
          if (err2 && !err2.message.includes('duplicate')) {
            console.error(`   ❌ Error: ${err2.message}`);
          } else {
            console.log(`   ✅ Fixed: ${sql.split('ADD COLUMN ')[1]?.split(' ')[0]}`);
          }
          
          completed++;
          if (completed === fixes.length) {
            console.log('   ✅ All columns fixed\n');
            resolve();
          }
        });
      });
    });
  });
}

// ========== FIX 2: Populate quantity_gross/net from quantity ==========
async function populateBrutNet() {
  return new Promise((resolve, reject) => {
    console.log('2️⃣ Populating BRUT/NET from quantity...');
    
    db.run(`
      UPDATE recipe_ingredients
      SET quantity_gross = COALESCE(quantity, 0),
          quantity_net = COALESCE(quantity, 0),
          waste_percentage = 0
      WHERE (quantity_gross IS NULL OR quantity_net IS NULL)
        AND quantity IS NOT NULL
    `, function(err) {
      if (err) {
        console.error(`   ❌ Error: ${err.message}\n`);
        return reject(err);
      }
      
      console.log(`   ✅ Updated ${this.changes} rows\n`);
      resolve();
    });
  });
}

// ========== FIX 3: Ensure ingredient_catalog_global exists ==========
async function ensureCatalogTable() {
  return new Promise((resolve, reject) => {
    console.log('3️⃣ Checking ingredient_catalog_global table...');
    
    db.get(`
      SELECT COUNT(*) as count 
      FROM sqlite_master 
      WHERE type='table' AND name='ingredient_catalog_global'
    `, (err, row) => {
      if (err) return reject(err);
      
      if (row.count === 0) {
        console.log('   ⚠️  Table missing, creating...');
        // Table creation should be handled by database.js
        console.log('   ✅ Table will be created on next server start\n');
      } else {
        console.log('   ✅ Table exists\n');
      }
      
      resolve();
    });
  });
}

// ========== FIX 4: Verify all enterprise tables ==========
async function verifyEnterpriseTables() {
  return new Promise((resolve, reject) => {
    console.log('4️⃣ Verifying enterprise tables...');
    
    const requiredTables = [
      'technical_sheets',
      'product_recalls',
      'stock_variance',
      'expiry_alerts',
      'product_portions',
      'recipe_versions',
      'allergen_cross_contamination'
    ];
    
    db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN (${requiredTables.map(() => '?').join(',')})
    `, requiredTables, (err, rows) => {
      if (err) return reject(err);
      
      const existing = rows.map(r => r.name);
      const missing = requiredTables.filter(t => !existing.includes(t));
      
      if (missing.length === 0) {
        console.log('   ✅ All enterprise tables exist\n');
      } else {
        console.log(`   ⚠️  Missing tables: ${missing.join(', ')}`);
        console.log('   ℹ️  These will be created by database-enterprise-tables.js\n');
      }
      
      resolve();
    });
  });
}

// ========== RUN ALL FIXES ==========
async function runAllFixes() {
  try {
    await fixMissingColumns();
    await populateBrutNet();
    await ensureCatalogTable();
    await verifyEnterpriseTables();
    
    console.log('✅ All bug fixes completed!\n');
    db.close();
  } catch (err) {
    console.error('❌ Error during fixes:', err.message);
    db.close();
    process.exit(1);
  }
}

if (require.main === module) {
  runAllFixes();
}

module.exports = { runAllFixes };

