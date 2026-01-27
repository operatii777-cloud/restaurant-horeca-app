const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// GET all ingredients - SIMPLE VERSION using real database structure
router.get('/', async (req, res) => {
    try {
        console.log('📦 Fetching ingredients from real database...');
        
        const ingredients = await db.all(`
            SELECT 
                id,
                name,
                name_en,
                unit,
                current_stock,
                min_stock,
                category,
                category_en,
                supplier,
                cost_per_unit as avg_price,
                is_hidden,
                is_available
            FROM ingredients
            ORDER BY name
        `);
        
        console.log(`✅ Found ${ingredients.length} ingredients`);
        
        res.json({
            success: true,
            data: ingredients.map(i => ({
                ...i,
                is_active: i.is_available && !i.is_hidden ? 1 : 0,
                name_en: i.name_en || i.name // Use EN name if available, fallback to RO
            }))
        });
    } catch (error) {
        console.error('❌ Error fetching ingredients:', error.message);
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
                SUM(CASE WHEN current_stock < min_stock * 0.2 THEN 1 ELSE 0 END) as critical_stock_count,
                SUM(CASE WHEN current_stock < min_stock THEN 1 ELSE 0 END) as low_stock_count,
                SUM(CASE WHEN is_hidden = 1 THEN 1 ELSE 0 END) as hidden_count
            FROM ingredients
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

module.exports = router;

