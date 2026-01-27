// server/src/modules/financial/financial.service.js
/**
 * S15 — Financial Reports Service
 * 
 * Business logic pentru rapoarte financiare:
 * - Reutilizează S13 COGS Engine
 * - Agregă date din orders, payments
 * - Calculează P&L, Cashflow, Category Mix
 */

const { dbPromise } = require("../../../database");
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
  
  // Excludem comenzile anulate
  try {
    const tableInfo = await db.all(`PRAGMA table_info(${ORDERS_TABLE})`);
    const hasStatus = tableInfo.some(col => col.name === 'status');
    if (hasStatus) {
      where.push(`(${ORDERS_TABLE}.status IS NULL OR ${ORDERS_TABLE}.status <> ?)`);
      params.push('cancelled');
    }
  } catch (err) {
    console.warn('[Financial Service] Nu s-a putut verifica coloana status');
  }
  
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  
  // Calculăm revenue din orders
  const revenueSql = `
    SELECT
      COALESCE(SUM(${ORDERS_TABLE}.total), 0) AS total_revenue
    FROM ${ORDERS_TABLE}
    ${whereClause}
    AND (${ORDERS_TABLE}.is_paid = 1 OR ${ORDERS_TABLE}.is_paid IS NULL)
  `;
  
  const revenueResult = await db.get(revenueSql, params);
  const revenue = revenueResult?.total_revenue || 0;
  
  // Calculăm COGS din S13
  const dailySummary = await cogsReporting.getDailyCogsSummary(filters);
  const cogsTotal = dailySummary.reduce((sum, day) => sum + (day.cogsTotal || 0), 0);
  
  // Operating expenses - pentru moment 0 (poate fi extins ulterior)
  const operatingExpenses = 0;
  
  const grossProfit = revenue - cogsTotal;
  const netProfit = grossProfit - operatingExpenses;
  
  const foodCostPercent = revenue > 0 ? (cogsTotal / revenue) * 100 : 0;
  const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  return {
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

