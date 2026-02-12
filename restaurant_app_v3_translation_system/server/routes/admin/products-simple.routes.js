const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// GET all products - SIMPLE VERSION using real database structure
router.get('/', async (req, res) => {
    try {
        console.log('🍕 Fetching products from real database...');
        
        // Get category filter if provided
        const { category } = req.query;
        
        let query = `
            SELECT 
                id,
                name,
                name_en,
                category,
                category_en,
                price,
                cost_price,
                description,
                description_en,
                weight,
                is_vegetarian,
                is_spicy,
                is_sellable as is_available,
                is_takeout_only,
                allergens,
                allergens_en,
                prep_time,
                spice_level,
                image_url
            FROM menu
        `;
        
        const params = [];
        
        // Add category filter if provided
        if (category && category.trim() !== '') {
            query += ' WHERE category = ?';
            params.push(category.trim());
        }
        
        query += ' ORDER BY category, name';
        
        const products = await db.all(query, params);
        
        console.log(`✅ Found ${products.length} products`);
        
        // Check if products have recipes
        const productsWithRecipes = await Promise.all(products.map(async (product) => {
            const recipeCount = await db.get(
                `SELECT COUNT(*) as count FROM recipes WHERE product_id = ?`,
                [product.id]
            );
            return {
                ...product,
                has_recipe: recipeCount.count > 0 ? 1 : 0,
                name_en: product.name_en || product.name,
                display_order: 0  // Add default display_order if missing
            };
        }));
        
        res.json(productsWithRecipes);
    } catch (error) {
        console.error('❌ Error fetching products:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET statistics
router.get('/statistics', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN EXISTS(SELECT 1 FROM recipes WHERE recipes.product_id = menu.id) THEN 1 ELSE 0 END) as with_recipes,
                COUNT(*) - SUM(CASE WHEN EXISTS(SELECT 1 FROM recipes WHERE recipes.product_id = menu.id) THEN 1 ELSE 0 END) as without_recipes,
                SUM(CASE WHEN is_sellable = 1 THEN 1 ELSE 0 END) as available
            FROM menu
        `);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Error fetching statistics:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET product cost analysis
router.get('/:id/cost-analysis', async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await db.get(`SELECT * FROM menu WHERE id = ?`, [id]);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        // Calculate total recipe cost
        const recipes = await db.all(`
            SELECT 
                r.quantity_needed,
                i.cost_per_unit
            FROM recipes r
            JOIN ingredients i ON r.ingredient_id = i.id
            WHERE r.product_id = ?
        `, [id]);
        
        const totalCost = recipes.reduce((sum, r) => {
            return sum + (r.quantity_needed * r.cost_per_unit);
        }, 0);
        
        const profit = product.price - totalCost;
        const profitPercentage = product.price > 0 ? ((profit / product.price) * 100).toFixed(2) : 0;
        
        res.json({
            success: true,
            data: {
                product_id: id,
                product_name: product.name,
                price: product.price,
                total_cost: totalCost.toFixed(2),
                profit: profit.toFixed(2),
                profit_percentage: profitPercentage
            }
        });
    } catch (error) {
        console.error('❌ Error calculating cost analysis:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;


