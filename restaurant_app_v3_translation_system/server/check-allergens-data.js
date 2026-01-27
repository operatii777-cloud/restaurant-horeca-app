const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db', (err) => {
  if (err) { console.error('❌ DB Error:', err); process.exit(1); }
  
  console.log('📊 Products WITH ALLERGENS:\n');
  
  db.all(
    `SELECT id, name, category, allergens, allergens_en FROM menu 
     WHERE (allergens IS NOT NULL AND allergens != '') 
        OR (allergens_en IS NOT NULL AND allergens_en != '')
     LIMIT 10`,
    (err, rows) => {
      if (err) {
        console.error('❌ Query error:', err);
        process.exit(1);
      }
      
      if (rows.length === 0) {
        console.log('❌ No products with allergens found');
      } else {
        rows.forEach((row, idx) => {
          console.log(`${idx + 1}. [${row.id}] ${row.category} / ${row.name}`);
          console.log(`   allergens (col):     ${row.allergens || '(null)'}`);
          console.log(`   allergens_en (col):  ${row.allergens_en || '(null)'}`);
          console.log('');
        });
      }
      
      db.close();
      process.exit(0);
    }
  );
});
