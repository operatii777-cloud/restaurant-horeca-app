const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// GET all recipes grouped by product
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching recipes from real database...');
        
        const recipes = await db.all(`
            SELECT 
                r.id,
                r.product_id,
                r.ingredient_id,
                r.quantity_needed,
                r.unit,
                r.waste_percentage,
                r.item_type,
                m.name as product_name,
                m.name_en as product_name_en,
                i.name as ingredient_name,
                i.name_en as ingredient_name_en,
                i.cost_per_unit
            FROM recipes r
            LEFT JOIN menu m ON r.product_id = m.id
            LEFT JOIN ingredients i ON r.ingredient_id = i.id
            ORDER BY m.name, r.id
        `);
        
        console.log(`✅ Found ${recipes.length} recipes`);
        
        res.json({
            success: true,
            data: recipes.map(r => ({
                ...r,
                product_name_en: r.product_name_en || r.product_name,
                ingredient_name_en: r.ingredient_name_en || r.ingredient_name,
                estimated_cost: (r.quantity_needed * (r.cost_per_unit || 0)).toFixed(2)
            }))
        });
    } catch (error) {
        console.error('❌ Error fetching recipes:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET recipes by product
router.get('/by-product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        
        const recipes = await db.all(`
            SELECT 
                r.*,
                i.name as ingredient_name,
                i.name_en as ingredient_name_en,
                i.unit as ingredient_unit,
                i.cost_per_unit
            FROM recipes r
            LEFT JOIN ingredients i ON r.ingredient_id = i.id
            WHERE r.product_id = ?
        `, [productId]);
        
        res.json({
            success: true,
            data: recipes
        });
    } catch (error) {
        console.error('❌ Error fetching recipes:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;


