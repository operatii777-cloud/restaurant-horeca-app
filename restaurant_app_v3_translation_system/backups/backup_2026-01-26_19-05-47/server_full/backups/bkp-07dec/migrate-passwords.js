/**
 * 🔒 SCRIPT DE MIGRARE PAROLE - BCRYPT
 * 
 * Acest script migrează toate parolele existente din plain text
 * sau hash-uri vechi către bcrypt (salt rounds: 10)
 * 
 * ⚠️ IMPORTANT: Rulează acest script O SINGURĂ DATĂ după ce ai aplicat fix-urile!
 * 
 * Usage:
 *   cd server
 *   node migrate-passwords.js
 */

const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Calea către baza de date
const dbPath = path.join(__dirname, 'restaurant.db');

console.log('🔒 MIGRARE PAROLE - BCRYPT');
console.log('==========================\n');
console.log(`📁 Baza de date: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Eroare la deschiderea bazei de date:', err.message);
    process.exit(1);
  }
  console.log('✅ Baza de date deschisă cu succes\n');
});

async function migratePasswords() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, username, password_hash FROM users', async (err, users) => {
      if (err) {
        console.error('❌ Eroare la citirea utilizatorilor:', err.message);
        reject(err);
        return;
      }

      if (users.length === 0) {
        console.log('ℹ️ Nu există utilizatori în baza de date.\n');
        resolve();
        return;
      }

      console.log(`📋 Găsite ${users.length} utilizatori\n`);

      let migrated = 0;
      let alreadyHashed = 0;
      let errors = 0;

      for (const user of users) {
        try {
          // Verifică dacă parola e deja bcrypt (începe cu $2a$, $2b$, sau $2y$)
          if (
            user.password_hash &&
            (user.password_hash.startsWith('$2a$') ||
             user.password_hash.startsWith('$2b$') ||
             user.password_hash.startsWith('$2y$'))
          ) {
            console.log(`✅ User ${user.id} (${user.username}) - parolă deja hash-uită cu bcrypt`);
            alreadyHashed++;
            continue;
          }

          // Verifică dacă parola e goală
          if (!user.password_hash || user.password_hash.trim() === '') {
            console.log(`⚠️ User ${user.id} (${user.username}) - parolă goală, se va seta o parolă default`);
            // Setează o parolă default (trebuie schimbată ulterior)
            const defaultPassword = 'ChangeMe123!';
            const hashed = await bcrypt.hash(defaultPassword, 10);
            
            await new Promise((res, rej) => {
              db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, user.id], (err) => {
                if (err) {
                  console.error(`❌ Eroare pentru user ${user.id}:`, err.message);
                  errors++;
                  rej(err);
                } else {
                  console.log(`✅ User ${user.id} (${user.username}) - parolă default setată (ChangeMe123!)`);
                  migrated++;
                  res();
                }
              });
            });
            continue;
          }

          // Hash-uiește parola plain text sau hash vechi
          console.log(`🔄 Migrare user ${user.id} (${user.username})...`);
          const hashed = await bcrypt.hash(user.password_hash, 10);

          await new Promise((res, rej) => {
            db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, user.id], (err) => {
              if (err) {
                console.error(`❌ Eroare pentru user ${user.id}:`, err.message);
                errors++;
                rej(err);
              } else {
                console.log(`✅ User ${user.id} (${user.username}) - parolă migrată cu succes`);
                migrated++;
                res();
              }
            });
          });
        } catch (error) {
          console.error(`❌ Eroare la procesarea user ${user.id}:`, error.message);
          errors++;
        }
      }

      console.log('\n==========================');
      console.log('📊 REZUMAT MIGRARE:');
      console.log(`   ✅ Migrate: ${migrated}`);
      console.log(`   ℹ️  Deja hash-uite: ${alreadyHashed}`);
      console.log(`   ❌ Erori: ${errors}`);
      console.log('==========================\n');

      if (errors === 0) {
        console.log('🎉 Migrare completă cu succes!\n');
        resolve();
      } else {
        reject(new Error(`Migrare completă cu ${errors} erori`));
      }
    });
  });
}

// Rulează migrarea
migratePasswords()
  .then(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ Eroare la închiderea bazei de date:', err.message);
        process.exit(1);
      }
      console.log('✅ Baza de date închisă\n');
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('❌ Eroare migrare:', err.message);
    db.close((err) => {
      if (err) {
        console.error('❌ Eroare la închiderea bazei de date:', err.message);
      }
      process.exit(1);
    });
  });

