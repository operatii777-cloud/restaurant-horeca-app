const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else if (!rows || rows.length === 0) {
      console.log('No tables in restaurant.db');
    } else {
      console.log('Tables found: ' + rows.map(r => r.name).join(', '));
      
      // Try to find delivery info
      db.get('SELECT id, delivery_fee, tip FROM delivery_assignments WHERE id = 1', (err, row) => {
        if (err) {
          console.log('delivery_assignments query error: ' + err.message);
        } else {
          console.log('delivery_assignments result:', row || 'not found');
        }
        
        // Update delivery fee to 15
        db.run('UPDATE delivery_assignments SET delivery_fee = 15, tip = 0 WHERE id = 1', function(err) {
          if (err) {
            console.log('Update error (might be ok):', err.message);
          } else {
            console.log('Updated ' + this.changes + ' rows in delivery_assignments');
          }
          db.close();
        });
      });
    }
  });
});
