// server/src/modules/cogs/cogs.routes.js
/**
 * S13 — COGS API Routes
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

    res.json(report);
  } catch (err) {
    console.error("Error in /api/cogs/product-profitability:", err);
    res.status(500).json({ error: "Eroare la generarea raportului." });
  }
});

// GET /api/cogs/category-profitability?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/category-profitability", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const report = await cogsReporting.getCategoryProfitabilityReport({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    });

    res.json(report);
  } catch (err) {
    console.error("Error in /api/cogs/category-profitability:", err);
    res.status(500).json({ error: "Eroare la generarea raportului." });
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

    res.json(summary);
  } catch (err) {
    console.error("Error in /api/cogs/daily-summary:", err);
    res.status(500).json({ error: "Eroare la generarea sumarului zilnic." });
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

module.exports = router;

