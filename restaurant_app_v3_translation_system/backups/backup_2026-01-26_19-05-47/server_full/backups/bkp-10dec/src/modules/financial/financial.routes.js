// server/src/modules/financial/financial.routes.js
/**
 * S15 — Financial Reports API Routes
 * 
 * Endpoint-uri REST pentru rapoarte financiare complete:
 * - Daily Summary (bazat pe S13 COGS)
 * - P&L (Profit & Loss)
 * - Cashflow
 * - Category Mix
 */

const express = require("express");
const router = express.Router();
const financialService = require("./financial.service");

// GET /api/financial/daily-summary?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/daily-summary", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const summary = await financialService.getDailySummary({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    
    res.json(summary);
  } catch (err) {
    console.error("Error in /api/financial/daily-summary:", err);
    res.status(500).json({ error: "Eroare la generarea sumarului zilnic." });
  }
});

// GET /api/financial/pnl?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/pnl", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const pnl = await financialService.getPnl({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    
    res.json(pnl);
  } catch (err) {
    console.error("Error in /api/financial/pnl:", err);
    res.status(500).json({ error: "Eroare la generarea raportului P&L." });
  }
});

// GET /api/financial/cashflow?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/cashflow", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const cashflow = await financialService.getCashflow({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    
    res.json(cashflow);
  } catch (err) {
    console.error("Error in /api/financial/cashflow:", err);
    res.status(500).json({ error: "Eroare la generarea raportului cashflow." });
  }
});

// GET /api/financial/category-mix?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/category-mix", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const categoryMix = await financialService.getCategoryMix({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    
    res.json(categoryMix);
  } catch (err) {
    console.error("Error in /api/financial/category-mix:", err);
    res.status(500).json({ error: "Eroare la generarea raportului category mix." });
  }
});

module.exports = router;

