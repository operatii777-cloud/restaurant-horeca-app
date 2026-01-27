/**
 * Menu Engineering API Routes
 * Analiză profitabilitate produse: Stars, Puzzles, Plowhorses, Dogs
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

// Import TVA Service pentru calcularea taxelor
let TVAService = null;
try {
  TVAService = require('../src/modules/tva/tva.service');
} catch (e) {
  console.warn('[Menu Engineering] TVA Service not available, using default 21% VAT');
}

// GET /api/menu-engineering/analysis
// Generează analiza Menu Engineering pentru o perioadă
router.get('/analysis', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const db = await dbPromise;
    
    // Default la ultimele 30 zile
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    
    // Query pentru date vânzări și costuri
    let sql = `
      SELECT 
        m.id as product_id,
        m.name as product_name,
        m.category,
        m.price as selling_price,
        COALESCE(SUM(json_extract(oi.value, '$.quantity')), 0) as quantity_sold,
        COALESCE(SUM(json_extract(oi.value, '$.quantity') * m.price), 0) as revenue,
        COALESCE(
          (SELECT SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0))
           FROM recipes r 
           LEFT JOIN ingredients i ON r.ingredient_id = i.id 
           WHERE r.product_id = m.id),
          0
        ) as food_cost_per_unit
      FROM menu m
      LEFT JOIN orders o ON o.status IN ('paid', 'completed', 'delivered')
        AND date(o.created_at) BETWEEN ? AND ?
      LEFT JOIN json_each(o.items) oi ON json_extract(oi.value, '$.productId') = m.id
        OR json_extract(oi.value, '$.product_id') = m.id
        OR json_extract(oi.value, '$.id') = m.id
      WHERE m.is_sellable = 1
    `;
    
    const params = [start, end];
    
    if (category && category !== 'all') {
      sql += ` AND m.category = ?`;
      params.push(category);
    }
    
    sql += ` GROUP BY m.id ORDER BY revenue DESC`;
    
    const products = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculează metrici
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity_sold, 0);
    const avgQuantity = totalQuantity / (products.filter(p => p.quantity_sold > 0).length || 1);
    
    // Calculează metrici cu corecție pentru taxe/TVA
    const productMetrics = await Promise.all(products.map(async (p) => {
      const foodCost = p.food_cost_per_unit * p.quantity_sold;
      
      // CORECTARE: Calculare Contribution Margin cu taxe/TVA
      // Formula corectă: CM = (Preț Vânzare - Taxe/TVA) - Food Cost Real
      let vatRate = 21; // Default 21% dacă TVA Service nu e disponibil
      const orderDate = new Date(end); // Folosim data de sfârșit a perioadei
      
      if (TVAService && typeof TVAService.getVatRateForProduct === 'function') {
        try {
          vatRate = await TVAService.getVatRateForProduct(p.product_id, orderDate);
        } catch (e) {
          console.warn(`[Menu Engineering] Error getting VAT rate for product ${p.product_id}, using default 21%`);
        }
      }
      
      // Calculare preț după taxe
      const vatAmountPerUnit = (p.selling_price * vatRate) / 100;
      const priceAfterTax = p.selling_price - vatAmountPerUnit;
      
      // Contribution Margin per unit (după taxe)
      const cmPerUnit = priceAfterTax - p.food_cost_per_unit;
      
      // Contribution Margin total
      const contributionMargin = (cmPerUnit * p.quantity_sold);
      
      // Revenue după taxe (pentru calculare corectă)
      const revenueAfterTax = (priceAfterTax * p.quantity_sold);
      
      // CM Percentage bazat pe prețul după taxe
      const cmPercentage = priceAfterTax > 0 ? (cmPerUnit / priceAfterTax) * 100 : 0;
      
      return {
        ...p,
        food_cost: foodCost,
        contribution_margin: contributionMargin,
        cm_per_unit: cmPerUnit,
        cm_percentage: cmPercentage,
        vat_rate: vatRate,
        price_after_tax: priceAfterTax,
        revenue_after_tax: revenueAfterTax,
        // Păstrăm și revenue-ul original pentru referință
        revenue_original: p.revenue
      };
    }));
    
    // Calculează medii pentru clasificare
    const avgCM = productMetrics.reduce((sum, p) => sum + p.cm_per_unit, 0) / (productMetrics.length || 1);
    
    // Clasifică produsele
    const classifiedProducts = productMetrics.map(p => {
      const isPopular = p.quantity_sold >= avgQuantity;
      const isProfitable = p.cm_per_unit >= avgCM;
      
      let classification, recommendation;
      
      if (isPopular && isProfitable) {
        classification = 'star';
        recommendation = 'Menține poziția premium. Nu modifica prețul. Promovează activ.';
      } else if (!isPopular && isProfitable) {
        classification = 'puzzle';
        recommendation = 'Crește vizibilitatea în meniu. Antrenează personalul să recomande. Consideră reducerea prețului.';
      } else if (isPopular && !isProfitable) {
        classification = 'plowhorse';
        recommendation = 'Crește prețul treptat. Reduce costurile ingredientelor. Redu porția sau schimbă rețeta.';
      } else {
        classification = 'dog';
        recommendation = 'Consideră eliminarea din meniu sau rebranding complet. Analizează dacă atrage clienți.';
      }
      
      return {
        ...p,
        classification,
        recommendation,
        popularity_index: avgQuantity > 0 ? (p.quantity_sold / avgQuantity) * 100 : 0,
        profitability_index: avgCM > 0 ? (p.cm_per_unit / avgCM) * 100 : 0
      };
    });
    
    // Statistici sumare
    const summary = {
      period: { start, end },
      total_products: classifiedProducts.length,
      total_revenue: classifiedProducts.reduce((sum, p) => sum + p.revenue, 0),
      total_food_cost: classifiedProducts.reduce((sum, p) => sum + p.food_cost, 0),
      total_contribution: classifiedProducts.reduce((sum, p) => sum + p.contribution_margin, 0),
      avg_food_cost_percent: 0,
      classification_counts: {
        star: classifiedProducts.filter(p => p.classification === 'star').length,
        puzzle: classifiedProducts.filter(p => p.classification === 'puzzle').length,
        plowhorse: classifiedProducts.filter(p => p.classification === 'plowhorse').length,
        dog: classifiedProducts.filter(p => p.classification === 'dog').length
      }
    };
    
    summary.avg_food_cost_percent = summary.total_revenue > 0 
      ? (summary.total_food_cost / summary.total_revenue) * 100 
      : 0;
    
    res.json({
      success: true,
      summary,
      products: classifiedProducts,
      thresholds: {
        avg_quantity: avgQuantity,
        avg_contribution_margin: avgCM
      }
    });
    
  } catch (error) {
    console.error('Menu Engineering error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/menu-engineering/snapshot
// Salvează un snapshot pentru istoric
router.post('/snapshot', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const db = await dbPromise;
    
    // Creează snapshot
    const snapshotResult = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO menu_engineering_snapshots (snapshot_date, period_start, period_end)
        VALUES (date('now'), ?, ?)
      `, [startDate, endDate], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    // Obține analiza
    const analysisResponse = await fetch(`http://localhost:${process.env.PORT || 3000}/api/menu-engineering/analysis?startDate=${startDate}&endDate=${endDate}`);
    const analysis = await analysisResponse.json();
    
    // Salvează itemele
    if (analysis.success && analysis.products) {
      for (const product of analysis.products) {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO menu_engineering_items 
            (snapshot_id, product_id, product_name, category, quantity_sold, revenue, 
             food_cost, contribution_margin, cm_percentage, popularity_index, 
             profitability_index, classification, recommendation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            snapshotResult.id, product.product_id, product.product_name, product.category,
            product.quantity_sold, product.revenue, product.food_cost, product.contribution_margin,
            product.cm_percentage, product.popularity_index, product.profitability_index,
            product.classification, product.recommendation
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    res.json({ success: true, snapshotId: snapshotResult.id });
    
  } catch (error) {
    console.error('Snapshot error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/menu-engineering/snapshots
// Listează snapshot-urile anterioare
router.get('/snapshots', async (req, res) => {
  try {
    const db = await dbPromise;
    
    const snapshots = await new Promise((resolve, reject) => {
      db.all(`
        SELECT s.*, 
          (SELECT COUNT(*) FROM menu_engineering_items WHERE snapshot_id = s.id) as item_count,
          (SELECT SUM(revenue) FROM menu_engineering_items WHERE snapshot_id = s.id) as total_revenue
        FROM menu_engineering_snapshots s
        ORDER BY s.created_at DESC
        LIMIT 20
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, snapshots });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/menu-engineering/snapshot/:id
// Detalii snapshot
router.get('/snapshot/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const snapshot = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM menu_engineering_snapshots WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!snapshot) {
      return res.status(404).json({ success: false, error: 'Snapshot not found' });
    }
    
    const items = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM menu_engineering_items WHERE snapshot_id = ? ORDER BY revenue DESC', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, snapshot, items });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

