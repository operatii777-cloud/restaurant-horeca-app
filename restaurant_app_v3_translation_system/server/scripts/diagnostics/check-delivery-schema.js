const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Check schema of delivery_assignments
  db.all("PRAGMA table_info(delivery_assignments)", (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }
    
    console.log('📋 delivery_assignments schema:');
    rows.forEach(row => {
      console.log(`  ${row.name}: ${row.type}${row.notnull ? ' NOT NULL' : ''}${row.pk ? ' (PRIMARY KEY)' : ''}`);
    });
    
    // Check existing data in delivery_assignments
    db.get('SELECT * FROM delivery_assignments WHERE id = 1', (err, row) => {
      if (err) {
        console.error('\nError reading delivery ID 1:', err);
      } else if (row) {
        console.log('\n📦 Existing delivery_assignments ID 1:');
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
      } else {
        console.log('\n⚠️ No delivery_assignments ID 1 found');
      }
      
      db.close();
    });
  });
});
