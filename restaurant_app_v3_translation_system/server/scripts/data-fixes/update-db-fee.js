const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', (err) => {
  if(err) {
    console.error('❌ DB Error:', err);
    process.exit(1);
  }
  
  db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
    if(err) {
      console.error('❌ Query Error:', err);
    } else {
      console.log('📊 Tables:', tables.map(t => t.name).join(', '));
      
      // Now try to update delivery_fee for delivery with id=1
      db.run('UPDATE delivery_assignments SET delivery_fee = 15 WHERE id = 1;', function(err) {
        if(err) {
          console.error('❌ Update Error:', err);
        } else {
          console.log('✅ Updated delivery_fee to 15 RON (changes=' + this.changes + ')');
        }
        db.close();
      });
    }
  });
});
