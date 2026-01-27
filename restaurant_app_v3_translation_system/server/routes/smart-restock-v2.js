/**
 * 🤖 SMART RESTOCK V2 - ML-based restock bazat pe produse best-seller
 * 
 * Logică:
 * 1. Analizează top produse vândute (ultimele 30-90 zile)
 * 2. Calculează ingredientele necesare pentru acele produse
 * 3. Predicție consum viitor bazat pe trend vânzări
 * 4. Propuneri reaprovizionare ÎNAINTE de epuizare stoc
 * 
 * ENTERPRISE TODO (PHASE E5): This route will be migrated to src/modules/smart-restock/routes.js
 */

const express = require('express');
const router = express.Router();

const getDb = () => {
  try {
    const { getDbConnection } = require('../database');
    return getDbConnection();
  } catch (e) {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, '../restaurant.db');
    return new sqlite3.Database(dbPath);
  }
};

/**
 * GET /api/smart-restock-v2/analysis
 * Analiză inteligentă bazată pe produse best-seller
 */
router.get('/analysis', async (req, res) => {
  const db = getDb();
  const { days = 30, forecast_days = 14 } = req.query;
  
  try {
    console.log(`🤖 Smart Restock V2 - Analiză pentru ${days} zile, predicție ${forecast_days} zile`);
    
    // 1. IDENTIFICĂ PRODUSELE BEST-SELLER
    const bestSellersQuery = `
      SELECT 
        json_extract(item.value, '$.productId') as product_id,
        json_extract(item.value, '$.name') as product_name,
        COUNT(*) as order_count,
        SUM(json_extract(item.value, '$.quantity')) as total_quantity_sold,
        AVG(json_extract(item.value, '$.quantity')) as avg_quantity_per_order
      FROM orders o
      CROSS JOIN json_each(o.items) item
      WHERE o.status IN ('paid', 'completed', 'delivered')
        AND o.timestamp >= DATETIME('now', '-' || ? || ' days')
        AND json_extract(item.value, '$.productId') IS NOT NULL
      GROUP BY json_extract(item.value, '$.productId')
      ORDER BY total_quantity_sold DESC
      LIMIT 50
    `;
    
    const daysInt = parseInt(days) || 30;
    
    const bestSellers = await new Promise((resolve, reject) => {
      db.all(bestSellersQuery, [daysInt], (err, rows) => {
        if (err) {
          console.error('❌ Best sellers query error:', err);
          reject(err);
        } else resolve(rows || []);
      });
    });
    
    console.log(`   ✓ Găsite ${bestSellers.length} produse best-seller`);
    
    // EARLY RETURN dacă nu sunt produse
    if (bestSellers.length === 0) {
      return res.json({
        success: true,
        summary: {
          analysis_period_days: parseInt(days) || 30,
          forecast_period_days: parseInt(forecast_days) || 14,
          generated_at: new Date().toISOString(),
          best_sellers_count: 0,
          total_ingredients_analyzed: 0,
          items_needing_reorder: 0,
          critical_items: 0,
          total_estimated_cost: '0.00',
          suppliers_to_contact: 0
        },
        top_products: [],
        predictions: [],
        supplier_orders: [],
        message: 'Nu există comenzi în perioada selectată.'
      });
    }
    
    // 2. PENTRU FIECARE PRODUS, CALCULEAZĂ INGREDIENTELE NECESARE
    const ingredientDemand = {};
    
    for (const product of bestSellers) {
      const productId = product.product_id;
      
      // Obține rețeta pentru produs
      // FIX: recipes table structure poate varia - folosim recipe_ingredients
      const recipeQuery = `
        SELECT 
          ri.ingredient_id,
          i.name as ingredient_name,
          COALESCE(ri.quantity_net, ri.quantity, 0) as quantity_needed,
          i.unit,
          COALESCE(i.current_stock, 0) as current_stock,
          COALESCE(i.min_stock_alert, 10) as min_stock_alert,
          COALESCE(i.cost_per_unit, i.purchase_price, 0) as cost_per_unit,
          i.supplier_id,
          s.name as supplier_name
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        JOIN ingredients i ON ri.ingredient_id = i.id
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        WHERE r.product_id = ?
      `;
      
      const ingredients = await new Promise((resolve, reject) => {
        db.all(recipeQuery, [productId], (err, rows) => {
          if (err) {
            console.error(`❌ Recipe query error for product ${productId}:`, err);
            resolve([]); // Continue with empty array instead of crashing
          } else resolve(rows || []);
        });
      });
      
      // Calculează nevoia pentru fiecare ingredient
      for (const ing of ingredients) {
        if (!ingredientDemand[ing.ingredient_id]) {
          ingredientDemand[ing.ingredient_id] = {
            ingredient_id: ing.ingredient_id,
            ingredient_name: ing.ingredient_name,
            unit: ing.unit,
            current_stock: ing.current_stock,
            min_stock_alert: ing.min_stock_alert || 10,
            cost_per_unit: ing.cost_per_unit || 0,
            supplier_id: ing.supplier_id,
            supplier_name: ing.supplier_name,
            total_demand_past: 0,
            products_using: [],
            daily_consumption: 0
          };
        }
        
        // Adaugă consumul pentru acest ingredient
        const consumption = ing.quantity_needed * product.total_quantity_sold;
        ingredientDemand[ing.ingredient_id].total_demand_past += consumption;
        ingredientDemand[ing.ingredient_id].products_using.push({
          product_name: product.product_name,
          quantity_sold: product.total_quantity_sold,
          quantity_needed_per_unit: ing.quantity_needed
        });
      }
    }
    
    console.log(`   ✓ Analizate ${Object.keys(ingredientDemand).length} ingrediente unice`);
    
    // 3. CALCULEAZĂ PREDICȚII ȘI RECOMANDĂRI
    const predictions = Object.values(ingredientDemand).map(ing => {
      // Consum zilnic mediu (bazat pe istoric)
      const dailyConsumption = ing.total_demand_past / parseInt(days);
      ing.daily_consumption = dailyConsumption;
      
      // Consum estimat pentru următoarele N zile
      const forecastDays = parseInt(forecast_days);
      const estimatedConsumption = dailyConsumption * forecastDays;
      
      // Zile până la epuizare
      const daysUntilStockout = dailyConsumption > 0 
        ? Math.floor(ing.current_stock / dailyConsumption)
        : 999;
      
      // Cantitate recomandată
      // Formula: (Consum estimat + Buffer 20% + Safety stock) - Stoc curent
      const safetyStock = ing.min_stock_alert * 1.5;
      const buffer = estimatedConsumption * 0.2;
      const recommendedOrder = Math.max(0, 
        Math.ceil(estimatedConsumption + buffer + safetyStock - ing.current_stock)
      );
      
      // Urgență (1-5)
      let urgency = 1;
      let urgencyLabel = 'Low';
      let urgencyColor = '#22c55e';
      
      if (daysUntilStockout <= 1) {
        urgency = 5;
        urgencyLabel = 'URGENT';
        urgencyColor = '#ef4444';
      } else if (daysUntilStockout <= 3) {
        urgency = 4;
        urgencyLabel = 'Critical';
        urgencyColor = '#f97316';
      } else if (daysUntilStockout <= 7) {
        urgency = 3;
        urgencyLabel = 'High';
        urgencyColor = '#f59e0b';
      } else if (daysUntilStockout <= 14) {
        urgency = 2;
        urgencyLabel = 'Medium';
        urgencyColor = '#3b82f6';
      }
      
      return {
        ...ing,
        daily_consumption: dailyConsumption.toFixed(2),
        estimated_consumption_forecast: estimatedConsumption.toFixed(2),
        days_until_stockout: daysUntilStockout,
        recommended_order_qty: recommendedOrder,
        estimated_cost: (recommendedOrder * ing.cost_per_unit).toFixed(2),
        urgency,
        urgency_label: urgencyLabel,
        urgency_color: urgencyColor,
        stock_coverage_days: daysUntilStockout,
        products_count: ing.products_using.length
      };
    });
    
    // 4. GRUPEAZĂ PE FURNIZORI
    const supplierOrders = {};
    
    predictions
      .filter(p => p.recommended_order_qty > 0)
      .forEach(pred => {
        const supplierId = pred.supplier_id || 'unknown';
        const supplierName = pred.supplier_name || 'Furnizor Nespecificat';
        
        if (!supplierOrders[supplierId]) {
          supplierOrders[supplierId] = {
            supplier_id: supplierId,
            supplier_name: supplierName,
            items: [],
            total_cost: 0,
            max_urgency: 0,
            total_items: 0
          };
        }
        
        supplierOrders[supplierId].items.push(pred);
        supplierOrders[supplierId].total_cost += parseFloat(pred.estimated_cost);
        supplierOrders[supplierId].max_urgency = Math.max(
          supplierOrders[supplierId].max_urgency,
          pred.urgency
        );
        supplierOrders[supplierId].total_items++;
      });
    
    // 5. REZUMAT ȘI INSIGHTS
    const summary = {
      analysis_period_days: parseInt(days),
      forecast_period_days: parseInt(forecast_days),
      generated_at: new Date().toISOString(),
      best_sellers_count: bestSellers.length,
      total_ingredients_analyzed: predictions.length,
      items_needing_reorder: predictions.filter(p => p.recommended_order_qty > 0).length,
      critical_items: predictions.filter(p => p.urgency >= 4).length,
      total_estimated_cost: predictions.reduce((sum, p) => sum + parseFloat(p.estimated_cost), 0).toFixed(2),
      suppliers_to_contact: Object.keys(supplierOrders).length
    };
    
    // Top 3 produse best-seller
    const topProducts = bestSellers.slice(0, 3).map(p => ({
      product_name: p.product_name,
      total_sold: p.total_quantity_sold,
      daily_average: (p.total_quantity_sold / parseInt(days)).toFixed(1)
    }));
    
    res.json({
      success: true,
      summary,
      top_products: topProducts,
      predictions: predictions.sort((a, b) => b.urgency - a.urgency),
      supplier_orders: Object.values(supplierOrders).sort((a, b) => b.max_urgency - a.max_urgency)
    });
    
  } catch (error) {
    console.error('❌ Smart Restock V2 Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/smart-restock-v2/generate-order
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
    const { dbPromise } = require('../database');
    const mainDb = await dbPromise;
    
    // Verifică dacă există tabela purchase_order_drafts
    const tableExists = await new Promise((resolve, reject) => {
      mainDb.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='purchase_order_drafts'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
    
    if (!tableExists) {
      return res.status(500).json({
        success: false,
        error: 'Tabela purchase_order_drafts nu există. Rulează migrația pentru Auto Purchase Orders.'
      });
    }
    
    const orderId = `PO-SMART-${Date.now()}`;
    const totalCost = items.reduce((sum, item) => sum + (item.recommended_order_qty * item.cost_per_unit), 0);
    
    // Inserare comandă
    const result = await new Promise((resolve, reject) => {
      mainDb.run(`
        INSERT INTO purchase_order_drafts (
          supplier_id, status, total_value, auto_generated, notes, created_at
        ) VALUES (?, 'draft', ?, 1, ?, datetime('now'))
      `, [
        supplier_id,
        totalCost,
        `Comandă generată automat de Smart Restock V2 bazată pe produse best-seller. Analiză: ${items.length} ingrediente.`
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    // Inserare items
    for (const item of items) {
      await new Promise((resolve, reject) => {
        mainDb.run(`
          INSERT INTO purchase_order_items (
            order_id, ingredient_id, quantity, unit, notes
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          result.id,
          item.ingredient_id,
          item.recommended_order_qty,
          item.unit,
          `Urgență: ${item.urgency_label} | Consum zilnic: ${item.daily_consumption} ${item.unit}`
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    res.json({
      success: true,
      order_id: orderId,
      db_order_id: result.id,
      supplier_id,
      items_count: items.length,
      total_cost: totalCost.toFixed(2),
      message: `Comandă ${orderId} creată cu succes!`
    });
    
  } catch (error) {
    console.error('❌ Generate Order Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

