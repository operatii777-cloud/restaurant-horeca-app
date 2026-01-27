// server/migrations/fix-recipe-recalculation-queue-status.js
/**
 * Migrare: Fix pentru coloana status în recipe_recalculation_queue
 * 
 * Rezolvă eroarea "no such column: status" prin:
 * 1. Ștergerea trigger-urilor vechi
 * 2. Adăugarea coloanei status dacă nu există
 * 3. Recrearea trigger-urilor cu status inclus
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'restaurant.db');

function runMigration() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Eroare la conectarea la DB:', err.message);
        return reject(err);
      }

      console.log('✅ Conectat la DB pentru migrare...');

      db.serialize(() => {
        // Pas 1: Șterge trigger-urile vechi
        console.log('\n📋 Pas 1: Ștergere trigger-uri vechi...');
        db.run(`DROP TRIGGER IF EXISTS recalculate_recipe_costs_on_ingredient_update`, (err) => {
          if (err) {
            console.error('⚠️ Eroare la ștergerea trigger-ului 1:', err.message);
          } else {
            console.log('✅ Trigger recalculate_recipe_costs_on_ingredient_update șters');
          }
        });

        db.run(`DROP TRIGGER IF EXISTS recalculate_recipe_costs_on_subrecipe_update`, (err) => {
          if (err) {
            console.error('⚠️ Eroare la ștergerea trigger-ului 2:', err.message);
          } else {
            console.log('✅ Trigger recalculate_recipe_costs_on_subrecipe_update șters');
          }
        });

        // Pas 2: Verifică dacă tabela există
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='recipe_recalculation_queue'`, (err, row) => {
          if (err) {
            console.error('❌ Eroare la verificarea tabelei:', err.message);
            db.close();
            return reject(err);
          }

          if (!row) {
            console.log('⚠️ Tabela recipe_recalculation_queue nu există, va fi creată la următoarea inițializare');
            db.close();
            return resolve();
          }

          // Pas 3: Verifică dacă coloana status există
          db.all(`PRAGMA table_info(recipe_recalculation_queue)`, (err, columns) => {
            if (err) {
              console.error('❌ Eroare la verificarea coloanelor:', err.message);
              db.close();
              return reject(err);
            }

            const hasStatus = columns.some(col => col.name === 'status');
            
            if (!hasStatus) {
              console.log('\n📋 Pas 2: Adăugare coloană status...');
              db.run(`ALTER TABLE recipe_recalculation_queue ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {
                if (err && !err.message.includes('duplicate column')) {
                  console.error('❌ Eroare la adăugarea coloanei status:', err.message);
                  db.close();
                  return reject(err);
                } else if (!err) {
                  console.log('✅ Coloană status adăugată');
                } else {
                  console.log('ℹ️ Coloana status există deja');
                }

                // Pas 3: Recrează trigger-urile
                recreateTriggers(db, resolve, reject);
              });
            } else {
              console.log('✅ Coloana status există deja');
              // Pas 3: Recrează trigger-urile
              recreateTriggers(db, resolve, reject);
            }
          });
        });
      });
    });
  });
}

function recreateTriggers(db, resolve, reject) {
  console.log('\n📋 Pas 3: Recreare trigger-uri...');

  // Trigger 1: recalculate_recipe_costs_on_ingredient_update
  db.run(`
    CREATE TRIGGER IF NOT EXISTS recalculate_recipe_costs_on_ingredient_update
    AFTER UPDATE OF cost_per_unit ON ingredients
    BEGIN
      -- Găsește toate produsele care folosesc acest ingredient
      INSERT INTO recipe_recalculation_queue (product_id, reason, status, created_at)
      SELECT DISTINCT r.product_id, 'ingredient_cost_changed', 'pending', datetime('now')
      FROM recipes r
      WHERE r.ingredient_id = NEW.id
        AND NOT EXISTS (
          SELECT 1 FROM recipe_recalculation_queue q
          WHERE q.product_id = r.product_id 
            AND q.status = 'pending'
        );
    END;
  `, (err) => {
    if (err && !err.message.includes('duplicate') && !err.message.includes('no such column')) {
      console.error('❌ Eroare la crearea trigger-ului 1:', err.message);
      db.close();
      return reject(err);
    } else if (!err) {
      console.log('✅ Trigger recalculate_recipe_costs_on_ingredient_update recreat');
    }

    // Trigger 2: recalculate_recipe_costs_on_subrecipe_update
    db.run(`
      CREATE TRIGGER IF NOT EXISTS recalculate_recipe_costs_on_subrecipe_update
      AFTER UPDATE OF cost_price ON menu
      WHEN NEW.cost_price IS NOT NULL
      BEGIN
        -- Găsește toate produsele care folosesc acest produs ca sub-rețetă
        INSERT INTO recipe_recalculation_queue (product_id, reason, status, created_at)
        SELECT DISTINCT r.product_id, 'sub_recipe_cost_changed', 'pending', datetime('now')
        FROM recipes r
        WHERE r.recipe_id = NEW.id
          AND NOT EXISTS (
            SELECT 1 FROM recipe_recalculation_queue q
            WHERE q.product_id = r.product_id 
              AND q.status = 'pending'
          );
      END;
    `, (err) => {
      if (err && !err.message.includes('duplicate') && !err.message.includes('no such column')) {
        console.error('❌ Eroare la crearea trigger-ului 2:', err.message);
        db.close();
        return reject(err);
      } else if (!err) {
        console.log('✅ Trigger recalculate_recipe_costs_on_subrecipe_update recreat');
      }

      // Pas 4: Verificare finală
      console.log('\n📋 Pas 4: Verificare finală...');
      db.get(`SELECT name FROM sqlite_master WHERE type='trigger' AND name='recalculate_recipe_costs_on_ingredient_update'`, (err, row) => {
        if (err) {
          console.error('⚠️ Eroare la verificarea trigger-ului:', err.message);
        } else if (row) {
          console.log('✅ Trigger-urile au fost recreate cu succes');
        }

        db.close((err) => {
          if (err) {
            console.error('⚠️ Eroare la închiderea DB:', err.message);
          } else {
            console.log('\n✅ Migrare finalizată cu succes!');
          }
          resolve();
        });
      });
    });
  });
}

// Rulează migrarea
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🎉 Migrare completă! Eroarea "no such column: status" a fost rezolvată.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Eroare la migrare:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };

