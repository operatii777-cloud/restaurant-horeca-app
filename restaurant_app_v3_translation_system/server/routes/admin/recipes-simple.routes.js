const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../database');

// Helper function for db.all() - wraps sqlite3 callback in Promise
async function dbAll(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // Deep clone to remove any EventEmitter properties
                const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
                resolve(result);
            }
        });
    });
}

// GET all recipes grouped by product
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching recipes from real database...');
        
        const db = await dbPromise;
        const recipes = await dbAll(db, `
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
        const db = await dbPromise;
        
        const recipes = await dbAll(db, `
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
        
        if (!Array.isArray(recipes)) {
            throw new Error('Recipes query nu returnează array');
        }
        
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

// POST /api/admin/recipes/calculate-nutrition
router.post('/calculate-nutrition', async (req, res) => {
    try {
        const { product_id, ingredients, servings = 1 } = req.body;
        
        if (!product_id || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Lipsesc date obligatorii: product_id și ingredients'
            });
        }

        const { dbPromise } = require('../../database');
        const db = await dbPromise;
        
        let totals = {
            energy_kcal: 0,
            energy_kj: 0,
            protein: 0,
            carbs: 0,
            sugars: 0,
            fat: 0,
            saturated_fat: 0,
            fiber: 0,
            salt: 0
        };
        
        let totalWeight = 0;
        
        for (const ing of ingredients) {
            if (!ing.ingredient_id || !ing.quantity || !ing.unit) {
                continue;
            }
            
            // Get nutrition data from ingredient_catalog
            const catalog = await new Promise((resolve, reject) => {
                db.get(`
                SELECT 
                    energy_kcal, energy_kj, protein, carbs, sugars, fat, saturated_fat, fiber, salt,
                    standard_unit
                FROM ingredient_catalog
                WHERE id = ?
            `, [ing.ingredient_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!catalog) {
                continue;
            }
            
            // Convert quantity to grams using unit conversion helper
            const { convertUnit } = require('../../../helpers/unit-conversion');
            let quantityInGrams = ing.quantity;
            
            if (ing.unit && ing.unit.toLowerCase() !== 'g' && ing.unit.toLowerCase() !== 'gr') {
                const conversion = convertUnit(ing.quantity, ing.unit, 'g');
                if (conversion.success) {
                    quantityInGrams = conversion.value;
                } else {
                    // Fallback: try common conversions
                    const unitLower = ing.unit.toLowerCase();
                    if (unitLower === 'kg') {
                        quantityInGrams = ing.quantity * 1000;
                    } else if (unitLower === 'l' || unitLower === 'L') {
                        quantityInGrams = ing.quantity * 1000; // Approximate: 1L ≈ 1000g for water-based
                    } else if (unitLower === 'ml') {
                        quantityInGrams = ing.quantity; // Approximate: 1ml ≈ 1g
                    } else {
                        // Default: assume already in grams
                        quantityInGrams = ing.quantity;
                    }
                }
            }
            
            // Apply waste percentage
            const quantityNet = quantityInGrams * (1 - (ing.waste_percentage || 0) / 100);
            
            // Calculate factor (nutrition values are per 100g in catalog)
            const factor = quantityNet / 100;
            
            totals.energy_kcal += (catalog.energy_kcal || 0) * factor;
            totals.energy_kj += (catalog.energy_kj || 0) * factor;
            totals.protein += (catalog.protein || 0) * factor;
            totals.carbs += (catalog.carbs || 0) * factor;
            totals.sugars += (catalog.sugars || 0) * factor;
            totals.fat += (catalog.fat || 0) * factor;
            totals.saturated_fat += (catalog.saturated_fat || 0) * factor;
            totals.fiber += (catalog.fiber || 0) * factor;
            totals.salt += (catalog.salt || 0) * factor;
            
            totalWeight += quantityNet;
        }
        
        // Normalize to per serving
        if (totalWeight > 0 && servings > 0) {
            const perServingFactor = 1 / servings;
            Object.keys(totals).forEach(key => {
                totals[key] = parseFloat((totals[key] * perServingFactor).toFixed(2));
            });
        }
        
        res.json({
            success: true,
            nutrition: totals,
            total_weight_grams: totalWeight,
            servings: servings
        });
    } catch (error) {
        console.error('❌ Error calculating nutrition:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;


