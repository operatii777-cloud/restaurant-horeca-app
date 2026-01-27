const express = require('express');
const router = express.Router();
const db = require('../config/database');

const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// GET all products for labels
router.get('/products', async (req, res) => {
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
    } catch (err) {
        console.error('Error fetching products for labels:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST generate label
router.post('/generate', async (req, res) => {
    try {
        const { product_id, product_name, price, barcode, additional_info } = req.body;

        if (!product_name || !price) {
            return res.status(400).json({ 
                error: 'product_name and price are required' 
            });
        }

        // In a real implementation, this would generate a PDF or image
        // For now, we just return the label data
        res.json({
            product_id,
            product_name,
            price,
            barcode,
            additional_info,
            generated_at: new Date().toISOString()
        });
    } catch (err) {
        console.error('Error generating label:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST print batch labels
router.post('/print-batch', async (req, res) => {
    try {
        const { product_id, count } = req.body;

        if (!product_id || !count) {
            return res.status(400).json({ 
                error: 'product_id and count are required' 
            });
        }

        // Get product details
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
    } catch (err) {
        console.error('Error printing batch labels:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

