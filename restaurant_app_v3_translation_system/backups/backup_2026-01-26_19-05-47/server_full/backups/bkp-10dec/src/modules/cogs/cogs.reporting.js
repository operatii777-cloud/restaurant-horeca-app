// server/src/modules/cogs/cogs.reporting.js
/**
 * S13 — COGS Reporting
 *
 * Rol:
 *  - rapoarte profitabilitate per produs
 *  - rapoarte profitabilitate per categorie
 *  - sumar COGS pe perioadă (pentru dashboard)
 */

const { dbPromise } = require("../../../database");
const masterData = require("../../../master-data");
const cogsEngine = require("./cogs.engine");
const { parseOrderItems } = require("../orders/order.mapper");

const { productsMaster } = masterData;

// Ajustează aceste constante la schema ta reală
const ORDERS_TABLE = "orders";
const ORDER_STATUS_CANCELLED = "cancelled";

/**
 * Extrage itemele din orders.items JSON și le agregă per produs.
 * 
 * @param {{ dateFrom?: string, dateTo?: string, categoryCode?: string|null }} filters
 * @returns {Promise<{ productId: number, quantity: number, revenue: number }[]>}
 */
async function getSalesAggregationByProduct(filters = {}) {
  const db = await dbPromise;
  
  const where = [];
  const params = [];

  // Filtru dată (timestamp)
  if (filters.dateFrom) {
    where.push(`${ORDERS_TABLE}.timestamp >= ?`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    where.push(`${ORDERS_TABLE}.timestamp <= ?`);
    params.push(filters.dateTo);
  }

  // excludem comenzile anulate
  // Notă: Folosim verificare safe pentru coloana status (poate fi NULL sau lipsă în baze vechi)
  try {
    // Verifică dacă coloana status există
    const db = await dbPromise;
    const tableInfo = await db.all(`PRAGMA table_info(${ORDERS_TABLE})`);
    const hasStatus = tableInfo.some(col => col.name === 'status');
    
    if (hasStatus) {
      where.push(`(${ORDERS_TABLE}.status IS NULL OR ${ORDERS_TABLE}.status <> ?)`);
      params.push(ORDER_STATUS_CANCELLED);
    }
    // Dacă nu există coloana status, nu adăugăm filtru (toate comenzile sunt incluse)
  } catch (err) {
    // Dacă verificarea eșuează, continuă fără filtru status
    console.warn('[COGS Reporting] Nu s-a putut verifica coloana status, continuă fără filtru');
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Selectăm toate comenzile din perioadă
  const sql = `
    SELECT
      ${ORDERS_TABLE}.id,
      ${ORDERS_TABLE}.items,
      ${ORDERS_TABLE}.timestamp
    FROM ${ORDERS_TABLE}
    ${whereClause}
  `;

  const rows = await db.all(sql, params);

  // Agregăm itemele din JSON
  const productMap = new Map();

  for (const row of rows) {
    try {
      const items = parseOrderItems(row.items);
      
      for (const item of items) {
        const productId = item.product_id || item.menu_item_id || item.id;
        if (!productId) continue;

        const qty = Number(item.quantity || item.qty || 1);
        const revenue = Number(item.total || item.line_total || item.price * qty || 0);

        if (productMap.has(productId)) {
          const existing = productMap.get(productId);
          existing.quantity += qty;
          existing.revenue += revenue;
        } else {
          productMap.set(productId, {
            productId: Number(productId),
            quantity: qty,
            revenue: revenue
          });
        }
      }
    } catch (err) {
      console.warn(`[COGS Reporting] Eroare la parsarea items pentru order ${row.id}:`, err.message);
    }
  }

  const result = Array.from(productMap.values());

  // Filtru după categorie (dacă e cerut) folosind productsMaster
  if (filters.categoryCode) {
    const code = String(filters.categoryCode).toLowerCase();
    return result.filter((row) => {
      const prod = productsMaster.getProductById(row.productId);
      if (!prod || !prod.category) return false;
      return prod.category.toLowerCase() === code;
    });
  }

  return result;
}

/**
 * Raport profitabilitate per produs într-o perioadă.
 *
 * @param {{ dateFrom?: string, dateTo?: string, categoryCode?: string|null, limit?: number }} filters
 * @returns {Promise<{
 *   items: {
 *     productId: number,
 *     productName: string,
 *     category: string|null,
 *     quantitySold: number,
 *     revenue: number,
 *     cogsTotal: number,
 *     cogsPerUnit: number,
 *     foodCostPercent: number|null,
 *     marginPercent: number|null,
 *     profit: number,
 *     avgSellingPrice: number
 *   }[],
 *   totalRevenue: number,
 *   totalCogs: number,
 *   totalProfit: number
 * }>}
 */
async function getProductProfitabilityReport(filters = {}) {
  const sales = await getSalesAggregationByProduct(filters);

  const items = [];
  let totalRevenue = 0;
  let totalCogs = 0;

  for (const row of sales) {
    const productId = row.productId;
    const qty = Number(row.quantity) || 0;
    const revenue = Number(row.revenue) || 0;
    totalRevenue += revenue;

    const cogs = await cogsEngine.calculateCogsForProduct(productId);
    if (!cogs) continue;

    const cogsPerUnit = cogs.totalCostPerPortion || 0;
    const cogsTotal = cogsPerUnit * qty;
    totalCogs += cogsTotal;

    const profit = revenue - cogsTotal;
    const avgSellingPrice = qty > 0 ? revenue / qty : cogs.sellingPrice;

    const prod = productsMaster.getProductById(productId);
    const category = prod && prod.category ? prod.category : null;

    items.push({
      productId,
      productName: prod ? prod.name : cogs.productName,
      category,
      quantitySold: qty,
      revenue,
      cogsTotal,
      cogsPerUnit,
      foodCostPercent: cogs.foodCostPercent,
      marginPercent: cogs.marginPercent,
      profit,
      avgSellingPrice
    });
  }

  // sortare descendent profit (poți ajusta)
  items.sort((a, b) => b.profit - a.profit);

  const limit = filters.limit ? Number(filters.limit) : null;
  const limitedItems = limit ? items.slice(0, limit) : items;

  return {
    items: limitedItems,
    totalRevenue,
    totalCogs,
    totalProfit: totalRevenue - totalCogs
  };
}

/**
 * Raport profitabilitate per categorie.
 *
 * Folosește raportul pe produs și agregă pe categorie.
 */
async function getCategoryProfitabilityReport(filters = {}) {
  const productReport = await getProductProfitabilityReport(filters);
  const map = new Map();

  for (const item of productReport.items) {
    const cat = (item.category || "OTHER").toLowerCase();
    if (!map.has(cat)) {
      map.set(cat, {
        category: item.category || "Other",
        quantitySold: 0,
        revenue: 0,
        cogsTotal: 0,
        profit: 0
      });
    }

    const agg = map.get(cat);
    agg.quantitySold += item.quantitySold;
    agg.revenue += item.revenue;
    agg.cogsTotal += item.cogsTotal;
    agg.profit += item.profit;
  }

  const categories = Array.from(map.values()).map((c) => ({
    ...c,
    foodCostPercent:
      c.revenue > 0 ? (c.cogsTotal / c.revenue) * 100 : null,
    marginPercent:
      c.revenue > 0 ? (c.profit / c.revenue) * 100 : null
  }));

  // sortare descendent după profit
  categories.sort((a, b) => b.profit - a.profit);

  return {
    categories,
    totalRevenue: productReport.totalRevenue,
    totalCogs: productReport.totalCogs,
    totalProfit: productReport.totalProfit
  };
}

/**
 * Sumar COGS pe zile (pentru dashboard).
 *
 * Presupunem că ai deja un raport de vânzări zilnic,
 * dar aici îl construim simplu din orders + items + COGS.
 *
 * @param {{ dateFrom?: string, dateTo?: string }} filters
 */
async function getDailyCogsSummary(filters = {}) {
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
  // Verifică dacă coloana status există
  try {
    const db = await dbPromise;
    const tableInfo = await db.all(`PRAGMA table_info(${ORDERS_TABLE})`);
    const hasStatus = tableInfo.some(col => col.name === 'status');
    
    if (hasStatus) {
      where.push(`(${ORDERS_TABLE}.status IS NULL OR ${ORDERS_TABLE}.status <> ?)`);
      params.push(ORDER_STATUS_CANCELLED);
    }
  } catch (err) {
    console.warn('[COGS Reporting] Nu s-a putut verifica coloana status, continuă fără filtru');
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT
      DATE(${ORDERS_TABLE}.timestamp) AS day,
      ${ORDERS_TABLE}.id,
      ${ORDERS_TABLE}.items
    FROM ${ORDERS_TABLE}
    ${whereClause}
    ORDER BY day ASC
  `;

  const rows = await db.all(sql, params);

  // agregăm pe zi
  const dayMap = new Map();

  for (const row of rows) {
    const day = row.day;
    
    try {
      const items = parseOrderItems(row.items);
      
      for (const item of items) {
        const productId = item.product_id || item.menu_item_id || item.id;
        if (!productId) continue;

        const qty = Number(item.quantity || item.qty || 1);
        const revenue = Number(item.total || item.line_total || item.price * qty || 0);

        const cogs = await cogsEngine.calculateCogsForProduct(productId);
        if (!cogs) continue;

        const cogsTotal = (cogs.totalCostPerPortion || 0) * qty;

        if (!dayMap.has(day)) {
          dayMap.set(day, {
            day,
            revenue: 0,
            cogsTotal: 0,
            profit: 0
          });
        }

        const agg = dayMap.get(day);
        agg.revenue += revenue;
        agg.cogsTotal += cogsTotal;
        agg.profit = agg.revenue - agg.cogsTotal;
      }
    } catch (err) {
      console.warn(`[COGS Reporting] Eroare la parsarea items pentru order ${row.id}:`, err.message);
    }
  }

  return Array.from(dayMap.values()).map((d) => ({
    ...d,
    foodCostPercent:
      d.revenue > 0 ? (d.cogsTotal / d.revenue) * 100 : null,
    marginPercent:
      d.revenue > 0 ? (d.profit / d.revenue) * 100 : null
  }));
}

module.exports = {
  getProductProfitabilityReport,
  getCategoryProfitabilityReport,
  getDailyCogsSummary,
  getSalesAggregationByProduct
};

