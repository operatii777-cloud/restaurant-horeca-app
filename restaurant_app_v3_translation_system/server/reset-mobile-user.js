const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');
const dbPath = path.join(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Funcție pentru hash parolă (pbkdf2) - aceeași ca în auth routes
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verifică utilizatorii existenți
db.all('SELECT id, username, role, is_active FROM kiosk_users', [], (err, rows) => {
  if (err) {
    console.error('❌ Error querying users:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('\n📋 Utilizatori existenți:');
  if (rows.length === 0) {
    console.log('  (niciun utilizator)');
  } else {
    rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Active: ${user.is_active}`);
    });
  }
  
  // Resetăm parola pentru utilizatorul 'admin' sau creăm unul nou
  const username = 'admin';
  const password = 'admin123'; // Parolă simplă pentru testare
  
  db.get('SELECT id FROM kiosk_users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('❌ Error checking user:', err);
      db.close();
      process.exit(1);
    }
    
    if (row) {
      // Update parola existentă
      const passwordHash = hashPassword(password);
      db.run(
        'UPDATE kiosk_users SET password_hash = ?, is_active = 1 WHERE username = ?',
        [passwordHash, username],
        function(err) {
          if (err) {
            console.error('❌ Error updating password:', err);
          } else {
            console.log(`\n✅ Parola resetată pentru utilizator: ${username}`);
            console.log(`   Username: ${username}`);
            console.log(`   Password: ${password}`);
          }
          db.close();
        }
      );
    } else {
      // Creează utilizator nou
      const passwordHash = hashPassword(password);
      db.run(
        'INSERT INTO kiosk_users (username, password_hash, role, full_name, is_active) VALUES (?, ?, ?, ?, ?)',
        [username, passwordHash, 'admin', 'Administrator', 1],
        function(err) {
          if (err) {
            console.error('❌ Error creating user:', err);
          } else {
            console.log(`\n✅ Utilizator creat: ${username}`);
            console.log(`   Username: ${username}`);
            console.log(`   Password: ${password}`);
          }
          db.close();
        }
      );
    }
  });
});
