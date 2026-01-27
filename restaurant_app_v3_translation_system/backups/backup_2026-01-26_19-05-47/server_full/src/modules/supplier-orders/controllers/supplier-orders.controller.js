/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/supplier-orders.js
 */

const { dbPromise } = require('../../../../database');

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
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

// GET /api/supplier-orders
async function getSupplierOrders(req, res, next) {
    try {
        const orders = await runQuery(`
            SELECT
                so.*,
                s.company_name as supplier_name,
                (SELECT COUNT(*) FROM supplier_order_items WHERE supplier_order_id = so.id) as items_count
            FROM supplier_orders so
            LEFT JOIN suppliers s ON so.supplier_id = s.id
            ORDER BY so.created_at DESC
        `);
        res.json(orders);
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
            return res.status(404).json({ message: 'Order not found' });
        }

        const items = await runQuery(`
            SELECT * FROM supplier_order_items WHERE order_id = ?
        `, [req.params.id]);

        res.json({
            ...order[0],
            items
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/supplier-orders
async function createSupplierOrder(req, res, next) {
    try {
        const { supplier_id, delivery_date, notes, items, status } = req.body;

        if (!supplier_id || !items || items.length === 0) {
            return res.status(400).json({ 
                error: 'supplier_id and items are required' 
            });
        }

        const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

        const totalValue = items.reduce((sum, item) => 
            sum + (item.quantity * item.price), 0
        );

        const result = await runQuerySingle(`
            INSERT INTO supplier_orders 
            (order_number, supplier_id, delivery_date, total_value, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        `, [orderNumber, supplier_id, delivery_date, totalValue, status || 'draft', notes]);

        for (const item of items) {
            await runQuerySingle(`
                INSERT INTO supplier_order_items 
                (order_id, product_name, quantity, unit, price)
                VALUES (?, ?, ?, ?, ?)
            `, [result.id, item.product_name, item.quantity, item.unit, item.price]);
        }

        res.status(201).json({ 
            id: result.id, 
            order_number: orderNumber,
            message: 'Supplier order created successfully' 
        });
    } catch (error) {
        next(error);
    }
}

// PUT /api/supplier-orders/:id
async function updateSupplierOrder(req, res, next) {
    try {
        const { supplier_id, delivery_date, notes, items, status } = req.body;

        let totalValue = null;
        if (items && items.length > 0) {
            totalValue = items.reduce((sum, item) => 
                sum + (item.quantity * item.price), 0
            );
        }

        const updateFields = [];
        const updateValues = [];

        if (supplier_id) {
            updateFields.push('supplier_id = ?');
            updateValues.push(supplier_id);
        }
        if (delivery_date) {
            updateFields.push('delivery_date = ?');
            updateValues.push(delivery_date);
        }
        if (notes !== undefined) {
            updateFields.push('notes = ?');
            updateValues.push(notes);
        }
        if (status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        if (totalValue !== null) {
            updateFields.push('total_value = ?');
            updateValues.push(totalValue);
        }

        updateFields.push('updated_at = datetime("now", "localtime")');
        updateValues.push(req.params.id);

        await runQuerySingle(`
            UPDATE supplier_orders 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);

        if (items && items.length > 0) {
            await runQuerySingle(`DELETE FROM supplier_order_items WHERE order_id = ?`, [req.params.id]);
            
            for (const item of items) {
                await runQuerySingle(`
                    INSERT INTO supplier_order_items 
                    (order_id, product_name, quantity, unit, price)
                    VALUES (?, ?, ?, ?, ?)
                `, [req.params.id, item.product_name, item.quantity, item.unit, item.price]);
            }
        }

        res.json({ message: 'Supplier order updated successfully' });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/supplier-orders/:id
async function deleteSupplierOrder(req, res, next) {
    try {
        await runQuerySingle(`DELETE FROM supplier_order_items WHERE order_id = ?`, [req.params.id]);
        await runQuerySingle(`DELETE FROM supplier_orders WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Supplier order deleted successfully' });
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

