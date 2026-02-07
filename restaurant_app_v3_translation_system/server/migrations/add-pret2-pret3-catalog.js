/**
 * Migrare: Adăugare coloane pret2, pret3 la catalog_products și menu
 * Pentru suport Preț 2 și Preț 3 în POS
 */

const { dbPromise } = require('../database');

async function migrate() {
  const db = await dbPromise;
  console.log('🔧 Migrare pret2/pret3 la catalog_products și menu...');

  const tables = ['catalog_products', 'menu'];
  for (const table of tables) {
    try {
      const exists = await new Promise((resolve, reject) => {
        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          [table],
          (err, row) => (err ? reject(err) : resolve(!!row))
        );
      });
      if (!exists) {
        console.log(`   ⚠️ Tabela ${table} nu există, skip`);
        continue;
      }

      const columns = await new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${table})`, [], (err, rows) =>
          err ? reject(err) : resolve(rows || [])
        );
      });
      const colNames = columns.map((c) => c.name);

      for (const col of ['pret2', 'pret3']) {
        if (!colNames.includes(col)) {
          await new Promise((resolve) => {
            db.run(`ALTER TABLE ${table} ADD COLUMN ${col} REAL DEFAULT 0`, (err) => {
              if (err) console.error(`   ❌ ${table}.${col}:`, err.message);
              else console.log(`   ✅ ${table}.${col} adăugat`);
              resolve();
            });
          });
        } else {
          console.log(`   ✓ ${table}.${col} există deja`);
        }
      }
    } catch (e) {
      console.error(`   ❌ Eroare la ${table}:`, e.message);
    }
  }
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { migrate };
