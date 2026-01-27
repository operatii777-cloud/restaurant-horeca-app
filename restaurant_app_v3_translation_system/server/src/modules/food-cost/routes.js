/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Food Cost Routes (logic migrated)
 * Original: routes/food-cost.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/food-cost.controller');

router.get('/products', controller.getProducts);
router.get('/stats', controller.getStats);
router.get('/products/:id', controller.getProductById);
router.post('/suggest-price', controller.suggestPrice);

// Food Cost Analysis endpoint - Real business logic
router.get('/analysis', async (req, res) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    const { startDate, endDate, category } = req.query;
    
    // Default to last 30 days
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateStart = startDate || thirtyDaysAgo;
    const dateEnd = endDate || today;
    
    // Build category filter
    let categoryFilter = '';
    const params = [dateStart, dateEnd];
    if (category) {
      categoryFilter = ' AND m.category = ?';
      params.push(category);
    }
    
    // Calculate theoretical food cost (based on recipes - calculate from ingredients)
    const theoreticalCost = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COALESCE(SUM(oi.quantity * COALESCE(recipe_cost.cost, 0)), 0) as theoretical_cost,
          COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
          COUNT(DISTINCT o.id) as total_orders
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN menu m ON oi.product_id = m.id
        LEFT JOIN (
          SELECT 
            r.product_id,
            SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0) * (1 + COALESCE(r.waste_percentage, 0) / 100.0)) as cost
          FROM recipes r
          LEFT JOIN ingredients i ON r.ingredient_id = i.id
          WHERE r.ingredient_id IS NOT NULL
          GROUP BY r.product_id
        ) recipe_cost ON m.id = recipe_cost.product_id
        WHERE o.status IN ('paid', 'completed', 'delivered')
        AND DATE(o.timestamp) >= DATE(?)
        AND DATE(o.timestamp) <= DATE(?)
        ${categoryFilter}
      `, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || { theoretical_cost: 0, total_revenue: 0, total_orders: 0 });
      });
    });
    
    // Calculate actual food cost (based on stock consumption)
    const actualCost = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COALESCE(SUM(
            CASE WHEN sm.movement_type = 'CONSUME' THEN ABS(sm.quantity_change) * COALESCE(i.cost_per_unit, 0) ELSE 0 END
          ), 0) as actual_cost
        FROM stock_movements sm
        JOIN ingredients i ON sm.ingredient_id = i.id
        WHERE DATE(sm.created_at) >= DATE(?)
        AND DATE(sm.created_at) <= DATE(?)
      `, [dateStart, dateEnd], (err, row) => {
        if (err) reject(err);
        else resolve(row || { actual_cost: 0 });
      });
    });
    
    // Calculate by category
    const byCategory = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          m.category,
          COALESCE(SUM(oi.quantity * COALESCE(recipe_cost.cost, 0)), 0) as theoretical_cost,
          COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
          COUNT(*) as items_sold,
          CASE 
            WHEN SUM(oi.quantity * oi.price) > 0 
            THEN ROUND(SUM(oi.quantity * COALESCE(recipe_cost.cost, 0)) / SUM(oi.quantity * oi.price) * 100, 2)
            ELSE 0 
          END as food_cost_percentage
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN menu m ON oi.product_id = m.id
        LEFT JOIN (
          SELECT r.product_id, SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0)) as cost
          FROM recipes r LEFT JOIN ingredients i ON r.ingredient_id = i.id
          WHERE r.ingredient_id IS NOT NULL GROUP BY r.product_id
        ) recipe_cost ON m.id = recipe_cost.product_id
        WHERE o.status IN ('paid', 'completed', 'delivered')
        AND DATE(o.timestamp) >= DATE(?)
        AND DATE(o.timestamp) <= DATE(?)
        GROUP BY m.category
        ORDER BY revenue DESC
      `, [dateStart, dateEnd], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Top variance products (actual vs theoretical)
    const topVariance = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          m.name as product_name,
          m.category,
          m.price as selling_price,
          COALESCE(recipe_cost.cost, 0) as recipe_cost,
          COALESCE(SUM(oi.quantity), 0) as quantity_sold,
          COALESCE(SUM(oi.quantity * COALESCE(recipe_cost.cost, 0)), 0) as total_theoretical_cost,
          COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
          CASE 
            WHEN m.price > 0 
            THEN ROUND(COALESCE(recipe_cost.cost, 0) / m.price * 100, 2)
            ELSE 0 
          END as food_cost_percentage
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN menu m ON oi.product_id = m.id
        LEFT JOIN (
          SELECT r.product_id, SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0)) as cost
          FROM recipes r LEFT JOIN ingredients i ON r.ingredient_id = i.id
          WHERE r.ingredient_id IS NOT NULL GROUP BY r.product_id
        ) recipe_cost ON m.id = recipe_cost.product_id
        WHERE o.status IN ('paid', 'completed', 'delivered')
        AND DATE(o.timestamp) >= DATE(?)
        AND DATE(o.timestamp) <= DATE(?)
        GROUP BY m.id
        HAVING food_cost_percentage > 35
        ORDER BY food_cost_percentage DESC
        LIMIT 10
      `, [dateStart, dateEnd], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculate variance
    const variance = actualCost.actual_cost - theoreticalCost.theoretical_cost;
    const variancePercentage = theoreticalCost.theoretical_cost > 0 
      ? Math.round((variance / theoreticalCost.theoretical_cost) * 100 * 100) / 100
      : 0;
    
    // Overall food cost percentage
    const overallFoodCostPercentage = theoreticalCost.total_revenue > 0
      ? Math.round((theoreticalCost.theoretical_cost / theoreticalCost.total_revenue) * 100 * 100) / 100
      : 0;
    
    res.json({
      success: true,
      data: {
        period: { start: dateStart, end: dateEnd },
        theoretical_cost: Math.round(theoreticalCost.theoretical_cost * 100) / 100,
        actual_cost: Math.round(actualCost.actual_cost * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        variance_percentage: variancePercentage,
        total_revenue: Math.round(theoreticalCost.total_revenue * 100) / 100,
        total_orders: theoreticalCost.total_orders,
        overall_food_cost_percentage: overallFoodCostPercentage,
        by_category: byCategory,
        top_variance_products: topVariance,
        target_food_cost_percentage: 30, // Industry standard target
        status: overallFoodCostPercentage <= 30 ? 'healthy' : overallFoodCostPercentage <= 35 ? 'warning' : 'critical'
      }
    });
  } catch (error) {
    console.error('Error in /api/food-cost/analysis:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
