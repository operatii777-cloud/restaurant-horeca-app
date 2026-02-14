const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

db.all(`SELECT name, name_en FROM menu 
        WHERE name LIKE '%Clătite%' 
        OR name LIKE '%Salată%' 
        OR name LIKE '%Shaorma%'
        OR name LIKE '%Ciorbă%'
        ORDER BY name LIMIT 20`, (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }
  
  console.log(`\n✅ Sample translations (${rows.length} products):\n`);
  rows.forEach(r => {
    console.log(`   ${r.name}`);
    console.log(`   → ${r.name_en}\n`);
  });
  
  db.close();
});
