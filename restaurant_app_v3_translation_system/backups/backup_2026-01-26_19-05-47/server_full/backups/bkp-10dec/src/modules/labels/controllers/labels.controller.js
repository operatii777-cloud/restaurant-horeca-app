/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/labels.js
 */

const { dbPromise } = require('../../../database');

const runQuery = async (sql, params = []) => {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// GET /api/labels/products
async function getProducts(req, res, next) {
    try {
        const products = await runQuery(`
            SELECT 
                id,
                name,
                price,
                category,
                barcode
            FROM products
            WHERE is_active = 1
            ORDER BY category, name
        `);
        res.json(products);
    } catch (error) {
        next(error);
    }
}

// POST /api/labels/generate
async function generateLabel(req, res, next) {
    try {
        const { product_id, product_name, price, barcode, additional_info } = req.body;

        if (!product_name || !price) {
            return res.status(400).json({ 
                error: 'product_name and price are required' 
            });
        }

        res.json({
            product_id,
            product_name,
            price,
            barcode,
            additional_info,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/labels/print-batch
async function printBatch(req, res, next) {
    try {
        const { product_id, count } = req.body;

        if (!product_id || !count) {
            return res.status(400).json({ 
                error: 'product_id and count are required' 
            });
        }

        const product = await runQuery(`
            SELECT id, name, price, barcode
            FROM products
            WHERE id = ?
        `, [product_id]);

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            product: product[0],
            count,
            message: `Batch of ${count} labels ready for printing`
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProducts,
    generateLabel,
    printBatch,
};

