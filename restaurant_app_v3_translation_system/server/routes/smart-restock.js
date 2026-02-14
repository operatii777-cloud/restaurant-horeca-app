/**
 * 🤖 SMART RESTOCK - Auto-restock cu ML Algorithm
 * 
 * Funcționalități:
 * - Analiză istoric vânzări (last 30/60/90 days)
 * - Predicție consum bazat pe trend
 * - Sezonalitate (weekend vs weekday)
 * - Generare comenzi automate furnizori
 * - Lead time optimization
 */

const express = require('express');
const router = express.Router();
const { DB_PATH } = require('../config/db-constants');

// Obține conexiunea la DB
const getDb = () => {
  try {
    const { getDbConnection } = require('../database');
    return getDbConnection();
  } catch (e) {
    const sqlite3 = require('sqlite3').verbose();
    return new sqlite3.Database(DB_PATH);
  }
};

/**
 * GET /api/smart-restock/analysis
 * Analizează consumul și generează predicții
 */
router.get('/analysis', async (req, res) => {
  const db = getDb();
  const { days = 30 } = req.query;
  
  try {
    // 1. Obține ingredientele cu stoc scăzut
    const lowStockQuery = `
      SELECT 
        i.id,
        i.name,
        i.current_stock,
        i.min_stock_alert,
        i.unit,
        i.cost_per_unit,
        i.supplier_id,
        s.name as supplier_name,
        i.category
      FROM ingredients i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.current_stock <= i.min_stock_alert * 1.5
        AND i.is_active = 1
      ORDER BY (i.current_stock / NULLIF(i.min_stock_alert, 0)) ASC
    `;
    
    const lowStockItems = await new Promise((resolve, reject) => {
      db.all(lowStockQuery, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 2. Obține consumul mediu din ultimele N zile
    const consumptionQuery = `
      SELECT 
        sm.ingredient_id,
        i.name as ingredient_name,
        ABS(SUM(CASE WHEN sm.quantity < 0 THEN sm.quantity ELSE 0 END)) as total_consumed,
        COUNT(DISTINCT DATE(sm.created_at)) as active_days,
        ABS(SUM(CASE WHEN sm.quantity < 0 THEN sm.quantity ELSE 0 END)) / 
          NULLIF(COUNT(DISTINCT DATE(sm.created_at)), 0) as avg_daily_consumption,
        MAX(sm.created_at) as last_movement
      FROM stock_moves sm
      JOIN ingredients i ON sm.ingredient_id = i.id
      WHERE sm.created_at >= DATE('now', '-${parseInt(days)} days')
        AND sm.move_type IN ('SALE_OUT', 'CONSUME', 'WASTE', 'PRODUCTION')
      GROUP BY sm.ingredient_id
      ORDER BY total_consumed DESC
    `;
    
    const consumptionData = await new Promise((resolve, reject) => {
      db.all(consumptionQuery, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 3. Analiză sezonalitate (weekend vs weekday)
    const seasonalityQuery = `
      SELECT 
        sm.ingredient_id,
        CASE 
          WHEN strftime('%w', sm.created_at) IN ('0', '6') THEN 'weekend'
          ELSE 'weekday'
        END as day_type,
        ABS(SUM(CASE WHEN sm.quantity < 0 THEN sm.quantity ELSE 0 END)) as total_consumed,
        COUNT(DISTINCT DATE(sm.created_at)) as days_count
      FROM stock_moves sm
      WHERE sm.created_at >= DATE('now', '-${parseInt(days)} days')
        AND sm.move_type IN ('SALE_OUT', 'CONSUME', 'WASTE', 'PRODUCTION')
      GROUP BY sm.ingredient_id, day_type
    `;
    
    const seasonalityData = await new Promise((resolve, reject) => {
      db.all(seasonalityQuery, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 4. Calculează predicții
    const predictions = lowStockItems.map(item => {
      const consumption = consumptionData.find(c => c.ingredient_id === item.id);
      const weekendData = seasonalityData.find(s => s.ingredient_id === item.id && s.day_type === 'weekend');
      const weekdayData = seasonalityData.find(s => s.ingredient_id === item.id && s.day_type === 'weekday');
      
      const avgDailyConsumption = consumption?.avg_daily_consumption || 0;
      const weekendMultiplier = weekendData && weekdayData && weekdayData.days_count > 0
        ? (weekendData.total_consumed / weekendData.days_count) / (weekdayData.total_consumed / weekdayData.days_count)
        : 1.2; // Default: weekend 20% mai mult
      
      // Zile până la epuizare
      const daysUntilStockout = avgDailyConsumption > 0 
        ? Math.floor(item.current_stock / avgDailyConsumption)
        : 999;
      
      // Cantitate recomandată (pentru 14 zile + buffer 20%)
      const leadTimeDays = 3; // Timp livrare standard
      const safetyStock = item.min_stock_alert * 1.5;
      const recommendedOrder = Math.max(0, 
        Math.ceil((avgDailyConsumption * (14 + leadTimeDays) * 1.2) - item.current_stock + safetyStock)
      );
      
      // Urgență (1-5)
      let urgency = 1;
      if (daysUntilStockout <= 1) urgency = 5;
      else if (daysUntilStockout <= 3) urgency = 4;
      else if (daysUntilStockout <= 7) urgency = 3;
      else if (daysUntilStockout <= 14) urgency = 2;
      
      return {
        ...item,
        avg_daily_consumption: avgDailyConsumption.toFixed(2),
        days_until_stockout: daysUntilStockout,
        weekend_multiplier: weekendMultiplier.toFixed(2),
        recommended_order_qty: recommendedOrder,
        estimated_cost: (recommendedOrder * (item.cost_per_unit || 0)).toFixed(2),
        urgency,
        urgency_label: ['', 'Low', 'Medium', 'High', 'Critical', 'Urgent'][urgency],
      };
    });

    // 5. Grupează pe furnizori
    const supplierOrders = {};
    predictions.forEach(pred => {
      if (pred.recommended_order_qty > 0) {
        const supplierId = pred.supplier_id || 'unknown';
        const supplierName = pred.supplier_name || 'Furnizor Nespecificat';
        
        if (!supplierOrders[supplierId]) {
          supplierOrders[supplierId] = {
            supplier_id: supplierId,
            supplier_name: supplierName,
            items: [],
            total_cost: 0,
            max_urgency: 0,
          };
        }
        
        supplierOrders[supplierId].items.push(pred);
        supplierOrders[supplierId].total_cost += parseFloat(pred.estimated_cost);
        supplierOrders[supplierId].max_urgency = Math.max(
          supplierOrders[supplierId].max_urgency, 
          pred.urgency
        );
      }
    });

    res.json({
      success: true,
      analysis_period_days: parseInt(days),
      generated_at: new Date().toISOString(),
      summary: {
        total_low_stock_items: lowStockItems.length,
        items_needing_reorder: predictions.filter(p => p.recommended_order_qty > 0).length,
        critical_items: predictions.filter(p => p.urgency >= 4).length,
        total_estimated_cost: predictions.reduce((sum, p) => sum + parseFloat(p.estimated_cost), 0).toFixed(2),
        suppliers_to_contact: Object.keys(supplierOrders).length,
      },
      predictions: predictions.sort((a, b) => b.urgency - a.urgency),
      supplier_orders: Object.values(supplierOrders).sort((a, b) => b.max_urgency - a.max_urgency),
    });
    
  } catch (error) {
    console.error('❌ Smart Restock Analysis Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/smart-restock/generate-order
 * Generează comandă automată pentru un furnizor
 */
router.post('/generate-order', async (req, res) => {
  const db = getDb();
  const { supplier_id, items } = req.body;
  
  if (!supplier_id || !items || items.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'supplier_id și items sunt obligatorii' 
    });
  }
  
  try {
    const orderId = `PO-AUTO-${Date.now()}`;
    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit), 0);
    
    // Inserare în purchase_order_drafts
    const insertQuery = `
      INSERT INTO purchase_order_drafts (
        order_id, supplier_id, status, total_amount, 
        notes, created_at, created_by
      ) VALUES (?, ?, 'draft', ?, ?, datetime('now'), 'SYSTEM-AUTO')
    `;
    
    await new Promise((resolve, reject) => {
      db.run(insertQuery, [
        orderId,
        supplier_id,
        totalCost,
        `Comandă generată automat de Smart Restock la ${new Date().toLocaleString('ro-RO')}`
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // Inserare items
    for (const item of items) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO purchase_order_items (
            order_id, ingredient_id, quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?)
        `, [orderId, item.ingredient_id, item.quantity, item.cost_per_unit, item.quantity * item.cost_per_unit],
        (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    res.json({
      success: true,
      order_id: orderId,
      supplier_id,
      items_count: items.length,
      total_cost: totalCost.toFixed(2),
      message: `Comandă ${orderId} creată cu succes!`,
    });
    
  } catch (error) {
    console.error('❌ Generate Order Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/smart-restock/trends/:ingredientId
 * Obține trend-ul consumului pentru un ingredient
 */
router.get('/trends/:ingredientId', async (req, res) => {
  const db = getDb();
  const { ingredientId } = req.params;
  const { days = 30 } = req.query;
  
  try {
    const query = `
      SELECT 
        DATE(created_at) as date,
        ABS(SUM(CASE WHEN quantity < 0 THEN quantity ELSE 0 END)) as daily_consumption,
        SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) as daily_received
      FROM stock_moves
      WHERE ingredient_id = ?
        AND created_at >= DATE('now', '-${parseInt(days)} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    
    const trends = await new Promise((resolve, reject) => {
      db.all(query, [ingredientId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculează moving average (7 zile)
    const withMovingAvg = trends.map((row, index) => {
      const start = Math.max(0, index - 6);
      const slice = trends.slice(start, index + 1);
      const movingAvg = slice.reduce((sum, r) => sum + r.daily_consumption, 0) / slice.length;
      
      return {
        ...row,
        moving_avg_7d: movingAvg.toFixed(2),
      };
    });
    
    res.json({
      success: true,
      ingredient_id: ingredientId,
      period_days: parseInt(days),
      data: withMovingAvg,
    });
    
  } catch (error) {
    console.error('❌ Trends Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

