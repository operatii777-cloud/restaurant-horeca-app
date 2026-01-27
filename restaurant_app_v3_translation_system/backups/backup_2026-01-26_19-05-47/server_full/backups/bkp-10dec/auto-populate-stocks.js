/**
 * AUTO-POPULATE STOCKS - Recreare modul
 * 
 * Populează automat tabelul `ingredients` cu ingrediente din rețete
 * care nu au fost adăugate încă în sistemul de stocuri
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Populează automat stocurile bazate pe ingredientele din rețete
 * @returns {Promise<{added: number, updated: number, message: string}>}
 */
async function autoPopulateStocks() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./restaurant.db', (err) => {
            if (err) {
                console.error('❌ Eroare conectare DB:', err.message);
                reject(err);
                return;
            }
        });

        let added = 0;
        let updated = 0;

        // Obține toate ingredientele unice din rețete
        const query = `
            SELECT DISTINCT 
                r.ingredient_id,
                i.name as ingredient_name,
                i.unit,
                i.category,
                i.current_stock,
                i.min_stock
            FROM recipes r
            LEFT JOIN ingredients i ON r.ingredient_id = i.id
            WHERE r.ingredient_id IS NOT NULL
            ORDER BY i.name
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Eroare la citirea rețetelor:', err.message);
                db.close();
                reject(err);
                return;
            }

            console.log(`📋 Găsite ${rows.length} ingrediente în rețete`);

            if (rows.length === 0) {
                db.close();
                resolve({
                    added: 0,
                    updated: 0,
                    message: 'Niciun ingredient găsit în rețete'
                });
                return;
            }

            // Verifică care ingrediente există și care lipsesc
            let processed = 0;

            rows.forEach((row) => {
                // Dacă ingredientul există (are nume), verifică dacă stocul e setat
                if (row.ingredient_name) {
                    // Ingredient existent - verifică dacă are stoc setat
                    if (row.current_stock === null || row.current_stock === undefined) {
                        // Setează stoc implicit
                        db.run(
                            'UPDATE ingredients SET current_stock = 0, min_stock = 0 WHERE id = ?',
                            [row.ingredient_id],
                            function(updateErr) {
                                if (updateErr) {
                                    console.error(`❌ Eroare update ingredient ${row.ingredient_id}:`, updateErr.message);
                                } else if (this.changes > 0) {
                                    updated++;
                                    console.log(`✅ Actualizat stoc pentru: ${row.ingredient_name}`);
                                }
                                
                                processed++;
                                checkComplete();
                            }
                        );
                    } else {
                        // Ingredient OK
                        processed++;
                        checkComplete();
                    }
                } else {
                    // Ingredient lipsă - ar trebui să existe deja din recipes
                    console.log(`⚠️ Ingredient ID ${row.ingredient_id} referit în rețete dar lipsă din baza de date`);
                    processed++;
                    checkComplete();
                }
            });

            function checkComplete() {
                if (processed === rows.length) {
                    db.close();
                    
                    const message = added > 0 || updated > 0
                        ? `Stocuri populate: ${added} adăugate, ${updated} actualizate`
                        : 'Toate stocurile sunt deja configurate';
                    
                    console.log(`✅ ${message}`);
                    
                    resolve({
                        added,
                        updated,
                        message
                    });
                }
            }
        });
    });
}

/**
 * Verifică și actualizează stocurile din baza de date
 * @returns {Promise<{added: number, updated: number, message: string}>}
 */
async function checkAndUpdateStocks() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./restaurant.db', (err) => {
            if (err) {
                console.error('❌ Eroare conectare DB:', err.message);
                reject(err);
                return;
            }
        });

        let updated = 0;

        // Verifică ingrediente care au stocuri NULL sau nedefinite
        const query = `
            SELECT id, name, current_stock, min_stock
            FROM ingredients
            WHERE current_stock IS NULL OR min_stock IS NULL
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Eroare la verificarea stocurilor:', err.message);
                db.close();
                reject(err);
                return;
            }

            if (rows.length === 0) {
                db.close();
                resolve({
                    added: 0,
                    updated: 0,
                    message: 'Toate stocurile sunt configurate corect'
                });
                return;
            }

            console.log(`📋 Găsite ${rows.length} ingrediente cu stocuri nedefinite`);

            let processed = 0;

            rows.forEach((row) => {
                db.run(
                    `UPDATE ingredients 
                     SET current_stock = COALESCE(current_stock, 0),
                         min_stock = COALESCE(min_stock, 0)
                     WHERE id = ?`,
                    [row.id],
                    function(updateErr) {
                        if (updateErr) {
                            console.error(`❌ Eroare update ${row.name}:`, updateErr.message);
                        } else if (this.changes > 0) {
                            updated++;
                            console.log(`✅ Actualizat: ${row.name}`);
                        }

                        processed++;
                        
                        if (processed === rows.length) {
                            db.close();
                            resolve({
                                added: 0,
                                updated,
                                message: `Verificare completă: ${updated} stocuri actualizate`
                            });
                        }
                    }
                );
            });
        });
    });
}

module.exports = {
    autoPopulateStocks,
    checkAndUpdateStocks
};

