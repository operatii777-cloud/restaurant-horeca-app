/**
 * ETAPA 3: INVENTORY MULTI-GESTIUNE HELPERS
 * =========================================
 * 
 * Funcții pentru gestionarea inventarului pe multiple gestiuni:
 * - Creare sesiuni inventar cu selecție gestiuni
 * - Obținere detalii inventar per gestiune
 * - Actualizare numărători per gestiune
 * - Finalizare inventar cu ajustări per gestiune
 * 
 * @created 29 Octombrie 2025
 * @version 1.0.1 - Fixed: Wrapped SQLite callbacks in Promises
 */

const { dbPromise } = require('../database');

// Helper: Categorii pentru inventarul zilnic (Perisabile + Bar)
const DAILY_INVENTORY_CATEGORIES = [
    'Vegetables', 'Fruits', 'Fruits & Vegetables', 'Meat', 'Seafood',
    'Dairy', 'Bakery', 'Beverages', 'Alcoholic Beverages', 'Sauces and Condiments', 'Oils and Fats'
];

/**
 * Creează o sesiune de inventar cu suport multi-gestiune
 * @param {string} sessionType - 'daily' sau 'monthly'
 * @param {string} startedBy - Numele utilizatorului
 * @param {Array<number>|null} locationIds - IDs gestiuni sau null pentru toate
 * @returns {Promise<{success: boolean, sessionId?: string, error?: string}>}
 */
async function createInventorySession(sessionType, startedBy, locationIds = null) {
    const db = await dbPromise;
    const sessionId = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
        // Determină scope-ul inventarului
        let scope = 'global';
        if (locationIds && locationIds.length > 0) {
            scope = locationIds.length === 1 ? 'single' : 'multiple';
        }

        // Pregătește selected_locations (JSON sau NULL)
        const selectedLocationsJson = locationIds ? JSON.stringify(locationIds) : null;

        // Dacă nu sunt specificate gestiuni, obține toate gestiunile active
        let finalLocationIds = locationIds;
        if (!locationIds) {
            const allLocations = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT id FROM management_locations 
                    WHERE is_active = 1 
                    ORDER BY id
                `, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            finalLocationIds = allLocations.map(loc => loc.id);
        }

        // Numără ingredientele active pentru fiecare gestiune
        let totalItems = 0;
        for (const locationId of finalLocationIds) {
            let countQuery = `
                SELECT COUNT(DISTINCT i.id) as count
                FROM ingredients i
                WHERE i.is_available = 1 
                    AND i.location_id = ?
            `;
            const params = [locationId];

            if (sessionType === 'daily') {
                const placeholders = DAILY_INVENTORY_CATEGORIES.map(() => '?').join(',');
                countQuery += ` AND (i.category_en IN (${placeholders}) OR i.category IN (${placeholders}))`;
                DAILY_INVENTORY_CATEGORIES.forEach(c => params.push(c));
                DAILY_INVENTORY_CATEGORIES.forEach(c => params.push(c));
            }

            const countResult = await new Promise((resolve, reject) => {
                db.get(countQuery, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            totalItems += countResult.count || 0;
        }

        console.log(`📋 [Inventory] Creare sesiune: ${sessionId}`);
        console.log(`   Tip: ${sessionType}, Scope: ${scope}`);
        console.log(`   Gestiuni: ${finalLocationIds.join(', ')}`);
        console.log(`   Total ingrediente: ${totalItems}`);

        // Creează sesiunea
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO inventory_sessions (
                    id, session_type, scope, selected_locations,
                    status, started_at, started_by, total_items, items_counted,
                    total_difference_value, created_at
                ) VALUES (?, ?, ?, ?, 'in_progress', datetime('now', 'localtime'), ?, ?, 0, 0, datetime('now', 'localtime'))
            `, [sessionId, sessionType, scope, selectedLocationsJson, startedBy, totalItems], function (err) {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`✅ [Inventory] Sesiune ${sessionId} creată cu succes`);

        return {
            success: true,
            sessionId,
            scope,
            totalItems,
            locationIds: finalLocationIds
        };

    } catch (error) {
        console.error(`❌ [Inventory] Eroare la creare sesiune:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Obține detaliile inventarului per gestiune
 * @param {string} sessionId - ID sesiune inventar
 * @returns {Promise<{success: boolean, session?: object, items?: Array, error?: string}>}
 */
async function getInventoryDetails(sessionId) {
    const db = await dbPromise;

    try {
        // Obține sesiunea
        const session = await new Promise((resolve, reject) => {
            db.get(`
                SELECT * FROM inventory_sessions WHERE id = ?
            `, [sessionId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!session) {
            return {
                success: false,
                error: 'Sesiunea nu există'
            };
        }

        // Parse gestiuni selectate
        let locationIds = [];
        if (session.selected_locations) {
            locationIds = JSON.parse(session.selected_locations);
        } else {
            // Dacă nu sunt specificate, obține toate gestiunile active
            const allLocations = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT id FROM management_locations 
                    WHERE is_active = 1 
                    ORDER BY id
                `, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            locationIds = allLocations.map(loc => loc.id);
        }

        console.log(`📊 [Inventory] Preluare detalii pentru sesiunea ${sessionId}`);
        console.log(`   Gestiuni: ${locationIds.join(', ')}`);

        // Obține stocurile pentru fiecare gestiune
        const items = [];
        for (const locationId of locationIds) {
            // Obține informații despre gestiune
            const location = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT id, name, type FROM management_locations WHERE id = ?
                `, [locationId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            let query = `
                SELECT 
                    i.id as ingredient_id,
                    i.name,
                    i.unit,
                    i.current_stock as theoretical_stock,
                    ic.counted_stock,
                    ? as location_id,
                    ? as location_name
                FROM ingredients i
                LEFT JOIN inventory_counts ic 
                    ON i.id = ic.ingredient_id 
                    AND ic.session_id = ? 
                    AND ic.location_id = ?
                WHERE i.is_available = 1 
                    AND i.location_id = ?
            `;
            const params = [locationId, location.name, sessionId, locationId, locationId];

            if (session.session_type === 'daily') {
                const placeholders = DAILY_INVENTORY_CATEGORIES.map(() => '?').join(',');
                query += ` AND (i.category_en IN (${placeholders}) OR i.category IN (${placeholders}))`;
                DAILY_INVENTORY_CATEGORIES.forEach(c => params.push(c));
                DAILY_INVENTORY_CATEGORIES.forEach(c => params.push(c));
            }

            query += ` ORDER BY i.category, i.name`;

            // Obține ingredientele din această gestiune
            const ingredients = await new Promise((resolve, reject) => {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            items.push(...ingredients);
        }

        console.log(`   Total ingrediente: ${items.length}`);

        return {
            success: true,
            session,
            items,
            locationIds
        };

    } catch (error) {
        console.error(`❌ [Inventory] Eroare la preluare detalii:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Actualizează numărătoarea pentru un ingredient într-o gestiune
 * @param {string} sessionId - ID sesiune inventar
 * @param {number} ingredientId - ID ingredient
 * @param {number} locationId - ID gestiune
 * @param {number} countedStock - Cantitate număr\ată
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateInventoryCount(sessionId, ingredientId, locationId, countedStock) {
    const db = await dbPromise;

    try {
        console.log(`🔢 [Inventory] Actualizare numărătoare:`);
        console.log(`   Sesiune: ${sessionId}, Ingredient: ${ingredientId}, Gestiune: ${locationId}, Cantitate: ${countedStock}`);

        // Inserează sau actualizează numărătoarea
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT OR REPLACE INTO inventory_counts (
                    session_id, ingredient_id, location_id, counted_stock, updated_at
                ) VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
            `, [sessionId, ingredientId, locationId, countedStock], function (err) {
                if (err) reject(err);
                else resolve();
            });
        });

        // Actualizează items_counted în sesiune
        const countResult = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COUNT(*) as count 
                FROM inventory_counts 
                WHERE session_id = ? AND counted_stock IS NOT NULL
            `, [sessionId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE inventory_sessions 
                SET items_counted = ? 
                WHERE id = ?
            `, [countResult.count, sessionId], function (err) {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`✅ [Inventory] Numărătoare actualizată`);

        return {
            success: true
        };

    } catch (error) {
        console.error(`❌ [Inventory] Eroare la actualizare numărătoare:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Finalizează sesiunea de inventar și actualizează stocurile per gestiune
 * @param {string} sessionId - ID sesiune inventar
 * @returns {Promise<{success: boolean, adjustments?: object, error?: string}>}
 */
async function finalizeInventorySession(sessionId) {
    const db = await dbPromise;

    try {
        console.log(`🔒 [Inventory] Finalizare sesiune: ${sessionId}`);

        // Obține toate numărătorile din sesiune
        const counts = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ic.*,
                    i.name as ingredient_name,
                    i.unit,
                    i.current_stock as theoretical_stock,
                    i.cost_per_unit,
                    ml.name as location_name
                FROM inventory_counts ic
                JOIN ingredients i ON ic.ingredient_id = i.id
                LEFT JOIN management_locations ml ON ic.location_id = ml.id
                WHERE ic.session_id = ? AND ic.counted_stock IS NOT NULL
            `, [sessionId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log(`   Total numărători: ${counts.length}`);

        let totalDifferenceValue = 0;
        const adjustments = {
            byLocation: {},
            total: 0
        };

        // Procesează fiecare numărătoare
        for (const count of counts) {
            const difference = count.counted_stock - count.theoretical_stock;

            if (difference !== 0) {
                console.log(`   Ajustare: ${count.ingredient_name} în ${count.location_name}: ${difference} ${count.unit}`);

                // Actualizează stocul ingredientului în gestiune
                await new Promise((resolve, reject) => {
                    db.run(`
                        UPDATE ingredients
                        SET current_stock = ?,
                            last_updated = datetime('now', 'localtime')
                        WHERE id = ? AND location_id = ?
                    `, [count.counted_stock, count.ingredient_id, count.location_id], function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Înregistrează mișcarea în stock_movements
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT INTO stock_movements (
                            ingredient_id, quantity_change, movement_type, 
                            reference_id, notes, location_id, created_at
                        ) VALUES (?, ?, 'inventory_adjustment', ?, ?, ?, datetime('now', 'localtime'))
                    `, [
                        count.ingredient_id,
                        difference,
                        sessionId,
                        `Inventar: ${count.theoretical_stock} → ${count.counted_stock}`,
                        count.location_id
                    ], function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Calculează diferența de valoare
                const differenceValue = difference * (count.cost_per_unit || 0);
                totalDifferenceValue += differenceValue;

                // Grupează ajustările per gestiune
                const locName = count.location_name || 'Unknown';
                if (!adjustments.byLocation[locName]) {
                    adjustments.byLocation[locName] = {
                        locationName: locName,
                        items: 0,
                        totalValue: 0
                    };
                }

                adjustments.byLocation[locName].items++;
                adjustments.byLocation[locName].totalValue += differenceValue;
            }
        }

        adjustments.total = totalDifferenceValue;

        // Actualizează sesiunea ca finalizată
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE inventory_sessions
                SET status = 'completed',
                    completed_at = datetime('now', 'localtime'),
                    total_difference_value = ?
                WHERE id = ?
            `, [totalDifferenceValue, sessionId], function (err) {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`✅ [Inventory] Sesiune ${sessionId} finalizată`);
        console.log(`   Diferență totală valoare: ${totalDifferenceValue.toFixed(2)} RON`);

        return {
            success: true,
            adjustments
        };

    } catch (error) {
        console.error(`❌ [Inventory] Eroare la finalizare:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Obține lista de sesiuni inventar cu filtre
 * @param {object} filters - {sessionType?, status?, startDate?, endDate?}
 * @returns {Promise<{success: boolean, sessions?: Array, error?: string}>}
 */
async function getInventorySessions(filters = {}) {
    const db = await dbPromise;

    try {
        let query = `
            SELECT 
                s.*,
                (SELECT COUNT(*) FROM inventory_counts WHERE session_id = s.id) as total_counts
            FROM inventory_sessions s
            WHERE 1=1
        `;
        const params = [];

        if (filters.sessionType) {
            query += ` AND s.session_type = ?`;
            params.push(filters.sessionType);
        }

        if (filters.status) {
            query += ` AND s.status = ?`;
            params.push(filters.status);
        }

        if (filters.startDate) {
            query += ` AND DATE(s.started_at) >= DATE(?)`;
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ` AND DATE(s.started_at) <= DATE(?)`;
            params.push(filters.endDate);
        }

        query += ` ORDER BY s.started_at DESC`;

        const sessions = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        return {
            success: true,
            sessions
        };

    } catch (error) {
        console.error(`❌ [Inventory] Eroare la preluare sesiuni:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Șterge o sesiune de inventar și datele asociate
 * @param {string} sessionId - ID sesiune inventar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteInventorySession(sessionId) {
    const db = await dbPromise;

    try {
        console.log(`🗑️ [Inventory] Ștergere sesiune: ${sessionId}`);

        // Șterge numărătorile asociate
        await new Promise((resolve, reject) => {
            db.run(`DELETE FROM inventory_counts WHERE session_id = ?`, [sessionId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Șterge sesiunea
        await new Promise((resolve, reject) => {
            db.run(`DELETE FROM inventory_sessions WHERE id = ?`, [sessionId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`✅ [Inventory] Sesiune ${sessionId} ștearsă`);

        return { success: true };

    } catch (error) {
        console.error(`❌ [Inventory] Eroare la ștergere sesiune:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    createInventorySession,
    getInventoryDetails,
    updateInventoryCount,
    finalizeInventorySession,
    getInventorySessions,
    deleteInventorySession
};
