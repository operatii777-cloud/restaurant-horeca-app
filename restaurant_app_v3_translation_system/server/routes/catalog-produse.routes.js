/**
 * ============================================================================
 * CATALOG PRODUSE - MODERN STYLE API ROUTES
 * ============================================================================
 * Created: 23 Oct 2025
 * Purpose: API endpoints for MODERN-style product catalog with advanced features
 * ============================================================================
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/db-constants');

// Database connection
const db = new sqlite3.Database(DB_PATH);

// Helper function to promisify database queries
function dbAll(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function dbGet(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function dbGetOptional(query, params = []) {
    try {
        return await dbGet(query, params);
    } catch (error) {
        if (error && /no such table/i.test(String(error.message))) {
            return null;
        }
        throw error;
    }
}

function dbRun(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

module.exports = function createCatalogRoutes(deps = {}) {
    const router = express.Router();
    const invalidateCache =
        typeof deps.invalidateMenuCache === 'function' ? deps.invalidateMenuCache : () => {};

    const safeInvalidateMenuCache = () => {
        try {
            invalidateCache();
        } catch (error) {
            console.warn('[catalog] invalidateMenuCache a eșuat:', error);
        }
    };

    const runInTransaction = async (callback) => {
        await dbRun('BEGIN IMMEDIATE TRANSACTION');
        try {
            const result = await callback();
            await dbRun('COMMIT');
            return result;
        } catch (error) {
            try {
                await dbRun('ROLLBACK');
            } catch (rollbackError) {
                console.error('[catalog] rollback failed:', rollbackError);
            }
            throw error;
        }
    };

    const dbRunIgnoringMissingTable = async (query, params = []) => {
        try {
            await dbRun(query, params);
        } catch (error) {
            if (error && /no such table/i.test(String(error.message))) {
                console.warn('[catalog] Tabel inexistent (ignorat):', error.message);
                return;
            }
            throw error;
        }
    };

    // ============================================================================
    // 1. GET /api/catalog/categories/tree - Hierarchical category tree
    // ============================================================================
router.get('/categories/tree', async (req, res) => {
    try {
        const categories = await dbAll(`
            SELECT 
                c.id,
                c.name,
                c.name_en,
                c.parent_id,
                c.icon,
                c.display_order,
                c.is_expanded,
                c.is_active,
                COUNT(m.id) as product_count
            FROM categories c
            LEFT JOIN menu m ON m.category = c.name
            WHERE c.is_active = 1
            GROUP BY c.id
            ORDER BY c.display_order, c.name
        `);
        
        // Build tree structure
        const buildTree = (parentId = null) => {
            return categories
                .filter(cat => cat.parent_id === parentId)
                .map(cat => ({
                    ...cat,
                    children: buildTree(cat.id)
                }));
        };
        
        const tree = buildTree(null);
        
        res.json({
            success: true,
            categories: tree,
            total: categories.length
        });
    } catch (error) {
        console.error('Error fetching category tree:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 2. GET /api/catalog/products - All products with extended details
// ============================================================================
router.get('/products', async (req, res) => {
    try {
        const { category, search, is_active, has_recipe } = req.query;
        
        let query = `
            SELECT 
                m.id,
                m.name,
                m.name_en,
                m.price,
                m.vat_rate,
                m.unit,
                m.category,
                m.stock_management,
                m.preparation_section,
                m.is_sellable as for_sale,
                m.is_sellable as is_active,
                m.has_recipe,
                m.is_fraction,
                m.display_order,
                m.description,
                m.description_en,
                m.image_url,
                m.allergens,
                m.allergens_computed,
                m.ingredients,
                m.cost_price
            FROM menu m
            WHERE 1=1
        `;
        
        const params = [];
        
        if (category) {
            query += ` AND m.category = ?`;
            params.push(category);
        }
        
        if (search) {
            query += ` AND (m.name LIKE ? OR m.name_en LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        if (is_active !== undefined) {
            query += ` AND m.is_sellable = ?`;
            params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
        }
        
        if (has_recipe !== undefined) {
            query += ` AND m.has_recipe = ?`;
            params.push(has_recipe === 'true' || has_recipe === '1' ? 1 : 0);
        }
        
        query += ` ORDER BY m.display_order, m.name`;
        
        const products = await dbAll(query, params);
        
        res.json({
            success: true,
            data: products,  // ✅ Changed from "products" to "data" for compatibility with useAPI hook
            products: products,  // Keep for backward compatibility
            total: products.length
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 2.0.bis GET /api/catalog/products/:id/chef-summary - Cost & allergen info
// ============================================================================
router.get('/products/:id/chef-summary', async (req, res) => {
    try {
        const { id } = req.params;

        const product = await dbGet('SELECT id, name, price, cost_price, allergens, allergens_computed, ingredients, has_recipe FROM menu WHERE id = ?', [id]);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Produsul nu a fost găsit' });
        }

        const parseArray = (value) => {
            if (!value && value !== 0) return [];
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) {
                        return parsed.map((entry) => (typeof entry === 'string' ? entry.trim() : entry)).filter(Boolean);
                    }
                } catch (error) {
                    // Fallback: split by virgulă
                    return value
                        .split(/[,\n]/)
                        .map((entry) => entry.trim())
                        .filter(Boolean);
                }
                return value
                    .split(/[,\n]/)
                    .map((entry) => entry.trim())
                    .filter(Boolean);
            }
            return [];
        };

        const toNumber = (value) => {
            if (value === null || value === undefined || value === '') return null;
            const num = Number(value);
            return Number.isFinite(num) ? num : null;
        };

        const price = toNumber(product.price) ?? 0;
        const cost = toNumber(product.cost_price);
        const marginValue = cost !== null ? Number((price - cost).toFixed(2)) : null;
        const marginPercent =
            cost !== null && price !== 0 ? Number((((price - cost) / price) * 100).toFixed(2)) : null;

        const recipeInfo = await dbGetOptional(
            'SELECT id, version, updated_at FROM recipes WHERE product_id = ? ORDER BY updated_at DESC LIMIT 1',
            [id],
        );
        const costInfo = await dbGetOptional(
            'SELECT updated_at FROM product_costs WHERE product_id = ? ORDER BY updated_at DESC LIMIT 1',
            [id],
        );
        const portionInfo = await dbGetOptional(
            'SELECT quantity, unit FROM portion_standards WHERE product_id = ? ORDER BY id DESC LIMIT 1',
            [id],
        );

        res.json({
            success: true,
            data: {
                product_id: product.id,
                name: product.name,
                price,
                cost_price: cost,
                margin_value: marginValue,
                margin_percent: marginPercent,
                has_recipe: Boolean(product.has_recipe),
                allergens: parseArray(product.allergens),
                allergens_computed: parseArray(product.allergens_computed),
                ingredients: parseArray(product.ingredients),
                recipe: recipeInfo
                    ? {
                          id: recipeInfo.id,
                          version: recipeInfo.version ?? null,
                          updated_at: recipeInfo.updated_at ?? null,
                      }
                    : null,
                cost_last_updated: costInfo?.updated_at ?? null,
                portion: portionInfo
                    ? {
                          quantity: portionInfo.quantity ?? null,
                          unit: portionInfo.unit ?? null,
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error('Error fetching chef summary:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 2.1.a POST /api/catalog/products/reorder - Reorder products within a category
// ============================================================================
router.post('/products/reorder', async (req, res) => {
    try {
        const { category, ordered_ids: orderedIds } = req.body || {};

        if (!category || typeof category !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Este necesară denumirea categoriei pentru reordonarea produselor.',
            });
        }

        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Trimite un vector ordered_ids cu ID-urile produselor în noua ordine.',
            });
        }

        let updated = 0;
        await runInTransaction(async () => {
            for (let index = 0; index < orderedIds.length; index += 1) {
                const productId = Number(orderedIds[index]);
                if (!Number.isFinite(productId)) {
                    continue;
                }
                const result = await dbRun(
                    `UPDATE menu SET display_order = ? WHERE id = ? AND category = ?`,
                    [index + 1, productId, category],
                );
                updated += result.changes ?? 0;
            }
        });

        safeInvalidateMenuCache();

        res.json({
            success: true,
            updated,
            message: 'Ordinea produselor a fost salvată cu succes.',
        });
    } catch (error) {
        console.error('Error reordering products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 2.1.b POST /api/catalog/categories/reorder - Reorder categories by parent
// ============================================================================
router.post('/categories/reorder', async (req, res) => {
    try {
        const { parent_id: parentId = null, ordered_ids: orderedIds } = req.body || {};

        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Trimite un vector ordered_ids cu ID-urile categoriilor în noua ordine.',
            });
        }

        let updated = 0;
        await runInTransaction(async () => {
            for (let index = 0; index < orderedIds.length; index += 1) {
                const categoryId = Number(orderedIds[index]);
                if (!Number.isFinite(categoryId)) {
                    continue;
                }

                if (parentId === null || parentId === undefined) {
                    const result = await dbRun(
                        `UPDATE categories SET display_order = ? WHERE id = ? AND parent_id IS NULL`,
                        [index + 1, categoryId],
                    );
                    updated += result.changes ?? 0;
                } else {
                    const numericParent = Number(parentId);
                    if (!Number.isFinite(numericParent)) {
                        continue;
                    }
                    const result = await dbRun(
                        `UPDATE categories SET display_order = ? WHERE id = ? AND parent_id = ?`,
                        [index + 1, categoryId, numericParent],
                    );
                    updated += result.changes ?? 0;
                }
            }
        });

        safeInvalidateMenuCache();

        res.json({
            success: true,
            updated,
            message: 'Ordinea categoriilor a fost salvată.',
        });
    } catch (error) {
        console.error('Error reordering categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 2.0. POST /api/catalog/products - Create a new product entry
// ============================================================================
router.post('/products', async (req, res) => {
    try {
        const {
            name,
            name_en,
            category,
            price,
            vat_rate,
            unit,
            description,
            description_en,
            stock_management,
            preparation_section,
            is_sellable,
            has_recipe,
            is_active,
            display_order,
            cost_price,
            allergens,
            allergens_computed,
            ingredients,
        } = req.body || {};

        if (!name || !category || unit === undefined || price === undefined || vat_rate === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Câmpurile name, category, price, vat_rate și unit sunt obligatorii',
            });
        }

        const currentDisplayOrder = await dbGet('SELECT MAX(display_order) as maxOrder FROM menu');
        const nextDisplayOrder = display_order !== undefined && display_order !== null
            ? Number(display_order)
            : ((currentDisplayOrder?.maxOrder ?? 0) + 1);

        const numericPrice = Number(price) || 0;
        const numericVat = Number(vat_rate) || 0;
        const numericCost = Number(cost_price) || 0;
        const sellable = is_sellable === 1 || is_sellable === true ? 1 : 0;
        const recipeFlag = has_recipe === 1 || has_recipe === true ? 1 : 0;
        const activeFlag = is_active === 1 || is_active === true ? 1 : sellable;

        const insertResult = await dbRun(
            `INSERT INTO menu (
                name,
                name_en,
                category,
                price,
                vat_rate,
                unit,
                description,
                description_en,
                stock_management,
                preparation_section,
                is_sellable,
                has_recipe,
                is_active,
                display_order,
                cost_price,
                allergens,
                allergens_computed,
                ingredients
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                name_en || null,
                category,
                numericPrice,
                numericVat,
                unit,
                description || null,
                description_en || null,
                stock_management || 'fifo',
                preparation_section || null,
                sellable,
                recipeFlag,
                activeFlag,
                Number.isFinite(nextDisplayOrder) ? nextDisplayOrder : null,
                numericCost,
                Array.isArray(allergens) ? JSON.stringify(allergens) : allergens || null,
                Array.isArray(allergens_computed)
                    ? JSON.stringify(allergens_computed)
                    : allergens_computed || null,
                Array.isArray(ingredients) ? JSON.stringify(ingredients) : ingredients || null,
            ],
        );

        const createdProduct = await dbGet('SELECT * FROM menu WHERE id = ?', [insertResult.lastID]);

        safeInvalidateMenuCache();

        res.json({
            success: true,
            message: 'Produs creat cu succes',
            product_id: insertResult.lastID,
            data: createdProduct,
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 2.1. PUT /api/catalog/products/bulk-price-change - Bulk price update
// ============================================================================
router.put('/products/bulk-price-change', async (req, res) => {
    try {
        const { product_ids, new_price, new_vat_rate, changed_by } = req.body;
        
        if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
            return res.status(400).json({ success: false, error: 'product_ids array is required' });
        }
        
        let updated = 0;
        
        for (const productId of product_ids) {
            const product = await dbGet('SELECT price, vat_rate FROM menu WHERE id = ?', [productId]);
            
            if (product) {
                await dbRun(`
                    INSERT INTO product_price_history (product_id, old_price, new_price, old_vat_rate, new_vat_rate, changed_by)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    productId,
                    product.price,
                    new_price !== undefined ? new_price : product.price,
                    product.vat_rate,
                    new_vat_rate !== undefined ? new_vat_rate : product.vat_rate,
                    changed_by || 'admin'
                ]);
                
                const updates = [];
                const params = [];
                
                if (new_price !== undefined) {
                    updates.push('price = ?');
                    params.push(new_price);
                }
                
                if (new_vat_rate !== undefined) {
                    updates.push('vat_rate = ?');
                    params.push(new_vat_rate);
                }
                
                if (updates.length > 0) {
                    params.push(productId);
                    await dbRun(`UPDATE menu SET ${updates.join(', ')} WHERE id = ?`, params);
                    updated++;
                }
            }
        }
        
        safeInvalidateMenuCache();

        res.json({
            success: true,
            message: `Updated ${updated} products`,
            updated_count: updated
        });
    } catch (error) {
        console.error('Error in bulk price change:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 2.1. PUT /api/catalog/products/:id - Update a product
// ============================================================================
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Verify product exists
        const existing = await dbGet('SELECT id FROM menu WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        // Build dynamic UPDATE query
        const fields = [];
        const values = [];
        
        const allowedFields = [
            'name', 'name_en', 'category', 'price', 'vat_rate', 'unit',
            'description', 'description_en', 'weight', 'allergens', 'allergens_computed', 'info',
            'ingredients', 'prep_time', 'spice_level', 'image_url',
            'cost_price', 'is_sellable', 'stock_management',
            'preparation_section', 'is_fraction', 'has_recipe',
            'is_active', 'display_order'
        ];
        
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }
        
        if (fields.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }
        
        values.push(id); // Add ID for WHERE clause
        
        await dbRun(`
            UPDATE menu
            SET ${fields.join(', ')}
            WHERE id = ?
        `, values);
        
        // Return updated product
        const updated = await dbGet('SELECT * FROM menu WHERE id = ?', [id]);
        
        safeInvalidateMenuCache();

        res.json({
            success: true,
            data: updated,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 3. POST /api/catalog/products/:id/clone - Clone a product
// ============================================================================
router.post('/products/:id/clone', async (req, res) => {
    try {
        const { id } = req.params;
        const { new_name } = req.body;
        
        if (!new_name) {
            return res.status(400).json({ success: false, error: 'new_name is required' });
        }
        
        // Get original product
        const original = await dbGet('SELECT * FROM menu WHERE id = ?', [id]);
        
        if (!original) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        // Insert cloned product
        const result = await dbRun(`
            INSERT INTO menu (
                name, name_en, category, price, vat_rate, unit,
                description, description_en, weight, allergens, info,
                ingredients, prep_time, spice_level, image_url,
                cost_price, is_sellable, stock_management,
                preparation_section, is_fraction, has_recipe,
                is_active, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            new_name,
            new_name + ' (EN)',
            original.category,
            original.price,
            original.vat_rate,
            original.unit,
            original.description,
            original.description_en,
            original.weight,
            original.allergens,
            original.info,
            original.ingredients,
            original.prep_time,
            original.spice_level,
            original.image_url,
            original.cost_price,
            original.is_sellable,
            original.stock_management,
            original.preparation_section,
            original.is_fraction,
            original.has_recipe,
            original.is_active,
            original.display_order + 1
        ]);
        
        // Clone recipe if exists
        if (original.has_recipe === 1) {
            const recipeItems = await dbAll('SELECT * FROM recipes WHERE product_id = ?', [id]);
            
            for (const item of recipeItems) {
                await dbRun(`
                    INSERT INTO recipes (product_id, ingredient_id, quantity, unit)
                    VALUES (?, ?, ?, ?)
                `, [result.lastID, item.ingredient_id, item.quantity, item.unit]);
            }
        }
        
        safeInvalidateMenuCache();

        res.json({
            success: true,
            message: 'Product cloned successfully',
            new_product_id: result.lastID
        });
    } catch (error) {
        console.error('Error cloning product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 4. DELETE /api/catalog/products/:id - Delete product with cleanup
// ============================================================================
router.delete('/products/:id', async (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({ success: false, error: 'Produs invalid' });
    }

    try {
        await dbRun('BEGIN IMMEDIATE TRANSACTION');

        const cleanupStatements = [
            { sql: 'DELETE FROM customization_options WHERE menu_item_id = ?', params: [productId] },
            { sql: 'DELETE FROM recipes WHERE product_id = ?', params: [productId] },
            { sql: 'DELETE FROM portion_standards WHERE product_id = ?', params: [productId] },
            { sql: 'DELETE FROM portion_compliance_log WHERE product_id = ?', params: [productId] },
            { sql: 'DELETE FROM stock_history WHERE product_id = ?', params: [productId] },
        ];

        for (const statement of cleanupStatements) {
            await dbRunIgnoringMissingTable(statement.sql, statement.params);
        }

        await dbRun('DELETE FROM menu WHERE id = ?', [productId]);
        await dbRun('COMMIT');

        safeInvalidateMenuCache();

        res.json({ success: true, message: 'Produs șters cu succes' });
    } catch (error) {
        try {
            await dbRun('ROLLBACK');
        } catch (rollbackError) {
            console.warn('[catalog] ROLLBACK eșuat pentru ștergerea produsului:', rollbackError);
        }
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. GET /api/catalog/products/:id/price-history - Price change history
// ============================================================================
router.get('/products/:id/price-history', async (req, res) => {
    try {
        const { id } = req.params;
        
        const history = await dbAll(`
            SELECT *
            FROM product_price_history
            WHERE product_id = ?
            ORDER BY changed_at DESC
            LIMIT 50
        `, [id]);
        
        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 6. GET /api/catalog/products/:id/dependencies - Product dependencies
// ============================================================================
router.get('/products/:id/dependencies', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get recipe ingredients
        const recipeIngredients = await dbAll(`
            SELECT 
                i.id,
                i.name,
                i.name_en,
                r.quantity_needed AS quantity,
                r.unit,
                i.current_stock,
                i.category
            FROM recipes r
            JOIN ingredients i ON r.ingredient_id = i.id
            WHERE r.product_id = ?
        `, [id]);
        
        // Get other products using same ingredients
        const relatedProducts = await dbAll(`
            SELECT DISTINCT
                m.id,
                m.name,
                m.category
            FROM menu m
            JOIN recipes r ON m.id = r.product_id
            WHERE r.ingredient_id IN (
                SELECT ingredient_id FROM recipes WHERE product_id = ?
            )
            AND m.id != ?
        `, [id, id]);
        
        res.json({
            success: true,
            dependencies: {
                ingredients: recipeIngredients,
                related_products: relatedProducts
            }
        });
    } catch (error) {
        console.error('Error fetching dependencies:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 7. GET /api/catalog/products/export - Export products to CSV
// ============================================================================
router.get('/products/export', async (req, res) => {
    try {
        const { format, category } = req.query;
        
        let query = `
            SELECT 
                m.id,
                m.name,
                m.price,
                m.vat_rate,
                m.unit,
                m.category,
                m.stock_management,
                m.preparation_section,
                m.is_sellable,
                m.has_recipe,
                m.is_fraction,
                m.cost_price
            FROM menu m
            WHERE 1=1
        `;
        
        const params = [];
        
        if (category) {
            query += ` AND m.category = ?`;
            params.push(category);
        }
        
        query += ` ORDER BY m.category, m.name`;
        
        const products = await dbAll(query, params);
        
        // Generate CSV
        let csv = 'ID,Nume,Preț,TVA %,U.M.,Categorie,Gestiune,Secție,La Vânzare,Are Rețetă,Fracție,Cost\n';
        
        products.forEach(p => {
            csv += `${p.id},"${p.name}",${p.price},${p.vat_rate},${p.unit},"${p.category}","${p.stock_management}","${p.preparation_section}",${p.is_sellable},${p.has_recipe},${p.is_fraction},${p.cost_price}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="catalog-produse-${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 8. POST /api/catalog/categories - Create new category
// ============================================================================
router.post('/categories', async (req, res) => {
    try {
        const { name, name_en, parent_id, icon } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, error: 'name is required' });
        }
        
        const result = await dbRun(`
            INSERT INTO categories (name, name_en, parent_id, icon)
            VALUES (?, ?, ?, ?)
        `, [name, name_en || name, parent_id || null, icon || '📁']);
        
        safeInvalidateMenuCache();

        res.json({
            success: true,
            message: 'Category created',
            category_id: result.lastID
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 9. PUT /api/catalog/categories/:id - Update category
// ============================================================================
router.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, name_en, icon, is_active } = req.body;
        
        const updates = [];
        const params = [];
        
        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        
        if (name_en) {
            updates.push('name_en = ?');
            params.push(name_en);
        }
        
        if (icon) {
            updates.push('icon = ?');
            params.push(icon);
        }
        
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active ? 1 : 0);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }
        
        params.push(id);
        await dbRun(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);
        
        safeInvalidateMenuCache();

        res.json({ success: true, message: 'Category updated' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 10. DELETE /api/catalog/categories/:id - Delete category (if empty)
// ============================================================================
router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if category has products
        const productCount = await dbGet(
            'SELECT COUNT(*) as count FROM menu WHERE category = (SELECT name FROM categories WHERE id = ?)',
            [id]
        );
        
        if (productCount && productCount.count > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete category: ${productCount.count} products assigned`
            });
        }
        
        // Check if category has children
        const childCount = await dbGet('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?', [id]);
        
        if (childCount && childCount.count > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete category: has ${childCount.count} sub-categories`
            });
        }
        
        await dbRun('DELETE FROM categories WHERE id = ?', [id]);
        
        safeInvalidateMenuCache();

        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

    return router;
};

