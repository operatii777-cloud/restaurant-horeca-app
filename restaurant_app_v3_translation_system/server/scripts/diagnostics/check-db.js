const sqlite3 = require('sqlite3').verbose();

function checkDatabase(dbPath, name) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log(`\n📊 Checking ${name} (${dbPath}):`);
    
    db.all(`SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%daily%' OR name LIKE '%offer%')`, (e, rows) => {
      if (e) {
        console.error('Error:', e.message);
        resolve();
        return;
      }
      
      if (!rows || rows.length === 0) {
        console.log(`❌ No daily offer tables found in ${name}`);
        db.close();
        resolve();
        return;
      }
      
      console.log(`✅ Found ${rows.length} daily offer related tables:`);
      rows.forEach(r => console.log(`   - ${r.name}`));
      
      // Check schema for each table
      const checkNext = (idx) => {
        if (idx >= rows.length) {
          db.close();
          resolve();
          return;
        }
        
        const tableName = rows[idx].name;
        db.all(`PRAGMA table_info(${tableName})`, (e, cols) => {
          if (!e && cols) {
            console.log(`   Schema of ${tableName}: ${cols.map(c => c.name).join(', ')}`);
          }
          checkNext(idx + 1);
        });
      };
      
      checkNext(0);
    });
  });
}

// Check both databases
(async () => {
  await checkDatabase('../restaurant.db', 'restaurant.db');
  await checkDatabase('../database.db', 'database.db');
  console.log('\n✅ Check complete');
})();
