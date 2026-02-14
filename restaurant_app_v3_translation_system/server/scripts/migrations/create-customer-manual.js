// Script pentru crearea manuală a unui client în baza de date
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Eroare la conectarea la baza de date:', err);
    process.exit(1);
  }
  
  console.log('✅ Conectat la baza de date');
  
  // Verifică dacă coloana password_hash există
  db.all("PRAGMA table_info(customers)", [], (err, cols) => {
    if (err) {
      console.error('❌ Eroare la verificarea tabelei:', err);
      db.close();
      process.exit(1);
    }
    
    const hasPasswordHash = cols.some(col => col.name === 'password_hash');
    
    if (!hasPasswordHash) {
      console.log('⚠️ Coloana password_hash nu există, adăugăm...');
      db.run('ALTER TABLE customers ADD COLUMN password_hash TEXT', (alterErr) => {
        if (alterErr && !alterErr.message.includes('duplicate column')) {
          console.error('❌ Eroare la adăugarea coloanei:', alterErr);
          db.close();
          process.exit(1);
        }
        console.log('✅ Coloana password_hash adăugată');
        _createCustomer();
      });
    } else {
      console.log('✅ Coloana password_hash există');
      _createCustomer();
    }
    
    function _createCustomer() {
      const email = 'operatii.777@gmail.com';
      const password = 'test123';
      const name = 'Operatii Test';
      
      // Hash parola
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      const passwordHash = `${salt}:${hash}`;
      
      // Verifică dacă clientul există deja
      db.get('SELECT id FROM customers WHERE customer_email = ?', [email], (err, existing) => {
        if (err) {
          console.error('❌ Eroare la verificarea clientului:', err);
          db.close();
          process.exit(1);
        }
        
        if (existing) {
          console.log(`⚠️ Clientul cu email ${email} există deja (ID: ${existing.id}). Actualizăm parola...`);
          
          // Actualizează parola
          db.run(
            'UPDATE customers SET password_hash = ?, customer_name = ?, is_active = 1 WHERE customer_email = ?',
            [passwordHash, name, email],
            function(updateErr) {
              if (updateErr) {
                console.error('❌ Eroare la actualizarea clientului:', updateErr);
                db.close();
                process.exit(1);
              }
              console.log(`✅ Client actualizat cu succes (ID: ${existing.id})`);
              console.log(`   Email: ${email}`);
              console.log(`   Parolă: ${password}`);
              console.log(`   Hash: ${passwordHash.substring(0, 50)}...`);
              db.close();
              process.exit(0);
            }
          );
        } else {
          // Creează client nou
          db.run(
            `INSERT INTO customers (customer_name, customer_email, password_hash, is_active, created_at, updated_at)
             VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [name, email, passwordHash],
            function(insertErr) {
              if (insertErr) {
                console.error('❌ Eroare la crearea clientului:', insertErr);
                db.close();
                process.exit(1);
              }
              
              console.log(`✅ Client creat cu succes (ID: ${this.lastID})`);
              console.log(`   Email: ${email}`);
              console.log(`   Parolă: ${password}`);
              console.log(`   Hash: ${passwordHash.substring(0, 50)}...`);
              db.close();
              process.exit(0);
            }
          );
        }
      });
    }
  });
});
