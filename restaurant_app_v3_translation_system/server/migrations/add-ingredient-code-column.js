/**
 * Migration: Add 'code' column to ingredients table
 * Generează automat coduri pentru toate ingredientele existente
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function runMigration() {
    const dbPath = path.join(__dirname, '..', 'restaurant.db');
    const db = new sqlite3.Database(dbPath);

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 1. Verifică dacă coloana 'code' există deja
            db.all(`PRAGMA table_info(ingredients)`, (err, columns) => {
                if (err) {
                    console.error('❌ Eroare la verificarea schemei ingredients:', err);
                    return reject(err);
                }

                const hasCodeColumn = columns.some(col => col.name === 'code');

                if (hasCodeColumn) {
                    console.log('✅ Coloana "code" există deja în tabelul ingredients');

                    // Generează coduri pentru ingredientele care nu au cod
                    db.all(`SELECT id, name FROM ingredients WHERE code IS NULL OR code = ''`, (err, rows) => {
                        if (err) {
                            console.error('❌ Eroare la citirea ingredientelor fără cod:', err);
                            return reject(err);
                        }

                        if (rows.length === 0) {
                            console.log('✅ Toate ingredientele au deja coduri');
                            db.close();
                            return resolve();
                        }

                        console.log(`📝 Generare coduri pentru ${rows.length} ingrediente...`);

                        let processed = 0;
                        rows.forEach((row, index) => {
                            const code = `ING-${String(row.id).padStart(5, '0')}`;

                            db.run(`UPDATE ingredients SET code = ? WHERE id = ?`, [code, row.id], (err) => {
                                if (err) {
                                    console.error(`❌ Eroare la actualizarea codului pentru ${row.name}:`, err);
                                } else {
                                    console.log(`  ✓ ${row.name} → ${code}`);
                                }

                                processed++;
                                if (processed === rows.length) {
                                    console.log(`✅ ${processed} coduri generate cu succes!`);
                                    db.close();
                                    resolve();
                                }
                            });
                        });
                    });
                } else {
                    console.log('📝 Adăugare coloană "code" în tabelul ingredients...');

                    // 2. Adaugă coloana 'code'
                    db.run(`ALTER TABLE ingredients ADD COLUMN code TEXT`, (err) => {
                        if (err) {
                            console.error('❌ Eroare la adăugarea coloanei code:', err);
                            return reject(err);
                        }

                        console.log('✅ Coloana "code" adăugată cu succes');

                        // 3. Generează coduri pentru toate ingredientele existente
                        db.all(`SELECT id, name FROM ingredients`, (err, rows) => {
                            if (err) {
                                console.error('❌ Eroare la citirea ingredientelor:', err);
                                return reject(err);
                            }

                            if (rows.length === 0) {
                                console.log('ℹ️ Nu există ingrediente în baza de date');
                                db.close();
                                return resolve();
                            }

                            console.log(`📝 Generare coduri pentru ${rows.length} ingrediente...`);

                            let processed = 0;
                            rows.forEach((row) => {
                                const code = `ING-${String(row.id).padStart(5, '0')}`;

                                db.run(`UPDATE ingredients SET code = ? WHERE id = ?`, [code, row.id], (err) => {
                                    if (err) {
                                        console.error(`❌ Eroare la actualizarea codului pentru ${row.name}:`, err);
                                    } else {
                                        console.log(`  ✓ ${row.name} → ${code}`);
                                    }

                                    processed++;
                                    if (processed === rows.length) {
                                        console.log(`✅ ${processed} coduri generate cu succes!`);

                                        // 4. Creează index pentru coloana code
                                        db.run(`CREATE INDEX IF NOT EXISTS idx_ingredients_code ON ingredients(code)`, (err) => {
                                            if (err) {
                                                console.warn('⚠️ Eroare la crearea indexului pentru code:', err);
                                            } else {
                                                console.log('✅ Index creat pentru coloana code');
                                            }
                                            db.close();
                                            resolve();
                                        });
                                    }
                                });
                            });
                        });
                    });
                }
            });
        });
    });
}

// Rulează migrația dacă scriptul este executat direct
if (require.main === module) {
    console.log('🚀 Pornire migrație: Add ingredient code column\n');
    runMigration()
        .then(() => {
            console.log('\n✅ Migrație finalizată cu succes!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migrație eșuată:', error);
            process.exit(1);
        });
}

module.exports = { runMigration };
