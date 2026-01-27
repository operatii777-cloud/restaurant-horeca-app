const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

db.all(`SELECT id, name, allergens, allergens_en, info 
        FROM menu 
        WHERE (allergens IS NOT NULL AND allergens != '') 
        OR (info IS NOT NULL AND info != '')
        LIMIT 15`, (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }
  
  console.log(`\n📋 Found ${rows.length} products with allergens/info:\n`);
  rows.forEach(r => {
    console.log(`${r.id}: ${r.name}`);
    if (r.allergens) {
      console.log(`   🔴 allergens (RO): ${r.allergens}`);
      console.log(`   🔵 allergens_en: ${r.allergens_en || 'NULL - NOT TRANSLATED'}`);
    }
    if (r.info) {
      console.log(`   ℹ️  info: ${r.info.substring(0, 80)}${r.info.length > 80 ? '...' : ''}`);
    }
    console.log('');
  });
  
  db.close();
});
