const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db', (err) => {
  if (err) {
    console.error('❌ DB Error:', err);
    process.exit(1);
  }
  
  console.log('📋 Checking MENU table schema...\n');
  
  db.all("PRAGMA table_info(menu)", (err, rows) => {
    if (err) {
      console.error('❌ Schema error:', err);
      process.exit(1);
    }
    
    // Show all columns with 'allergen' or 'name'
    rows.forEach(col => {
      if (col.name.includes('allergen') || col.name.includes('name') || col.name === 'id') {
        console.log(`  ${col.cid}. ${col.name} (${col.type}) - NotNull: ${col.notnull}`);
      }
    });
    
    console.log('\n📊 Sample products data:\n');
    
    // Get sample data
    db.all('SELECT id, name, allergens, allergens_en FROM menu LIMIT 5', (err, rows) => {
      if (err) {
        console.error('❌ Query error:', err);
        process.exit(1);
      }
      
      rows.forEach((row, idx) => {
        console.log(`Product ${idx + 1} (ID: ${row.id})`);
        console.log(`  Name: ${row.name}`);
        console.log(`  allergens: ${row.allergens || '(empty)'}`);
        console.log(`  allergens_en: ${row.allergens_en || '(empty)'}`);
        console.log('');
      });
      
      db.close();
      process.exit(0);
    });
  });
});
