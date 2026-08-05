/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/supplier-orders.js
 * Aligned to real restaurant.db schema (T-CL-020):
 *   supplier_orders: order_number, order_date, expected_delivery_date, total_amount, status
 *   supplier_order_items: order_id, item_name, quantity, unit, unit_price, total_price
 *   suppliers: name (not company_name)
 */

const { dbPromise } = require('../../../../database');

const ALLOWED_STATUSES = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];

const normalizeStatus = (status) => {
  if (!status) return 'pending';
  if (status === 'draft' || status === 'sent') return 'pending';
  if (status === 'in transit' || status === 'În Transit') return 'in_transit';
  return ALLOWED_STATUSES.includes(status) ? status : 'pending';
};

const runQuery = async (sql, params = []) => {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runQuerySingle = async (sql, params = []) => {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getOne = async (sql, params = []) => {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

function mapItemInput(item) {
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unit_price ?? item.price ?? 0);
  const itemName = item.item_name || item.product_name || item.name;
  if (!itemName) {
    throw new Error('Each item requires item_name');
  }
  return {
    ingredient_id: item.ingredient_id || null,
    item_name: itemName,
    quantity,
    unit: item.unit || 'buc',
    unit_price: unitPrice,
    total_price: Number(item.total_price != null ? item.total_price : quantity * unitPrice),
    notes: item.notes || null,
  };
}

// GET /api/supplier-orders
async function getSupplierOrders(req, res, next) {
  try {
    const orders = await runQuery(`
      SELECT
        so.*,
        s.name as supplier_name,
        (SELECT COUNT(*) FROM supplier_order_items WHERE order_id = so.id) as items_count
      FROM supplier_orders so
      LEFT JOIN suppliers s ON so.supplier_id = s.id
      ORDER BY so.created_at DESC
    `);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

// GET /api/supplier-orders/:id
async function getSupplierOrderById(req, res, next) {
  try {
    const order = await runQuery(`
      SELECT
        so.*,
        s.name as supplier_name,
        s.phone as supplier_phone,
        s.email as supplier_email
      FROM supplier_orders so
      LEFT JOIN suppliers s ON so.supplier_id = s.id
      WHERE so.id = ?
    `, [req.params.id]);

    if (order.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const items = await runQuery(
      `SELECT * FROM supplier_order_items WHERE order_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...order[0],
        items,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/supplier-orders
async function createSupplierOrder(req, res, next) {
  try {
    const {
      supplier_id,
      order_date,
      expected_delivery_date,
      delivery_date,
      notes,
      items,
      status,
    } = req.body;

    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'supplier_id and items are required',
      });
    }

    const mappedItems = items.map(mapItemInput);
    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const totalAmount = mappedItems.reduce((sum, item) => sum + item.total_price, 0);
    const orderDate = order_date || new Date().toISOString().slice(0, 10);
    const expectedDelivery = expected_delivery_date || delivery_date || null;
    const orderStatus = normalizeStatus(status);

    const result = await runQuerySingle(
      `INSERT INTO supplier_orders
        (order_number, supplier_id, order_date, expected_delivery_date, total_amount, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))`,
      [orderNumber, supplier_id, orderDate, expectedDelivery, totalAmount, orderStatus, notes || null]
    );

    for (const item of mappedItems) {
      await runQuerySingle(
        `INSERT INTO supplier_order_items
          (order_id, ingredient_id, item_name, quantity, unit, unit_price, total_price, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          result.id,
          item.ingredient_id,
          item.item_name,
          item.quantity,
          item.unit,
          item.unit_price,
          item.total_price,
          item.notes,
        ]
      );
    }

    const created = await getOne(`SELECT * FROM supplier_orders WHERE id = ?`, [result.id]);

    res.status(201).json({
      success: true,
      data: created,
      id: result.id,
      order_number: orderNumber,
      message: 'Supplier order created successfully',
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/supplier-orders/:id
async function updateSupplierOrder(req, res, next) {
  try {
    const {
      supplier_id,
      order_date,
      expected_delivery_date,
      delivery_date,
      notes,
      items,
      status,
    } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (supplier_id) {
      updateFields.push('supplier_id = ?');
      updateValues.push(supplier_id);
    }
    if (order_date) {
      updateFields.push('order_date = ?');
      updateValues.push(order_date);
    }
    const expectedDelivery = expected_delivery_date || delivery_date;
    if (expectedDelivery) {
      updateFields.push('expected_delivery_date = ?');
      updateValues.push(expectedDelivery);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(normalizeStatus(status));
    }

    let mappedItems = null;
    if (items && items.length > 0) {
      mappedItems = items.map(mapItemInput);
      const totalAmount = mappedItems.reduce((sum, item) => sum + item.total_price, 0);
      updateFields.push('total_amount = ?');
      updateValues.push(totalAmount);
    }

    updateFields.push(`updated_at = datetime('now', 'localtime')`);
    updateValues.push(req.params.id);

    if (updateFields.length > 1) {
      await runQuerySingle(
        `UPDATE supplier_orders SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    if (mappedItems) {
      await runQuerySingle(`DELETE FROM supplier_order_items WHERE order_id = ?`, [req.params.id]);
      for (const item of mappedItems) {
        await runQuerySingle(
          `INSERT INTO supplier_order_items
            (order_id, ingredient_id, item_name, quantity, unit, unit_price, total_price, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.params.id,
            item.ingredient_id,
            item.item_name,
            item.quantity,
            item.unit,
            item.unit_price,
            item.total_price,
            item.notes,
          ]
        );
      }
    }

    const updated = await getOne(`SELECT * FROM supplier_orders WHERE id = ?`, [req.params.id]);
    res.json({ success: true, data: updated, message: 'Supplier order updated successfully' });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/supplier-orders/:id
async function deleteSupplierOrder(req, res, next) {
  try {
    await runQuerySingle(`DELETE FROM supplier_order_items WHERE order_id = ?`, [req.params.id]);
    await runQuerySingle(`DELETE FROM supplier_orders WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Supplier order deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSupplierOrders,
  getSupplierOrderById,
  createSupplierOrder,
  updateSupplierOrder,
  deleteSupplierOrder,
};
