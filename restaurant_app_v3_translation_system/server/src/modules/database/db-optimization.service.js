/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABASE OPTIMIZATION SERVICE
 * 
 * Creează indexuri pentru optimizare performance:
 * - Indexuri pentru query-uri frecvente
 * - Indexuri pentru orders (platform, timestamp, status)
 * - Indexuri pentru stock_moves (ingredient_id, date)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');

class DatabaseOptimizationService {
  /**
   * Create indexes for performance optimization
   */
  async createIndexes() {
    const db = await dbPromise;
    
    const indexes = [
      // Orders indexes
      {
        name: 'idx_orders_platform',
        sql: 'CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform)'
      },
      {
        name: 'idx_orders_timestamp',
        sql: 'CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp)'
      },
      {
        name: 'idx_orders_status',
        sql: 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)'
      },
      {
        name: 'idx_orders_platform_timestamp',
        sql: 'CREATE INDEX IF NOT EXISTS idx_orders_platform_timestamp ON orders(platform, timestamp)'
      },
      {
        name: 'idx_orders_status_timestamp',
        sql: 'CREATE INDEX IF NOT EXISTS idx_orders_status_timestamp ON orders(status, timestamp)'
      },
      
      // Stock moves indexes
      {
        name: 'idx_stock_moves_ingredient_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_stock_moves_ingredient_id ON stock_moves(ingredient_id)'
      },
      {
        name: 'idx_stock_moves_date',
        sql: 'CREATE INDEX IF NOT EXISTS idx_stock_moves_date ON stock_moves(date)'
      },
      {
        name: 'idx_stock_moves_reference',
        sql: 'CREATE INDEX IF NOT EXISTS idx_stock_moves_reference ON stock_moves(reference_type, reference_id)'
      },
      // NOTE: stock_moves table uses reference_type/reference_id, not order_id
      // Index removed: idx_stock_moves_order_id (column does not exist)
      
      // Order items indexes
      {
        name: 'idx_order_items_order_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)'
      },
      {
        name: 'idx_order_items_product_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)'
      },
      
      // Ingredients indexes
      {
        name: 'idx_ingredients_is_available',
        sql: 'CREATE INDEX IF NOT EXISTS idx_ingredients_is_available ON ingredients(is_available)'
      },
      {
        name: 'idx_ingredients_min_stock',
        sql: 'CREATE INDEX IF NOT EXISTS idx_ingredients_min_stock ON ingredients(min_stock)'
      },
      
      // Recipes indexes
      {
        name: 'idx_recipes_product_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_recipes_product_id ON recipes(product_id)'
      },
      {
        name: 'idx_recipes_ingredient_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_recipes_ingredient_id ON recipes(ingredient_id)'
      },
      {
        name: 'idx_recipes_recipe_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_recipes_recipe_id ON recipes(recipe_id)'
      }
      // NOTE: recipe_ingredients table does not exist - using recipes table instead
      // Indexes changed: idx_recipe_ingredients_* -> idx_recipes_*
    ];
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const index of indexes) {
      try {
        await new Promise((resolve, reject) => {
          db.run(index.sql, (err) => {
            if (err) {
              // Index might already exist, check error
              if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                skipped++;
                resolve();
              } else {
                reject(err);
              }
            } else {
              created++;
              resolve();
            }
          });
        });
      } catch (error) {
        console.error(`❌ [DB OPTIMIZATION] Error creating index ${index.name}:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ [DB OPTIMIZATION] Indexes created: ${created}, skipped: ${skipped}, errors: ${errors}`);
    
    return {
      created,
      skipped,
      errors,
      total: indexes.length
    };
  }

  /**
   * Analyze query performance
   */
  async analyzeQueryPerformance(query, params = []) {
    const db = await dbPromise;
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        db.all(query, params, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        execution_time_ms: executionTime,
        status: executionTime > 2000 ? 'slow' : executionTime > 1000 ? 'warning' : 'ok'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        execution_time_ms: Date.now() - startTime
      };
    }
  }
}

module.exports = new DatabaseOptimizationService();
