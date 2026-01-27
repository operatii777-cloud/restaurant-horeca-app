// Script pentru verificare ce există deja în DB
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Eroare conectare DB:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Conectat la DB\n');
  
  // Verifică tabelele
  const tablesToCheck = [
    'allergens',
    'ingredient_allergens',
    'additives_catalog',
    'ingredient_additives',
    'products_86_list',
    'customer_allergen_profiles'
  ];
  
  let checked = 0;
  
  tablesToCheck.forEach(tableName => {
    db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, rows) => {
      checked++;
      if (err) {
        console.log(`❌ ${tableName}: Eroare verificare`);
      } else if (rows.length > 0) {
        // Verifică coloanele
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
          if (err) {
            console.log(`✅ ${tableName}: EXISTĂ (eroare la coloane)`);
          } else {
            console.log(`✅ ${tableName}: EXISTĂ`);
            console.log(`   Coloane: ${columns.map(c => c.name).join(', ')}`);
          }
          
          if (checked === tablesToCheck.length) {
            // Verifică câmpuri în orders
            db.all(`PRAGMA table_info(orders)`, (err, columns) => {
              if (!err) {
                const orderCols = columns.map(c => c.name);
                console.log(`\n📋 Câmpuri în orders:`);
                console.log(`   cogs: ${orderCols.includes('cogs') ? '✅' : '❌'}`);
                console.log(`   gross_profit: ${orderCols.includes('gross_profit') ? '✅' : '❌'}`);
                console.log(`   food_cost_percentage: ${orderCols.includes('food_cost_percentage') ? '✅' : '❌'}`);
              }
              
              // Verifică alergeni
              db.all(`SELECT COUNT(*) as count FROM allergens`, (err, rows) => {
                if (!err) {
                  console.log(`\n🌾 Alergeni în DB: ${rows[0].count}`);
                }
                db.close();
              });
            });
          }
        });
      } else {
        console.log(`❌ ${tableName}: LIPSEȘTE`);
        if (checked === tablesToCheck.length) {
          db.all(`PRAGMA table_info(orders)`, (err, columns) => {
            if (!err) {
              const orderCols = columns.map(c => c.name);
              console.log(`\n📋 Câmpuri în orders:`);
              console.log(`   cogs: ${orderCols.includes('cogs') ? '✅' : '❌'}`);
              console.log(`   gross_profit: ${orderCols.includes('gross_profit') ? '✅' : '❌'}`);
              console.log(`   food_cost_percentage: ${orderCols.includes('food_cost_percentage') ? '✅' : '❌'}`);
            }
            
            db.all(`SELECT COUNT(*) as count FROM allergens`, (err, rows) => {
              if (!err) {
                console.log(`\n🌾 Alergeni în DB: ${rows[0].count}`);
              }
              db.close();
            });
          });
        }
      }
    });
  });
});

