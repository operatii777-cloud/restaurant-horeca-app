// server/src/modules/cogs/cogs.routes.js
/**
 * S13 - COGS API Routes
 * 
 * Endpoint-uri REST pentru Admin-Vite (dashboard profitabilitate)
 */

const express = require("express");
const router = express.Router();

const cogsReporting = require("./cogs.reporting");
const cogsSync = require("./cogs.sync.service");

// GET /api/cogs/product-profitability?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&category=Pizza&limit=50
router.get("/product-profitability", async (req, res) => {
  try {
    const { dateFrom, dateTo, category, limit } = req.query;

    const report = await cogsReporting.getProductProfitabilityReport({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      categoryCode: category || undefined,
      limit: limit ? Number(limit) : undefined
    });

    res.json(Array.isArray(report) ? report : []);
  } catch (err) {
    console.error("Error in /api/cogs/product-profitability:", err);
    // Returnează array gol în loc de 500 pentru a preveni crash-ul paginii
    res.json([]);
  }
});

// GET /api/cogs/category-profitability?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/category-profitability", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    console.log(`🔍 [COGS] Category profitability request: dateFrom=${dateFrom}, dateTo=${dateTo}`);

    const report = await cogsReporting.getCategoryProfitabilityReport({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    });

    console.log(`📊 [COGS] Report structure:`, {
      hasCategories: !!report?.categories,
      categoriesCount: report?.categories?.length || 0,
      totalRevenue: report?.totalRevenue,
      totalCogs: report?.totalCogs
    });

    // getCategoryProfitabilityReport returnează un obiect cu { categories, totalRevenue, ... }
    // Trebuie să returnăm doar array-ul de categorii
    const categories = report?.categories || [];
    
    // Transformă datele în formatul așteptat de frontend
    const formattedCategories = categories.map((cat) => ({
      categoryCode: (cat.category || '').toLowerCase().replace(/\s+/g, '-'),
      categoryName: cat.category || 'Other',
      revenue: cat.revenue || 0,
      cogsTotal: cat.cogsTotal || 0,
      profit: cat.profit || 0,
      foodCostPercent: cat.foodCostPercent || null,
      marginPercent: cat.marginPercent || null,
    }));

    console.log(`✅ [COGS] Category profitability: ${formattedCategories.length} categorii`);
    if (formattedCategories.length > 0) {
      console.log(`📋 [COGS] Primele 3 categorii:`, formattedCategories.slice(0, 3).map(c => c.categoryName));
    } else {
      console.warn(`⚠️ [COGS] Nu există categorii pentru perioada selectată`);
    }
    
    res.json(formattedCategories);
  } catch (err) {
    console.error("❌ [COGS] Error in /api/cogs/category-profitability:", err);
    console.error("❌ [COGS] Stack:", err.stack);
    // Returnează array gol în loc de 500 pentru a preveni crash-ul paginii
    res.json([]);
  }
});

// GET /api/cogs/daily-summary?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/daily-summary", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const summary = await cogsReporting.getDailyCogsSummary({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    });

    res.json(Array.isArray(summary) ? summary : []);
  } catch (err) {
    console.error("Error in /api/cogs/daily-summary:", err);
    // Returnează array gol în loc de 500 pentru a preveni crash-ul paginii
    res.json([]);
  }
});

// POST /api/cogs/sync-all
router.post("/sync-all", async (req, res) => {
  try {
    const result = await cogsSync.syncCogsForAllProducts();
    res.json(result);
  } catch (err) {
    console.error("Error in /api/cogs/sync-all:", err);
    res.status(500).json({ error: "Eroare la sincronizarea COGS." });
  }
});

// POST /api/cogs/sync/:productId
router.post("/sync/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: "ID produs invalid." });
    }

    const result = await cogsSync.syncCogsForProduct(productId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error(`Error in /api/cogs/sync/${req.params.productId}:`, err);
    res.status(500).json({ error: "Eroare la sincronizarea COGS." });
  }
});

// GET /api/cogs/calculate - Calculate COGS for a period or product
router.get("/calculate", async (req, res) => {
  try {
    const { dateFrom, dateTo, productId } = req.query;

    if (productId) {
      // Calculate COGS for specific product
      const productIdNum = Number(productId);
      if (!productIdNum || isNaN(productIdNum)) {
        return res.status(400).json({ error: "ID produs invalid." });
      }

      const result = await cogsSync.syncCogsForProduct(productIdNum);
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json({
        success: true,
        product_id: productIdNum,
        cogs: result.cogs || 0,
        message: "COGS calculated successfully"
      });
    } else {
      // Calculate COGS summary for period
      const summary = await cogsReporting.getDailyCogsSummary({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      });

      const totals = Array.isArray(summary) ? summary.reduce((acc, day) => {
        acc.total_revenue += parseFloat(day.revenue || 0);
        acc.total_cogs += parseFloat(day.cogsTotal || 0);
        acc.total_profit += parseFloat(day.profit || 0);
        return acc;
      }, { total_revenue: 0, total_cogs: 0, total_profit: 0 }) : { total_revenue: 0, total_cogs: 0, total_profit: 0 };

      res.json({
        success: true,
        period: { dateFrom: dateFrom || null, dateTo: dateTo || null },
        totals,
        days: summary || [],
        message: "COGS calculated successfully"
      });
    }
  } catch (err) {
    console.error("Error in /api/cogs/calculate:", err);
    res.status(500).json({ error: "Eroare la calcularea COGS." });
  }
});

module.exports = router;

