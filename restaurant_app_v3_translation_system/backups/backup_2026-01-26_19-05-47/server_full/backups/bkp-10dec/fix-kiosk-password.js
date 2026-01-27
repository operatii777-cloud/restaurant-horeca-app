/**
 * Script pentru actualizarea parolei admin în kiosk_users
 * Schimbă parola de la "admin.5555" la "admin5555"
 */

const { dbPromise } = require('./database');
const crypto = require('crypto');

async function fixPassword() {
  try {
    const db = await dbPromise;
    
    // Generează hash pentru "admin5555"
    const password = 'admin5555';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const password_hash = `${salt}:${hash}`;
    
    // Actualizează parola pentru utilizatorul admin
    db.run(
      'UPDATE kiosk_users SET password_hash = ? WHERE username = ?',
      [password_hash, 'admin'],
      function(err) {
        if (err) {
          console.error('❌ Eroare la actualizarea parolei:', err);
          process.exit(1);
        } else {
          console.log('✅ Parola actualizată cu succes pentru utilizatorul "admin"');
          console.log('   Username: admin');
          console.log('   Password: admin5555');
          process.exit(0);
        }
      }
    );
  } catch (error) {
    console.error('❌ Eroare:', error);
    process.exit(1);
  }
}

fixPassword();

