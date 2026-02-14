const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

db.all(`SELECT name, name_en FROM menu 
        WHERE name_en LIKE '%of/from%' 
        OR name_en LIKE '%at/to%' 
        OR name_en LIKE '%clasice%' 
        OR name_en LIKE '%umplute%'
        OR name_en LIKE '%dulceață%'
        ORDER BY name`, (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }
  
  console.log(`\n🔍 Found ${rows.length} products with hybrid translations:\n`);
  rows.forEach(r => {
    console.log(`"${r.name}": "${r.name_en}",`);
  });
  
  db.close();
});
