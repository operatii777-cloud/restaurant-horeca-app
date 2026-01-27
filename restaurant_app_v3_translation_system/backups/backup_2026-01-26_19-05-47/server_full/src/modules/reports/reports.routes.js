/**
 * REPORTS ROUTES
 * Advanced reporting endpoints
 */

const express = require('express');
const router = express.Router();
const controller = require('./reports.controller');

// Lost & Found Reports (PDF generation)
const lostfoundReportsRouter = require('../../../routes/lostfound-reports');
router.use('/lostfound', lostfoundReportsRouter);

// Delivery Performance Report
router.get('/delivery-performance', controller.getDeliveryPerformanceReport);

// Drive-Thru Performance Report
router.get('/drive-thru-performance', controller.getDriveThruPerformanceReport);

// Reports endpoints
router.get('/customer-behavior', controller.getCustomerBehaviorReport);
router.get('/profitability', controller.getProfitabilityReport);
router.get('/sales-detailed', controller.getSalesDetailedReport);
router.get('/time-trends', controller.getTimeTrendsReport);
router.get('/stock-prediction', controller.getStockPredictionReport);
router.get('/abc-analysis', controller.getABCAnalysisReport);
// Alias pentru compatibilitate - redirectează către /api/financial/pnl
router.get('/profit-loss', async (req, res, next) => {
  try {
    console.log('📊 [Profit-Loss Route] Request received:', req.query);
    const cogsReporting = require('../../cogs/cogs.reporting');
    const { start_date, end_date, startDate, endDate } = req.query;
    const dateFrom = start_date || startDate;
    const dateTo = end_date || endDate;
    
    // Folosim doar getDailyCogsSummary pentru consistență (aceeași logică ca admin-vite)
    let dailyData = [];
    try {
      const dailySummary = await cogsReporting.getDailyCogsSummary({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      
      console.log(`📊 [Profit-Loss Route] Daily summary received: ${dailySummary?.length || 0} days`);
      
      // Transformă datele zilnice în formatul așteptat de frontend
      dailyData = (Array.isArray(dailySummary) ? dailySummary : []).map(day => {
        const revenue = parseFloat(day.revenue || 0);
        const costs = parseFloat(day.cogsTotal || 0);
        const profit = parseFloat(day.profit || (revenue - costs));
        const margin = revenue > 0 ? parseFloat(((profit / revenue) * 100).toFixed(2)) : 0;
        
        return {
          date: day.day || day.date || '',
          revenue: revenue,
          costs: costs,
          profit: profit,
          margin: margin.toFixed(2) + '%'
        };
      });
      
      // Calculăm totalurile din datele zilnice (pentru consistență)
      const totals = dailyData.reduce((acc, day) => {
        acc.total_revenue += day.revenue;
        acc.total_costs += day.costs;
        acc.total_profit += day.profit;
        return acc;
      }, { total_revenue: 0, total_costs: 0, total_profit: 0 });
      
      // Transformă formatul pentru compatibilitate cu ProfitLossPage
      const response = {
        totals: {
          total_revenue: totals.total_revenue,
          total_costs: totals.total_costs,
          total_profit: totals.total_profit,
        },
        data: dailyData // Array de zile cu detalii
      };
      
      console.log(`📊 [Profit-Loss Route] Sending response with ${dailyData.length} days, totals:`, totals);
      res.json(response);
    } catch (dailyError) {
      console.error('❌ Error getting daily summary:', dailyError);
      res.json({
        totals: {
          total_revenue: 0,
          total_costs: 0,
          total_profit: 0,
        },
        data: []
      });
    }
  } catch (err) {
    console.error('❌ Error in /api/reports/profit-loss:', err);
    console.error('❌ Error stack:', err.stack);
    res.json({
      totals: {
        total_revenue: 0,
        total_costs: 0,
        total_profit: 0,
      },
      data: []
    });
  }
});

module.exports = router;

