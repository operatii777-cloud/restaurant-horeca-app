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

// Funcție pentru hash parolă (pbkdf2)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verifică dacă utilizatorul există
db.get('SELECT id FROM kiosk_users WHERE username = ?', ['admin'], (err, row) => {
  if (err) {
    console.error('❌ Error checking user:', err);
    db.close();
    process.exit(1);
  }
  
  if (row) {
    console.log('✅ Utilizator "admin" există deja');
    db.close();
  } else {
    // Creează utilizatorul
    const passwordHash = hashPassword('admin123');
    db.run(
      'INSERT INTO kiosk_users (username, password_hash, role, full_name, is_active) VALUES (?, ?, ?, ?, ?)',
      ['admin', passwordHash, 'admin', 'Administrator', 1],
      function(err) {
        if (err) {
          console.error('❌ Error creating user:', err);
        } else {
          console.log('✅ Utilizator creat: username=admin, password=admin123');
        }
        db.close();
      }
    );
  }
});
