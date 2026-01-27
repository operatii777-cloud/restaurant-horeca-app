/**
 * ENTERPRISE CONTROLLER - FIXED
 * Phase: E8 - Logic migrated from routes/labels.js
 */

const { dbPromise } = require('../../../../database');

const runQuery = async (sql, params = []) => {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('❌ [labels/runQuery] SQL Error:', err);
                console.error('❌ [labels/runQuery] SQL:', sql);
                console.error('❌ [labels/runQuery] Params:', params);
                reject(err);
            } else {
                // CRITICAL FIX: db.all poate returna undefined, nu doar array gol
                const result = rows || [];
                console.log(`✅ [labels/runQuery] Query returned ${result.length} rows`);
                resolve(result);
            }
        });
    });
};

// Helper function to check if table exists
const tableExists = async (db, tableName) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
            [tableName],
            (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            }
        );
    });
};

// GET /api/labels/products
async function getProducts(req, res, next) {
    try {
        console.log('🔍 [labels/getProducts] Starting product fetch...');
        const db = await dbPromise;
        let products = [];
        
        // DEBUG: List all tables in database
        await new Promise((resolve, reject) => {
            db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, [], (err, tables) => {
                if (err) {
                    console.error('❌ [labels/getProducts] Error listing tables:', err);
                    reject(err);
                } else {
                    console.log('📋 [labels/getProducts] All tables in database:', tables.map(t => t.name));
                    resolve();
                }
            });
        });
        
        // Check which tables exist
        const menuExists = await tableExists(db, 'menu');
        const catalogExists = await tableExists(db, 'catalog_products');
        const productsExists = await tableExists(db, 'products');
        
        console.log('📊 [labels/getProducts] Tables status:', {
            menu: menuExists,
            catalog_products: catalogExists,
            products: productsExists
        });
        
        // Try menu table first (most common)
        if (menuExists) {
            try {
                products = await runQuery(`
                    SELECT 
                        id,
                        name,
                        COALESCE(price, 0) as price,
                        COALESCE(category, 'Fără categorie') as category,
                        NULL as barcode
                    FROM menu
                    ORDER BY category, name
                `);
                console.log(`✅ [labels/getProducts] Found ${products.length} products from menu table`);
            } catch (menuError) {
                console.log('⚠️ [labels/getProducts] Menu table query failed:', menuError.message);
            }
        }
        
        // If no products from menu, try catalog_products
        if (products.length === 0 && catalogExists) {
            try {
                products = await runQuery(`
                    SELECT 
                        id,
                        name,
                        COALESCE(price, 0) as price,
                        COALESCE(category, 'Fără categorie') as category,
                        barcode
                    FROM catalog_products
                    ORDER BY category, name
                `);
                console.log(`✅ [labels/getProducts] Found ${products.length} products from catalog_products table`);
            } catch (catalogError) {
                console.log('⚠️ [labels/getProducts] Catalog_products query failed:', catalogError.message);
            }
        }
        
        // If still no products, try products table
        if (products.length === 0 && productsExists) {
            try {
                products = await runQuery(`
                    SELECT 
                        id,
                        name,
                        COALESCE(price, 0) as price,
                        COALESCE(category, 'Fără categorie') as category,
                        barcode
                    FROM products
                    ORDER BY category, name
                `);
                console.log(`✅ [labels/getProducts] Found ${products.length} products from products table`);
            } catch (productsError) {
                console.log('⚠️ [labels/getProducts] Products table query failed:', productsError.message);
            }
        }
        
        // If no tables exist or all failed, return empty array with warning
        if (!menuExists && !catalogExists && !productsExists) {
            console.warn('⚠️ [labels/getProducts] No product tables found in database!');
            return res.json({
                products: [],
                warning: 'No product tables found in database. Please create menu, catalog_products, or products table.'
            });
        }
        
        console.log(`✅ [labels/getProducts] Returning ${products.length} products`);
        
        // Always return products array, even if empty
        res.json(products);
        
    } catch (error) {
        console.error('❌ [labels/getProducts] Critical Error:', error);
        console.error('❌ [labels/getProducts] Stack:', error.stack);
        
        // Return 500 with detailed error
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message || 'Unknown error',
            details: 'Failed to fetch products for labels',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// POST /api/labels/generate
async function generateLabel(req, res, next) {
    try {
        const { product_id, product_name, price, barcode, additional_info } = req.body;

        if (!product_name || !price) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'product_name and price are required' 
            });
        }

        const label = {
            product_id,
            product_name,
            price: parseFloat(price),
            barcode: barcode || null,
            additional_info: additional_info || null,
            generated_at: new Date().toISOString()
        };

        console.log('✅ [labels/generateLabel] Label generated:', label);
        res.json(label);
        
    } catch (error) {
        console.error('❌ [labels/generateLabel] Error:', error);
        next(error);
    }
}

// POST /api/labels/print-batch
async function printBatch(req, res, next) {
    try {
        const { product_id, count } = req.body;

        if (!product_id || !count) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'product_id and count are required' 
            });
        }

        if (count < 1 || count > 100) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'Count must be between 1 and 100' 
            });
        }

        console.log(`🔍 [labels/printBatch] Fetching product ${product_id} for ${count} labels`);
        
        const db = await dbPromise;
        let product = null;
        
        // Check which tables exist
        const menuExists = await tableExists(db, 'menu');
        const catalogExists = await tableExists(db, 'catalog_products');
        const productsExists = await tableExists(db, 'products');
        
        // Try menu table first
        if (menuExists) {
            const rows = await runQuery(`
                SELECT id, name, COALESCE(price, 0) as price, NULL as barcode
                FROM menu
                WHERE id = ?
            `, [product_id]);
            
            if (rows.length > 0) {
                product = rows[0];
                console.log('✅ [labels/printBatch] Product found in menu table');
            }
        }
        
        // Try catalog_products if not found
        if (!product && catalogExists) {
            const rows = await runQuery(`
                SELECT id, name, COALESCE(price, 0) as price, barcode
                FROM catalog_products
                WHERE id = ?
            `, [product_id]);
            
            if (rows.length > 0) {
                product = rows[0];
                console.log('✅ [labels/printBatch] Product found in catalog_products table');
            }
        }
        
        // Try products table if still not found
        if (!product && productsExists) {
            const rows = await runQuery(`
                SELECT id, name, COALESCE(price, 0) as price, barcode
                FROM products
                WHERE id = ?
            `, [product_id]);
            
            if (rows.length > 0) {
                product = rows[0];
                console.log('✅ [labels/printBatch] Product found in products table');
            }
        }

        if (!product) {
            console.warn(`⚠️ [labels/printBatch] Product ${product_id} not found in any table`);
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'Product not found' 
            });
        }

        const response = {
            product: product,
            count: parseInt(count),
            message: `Batch of ${count} labels ready for printing`,
            timestamp: new Date().toISOString()
        };

        console.log('✅ [labels/printBatch] Batch prepared successfully');
        res.json(response);
        
    } catch (error) {
        console.error('❌ [labels/printBatch] Error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message,
            details: 'Failed to fetch product for batch printing',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

module.exports = {
    getProducts,
    generateLabel,
    printBatch,
};
