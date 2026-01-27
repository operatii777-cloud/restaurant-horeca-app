// server/orders/unifiedOrderService.js
// Model unificat pentru comenzi, indiferent de canal (POS, KIOSK, QR etc.)

const { dbPromise } = require("../database");

const ORDER_SOURCE = {
  POS: "POS",
  KIOSK: "KIOSK",
  QR: "QR",
  DELIVERY: "DELIVERY",
  DRIVE_THRU: "DRIVE_THRU",  // NOU (05 Dec 2025)
  SUPERVISOR: "SUPERVISOR",
};

async function getUnifiedOrder(tenantId, orderId, sourceHint) {
  const db = await dbPromise;
  const row = await new Promise((resolve, reject) => {
    db.get(
      `
        SELECT id, total, status, table_number, type, items
        FROM orders
        WHERE id = ?
      `,
      [orderId],
      (err, result) => {
        if (err) reject(err);
        else resolve(result || null);
      }
    );
  });

  if (!row) {
    const e = new Error(`Comanda ${orderId} nu a fost găsită.`);
    e.statusCode = 404;
    throw e;
  }

  let parsedItems = [];
  if (row.items) {
    try {
      parsedItems = JSON.parse(row.items);
      if (!Array.isArray(parsedItems)) parsedItems = [];
    } catch {
      parsedItems = [];
    }
  }

  const unifiedItems = parsedItems
    .map((it) => {
      const productId = it.product_id || it.menu_item_id || it.id;
      const name = it.name || it.product_name || "";
      const qtyRaw = it.quantity ?? it.qty ?? 1;
      const qty = Number(qtyRaw) || 0;
      const price = Number(it.price || 0);
      const lineTotal = Number(it.total || it.line_total || price * qty);
      if (!productId || qty <= 0) return null;
      return {
        product_id: productId,
        product_name: name,
        qty,
        unit: it.unit || "buc",
        price,
        line_total: lineTotal,
      };
    })
    .filter(Boolean);

  return {
    id: row.id,
    tenant_id: tenantId,
    source: sourceHint,
    status: row.status,
    table_id: row.table_number || null,
    channel: row.type || "DINEIN",
    items: unifiedItems,
  };
}

module.exports = {
  ORDER_SOURCE,
  getUnifiedOrder,
};


