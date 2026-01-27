// server/src/modules/financial/financial.routes.js
/**
 * S15 - Financial Reports API Routes
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
    
    res.json(summary || {});
  } catch (err) {
    console.error("Error in /api/financial/daily-summary:", err);
    // Returnează obiect gol în loc de 500 pentru a preveni crash-ul paginii
    res.json({});
  }
});

// GET /api/financial/pnl?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/pnl", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    console.log(`📊 [Financial PNL Route] Request received: dateFrom=${dateFrom}, dateTo=${dateTo}`);
    
    const pnl = await financialService.getPnl({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    
    console.log(`📊 [Financial PNL Route] PNL result:`, pnl);
    res.json(pnl || {});
  } catch (err) {
    console.error("❌ Error in /api/financial/pnl:", err);
    console.error("❌ Error stack:", err.stack);
    // Returnează obiect gol în loc de 500 pentru a preveni crash-ul paginii
    res.json({});
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
    
    res.json(cashflow || {});
  } catch (err) {
    console.error("Error in /api/financial/cashflow:", err);
    // Returnează obiect gol în loc de 500 pentru a preveni crash-ul paginii
    res.json({});
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
    
    res.json(categoryMix || {});
  } catch (err) {
    console.error("Error in /api/financial/category-mix:", err);
    // Returnează obiect gol în loc de 500 pentru a preveni crash-ul paginii
    res.json({});
  }
});

module.exports = router;

