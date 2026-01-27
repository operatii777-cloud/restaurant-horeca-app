// server/production/productionBatchService.js
// Serviciu pentru gestionarea batch-urilor de producție

const { dbPromise } = require("../database");
const { createStockMove } = require("../stock/stockMoveService");
const { STOCK_MOVE_REASON, STOCK_MOVE_SOURCE } = require("../stock/stockMoveConstants");

const DEFAULT_TENANT_ID = 1;

/**
 * Generează număr batch unic
 */
function generateBatchNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BATCH-${timestamp}-${random}`;
}

/**
 * Creează un batch de producție
 */
async function createProductionBatch(batchData) {
  const db = await dbPromise;
  const {
    tenant_id = DEFAULT_TENANT_ID,
    batch_date,
    recipe_id,
    recipe_name,
    responsible,
    location_id = 1,
    notes,
    created_by,
    items = [], // [{ ingredient_id, quantity_planned, unit, cost_per_unit }]
    results = [] // [{ product_id, quantity_produced, unit, cost_per_unit }]
  } = batchData;

  const batchNumber = generateBatchNumber();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Inserează header batch
      db.run(
        `INSERT INTO production_batches (
          tenant_id, batch_number, batch_date, recipe_id, recipe_name,
          status, responsible, location_id, notes, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?)`,
        [tenant_id, batchNumber, batch_date, recipe_id, recipe_name, responsible, location_id, notes, created_by, now, now],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          const batchId = this.lastID;

          // Inserează items (ingrediente consumate)
          const itemPromises = items.map((item) => {
            return new Promise((resolveItem, rejectItem) => {
              const totalCost = (item.quantity_planned || 0) * (item.cost_per_unit || 0);
              db.run(
                `INSERT INTO production_batch_items (
                  tenant_id, batch_id, ingredient_id, quantity_planned, quantity_used,
                  unit, cost_per_unit, total_cost, lot_number, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  tenant_id, batchId, item.ingredient_id,
                  item.quantity_planned || 0, item.quantity_used || item.quantity_planned || 0,
                  item.unit, item.cost_per_unit || 0, totalCost,
                  item.lot_number, item.notes
                ],
                (err) => {
                  if (err) rejectItem(err);
                  else resolveItem();
                }
              );
            });
          });

          // Inserează results (produse finite)
          const resultPromises = results.map((result) => {
            return new Promise((resolveResult, rejectResult) => {
              const totalCost = (result.quantity_produced || 0) * (result.cost_per_unit || 0);
              db.run(
                `INSERT INTO production_batch_results (
                  tenant_id, batch_id, product_id, quantity_produced,
                  unit, cost_per_unit, total_cost, lot_number, expiry_date, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  tenant_id, batchId, result.product_id,
                  result.quantity_produced || 0,
                  result.unit, result.cost_per_unit || 0, totalCost,
                  result.lot_number, result.expiry_date, result.notes
                ],
                (err) => {
                  if (err) rejectResult(err);
                  else resolveResult();
                }
              );
            });
          });

          Promise.all([...itemPromises, ...resultPromises])
            .then(() => {
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                resolve({ batchId, batchNumber });
              });
            })
            .catch((err) => {
              db.run('ROLLBACK');
              reject(err);
            });
        }
      );
    });
  });
}

/**
 * Finalizează un batch de producție (generează stock_moves PRODUCTION_OUT/IN)
 */
async function finalizeProductionBatch(tenantId, batchId) {
  const db = await dbPromise;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Obține batch header
      db.get(
        `SELECT * FROM production_batches WHERE id = ? AND tenant_id = ?`,
        [batchId, tenantId],
        async (err, batch) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          if (!batch) {
            db.run('ROLLBACK');
            return reject(new Error(`Batch ${batchId} not found`));
          }

          if (batch.status === 'completed') {
            db.run('ROLLBACK');
            return reject(new Error(`Batch ${batchId} already completed`));
          }

          try {
            // Obține items (ingrediente consumate)
            const items = await new Promise((resolveItems, rejectItems) => {
              db.all(
                `SELECT * FROM production_batch_items WHERE batch_id = ?`,
                [batchId],
                (err, rows) => {
                  if (err) rejectItems(err);
                  else resolveItems(rows || []);
                }
              );
            });

            // Generează stock_moves PRODUCTION_OUT pentru ingrediente
            for (const item of items) {
              if (item.quantity_used > 0) {
                await createStockMove({
                  tenant_id: tenantId,
                  ingredient_id: item.ingredient_id,
                  qty: item.quantity_used,
                  direction: "OUT",
                  reason: STOCK_MOVE_REASON.PRODUCTION_OUT,
                  source: STOCK_MOVE_SOURCE.PRODUCTION,
                  reference_type: "PRODUCTION_BATCH",
                  reference_id: batchId,
                  unit_price: item.cost_per_unit,
                  value: item.total_cost,
                  tva_percent: null,
                  location_id: batch.location_id,
                  meta: {
                    batch_number: batch.batch_number,
                    recipe_id: batch.recipe_id,
                    recipe_name: batch.recipe_name,
                  },
                });
              }
            }

            // Obține results (produse finite)
            const results = await new Promise((resolveResults, rejectResults) => {
              db.all(
                `SELECT * FROM production_batch_results WHERE batch_id = ?`,
                [batchId],
                (err, rows) => {
                  if (err) rejectResults(err);
                  else resolveResults(rows || []);
                }
              );
            });

            // Generează stock_moves PRODUCTION_IN pentru produse finite
            for (const result of results) {
              if (result.quantity_produced > 0) {
                // Pentru produse finite, verificăm dacă există în ingredients (ca ingredient finit)
                // Dacă nu există, folosim product_id direct (va fi în meta pentru referință)
                const finishedProductIngredient = await new Promise((resolve, reject) => {
                  db.get(
                    `SELECT id FROM ingredients WHERE id = ? OR (product_id = ? AND product_id IS NOT NULL)`,
                    [result.product_id, result.product_id],
                    (err, row) => {
                      if (err) reject(err);
                      else resolve(row);
                    }
                  );
                });

                const ingredientId = finishedProductIngredient?.id || result.product_id;

                await createStockMove({
                  tenant_id: tenantId,
                  ingredient_id: ingredientId,
                  qty: result.quantity_produced,
                  direction: "IN",
                  reason: STOCK_MOVE_REASON.PRODUCTION_IN,
                  source: STOCK_MOVE_SOURCE.PRODUCTION,
                  reference_type: "PRODUCTION_BATCH",
                  reference_id: batchId,
                  unit_price: result.cost_per_unit,
                  value: result.total_cost,
                  tva_percent: null,
                  location_id: batch.location_id,
                  meta: {
                    batch_number: batch.batch_number,
                    recipe_id: batch.recipe_id,
                    recipe_name: batch.recipe_name,
                    product_id: result.product_id, // Produs finit din menu
                    lot_number: result.lot_number,
                    expiry_date: result.expiry_date,
                    is_finished_product: true, // Flag pentru produse finite
                  },
                });
              }
            }

            // Actualizează status batch
            const now = new Date().toISOString();
            db.run(
              `UPDATE production_batches 
               SET status = 'completed', completed_at = ?, updated_at = ?
               WHERE id = ? AND tenant_id = ?`,
              [now, now, batchId, tenantId],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }

                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                  }

                  console.log(`[finalizeProductionBatch] SUCCESS - Batch #${batchId}`, {
                    tenantId,
                    batchId,
                    batchNumber: batch.batch_number,
                    itemsProcessed: items.length,
                    resultsProcessed: results.length
                  });

                  resolve({
                    batchId,
                    batchNumber: batch.batch_number,
                    itemsProcessed: items.length,
                    resultsProcessed: results.length
                  });
                });
              }
            );
          } catch (error) {
            db.run('ROLLBACK');
            reject(error);
          }
        }
      );
    });
  });
}

/**
 * Obține batch-uri de producție
 */
async function getProductionBatches(tenantId, filters = {}) {
  const db = await dbPromise;
  const { status, startDate, endDate, limit = 100 } = filters;

  let query = `
    SELECT 
      pb.*,
      COUNT(DISTINCT pbi.id) AS items_count,
      COUNT(DISTINCT pbr.id) AS results_count
    FROM production_batches pb
    LEFT JOIN production_batch_items pbi ON pbi.batch_id = pb.id
    LEFT JOIN production_batch_results pbr ON pbr.batch_id = pb.id
    WHERE pb.tenant_id = ?
  `;
  const params = [tenantId];

  if (status) {
    query += ` AND pb.status = ?`;
    params.push(status);
  }

  if (startDate) {
    query += ` AND pb.batch_date >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND pb.batch_date <= ?`;
    params.push(endDate);
  }

  query += ` GROUP BY pb.id ORDER BY pb.created_at DESC LIMIT ?`;
  params.push(limit);

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Obține detalii batch (cu items și results)
 */
async function getProductionBatchDetails(tenantId, batchId) {
  const db = await dbPromise;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Header
      db.get(
        `SELECT * FROM production_batches WHERE id = ? AND tenant_id = ?`,
        [batchId, tenantId],
        (err, batch) => {
          if (err) return reject(err);
          if (!batch) return reject(new Error(`Batch ${batchId} not found`));

          // Items
          db.all(
            `SELECT pbi.*, i.name AS ingredient_name
             FROM production_batch_items pbi
             LEFT JOIN ingredients i ON i.id = pbi.ingredient_id
             WHERE pbi.batch_id = ?`,
            [batchId],
            (err, items) => {
              if (err) return reject(err);

              // Results
              db.all(
                `SELECT pbr.*, m.name AS product_name
                 FROM production_batch_results pbr
                 LEFT JOIN menu m ON m.id = pbr.product_id
                 WHERE pbr.batch_id = ?`,
                [batchId],
                (err, results) => {
                  if (err) return reject(err);

                  resolve({
                    ...batch,
                    items: items || [],
                    results: results || []
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

module.exports = {
  createProductionBatch,
  finalizeProductionBatch,
  getProductionBatches,
  getProductionBatchDetails,
  generateBatchNumber,
};

