/**
 * PHASE S7.4 - Stock Consumption Service
 * 
 * Unified service for consuming stock for orders.
 * Used by fiscalization and other order completion flows.
 */

const StocksRepository = require('../repo/stocks.repository');
const { dbPromise } = require('../../../../database');
// PHASE S8.5 - SAF-T Validation
// Note: saft.service.ts is TypeScript - skipping for now
// TODO: Convert to .js or handle TypeScript compilation
// const SaftService = require('../../saft/saft.service');
// PHASE S9.2 - Recipe Expander for recursive recipes
const { expandRecipeToIngredientsWithUnitConversion, aggregateIngredients } = require('../../stock/recipe.expander');

class StockConsumptionService {
  /**
   * Check if stock is already consumed for an order
   */
  async isStockConsumedForOrder(orderId) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      // Check if there are stock moves for this order with type CONSUME or ADJUST
      // Using reference_id and reference_type for backward compatibility
      db.get(
        `SELECT COUNT(*) as count 
         FROM stock_moves 
         WHERE (reference_id = ? AND reference_type = 'ORDER')
            OR order_id = ?
           AND type IN ('CONSUME', 'ADJUST')
           AND quantity_out > 0`,
        [orderId, orderId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve((row?.count || 0) > 0);
          }
        }
      );
    });
  }

  /**
   * Consume stock for an order
   * 
   * @param {number} orderId - Order ID
   * @param {Object} options - Options for stock consumption
   * @param {string} options.reason - Reason for consumption (e.g., 'FISCAL_RECEIPT', 'ORDER_COMPLETED')
   * @param {string} options.source - Source of consumption (e.g., 'POS', 'KIOSK', 'ADMIN')
   * @param {number} options.fiscalReceiptId - Fiscal receipt ID (if applicable)
   * @param {string} options.fiscalNumber - Fiscal number (if applicable)
   * @returns {Promise<Object>} Result of stock consumption
   */
  async consumeStockForOrder(orderId, options = {}) {
    const db = await dbPromise;
    const { reason = 'FISCAL_RECEIPT', source = 'POS', fiscalReceiptId = null, fiscalNumber = null } = options;

    // 1. Check if already consumed
    const alreadyConsumed = await this.isStockConsumedForOrder(orderId);
    if (alreadyConsumed) {
      console.log(`[FISCAL STOCK] Stock already consumed for order ${orderId}, skipping`);
      return { skipped: true, reason: 'ALREADY_CONSUMED' };
    }

    // 2. Get order with items
    const order = await this.getOrderWithItems(db, orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (!order.items || order.items.length === 0) {
      console.log(`[FISCAL STOCK] Order ${orderId} has no items, skipping stock consumption`);
      return { skipped: true, reason: 'NO_ITEMS' };
    }

    console.log(`[FISCAL STOCK] Consuming stock for order ${orderId} via StockEngine`);

    // 3. For each item, expand recipe recursively and calculate consumption
    const stockMoves = [];
    
    for (const item of order.items) {
      try {
        const productId = item.product_id || item.menu_item_id || item.id;
        const itemQty = Number(item.quantity || item.qty || 1);
        
        if (!productId || itemQty <= 0) {
          continue;
        }
        
        // PHASE S9.2 - Use recipe expander for recursive recipes
        try {
          // Expand recipe recursively (handles sub-recipes, waste, unit conversion)
          const expandedIngredients = await expandRecipeToIngredientsWithUnitConversion(
            productId,
            itemQty
          );
          
          if (expandedIngredients.length === 0) {
            // No recipe = no stock consumption needed
            continue;
          }
          
          // Aggregate ingredients by ingredient_id (in case same ingredient appears multiple times)
          const aggregated = aggregateIngredients(expandedIngredients);
          
          // Create stock moves for each ingredient
          for (const ing of aggregated) {
            if (ing.qty > 0) {
              stockMoves.push({
                ingredient_id: ing.ingredient_id,
                quantity_out: ing.qty, // Positive quantity_out = consumption
                type: 'CONSUME',
                reference_type: 'ORDER',
                reference_id: orderId,
                move_reason: reason,
                move_source: source,
                order_id: orderId,
                fiscal_receipt_id: fiscalReceiptId,
                fiscal_number: fiscalNumber,
                product_id: productId,
                notes: `Consumed for order ${orderId}, product ${productId} (qty: ${itemQty}), fiscal receipt ${fiscalReceiptId || 'N/A'}. Recipe expanded recursively.`
              });
            }
          }
        } catch (expandError) {
          // Fallback to old method if recipe expander fails
          console.warn(`[FISCAL STOCK] Recipe expander failed for product ${productId}, using fallback method:`, expandError.message);
          
          // FALLBACK: Use old method (non-recursive)
          const recipe = await this.getRecipeForProduct(db, productId);
          
          if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
            continue;
          }

          // Calculate consumption for each ingredient (old method)
          for (const ingredient of recipe.ingredients) {
            const consumedQuantity = (ingredient.quantity || 0) * itemQty;
            
            if (consumedQuantity > 0) {
              stockMoves.push({
                ingredient_id: ingredient.ingredient_id,
                quantity_out: consumedQuantity,
                type: 'CONSUME',
                reference_type: 'ORDER',
                reference_id: orderId,
                move_reason: reason,
                move_source: source,
                order_id: orderId,
                fiscal_receipt_id: fiscalReceiptId,
                fiscal_number: fiscalNumber,
                product_id: productId,
                notes: `Consumed for order ${orderId}, product ${productId} (FALLBACK method), fiscal receipt ${fiscalReceiptId || 'N/A'}`
              });
            }
          }
        }
      } catch (err) {
        console.error(`[FISCAL STOCK] Error processing item for order ${orderId}:`, err);
        // Continue with other items
      }
    }

    // 4. PHASE S8.5 - Validate stock moves against SAF-T before creating
    // TODO: Re-enable when saft.service is converted to .js
    // if (stockMoves.length > 0) {
    //   for (const move of stockMoves) {
    //     const validation = await SaftService.validateStockTransactionData(move);
    //     if (!validation.valid && validation.errors.length > 0) {
    //       console.warn(`[FISCAL STOCK] SAF-T validation warning for stock move:`, validation.errors);
    //       // Continue with warnings, but log errors
    //     }
    //   }
    // }
    if (stockMoves.length > 0) {
      // Create stock moves for all ingredients consumed
      await this.createStockMoves(db, stockMoves);
      
      // 5. Mark order as stock consumed
      await this.markOrderStockConsumed(db, orderId, fiscalReceiptId);
      
      console.log(`[FISCAL STOCK] ✅ Stock consumed for order ${orderId}: ${stockMoves.length} moves created`);
      
      return {
        skipped: false,
        movesCreated: stockMoves.length,
        moves: stockMoves
      };
    } else {
      console.log(`[FISCAL STOCK] No stock moves needed for order ${orderId} (no recipes found)`);
      return { skipped: true, reason: 'NO_RECIPES' };
    }
  }

  /**
   * Get order with items
   */
  async getOrderWithItems(db, orderId) {
    return new Promise((resolve, reject) => {
      // Get order
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
        if (err) {
          reject(err);
          return;
        }

        if (!order) {
          resolve(null);
          return;
        }

        // Parse items if stored as JSON
        if (order.items && typeof order.items === 'string') {
          try {
            order.items = JSON.parse(order.items);
          } catch (e) {
            order.items = [];
          }
        }

        // If no items in order object, try to get from order_items table
        if (!order.items || order.items.length === 0) {
          // Check if order_items table exists first
          db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'`, (err, tableExists) => {
            if (err || !tableExists) {
              // Table doesn't exist, use empty array
              order.items = [];
              resolve(order);
            } else {
              // Table exists, query it
              db.all(
                `SELECT oi.*, p.name as product_name 
                 FROM order_items oi 
                 LEFT JOIN menu p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`,
                [orderId],
                (err, items) => {
                  if (err) {
                    // If query fails, use empty array instead of rejecting
                    console.warn(`⚠️ Error fetching order_items for order ${orderId}:`, err.message);
                    order.items = [];
                    resolve(order);
                  } else {
                    order.items = items || [];
                    resolve(order);
                  }
                }
              );
            }
          });
        } else {
          resolve(order);
        }
      });
    });
  }

  /**
   * Get recipe for a product
   */
  async getRecipeForProduct(db, productId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT r.*, 
                json_group_array(
                  json_object(
                    'ingredient_id', ri.ingredient_id,
                    'quantity', ri.quantity,
                    'unit', ri.unit
                  )
                ) as ingredients
         FROM recipes r
         LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
         WHERE r.product_id = ?
         GROUP BY r.id
         LIMIT 1`,
        [productId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row && row.ingredients) {
              try {
                row.ingredients = JSON.parse(row.ingredients);
              } catch (e) {
                row.ingredients = [];
              }
            } else {
              row = null;
            }
            resolve(row);
          }
        }
      );
    });
  }

  /**
   * Create stock moves in transaction
   */
  async createStockMoves(db, stockMoves) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const insertMove = (move, callback) => {
          // Use base columns that definitely exist in stock_moves table
          const baseQuery = `
            INSERT INTO stock_moves 
            (ingredient_id, quantity_out, type, reference_type, reference_id, 
             move_reason, move_source, notes, date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
          `;

          const baseParams = [
            move.ingredient_id,
            move.quantity_out,
            move.type,
            move.reference_type,
            move.reference_id,
            move.move_reason || null,
            move.move_source || null,
            move.notes || null
          ];

          // Insert with base columns
          db.run(baseQuery, baseParams, function(err) {
            if (err) {
              callback(err);
            } else {
              const moveId = this.lastID;
              
              // Try to update optional columns if they exist
              const optionalUpdates = [];
              const optionalParams = [];
              
              if (move.order_id) {
                optionalUpdates.push('order_id = ?');
                optionalParams.push(move.order_id);
              }
              if (move.fiscal_receipt_id) {
                optionalUpdates.push('fiscal_receipt_id = ?');
                optionalParams.push(move.fiscal_receipt_id);
              }
              if (move.fiscal_number) {
                optionalUpdates.push('fiscal_number = ?');
                optionalParams.push(move.fiscal_number);
              }
              if (move.product_id) {
                optionalUpdates.push('product_id = ?');
                optionalParams.push(move.product_id);
              }

              if (optionalUpdates.length > 0) {
                db.run(
                  `UPDATE stock_moves SET ${optionalUpdates.join(', ')} WHERE id = ?`,
                  [...optionalParams, moveId],
                  (updateErr) => {
                    // Ignore errors if columns don't exist - that's OK
                    callback(null);
                  }
                );
              } else {
                callback(null);
              }
            }
          });
        };

        let completed = 0;
        let hasError = false;

        stockMoves.forEach((move) => {
          insertMove(move, (err) => {
            if (err && !hasError) {
              hasError = true;
              db.run('ROLLBACK', () => {
                reject(err);
              });
            } else if (!hasError) {
              completed++;
              if (completed === stockMoves.length) {
                db.run('COMMIT', (commitErr) => {
                  if (commitErr) {
                    reject(commitErr);
                  } else {
                    resolve();
                  }
                });
              }
            }
          });
        });
      });
    });
  }

  /**
   * Mark order as stock consumed
   */
  async markOrderStockConsumed(db, orderId, fiscalReceiptId) {
    return new Promise((resolve, reject) => {
      // Try to add stock_consumed column if it doesn't exist
      db.run(
        `ALTER TABLE orders ADD COLUMN stock_consumed INTEGER DEFAULT 0`,
        () => {
          // Ignore error if column already exists
          
          // Update order
          db.run(
            `UPDATE orders 
             SET stock_consumed = 1 
             WHERE id = ?`,
            [orderId],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        }
      );
    });
  }
}

module.exports = new StockConsumptionService();
