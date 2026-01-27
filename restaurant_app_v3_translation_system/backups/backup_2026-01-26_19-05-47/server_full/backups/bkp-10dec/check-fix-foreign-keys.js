// Script pentru verificare și reparare foreign keys
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'restaurant.db');

console.log('🔍 Verificare și reparare Foreign Keys...\n');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Eroare la conectarea la baza de date:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectat la baza de date\n');
  
  checkAndFixForeignKeys(db);
});

function checkAndFixForeignKeys(db) {
  // 1. Verifică dacă foreign keys sunt activate
  db.get("PRAGMA foreign_keys", (err, row) => {
    if (err) {
      console.error('❌ Eroare la verificarea foreign_keys:', err);
      db.close();
      return;
    }
    
    const fkEnabled = row.foreign_keys === 1;
    console.log(`📊 Foreign Keys Status: ${fkEnabled ? '✅ ACTIVATE' : '❌ DEZACTIVATE'}\n`);
    
    if (!fkEnabled) {
      console.log('🔧 Activare foreign keys...');
      db.run("PRAGMA foreign_keys = ON", (err) => {
        if (err) {
          console.error('❌ Eroare la activarea foreign_keys:', err);
        } else {
          console.log('✅ Foreign keys activate\n');
        }
        continueCheck(db);
      });
    } else {
      continueCheck(db);
    }
  });
}

function continueCheck(db) {
  // 2. Verifică integritatea foreign keys
  console.log('🔍 Verificare integritate foreign keys...\n');
  
  db.all("PRAGMA foreign_key_check", (err, violations) => {
    if (err) {
      console.error('❌ Eroare la verificarea integrității:', err);
      db.close();
      return;
    }
    
    if (violations.length === 0) {
      console.log('✅ Nu există încălcări ale foreign keys!\n');
      checkSpecificForeignKeys(db);
      return;
    }
    
    console.log(`⚠️ Găsite ${violations.length} încălcări ale foreign keys:\n`);
    
    // Grupează după tabel
    const violationsByTable = {};
    violations.forEach(v => {
      if (!violationsByTable[v.table]) {
        violationsByTable[v.table] = [];
      }
      violationsByTable[v.table].push(v);
    });
    
    // Afișează și repara
    Object.keys(violationsByTable).forEach(table => {
      console.log(`📋 Tabel: ${table}`);
      violationsByTable[table].forEach(v => {
        console.log(`   - Row ID: ${v.rowid}, FK: ${v.fkey || 'N/A'}`);
      });
      console.log('');
    });
    
    fixViolations(db, violationsByTable);
  });
}

function fixViolations(db, violationsByTable) {
  console.log('🔧 Reparare încălcări...\n');
  
  const fixes = [];
  
  // Reparări specifice pentru fiecare tabel
  Object.keys(violationsByTable).forEach(table => {
    const violations = violationsByTable[table];
    
    violations.forEach(v => {
      if (table === 'customization_options' && v.fkey === 'menu_item_id') {
        // Șterge opțiuni pentru menu items care nu mai există
        fixes.push({
          sql: `DELETE FROM customization_options WHERE menu_item_id NOT IN (SELECT id FROM menu) AND id = ?`,
          params: [v.rowid],
          description: `Șterge customization_option ${v.rowid} (menu_item_id invalid)`
        });
      } else if (table === 'feedback' && v.fkey === 'order_id') {
        // Setează order_id la NULL pentru feedback-uri cu order_id invalid
        fixes.push({
          sql: `UPDATE feedback SET order_id = NULL WHERE order_id NOT IN (SELECT id FROM orders) AND id = ?`,
          params: [v.rowid],
          description: `Setează order_id NULL pentru feedback ${v.rowid}`
        });
      } else if (table === 'notifications' && v.fkey === 'order_id') {
        // Setează order_id la NULL pentru notificări cu order_id invalid
        fixes.push({
          sql: `UPDATE notifications SET order_id = NULL WHERE order_id NOT IN (SELECT id FROM orders) AND id = ?`,
          params: [v.rowid],
          description: `Setează order_id NULL pentru notification ${v.rowid}`
        });
      } else if (table === 'waiters' && v.fkey === 'pin_rotated_by') {
        // Setează pin_rotated_by la NULL pentru waiters cu pin_rotated_by invalid
        fixes.push({
          sql: `UPDATE waiters SET pin_rotated_by = NULL WHERE pin_rotated_by NOT IN (SELECT id FROM waiters) AND id = ?`,
          params: [v.rowid],
          description: `Setează pin_rotated_by NULL pentru waiter ${v.rowid}`
        });
      } else if (table === 'waiter_pin_audit' && v.fkey === 'waiter_id') {
        // Șterge audit entries pentru waiters care nu mai există
        fixes.push({
          sql: `DELETE FROM waiter_pin_audit WHERE waiter_id NOT IN (SELECT id FROM waiters) AND id = ?`,
          params: [v.rowid],
          description: `Șterge waiter_pin_audit ${v.rowid} (waiter_id invalid)`
        });
      } else {
        // Fix generic: setează FK la NULL dacă e posibil, altfel șterge
        console.log(`⚠️ Nu există fix specific pentru ${table}.${v.fkey || 'FK'}`);
      }
    });
  });
  
  if (fixes.length === 0) {
    console.log('ℹ️ Nu există fix-uri automate disponibile pentru aceste încălcări.\n');
    checkSpecificForeignKeys(db);
    return;
  }
  
  console.log(`🔧 Aplicare ${fixes.length} fix-uri...\n`);
  
  let fixed = 0;
  let errors = 0;
  
  fixes.forEach((fix, index) => {
    db.run(fix.sql, fix.params, function(err) {
      if (err) {
        console.error(`❌ Eroare la fix ${index + 1}: ${fix.description}`, err.message);
        errors++;
      } else {
        console.log(`✅ Fix ${index + 1}: ${fix.description}`);
        fixed++;
      }
      
      if (fixed + errors === fixes.length) {
        console.log(`\n📊 Rezultat: ${fixed} fix-uri aplicate, ${errors} erori\n`);
        // Verifică din nou
        db.all("PRAGMA foreign_key_check", (err, violations) => {
          if (err) {
            console.error('❌ Eroare la re-verificare:', err);
          } else if (violations.length === 0) {
            console.log('✅ Toate foreign keys sunt acum valide!\n');
          } else {
            console.log(`⚠️ Rămân ${violations.length} încălcări nereparate\n`);
          }
          checkSpecificForeignKeys(db);
        });
      }
    });
  });
}

function checkSpecificForeignKeys(db) {
  console.log('🔍 Verificare detaliată foreign keys specifice...\n');
  
  const checks = [
    {
      name: 'customization_options -> menu',
      sql: `SELECT COUNT(*) as count FROM customization_options WHERE menu_item_id IS NOT NULL AND menu_item_id NOT IN (SELECT id FROM menu)`,
      fix: `DELETE FROM customization_options WHERE menu_item_id IS NOT NULL AND menu_item_id NOT IN (SELECT id FROM menu)`
    },
    {
      name: 'feedback -> orders',
      sql: `SELECT COUNT(*) as count FROM feedback WHERE order_id IS NOT NULL AND order_id NOT IN (SELECT id FROM orders)`,
      fix: `UPDATE feedback SET order_id = NULL WHERE order_id IS NOT NULL AND order_id NOT IN (SELECT id FROM orders)`
    },
    {
      name: 'notifications -> orders',
      sql: `SELECT COUNT(*) as count FROM notifications WHERE order_id IS NOT NULL AND order_id NOT IN (SELECT id FROM orders)`,
      fix: `UPDATE notifications SET order_id = NULL WHERE order_id IS NOT NULL AND order_id NOT IN (SELECT id FROM orders)`
    },
    {
      name: 'waiters -> waiters (pin_rotated_by)',
      sql: `SELECT COUNT(*) as count FROM waiters WHERE pin_rotated_by IS NOT NULL AND pin_rotated_by NOT IN (SELECT id FROM waiters)`,
      fix: `UPDATE waiters SET pin_rotated_by = NULL WHERE pin_rotated_by IS NOT NULL AND pin_rotated_by NOT IN (SELECT id FROM waiters)`
    },
    {
      name: 'waiter_pin_audit -> waiters',
      sql: `SELECT COUNT(*) as count FROM waiter_pin_audit WHERE waiter_id NOT IN (SELECT id FROM waiters)`,
      fix: `DELETE FROM waiter_pin_audit WHERE waiter_id NOT IN (SELECT id FROM waiters)`
    },
    {
      name: 'points_history -> orders',
      sql: `SELECT COUNT(*) as count FROM points_history WHERE order_id IS NOT NULL AND order_id NOT IN (SELECT id FROM orders)`,
      fix: `UPDATE points_history SET order_id = NULL WHERE order_id IS NOT NULL AND order_id NOT IN (SELECT id FROM orders)`
    },
    {
      name: 'menu_pdf_products -> menu',
      sql: `SELECT COUNT(*) as count FROM menu_pdf_products WHERE product_id NOT IN (SELECT id FROM menu)`,
      fix: `DELETE FROM menu_pdf_products WHERE product_id NOT IN (SELECT id FROM menu)`
    }
  ];
  
  let completed = 0;
  let totalIssues = 0;
  
  checks.forEach(check => {
    db.get(check.sql, (err, row) => {
      if (err) {
        console.error(`❌ Eroare la verificarea ${check.name}:`, err.message);
      } else {
        const count = row.count;
        if (count > 0) {
          console.log(`⚠️ ${check.name}: ${count} încălcări găsite`);
          totalIssues += count;
          
          // Aplică fix
          db.run(check.fix, function(fixErr) {
            if (fixErr) {
              console.error(`   ❌ Eroare la reparare:`, fixErr.message);
            } else {
              console.log(`   ✅ Reparat: ${this.changes} înregistrări`);
            }
          });
        } else {
          console.log(`✅ ${check.name}: OK`);
        }
      }
      
      completed++;
      if (completed === checks.length) {
        console.log(`\n📊 Verificare completă: ${totalIssues} probleme găsite și reparate\n`);
        
        // Verificare finală
        db.all("PRAGMA foreign_key_check", (err, violations) => {
          if (err) {
            console.error('❌ Eroare la verificarea finală:', err);
          } else if (violations.length === 0) {
            console.log('✅✅✅ TOATE FOREIGN KEYS SUNT VALIDE! ✅✅✅\n');
          } else {
            console.log(`⚠️ Rămân ${violations.length} încălcări:\n`);
            violations.forEach(v => {
              console.log(`   - ${v.table}.${v.fkey || 'FK'} (rowid: ${v.rowid})`);
            });
          }
          
          // Verifică dacă foreign keys sunt activate
          db.get("PRAGMA foreign_keys", (err, row) => {
            if (!err && row.foreign_keys === 1) {
              console.log('\n✅ Foreign keys sunt activate și funcționale!\n');
            }
            db.close();
            process.exit(0);
          });
        });
      }
    });
  });
}

