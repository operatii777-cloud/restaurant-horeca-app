/**
 * 🔍 Verifică utilizatorii din baza de date
 */

const { dbPromise, getUserByUsername } = require('./database');
const bcrypt = require('bcrypt');

async function checkUsers() {
  try {
    const db = await dbPromise;
    
    // Verifică utilizatori din tabela users
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, username, email, role_id FROM users LIMIT 10', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    console.log('\n📋 Utilizatori din tabela users:');
    if (users.length === 0) {
      console.log('  ⚠️ Nu există utilizatori în tabela users');
      console.log('\n💡 Trebuie să creezi un utilizator admin în tabela users');
    } else {
      users.forEach(u => {
        console.log(`  - ${u.username} (ID: ${u.id}, Email: ${u.email || 'N/A'}, Role ID: ${u.role_id})`);
      });
    }
    
    // Verifică utilizatori din tabela kiosk_users
    const kioskUsers = await new Promise((resolve, reject) => {
      db.all('SELECT id, username, role FROM kiosk_users LIMIT 10', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    console.log('\n📋 Utilizatori din tabela kiosk_users:');
    if (kioskUsers.length === 0) {
      console.log('  ⚠️ Nu există utilizatori în tabela kiosk_users');
    } else {
      kioskUsers.forEach(u => {
        console.log(`  - ${u.username} (ID: ${u.id}, Role: ${u.role})`);
      });
    }
    
    // Testează login cu getUserByUsername
    console.log('\n🔍 Testare getUserByUsername("admin"):');
    try {
      const adminUser = await getUserByUsername('admin');
      if (adminUser) {
        console.log(`  ✅ Utilizator găsit: ${adminUser.username} (ID: ${adminUser.id})`);
        
        // Testează parola
        const testPasswords = ['admin', 'admin123', 'admin5555', 'admin.5555', 'password'];
        console.log('\n🔐 Testare parole:');
        for (const pwd of testPasswords) {
          try {
            const match = await bcrypt.compare(pwd, adminUser.password_hash);
            if (match) {
              console.log(`  ✅ Parola corectă: "${pwd}"`);
              break;
            } else {
              console.log(`  ❌ "${pwd}" - nu se potrivește`);
            }
          } catch (e) {
            console.log(`  ⚠️ Eroare la testarea parolei "${pwd}": ${e.message}`);
          }
        }
      } else {
        console.log('  ❌ Utilizator "admin" nu există în tabela users');
      }
    } catch (e) {
      console.error('  ❌ Eroare:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Eroare:', error);
  }
}

checkUsers();

