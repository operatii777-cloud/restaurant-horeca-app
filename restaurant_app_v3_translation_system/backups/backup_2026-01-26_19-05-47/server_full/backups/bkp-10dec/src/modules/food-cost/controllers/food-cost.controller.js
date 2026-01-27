/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/food-cost.js
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

// GET /api/food-cost/products
async function getProducts(req, res, next) {
    try {
        const products = await runQuery(`
            SELECT 
                p.id,
                p.name,
                p.category,
                p.price,
                COALESCE(
                    (SELECT SUM(ri.quantity * i.price_per_unit)
                     FROM recipe_ingredients ri
                     JOIN ingredients i ON ri.ingredient_id = i.id
                     WHERE ri.product_id = p.id), 
                    0
                ) as cost
            FROM products p
            WHERE p.is_active = 1
            AND p.price > 0
            ORDER BY p.category, p.name
        `);

        res.json(products);
    } catch (error) {
        next(error);
    }
}

// GET /api/food-cost/stats
async function getStats(req, res, next) {
    try {
        const stats = await runQuery(`
            SELECT 
                COUNT(*) as total_products,
                AVG(
                    CASE 
                        WHEN p.price > 0 THEN 
                            (COALESCE(
                                (SELECT SUM(ri.quantity * i.price_per_unit)
                                 FROM recipe_ingredients ri
                                 JOIN ingredients i ON ri.ingredient_id = i.id
                                 WHERE ri.product_id = p.id), 
                                0
                            ) / p.price) * 100
                        ELSE 0
                    END
                ) as avg_food_cost_percent,
                AVG(
                    CASE 
                        WHEN p.price > 0 THEN 
                            ((p.price - COALESCE(
                                (SELECT SUM(ri.quantity * i.price_per_unit)
                                 FROM recipe_ingredients ri
                                 JOIN ingredients i ON ri.ingredient_id = i.id
                                 WHERE ri.product_id = p.id), 
                                0
                            )) / p.price) * 100
                        ELSE 0
                    END
                ) as avg_margin_percent,
                SUM(
                    CASE 
                        WHEN p.price > 0 AND 
                            (COALESCE(
                                (SELECT SUM(ri.quantity * i.price_per_unit)
                                 FROM recipe_ingredients ri
                                 JOIN ingredients i ON ri.ingredient_id = i.id
                                 WHERE ri.product_id = p.id), 
                                0
                            ) / p.price) * 100 > 35
                        THEN 1 
                        ELSE 0 
                    END
                ) as high_food_cost_count
            FROM products p
            WHERE p.is_active = 1
            AND p.price > 0
        `);

        res.json(stats[0] || {
            total_products: 0,
            avg_food_cost_percent: 0,
            avg_margin_percent: 0,
            high_food_cost_count: 0
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/food-cost/products/:id
async function getProductById(req, res, next) {
    try {
        const product = await runQuery(`
            SELECT 
                p.id,
                p.name,
                p.category,
                p.price,
                p.description
            FROM products p
            WHERE p.id = ?
        `, [req.params.id]);

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const ingredients = await runQuery(`
            SELECT 
                i.id,
                i.name,
                i.unit,
                i.price_per_unit,
                ri.quantity,
                (ri.quantity * i.price_per_unit) as total_cost
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.product_id = ?
        `, [req.params.id]);

        const totalCost = ingredients.reduce((sum, ing) => sum + ing.total_cost, 0);
        const foodCostPercent = product[0].price > 0 ? (totalCost / product[0].price) * 100 : 0;
        const margin = product[0].price > 0 ? ((product[0].price - totalCost) / product[0].price) * 100 : 0;

        res.json({
            ...product[0],
            cost: totalCost,
            food_cost_percent: foodCostPercent,
            margin_percent: margin,
            ingredients: ingredients
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/food-cost/suggest-price
async function suggestPrice(req, res, next) {
    try {
        const { product_id, target_food_cost_percent } = req.body;

        if (!product_id || !target_food_cost_percent) {
            return res.status(400).json({ 
                error: 'product_id and target_food_cost_percent are required' 
            });
        }

        const cost = await runQuery(`
            SELECT 
                COALESCE(
                    (SELECT SUM(ri.quantity * i.price_per_unit)
                     FROM recipe_ingredients ri
                     JOIN ingredients i ON ri.ingredient_id = i.id
                     WHERE ri.product_id = ?), 
                    0
                ) as cost
        `, [product_id]);

        const productCost = cost[0].cost;
        const suggestedPrice = productCost / (target_food_cost_percent / 100);

        res.json({
            product_id,
            current_cost: productCost,
            target_food_cost_percent,
            suggested_price: Math.ceil(suggestedPrice * 100) / 100
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProducts,
    getStats,
    getProductById,
    suggestPrice,
};

