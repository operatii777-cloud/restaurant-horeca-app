/**
 * VERIFICARE ENTERPRISE FEATURES - Test rapid funcționalitate
 * Data: 03 Decembrie 2025
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../restaurant.db');

async function verifyTables() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    console.log('🧪 VERIFICARE ENTERPRISE TABLES');
    console.log('==================================\n');
    
    const tables = [
      'ingredient_catalog_global',
      'technical_sheets',
      'product_portions',
      'allergen_cross_contamination',
      'product_recalls',
      'expiry_alerts',
      'stock_variance',
      'recipe_versions',
      'technical_sheet_history'
    ];
    
    let checked = 0;
    let existing = 0;
    
    const checkNext = (index) => {
      if (index >= tables.length) {
        console.log('\n==================================');
        console.log(`✅ Tables verified: ${existing}/${checked}`);
        console.log('==================================\n');
        db.close();
        return resolve({ checked, existing });
      }
      
      const tableName = tables[index];
      
      db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `, [tableName], (err, row) => {
        checked++;
        
        if (err) {
          console.log(`❌ ${tableName} - Error: ${err.message}`);
        } else if (row) {
          console.log(`✅ ${tableName}`);
          existing++;
          
          // Count records
          db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err2, countRow) => {
            if (!err2 && countRow) {
              console.log(`   └─ Records: ${countRow.count}`);
            }
            checkNext(index + 1);
          });
        } else {
          console.log(`❌ ${tableName} - NOT FOUND`);
          checkNext(index + 1);
        }
      });
    };
    
    checkNext(0);
  });
}

async function verifyServices() {
  console.log('\n🔧 VERIFICARE SERVICES');
  console.log('==================================\n');
  
  const services = [
    'technical-sheet.service.js',
    'portion.service.js',
    'recall.service.js',
    'expiry.service.js',
    'recipe.service.js',
    'variance.service.js',
    'cross-contamination.service.js',
    'pricing.service.js',
    'transfer.service.js'
  ];
  
  const fs = require('fs');
  
  let existing = 0;
  
  for (const service of services) {
    const servicePath = path.join(__dirname, '../services', service);
    
    if (fs.existsSync(servicePath)) {
      console.log(`✅ ${service}`);
      existing++;
      
      // Try to require
      try {
        require(servicePath);
        console.log(`   └─ Module loads: OK`);
      } catch (error) {
        console.log(`   └─ Module error: ${error.message}`);
      }
    } else {
      console.log(`❌ ${service} - NOT FOUND`);
    }
  }
  
  console.log('\n==================================');
  console.log(`✅ Services verified: ${existing}/${services.length}`);
  console.log('==================================\n');
  
  return { total: services.length, existing };
}

async function testIngredientCatalog() {
  console.log('\n📦 TEST: Ingredient Catalog');
  console.log('==================================\n');
  
  const db = new sqlite3.Database(DB_PATH);
  
  return new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM ingredient_catalog_global', [], (err, row) => {
      if (err) {
        console.log('❌ Error:', err.message);
        return resolve(false);
      }
      
      console.log(`✅ Catalog contains: ${row.count} ingredients`);
      
      // Show sample
      db.all('SELECT name_ro, category, allergens FROM ingredient_catalog_global LIMIT 5', [], (err2, rows) => {
        if (!err2 && rows) {
          console.log('\n📋 Sample ingredients:');
          rows.forEach(r => {
            console.log(`  - ${r.name_ro} (${r.category}) - Allergens: ${r.allergens}`);
          });
        }
        
        db.close();
        resolve(true);
      });
    });
  });
}

// RUN ALL TESTS
(async () => {
  try {
    console.log('\n');
    console.log('🚀 ENTERPRISE FEATURES VERIFICATION');
    console.log('====================================\n');
    
    const tablesResult = await verifyTables();
    const servicesResult = await verifyServices();
    const catalogResult = await testIngredientCatalog();
    
    console.log('\n====================================');
    console.log('📊 FINAL REPORT');
    console.log('====================================');
    console.log(`Tables: ${tablesResult.existing}/${tablesResult.checked} ✅`);
    console.log(`Services: ${servicesResult.existing}/${servicesResult.total} ✅`);
    console.log(`Catalog populated: ${catalogResult ? 'Yes' : 'No'} ${catalogResult ? '✅' : '❌'}`);
    console.log('====================================\n');
    
    const allGood = tablesResult.existing === tablesResult.checked && 
                    servicesResult.existing === servicesResult.total && 
                    catalogResult;
    
    if (allGood) {
      console.log('🎉 ALL TESTS PASSED! Ready for Frontend!\n');
      process.exit(0);
    } else {
      console.log('⚠️ Some tests failed. Check errors above.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
})();

