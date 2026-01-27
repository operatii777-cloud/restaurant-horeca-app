const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('=== Verificare structură DB pentru login ===\n');

// Check users table structure
db.all("PRAGMA table_info(users)", (err, cols) => {
  console.log('1. Structura tabelei "users":');
  if (err) console.log('   Error:', err.message);
  else cols.forEach(c => console.log('   -', c.name, '(', c.type, ')'));
  
  // Check waiters table
  db.all("PRAGMA table_info(waiters)", (err, cols) => {
    console.log('\n2. Structura tabelei "waiters":');
    if (err) console.log('   Error:', err.message);
    else cols.forEach(c => console.log('   -', c.name, '(', c.type, ')'));
    
    // Show some waiters
    db.all("SELECT * FROM waiters LIMIT 5", (err, rows) => {
      console.log('\n3. Ospătari existenți:');
      if (err) console.log('   Error:', err.message);
      else rows.forEach(r => console.log('   -', r.name || r.username, '| id:', r.id));
      
      // Show user_roles
      db.all("SELECT * FROM user_roles", (err, rows) => {
        console.log('\n4. Roluri utilizatori:');
        if (err) console.log('   Error:', err.message);
        else rows.forEach(r => console.log('   -', JSON.stringify(r)));
        
        // Check users
        db.all("SELECT * FROM users LIMIT 5", (err, rows) => {
          console.log('\n5. Utilizatori (users):');
          if (err) console.log('   Error:', err.message);
          else rows.forEach(r => console.log('   -', JSON.stringify(r)));
          
          db.close();
        });
      });
    });
  });
});
