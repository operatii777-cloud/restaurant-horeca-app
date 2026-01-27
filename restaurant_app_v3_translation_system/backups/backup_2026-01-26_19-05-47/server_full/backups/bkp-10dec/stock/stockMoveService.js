// server/stock/stockMoveService.js
// Helper unic pentru inserarea în stock_moves, conform modelului unificat

const { dbPromise } = require("../database");

async function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * Creează o mișcare de stoc în tabela stock_moves.
 * Nu schimbă schema existentă, doar populează câmpurile suplimentare când există.
 *
 * @param {object} params
 * @param {number} params.tenant_id
 * @param {number} params.ingredient_id
 * @param {number} params.qty        Cantitate pozitivă
 * @param {'IN'|'OUT'} params.direction
 * @param {string} params.reason     move_reason
 * @param {string} params.source     move_source
 * @param {string} params.reference_type
 * @param {number} params.reference_id
 * @param {number} params.unit_price Cost unitar (opțional, default 0)
 * @param {number} params.value      Valoare totală (pozitivă, opțional)
 * @param {number|null} [params.tva_percent]
 * @param {object|null} [params.meta]
 */
async function createStockMove({
  tenant_id,
  ingredient_id,
  qty,
  direction,
  reason,
  source,
  reference_type,
  reference_id,
  unit_price = 0,
  value = 0,
  tva_percent = null,
  meta = null,
}) {
  if (!tenant_id || !ingredient_id || !qty || qty <= 0) {
    throw new Error("Parametri invalizi pentru createStockMove");
  }

  const quantity_in = direction === "IN" ? qty : 0;
  const quantity_out = direction === "OUT" ? qty : 0;
  const value_in = direction === "IN" ? value : 0;
  const value_out = direction === "OUT" ? value : 0;

  const db = await dbPromise;
  await runAsync(
    db,
    `
      INSERT INTO stock_moves (
        tenant_id,
        date,
        type,
        reference_type,
        reference_id,
        ingredient_id,
        quantity_in,
        quantity_out,
        unit_price,
        value_in,
        value_out,
        tva_percent,
        move_reason,
        move_source,
        meta_json
      ) VALUES (
        ?, datetime('now'),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `,
    [
      tenant_id,
      // type rămâne compatibil cu schema veche: derivăm din reason
      mapReasonToLegacyType(reason),
      reference_type || null,
      reference_id || null,
      ingredient_id,
      quantity_in,
      quantity_out,
      unit_price || 0,
      value_in,
      value_out,
      tva_percent != null ? tva_percent : 0,
      reason || null,
      source || null,
      meta ? JSON.stringify(meta) : null,
    ]
  );
}

function mapReasonToLegacyType(reason) {
  if (!reason) return "ADJUST";
  if (reason.endsWith("_IN")) {
    if (reason.startsWith("NIR")) return "NIR";
    if (reason.startsWith("TRANSFER")) return "ADJUST";
    if (reason.startsWith("ADJUST")) return "ADJUST";
    if (reason.startsWith("PRODUCTION")) return "ADJUST";
    if (reason.startsWith("CANCEL_SALE")) return "ADJUST";
  }
  if (reason.endsWith("_OUT")) {
    if (reason.startsWith("CONSUME")) return "CONSUME";
    if (reason.startsWith("TRANSFER")) return "ADJUST";
    if (reason.startsWith("ADJUST")) return "ADJUST";
    if (reason.startsWith("SALE")) return "CONSUME";
    if (reason.startsWith("PRODUCTION")) return "CONSUME";
    if (reason.startsWith("WASTE")) return "CONSUME";
  }
  return "ADJUST";
}

module.exports = {
  createStockMove,
};


