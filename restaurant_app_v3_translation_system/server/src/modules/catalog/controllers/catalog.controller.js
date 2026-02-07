/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/catalog-produse.routes.js
 * 
 * NOTE: This controller uses direct SQLite connection (factory pattern)
 * to maintain compatibility with original catalog routes.
 */

/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/catalog.js
 * 
 * FIXED: Use dbPromise instead of creating new connections
 * This prevents database connection exhaustion and server crashes
 * REMOVED: Direct sqlite3.Database connection - using shared dbPromise
 */

const { dbPromise } = require('../../../../database');
// PHASE PRODUCTION-READY: Use centralized validators
const { validateProduct, validateCategory } = require('../../../utils/validators');
const { AppError, createValidationError, createNotFoundError } = require('../../../utils/error-handler');

// Helper to get DB with timeout
async function getDb() {
    try {
        return await Promise.race([
            dbPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
        ]);
    } catch (dbError) {
        console.warn('⚠️ Database not ready for catalog:', dbError.message);
        throw dbError;
    }
}

// Helper functions (using dbPromise)
async function dbAll(query, params = []) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function dbGet(query, params = []) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function dbRun(query, params = []) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
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

// Controller factory - receives dependencies
function createCatalogController(deps = {}) {
    const invalidateCache = typeof deps.invalidateMenuCache === 'function' ? deps.invalidateMenuCache : () => { };

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

    // GET /api/catalog/categories/tree
    async function getCategoryTree(req, res, next) {
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
            next(error);
        }
    }

    // GET /api/catalog/products
    async function getProducts(req, res, next) {
        try {
            const { category, search, is_active, has_recipe } = req.query;

            let query = `
                SELECT 
                    m.id,
                    m.name,
                    m.name_en,
                    m.price,
                    m.pret2,
                    m.pret3,
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
                data: products,
                products: products,
                total: products.length
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/catalog/products/:id/chef-summary
    async function getChefSummary(req, res, next) {
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
            next(error);
        }
    }

    // POST /api/catalog/products/reorder
    async function reorderProducts(req, res, next) {
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
            next(error);
        }
    }

    // POST /api/catalog/categories/reorder
    async function reorderCategories(req, res, next) {
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
            next(error);
        }
    }

    // POST /api/catalog/products
    async function createProduct(req, res, next) {
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

            // PHASE PRODUCTION-READY: Use centralized validators
            const productData = {
                name,
                category,
                price,
                vat_rate,
                unit,
                cost_price,
                is_sellable,
                has_recipe
            };

            const validation = validateProduct(productData, 'create');
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: validation.errors
                    }
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
            next(error);
        }
    }

    // PUT /api/catalog/products/bulk-price-change
    async function bulkPriceChange(req, res, next) {
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
            next(error);
        }
    }

    // PUT /api/catalog/products/:id
    async function updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // PHASE PRODUCTION-READY: Validate product data
            const validation = validateProduct(updates, 'update');
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: validation.errors
                    }
                });
            }

            const existing = await dbGet('SELECT id FROM menu WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }

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

            values.push(id);

            await dbRun(`
                UPDATE menu
                SET ${fields.join(', ')}
                WHERE id = ?
            `, values);

            const updated = await dbGet('SELECT * FROM menu WHERE id = ?', [id]);

            safeInvalidateMenuCache();

            res.json({
                success: true,
                data: updated,
                message: 'Product updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/catalog/products/:id/clone
    async function cloneProduct(req, res, next) {
        try {
            const { id } = req.params;
            const { new_name } = req.body;

            if (!new_name) {
                return res.status(400).json({ success: false, error: 'new_name is required' });
            }

            const original = await dbGet('SELECT * FROM menu WHERE id = ?', [id]);

            if (!original) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }

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
            next(error);
        }
    }

    // DELETE /api/catalog/products/:id
    async function deleteProduct(req, res, next) {
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
            next(error);
        }
    }

    // GET /api/catalog/products/:id/price-history
    async function getPriceHistory(req, res, next) {
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
            next(error);
        }
    }

    // GET /api/catalog/products/:id/dependencies
    async function getDependencies(req, res, next) {
        try {
            const { id } = req.params;

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
            next(error);
        }
    }

    // GET /api/catalog/products/export
    async function exportProducts(req, res, next) {
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

            let csv = 'ID,Nume,Preț,TVA %,U.M.,Categorie,Gestiune,Secție,La Vânzare,Are Rețetă,Fracție,Cost\n';

            products.forEach(p => {
                csv += `${p.id},"${p.name}",${p.price},${p.vat_rate},${p.unit},"${p.category}","${p.stock_management}","${p.preparation_section}",${p.is_sellable},${p.has_recipe},${p.is_fraction},${p.cost_price}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="catalog-produse-${Date.now()}.csv"`);
            res.send(csv);
        } catch (error) {
            next(error);
        }
    }

    // POST /api/catalog/categories
    async function createCategory(req, res, next) {
        try {
            const { name, name_en, parent_id, icon } = req.body;

            // PHASE PRODUCTION-READY: Use centralized validators
            const validation = validateCategory({ name, name_en, parent_id, icon }, 'create');
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: validation.errors
                    }
                });
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
            next(error);
        }
    }

    // PUT /api/catalog/categories/:id
    async function updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const { name, name_en, icon, is_active } = req.body;

            // PHASE PRODUCTION-READY: Validate category data
            const validation = validateCategory({ name, name_en, icon }, 'update');
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: validation.errors
                    }
                });
            }

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
            next(error);
        }
    }

    // DELETE /api/catalog/categories/:id
    async function deleteCategory(req, res, next) {
        try {
            const { id } = req.params;

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
            next(error);
        }
    }

    return {
        getCategoryTree,
        getProducts,
        getChefSummary,
        reorderProducts,
        reorderCategories,
        createProduct,
        bulkPriceChange,
        updateProduct,
        cloneProduct,
        deleteProduct,
        getPriceHistory,
        getDependencies,
        exportProducts,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}

module.exports = { createCatalogController };

