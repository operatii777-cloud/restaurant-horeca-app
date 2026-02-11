const dbPromise = require('../../database');

/**
 * Product Recall Service
 * Manages product recalls and traceability
 */
class RecallService {
    /**
     * Initiate a product recall
     * @param {Object} recallData - Recall information
     * @returns {Promise<number>} Recall ID
     */
    static async initiateRecall(recallData) {
        const {
            ingredientId,
            lotNumber,
            reason,
            severity, // 'critical', 'major', 'minor'
            initiatedBy,
            affectedDateFrom,
            affectedDateTo,
            supplierNotified = false
        } = recallData;

        const db = await dbPromise;
        const recallId = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO product_recalls (
                    ingredient_id, lot_number, reason, severity, 
                    initiated_by, initiated_at, affected_date_from, 
                    affected_date_to, supplier_notified, status
                ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, 'active')`,
                [ingredientId, lotNumber, reason, severity, initiatedBy,
                    affectedDateFrom, affectedDateTo, supplierNotified ? 1 : 0],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        console.log(`🚨 [RECALL] Initiated recall #${recallId} for ingredient ${ingredientId}, lot ${lotNumber}`);

        // Identify affected products
        await this.identifyAffectedProducts(recallId, ingredientId, lotNumber, affectedDateFrom, affectedDateTo);

        return recallId;
    }

    /**
     * Identify all products affected by a recall
     * @param {number} recallId - Recall ID
     * @param {number} ingredientId - Ingredient ID
     * @param {string} lotNumber - Lot number
     * @param {string} dateFrom - Start date
     * @param {string} dateTo - End date
     * @returns {Promise<Array>} Affected products
     */
    static async identifyAffectedProducts(recallId, ingredientId, lotNumber, dateFrom, dateTo) {
        const db = await dbPromise;

        // Find all batches of this ingredient in the affected lot and date range
        const affectedBatches = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id, quantity_kg, received_date 
                 FROM ingredient_batches 
                 WHERE ingredient_id = ? 
                 AND lot_number = ? 
                 AND received_date BETWEEN ? AND ?`,
                [ingredientId, lotNumber, dateFrom, dateTo],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        console.log(`📦 [RECALL] Found ${affectedBatches.length} affected batches`);

        // Find all recipes using this ingredient
        const affectedRecipes = await new Promise((resolve, reject) => {
            db.all(
                `SELECT DISTINCT r.id, r.name 
                 FROM recipes r
                 JOIN recipe_ingredients ri ON r.id = ri.recipe_id
                 WHERE ri.ingredient_id = ?`,
                [ingredientId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        console.log(`🍽️ [RECALL] Found ${affectedRecipes.length} affected recipes`);

        // Find all orders containing these recipes in the affected date range
        const affectedOrders = await new Promise((resolve, reject) => {
            db.all(
                `SELECT DISTINCT o.id, o.created_at, o.table_number, o.customer_name
                 FROM orders o
                 JOIN order_items oi ON o.id = oi.order_id
                 WHERE oi.product_name IN (
                     SELECT name FROM recipes WHERE id IN (${affectedRecipes.map(() => '?').join(',')})
                 )
                 AND o.created_at BETWEEN ? AND ?`,
                [...affectedRecipes.map(r => r.id), dateFrom, dateTo],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        console.log(`📋 [RECALL] Found ${affectedOrders.length} affected orders`);

        // Store affected items
        for (const batch of affectedBatches) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO recall_affected_items (
                        recall_id, item_type, item_id, quantity, identified_at
                    ) VALUES (?, 'batch', ?, ?, datetime('now'))`,
                    [recallId, batch.id, batch.quantity_kg],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        for (const order of affectedOrders) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO recall_affected_items (
                        recall_id, item_type, item_id, customer_info, identified_at
                    ) VALUES (?, 'order', ?, ?, datetime('now'))`,
                    [recallId, order.id, JSON.stringify({
                        table: order.table_number,
                        customer: order.customer_name,
                        date: order.created_at
                    })],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        return {
            batches: affectedBatches.length,
            recipes: affectedRecipes.length,
            orders: affectedOrders.length
        };
    }

    /**
     * Get recall details with affected items
     * @param {number} recallId - Recall ID
     * @returns {Promise<Object>} Recall details
     */
    static async getRecallDetails(recallId) {
        const db = await dbPromise;

        const recall = await new Promise((resolve, reject) => {
            db.get(
                `SELECT r.*, i.name as ingredient_name, u.username as initiated_by_name
                 FROM product_recalls r
                 LEFT JOIN ingredients i ON r.ingredient_id = i.id
                 LEFT JOIN users u ON r.initiated_by = u.id
                 WHERE r.id = ?`,
                [recallId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!recall) {
            throw new Error(`Recall #${recallId} not found`);
        }

        const affectedItems = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM recall_affected_items WHERE recall_id = ?`,
                [recallId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        return {
            ...recall,
            affectedItems
        };
    }

    /**
     * Complete a recall
     * @param {number} recallId - Recall ID
     * @param {string} completedBy - User ID
     * @param {string} notes - Completion notes
     * @returns {Promise<void>}
     */
    static async completeRecall(recallId, completedBy, notes) {
        const db = await dbPromise;

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE product_recalls 
                 SET status = 'completed', 
                     completed_at = datetime('now'),
                     completed_by = ?,
                     completion_notes = ?
                 WHERE id = ?`,
                [completedBy, notes, recallId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log(`✅ [RECALL] Recall #${recallId} completed by user ${completedBy}`);
    }

    /**
     * Generate recall report
     * @param {number} recallId - Recall ID
     * @returns {Promise<Object>} Recall report
     */
    static async generateRecallReport(recallId) {
        const details = await this.getRecallDetails(recallId);

        const report = {
            recallId,
            ingredient: details.ingredient_name,
            lotNumber: details.lot_number,
            severity: details.severity,
            reason: details.reason,
            initiatedAt: details.initiated_at,
            initiatedBy: details.initiated_by_name,
            affectedPeriod: {
                from: details.affected_date_from,
                to: details.affected_date_to
            },
            affectedItems: {
                batches: details.affectedItems.filter(i => i.item_type === 'batch').length,
                orders: details.affectedItems.filter(i => i.item_type === 'order').length
            },
            status: details.status,
            completedAt: details.completed_at,
            completionNotes: details.completion_notes
        };

        return report;
    }

    /**
     * Test recall procedure (simulation)
     * @param {number} ingredientId - Ingredient to test
     * @returns {Promise<Object>} Test results
     */
    static async testRecallProcedure(ingredientId) {
        console.log(`🧪 [RECALL TEST] Starting recall simulation for ingredient ${ingredientId}`);

        const startTime = Date.now();

        // Simulate recall initiation
        const testRecallId = await this.initiateRecall({
            ingredientId,
            lotNumber: 'TEST-' + Date.now(),
            reason: 'SIMULATION TEST - Not a real recall',
            severity: 'minor',
            initiatedBy: 1,
            affectedDateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            affectedDateTo: new Date().toISOString(),
            supplierNotified: false
        });

        const identificationTime = Date.now() - startTime;

        // Get details
        const details = await this.getRecallDetails(testRecallId);

        // Complete test recall
        await this.completeRecall(testRecallId, 1, 'Test completed successfully');

        const totalTime = Date.now() - startTime;

        console.log(`✅ [RECALL TEST] Test completed in ${totalTime}ms`);

        return {
            success: true,
            recallId: testRecallId,
            identificationTimeMs: identificationTime,
            totalTimeMs: totalTime,
            affectedItems: details.affectedItems.length,
            performance: totalTime < 5000 ? 'EXCELLENT' : totalTime < 10000 ? 'GOOD' : 'NEEDS IMPROVEMENT'
        };
    }
}

module.exports = RecallService;
