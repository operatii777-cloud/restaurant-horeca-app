// server/production/consumptionService.js
// Motor central de consum pe baza rețetelor existente (tabela recipes)

const { dbPromise } = require("../database");
const { createStockMove } = require("../stock/stockMoveService");
const { STOCK_MOVE_REASON, STOCK_MOVE_SOURCE } = require("../stock/stockMoveConstants");
const { ORDER_SOURCE, getUnifiedOrder } = require("../orders/unifiedOrderService");

async function getAllRecipesForProduct(productId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT 
          r.ingredient_id,
          r.quantity_needed,
          r.unit,
          r.waste_percentage,
          i.name AS ingredient_name,
          i.cost_per_unit
        FROM recipes r
        LEFT JOIN ingredients i ON i.id = r.ingredient_id
        WHERE r.product_id = ?
      `,
      [productId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

function mapOrderSourceToStockSource(orderSource) {
  switch (orderSource) {
    case ORDER_SOURCE.POS:
      return STOCK_MOVE_SOURCE.POS;
    case ORDER_SOURCE.KIOSK:
      return STOCK_MOVE_SOURCE.KIOSK;
    case ORDER_SOURCE.QR:
      return STOCK_MOVE_SOURCE.QR;
    case ORDER_SOURCE.DELIVERY:
      return STOCK_MOVE_SOURCE.DELIVERY;
    case ORDER_SOURCE.SUPERVISOR:
      return STOCK_MOVE_SOURCE.SUPERVISOR;
    default:
      return STOCK_MOVE_SOURCE.MANUAL;
  }
}

async function hasAlreadyConsumedForOrder(tenantId, orderId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(
      `
        SELECT COUNT(*) AS cnt
        FROM stock_moves
        WHERE tenant_id = ?
          AND reference_type = 'ORDER'
          AND reference_id = ?
          AND move_reason = ?
      `,
      [tenantId, orderId, STOCK_MOVE_REASON.SALE_OUT],
      (err, row) => {
        if (err) reject(err);
        else resolve((row && row.cnt > 0) || false);
      }
    );
  });
}

/**
 * Consumă stoc (ingrediente) pentru o comandă pe baza rețetelor (tabela recipes).
 * Generează stock_moves SALE_OUT fără a modifica ingredients.current_stock (legacy rămâne pentru compatibilitate).
 * 
 * @param {number} tenantId - ID tenant
 * @param {number} orderId - ID comandă
 * @param {string} orderSource - Sursa comenzii (ORDER_SOURCE.POS, ORDER_SOURCE.QR, etc.)
 * @returns {Promise<{consumedLines: number, skipped: boolean}>}
 */
async function consumeStockForOrder(tenantId, orderId, orderSource) {
  if (!tenantId || !orderId) {
    throw new Error("Parametri invalizi pentru consumeStockForOrder");
  }

  // Verifică dacă deja există stock_moves pentru această comandă (idempotent)
  const already = await hasAlreadyConsumedForOrder(tenantId, orderId);
  if (already) {
    console.log(`[consumeStockForOrder] SKIP - Order #${orderId} already has SALE_OUT stock_moves`, {
      tenantId,
      orderId,
      source: orderSource,
      alreadyConsumed: true,
      movesCreated: 0
    });
    return { consumedLines: 0, skipped: true };
  }

  // Obține comanda unificată
  const unifiedOrder = await getUnifiedOrder(tenantId, orderId, orderSource);
  const stockSource = mapOrderSourceToStockSource(unifiedOrder.source);

  console.log(`[consumeStockForOrder] START - Order #${orderId}`, {
    tenantId,
    orderId,
    source: orderSource,
    stockSource,
    itemsCount: unifiedOrder.items.length,
    alreadyConsumed: false
  });

  let consumedLines = 0;
  const db = await dbPromise;

  for (const item of unifiedOrder.items) {
    const recipes = await getAllRecipesForProduct(item.product_id);
    if (!recipes.length) {
      console.log(`[consumeStockForOrder] SKIP - Product #${item.product_id} (${item.product_name}) has no recipes`);
      continue;
    }

    const factor = item.qty || 1;

    for (const rec of recipes) {
      let neededQty = (Number(rec.quantity_needed) || 0) * factor;
      const waste = Number(rec.waste_percentage) || 0;
      if (waste > 0) {
        neededQty = neededQty * (1 + waste / 100);
      }
      if (!(neededQty > 0)) continue;

      const costPerUnit = Number(rec.cost_per_unit) || 0;
      const totalCost = costPerUnit * neededQty;

      await createStockMove({
        tenant_id: tenantId,
        ingredient_id: rec.ingredient_id,
        qty: neededQty,
        direction: "OUT",
        reason: STOCK_MOVE_REASON.SALE_OUT,
        source: stockSource,
        reference_type: "ORDER",
        reference_id: unifiedOrder.id,
        unit_price: costPerUnit,
        value: totalCost,
        tva_percent: null,
        meta: {
          order_channel: unifiedOrder.channel,
          table_id: unifiedOrder.table_id,
          sold_product_id: item.product_id,
          sold_product_name: item.product_name,
        },
      });

      consumedLines++;
    }
  }

  console.log(`[consumeStockForOrder] SUCCESS - Order #${orderId}`, {
    tenantId,
    orderId,
    source: orderSource,
    stockSource,
    alreadyConsumed: false,
    movesCreated: consumedLines
  });

  return { consumedLines, skipped: false };
}

module.exports = {
  consumeStockForOrder,
};


