const express = require('express');
const router = express.Router();

// Demo data
const dailyRevenue = [42000, 38500, 51200, 47800, 55000, 62000, 58900];
const dailyCosts = [18000, 16500, 21000, 20000, 23000, 26000, 24500];

function generatePL(period) {
  const revenue = dailyRevenue.reduce((a, b) => a + b, 0);
  const cogs = dailyCosts.reduce((a, b) => a + b, 0);
  const grossProfit = revenue - cogs;
  const labor = revenue * 0.28;
  const overhead = revenue * 0.15;
  const ebitda = grossProfit - labor - overhead;
  return {
    period,
    revenue,
    cogs,
    grossProfit,
    grossMargin: ((grossProfit / revenue) * 100).toFixed(1) + '%',
    labor,
    overhead,
    ebitda,
    ebitdaMargin: ((ebitda / revenue) * 100).toFixed(1) + '%',
    netProfit: ebitda * 0.8,
    netMargin: ((ebitda * 0.8 / revenue) * 100).toFixed(1) + '%',
  };
}

// GET /api/financial/pl - Daily P&L auto-generated
router.get('/pl', (req, res) => {
  const period = req.query.period || new Date().toISOString().split('T')[0];
  res.json(generatePL(period));
});

// GET /api/financial/pl/weekly - Weekly P&L
router.get('/pl/weekly', (req, res) => {
  const days = dailyRevenue.map((rev, i) => {
    const cost = dailyCosts[i];
    const gp = rev - cost;
    const date = new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0];
    return { date, revenue: rev, cogs: cost, grossProfit: gp, grossMargin: ((gp / rev) * 100).toFixed(1) + '%' };
  });
  res.json({ days, summary: generatePL('weekly') });
});

// GET /api/financial/cash-reconciliation - Cash reconciliation AI
router.get('/cash-reconciliation', (req, res) => {
  const expected = 15420.50;
  const actual = 15398.75;
  const discrepancy = actual - expected;
  res.json({
    date: new Date().toISOString().split('T')[0],
    expectedCash: expected,
    actualCash: actual,
    discrepancy: discrepancy.toFixed(2),
    discrepancyPct: ((Math.abs(discrepancy) / expected) * 100).toFixed(2) + '%',
    status: Math.abs(discrepancy) < 50 ? 'OK' : 'ALERT',
    aiInsight: Math.abs(discrepancy) < 50 ? 'Normal variance within tolerance' : 'Significant discrepancy detected - review required',
  });
});

// GET /api/financial/cogs - COGS live tracking
router.get('/cogs', (req, res) => {
  const categories = [
    { category: 'Food - Meat', cogs: 8500, revenueShare: 0.42, target: 0.38, alert: true },
    { category: 'Food - Vegetables', cogs: 2100, revenueShare: 0.10, target: 0.12, alert: false },
    { category: 'Beverages', cogs: 3200, revenueShare: 0.16, target: 0.18, alert: false },
    { category: 'Packaging', cogs: 1100, revenueShare: 0.05, target: 0.04, alert: true },
  ];
  const totalRevenue = dailyRevenue[dailyRevenue.length - 1];
  res.json({ date: new Date().toISOString().split('T')[0], totalRevenue, categories });
});

// GET /api/financial/ebitda-projection - EBITDA projection live
router.get('/ebitda-projection', (req, res) => {
  const current = generatePL('current');
  res.json({
    currentEbitda: current.ebitda,
    projectedMonthly: current.ebitda * 4.3,
    projectedAnnual: current.ebitda * 52,
    growthRate: '+8.5%',
    trend: 'POSITIVE',
    scenarios: {
      pessimistic: (current.ebitda * 52 * 0.85).toFixed(0),
      base: (current.ebitda * 52).toFixed(0),
      optimistic: (current.ebitda * 52 * 1.15).toFixed(0),
    },
  });
});

// GET /api/financial/tax-forecast - Tax liability forecast
router.get('/tax-forecast', (req, res) => {
  const annualRevenue = dailyRevenue.reduce((a, b) => a + b, 0) * 52;
  const vatLiability = annualRevenue * 0.19;
  const corporateTax = annualRevenue * 0.16 * 0.1;
  res.json({
    period: new Date().getFullYear(),
    annualRevenue: annualRevenue.toFixed(0),
    vatLiability: vatLiability.toFixed(0),
    vatRate: '19%',
    corporateTax: corporateTax.toFixed(0),
    totalTaxLiability: (vatLiability + corporateTax).toFixed(0),
    nextPaymentDue: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });
});

// GET /api/financial/accruals - Accrual tracking
router.get('/accruals', (req, res) => {
  res.json({
    accruals: [
      { item: 'Staff salaries - March', amount: 45000, dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], status: 'PENDING' },
      { item: 'Rent Q1', amount: 12000, dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], status: 'PENDING' },
      { item: 'Supplier invoices', amount: 8500, dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], status: 'PENDING' },
    ],
    totalAccrued: 65500,
  });
});

module.exports = router;
