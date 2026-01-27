// server/src/modules/financial/financial.service.js
/**
 * S15 - Financial Reports Service
 * 
 * Business logic pentru rapoarte financiare:
 * - Reutilizează S13 COGS Engine
 * - Agregă date din orders, payments
 * - Calculează P&L, Cashflow, Category Mix
 */

const { dbPromise } = require('../../../database');
const cogsReporting = require("../cogs/cogs.reporting");
const { parseOrderItems } = require("../orders/order.mapper");

const ORDERS_TABLE = "orders";
const POS_PAYMENTS_TABLE = "pos_payments";

/**
 * Daily Summary - bazat pe S13 daily-summary, dar cu format extins
 */
async function getDailySummary(filters = {}) {
  // Reutilizăm S13 daily-summary
  const dailyCogs = await cogsReporting.getDailyCogsSummary(filters);
  
  // Transformăm în formatul S15
  return dailyCogs.map((day) => ({
    day: day.day,
    revenue: day.revenue || 0,
    cogsTotal: day.cogsTotal || 0,
    grossProfit: day.profit || (day.revenue - day.cogsTotal),
    foodCostPercent: day.foodCostPercent || (day.revenue > 0 ? (day.cogsTotal / day.revenue) * 100 : 0),
    marginPercent: day.marginPercent || (day.revenue > 0 ? ((day.revenue - day.cogsTotal) / day.revenue) * 100 : 0),
  }));
}

/**
 * P&L (Profit & Loss) pentru o perioadă
 */
async function getPnl(filters = {}) {
  try {
    console.log(`📊 [Financial PNL] getPnl called with filters:`, filters);
    const db = await dbPromise;
    
    const where = [];
    const params = [];
    
    if (filters.dateFrom) {
      where.push(`strftime('%Y-%m-%d', ${ORDERS_TABLE}.timestamp) >= strftime('%Y-%m-%d', ?)`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.push(`strftime('%Y-%m-%d', ${ORDERS_TABLE}.timestamp) <= strftime('%Y-%m-%d', ?)`);
      params.push(filters.dateTo);
    }
    
    console.log(`📊 [Financial PNL] Where clause parts:`, where);
    console.log(`📊 [Financial PNL] Params:`, params);
    
  // FILTRARE CORECTĂ: Excludem doar comenzile anulate, NU test
  // Include toate comenzile (paid, completed, delivered, pending, NULL) except cancelled
  where.push(`(${ORDERS_TABLE}.status IS NULL OR ${ORDERS_TABLE}.status != 'cancelled')`);
  // Excludem comenzile de test (table_number negativ sau client_identifier conține 'test')
  where.push(`(${ORDERS_TABLE}.table_number IS NULL OR ${ORDERS_TABLE}.table_number >= 0)`);
  where.push(`(${ORDERS_TABLE}.client_identifier IS NULL OR LOWER(${ORDERS_TABLE}.client_identifier) NOT LIKE '%test%')`);
  
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  
  console.log(`📊 [Financial PNL] Where clause: ${whereClause}`);
  console.log(`📊 [Financial PNL] Final params:`, params);
  
  // Calculăm revenue din orders
  const revenueSql = `
    SELECT
      COALESCE(SUM(${ORDERS_TABLE}.total), 0) AS total_revenue
    FROM ${ORDERS_TABLE}
    ${whereClause}
  `;
  
  console.log(`📊 [Financial PNL] Revenue SQL: ${revenueSql}`);
  
  const revenueResult = await new Promise((resolve, reject) => {
    db.get(revenueSql, params, (err, row) => {
      if (err) {
        console.error('❌ Error in revenue query:', err);
        console.error('❌ SQL:', revenueSql);
        console.error('❌ Params:', params);
        resolve({ total_revenue: 0 });
      } else {
        console.log(`✅ Revenue query result:`, row);
        resolve(row || { total_revenue: 0 });
      }
    });
  });
  const revenue = parseFloat(revenueResult?.total_revenue) || 0;
  console.log(`📊 [Financial PNL] Revenue calculated: ${revenue}`);
  
  // Calculăm COGS din S13
  const dailySummary = await cogsReporting.getDailyCogsSummary(filters);
  console.log(`📊 [Financial PNL] Daily summary received: ${dailySummary?.length || 0} days`);
  const cogsTotal = (Array.isArray(dailySummary) ? dailySummary : []).reduce((sum, day) => sum + (day.cogsTotal || 0), 0);
  console.log(`📊 [Financial PNL] COGS Total: ${cogsTotal}`);
  
  // Operating expenses - pentru moment 0 (poate fi extins ulterior)
  const operatingExpenses = 0;
  
  const grossProfit = revenue - cogsTotal;
  const netProfit = grossProfit - operatingExpenses;
  
  const foodCostPercent = revenue > 0 ? (cogsTotal / revenue) * 100 : 0;
  const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  const result = {
    period: {
      from: filters.dateFrom || null,
      to: filters.dateTo || null,
    },
    revenue,
    cogsTotal,
    grossProfit,
    operatingExpenses,
    netProfit,
    foodCostPercent,
    marginPercent,
  };
  
  console.log(`📊 [Financial PNL] Returning result:`, result);
  return result;
  } catch (error) {
    console.error('❌ Error in getPnl:', error);
    console.error('❌ Error stack:', error.stack);
    // Returnează obiect cu valori 0 în loc să arunce eroarea
    return {
      period: {
        from: filters.dateFrom || null,
        to: filters.dateTo || null,
      },
      revenue: 0,
      cogsTotal: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      netProfit: 0,
      foodCostPercent: 0,
      marginPercent: 0,
    };
  }
}

/**
 * Cashflow - inflows și outflows
 */
async function getCashflow(filters = {}) {
  const db = await dbPromise;
  
  const where = [];
  const params = [];
  
  if (filters.dateFrom) {
    where.push(`DATE(${ORDERS_TABLE}.timestamp) >= DATE(?)`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    where.push(`DATE(${ORDERS_TABLE}.timestamp) <= DATE(?)`);
    params.push(filters.dateTo);
  }
  
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  
  // Inflows din orders (plăți)
  // Verificăm dacă există tabela pos_payments
  let hasPosPayments = false;
  try {
    // Security: Validate table name (PRAGMA doesn't support placeholders)
    const ALLOWED_TABLES = ['orders', 'order_items', 'menu', 'products', 'pos_payments'];
    if (!ALLOWED_TABLES.includes(POS_PAYMENTS_TABLE.toLowerCase())) {
      throw new Error(`Invalid table name: ${POS_PAYMENTS_TABLE}`);
    }
    
    const tableInfo = await db.all(`PRAGMA table_info(${POS_PAYMENTS_TABLE})`);
    hasPosPayments = tableInfo.length > 0;
  } catch (err) {
    // Tabela nu există
  }
  
  let inflows = {
    cash: 0,
    card: 0,
    vouchers: 0,
    other: 0,
    total: 0,
  };
  
  if (hasPosPayments) {
    // Agregăm din pos_payments
    const paymentsSql = `
      SELECT
        payment_method,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM ${POS_PAYMENTS_TABLE}
      INNER JOIN ${ORDERS_TABLE} ON ${POS_PAYMENTS_TABLE}.order_id = ${ORDERS_TABLE}.id
      ${whereClause}
      GROUP BY payment_method
    `;
    
    const paymentsRows = await db.all(paymentsSql, params);
    
    for (const row of paymentsRows) {
      const method = (row.payment_method || 'other').toLowerCase();
      const amount = row.total_amount || 0;
      
      if (method.includes('cash') || method === 'numerar') {
        inflows.cash += amount;
      } else if (method.includes('card') || method.includes('card')) {
        inflows.card += amount;
      } else if (method.includes('voucher') || method.includes('sodexo') || method.includes('ticket')) {
        inflows.vouchers += amount;
      } else {
        inflows.other += amount;
      }
    }
  } else {
    // Fallback: agregăm din orders.payment_method
    const ordersSql = `
      SELECT
        payment_method,
        COALESCE(SUM(total), 0) AS total_amount
      FROM ${ORDERS_TABLE}
      ${whereClause}
      AND (is_paid = 1 OR is_paid IS NULL)
      AND payment_method IS NOT NULL
      GROUP BY payment_method
    `;
    
    const ordersRows = await db.all(ordersSql, params);
    
    for (const row of ordersRows) {
      const method = (row.payment_method || 'other').toLowerCase();
      const amount = row.total_amount || 0;
      
      if (method.includes('cash') || method === 'numerar') {
        inflows.cash += amount;
      } else if (method.includes('card') || method.includes('card')) {
        inflows.card += amount;
      } else if (method.includes('voucher') || method.includes('sodexo') || method.includes('ticket')) {
        inflows.vouchers += amount;
      } else {
        inflows.other += amount;
      }
    }
  }
  
  inflows.total = inflows.cash + inflows.card + inflows.vouchers + inflows.other;
  
  // Outflows - pentru moment minimal (poate fi extins ulterior)
  const outflows = {
    suppliers: 0,  // Poate fi calculat din NIR payments dacă există
    salaries: 0,   // Poate fi calculat din payroll dacă există
    other: 0,
    total: 0,
  };
  
  // TODO: Calculare outflows din NIR payments, payroll, etc.
  // Pentru moment, outflows.total = 0
  
  const netCashflow = inflows.total - outflows.total;
  
  return {
    period: {
      from: filters.dateFrom || null,
      to: filters.dateTo || null,
    },
    inflows,
    outflows,
    netCashflow,
  };
}

/**
 * Category Mix - bazat pe S13 category-profitability
 */
async function getCategoryMix(filters = {}) {
  // Reutilizăm S13 category-profitability
  const categoryReport = await cogsReporting.getCategoryProfitabilityReport(filters);
  
  const totalRevenue = categoryReport.totalRevenue || 0;
  
  // Transformăm în formatul S15
  const categories = categoryReport.categories.map((cat) => ({
    categoryCode: (cat.category || 'OTHER').toLowerCase(),
    categoryName: cat.category || 'Other',
    revenue: cat.revenue || 0,
    cogsTotal: cat.cogsTotal || 0,
    grossProfit: cat.profit || 0,
    foodCostPercent: cat.foodCostPercent || 0,
    marginPercent: cat.marginPercent || 0,
    shareOfRevenue: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0,
  }));
  
  return {
    categories,
  };
}

module.exports = {
  getDailySummary,
  getPnl,
  getCashflow,
  getCategoryMix,
};

