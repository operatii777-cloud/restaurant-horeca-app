/**
 * 📦 INGREDIENT CATALOG ROUTES
 * API endpoints pentru catalog ingrediente (template global)
 * 
 * Endpoints:
 * - GET /api/ingredient-catalog - Listă catalog (cu filtre)
 * - GET /api/ingredient-catalog/:id - Detalii ingredient catalog
 * - POST /api/ingredient-catalog/import/:id - Import în ingredients (creare nouă)
 * - GET /api/allergens-catalog - Listă alergeni (14 majori)
 * - GET /api/additives-catalog - Listă aditivi (E-uri)
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // ============================================================================
    // GET /api/ingredient-catalog - Listă catalog ingrediente
    // ============================================================================
    router.get('/', async (req, res) => {
        try {
            console.log('📦 [CATALOG] Request pentru ingredient catalog:', req.query);
            
            const {
                category,
                search,
                is_common,
                allergen_free,
                organic,
                limit = 1000,
                offset = 0
            } = req.query;
            
            let query = `
                SELECT 
                    id, name, name_en, name_scientific,
                    category, subcategory, food_group,
                    standard_unit, standard_package_size, package_type,
                    allergens, allergen_traces, allergen_free_certified,
                    additives, preservatives,
                    energy_kcal, energy_kj, fat, saturated_fat, carbs, sugars, fiber, protein, salt,
                    processing_loss_percentage, processing_notes,
                    estimated_cost_per_kg, cost_range_min, cost_range_max,
                    origin_country, organic_certified, quality_standard,
                    description, usage_tips,
                    is_active, is_common, is_seasonal, season_months,
                    created_at
                FROM ingredient_catalog
                WHERE is_active = 1
            `;
            
            const params = [];
            
            // Filtre
            if (category) {
                query += ` AND category = ?`;
                params.push(category);
            }
            
            if (search) {
                query += ` AND (name LIKE ? OR name_en LIKE ? OR description LIKE ?)`;
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam);
            }
            
            if (is_common === 'true') {
                query += ` AND is_common = 1`;
            }
            
            if (allergen_free === 'true') {
                query += ` AND allergen_free_certified = 1`;
            }
            
            if (organic === 'true') {
                query += ` AND organic_certified = 1`;
            }
            
            query += ` ORDER BY category, name LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));
            
            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('❌ Eroare la încărcarea catalogului:', err.message);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                try {
                    // Parse JSON fields cu protecție împotriva erorilor
                    const ingredients = rows.map(row => {
                        const safeJSONParse = (value) => {
                            if (!value) return [];
                            if (Array.isArray(value)) return value;
                            if (typeof value === 'string') {
                                try {
                                    return JSON.parse(value);
                                } catch (e) {
                                    console.warn('⚠️ JSON parse failed for value:', value);
                                    return [];
                                }
                            }
                            return [];
                        };
                        
                        return {
                            ...row,
                            allergens: safeJSONParse(row.allergens),
                            allergen_traces: safeJSONParse(row.allergen_traces),
                            additives: safeJSONParse(row.additives),
                            preservatives: safeJSONParse(row.preservatives),
                            season_months: safeJSONParse(row.season_months)
                        };
                    });
                    
                    console.log(`✅ Catalog ingrediente: ${ingredients.length} rezultate`);
                    res.json({ success: true, ingredients, total: ingredients.length });
                } catch (parseError) {
                    console.error('❌ Eroare la parsarea datelor catalog:', parseError.message);
                    return res.status(500).json({ success: false, error: 'Eroare la procesarea datelor' });
                }
            });
        } catch (error) {
            console.error('❌ Eroare la încărcarea catalogului:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // ============================================================================
    // GET /api/ingredient-catalog/allergens - Listă alergeni (14 majori)
    // IMPORTANT: Trebuie ÎNAINTE de /:id pentru a nu fi interceptat
    // ============================================================================
    router.get('/allergens', async (req, res) => {
        try {
            db.all('SELECT * FROM allergens_catalog ORDER BY display_order', [], (err, rows) => {
                if (err) {
                    console.error('❌ Eroare la încărcarea alergenilor:', err.message);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                console.log(`✅ Alergeni catalog: ${rows.length} rezultate`);
                res.json({ success: true, allergens: rows });
            });
        } catch (error) {
            console.error('❌ Eroare la încărcarea alergenilor:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // ============================================================================
    // GET /api/ingredient-catalog/additives - Listă aditivi (E-uri)
    // IMPORTANT: Trebuie ÎNAINTE de /:id pentru a nu fi interceptat
    // ============================================================================
    router.get('/additives', async (req, res) => {
        try {
            db.all('SELECT * FROM additives_catalog ORDER BY e_code', [], (err, rows) => {
                if (err) {
                    console.error('❌ Eroare la încărcarea aditivilor:', err.message);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                console.log(`✅ Aditivi catalog: ${rows.length} rezultate`);
                res.json({ success: true, additives: rows });
            });
        } catch (error) {
            console.error('❌ Eroare la încărcarea aditivilor:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // ============================================================================
    // GET /api/ingredient-catalog/:id - Detalii ingredient catalog
    // ============================================================================
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    id, name, name_en, name_scientific,
                    category, subcategory, food_group,
                    standard_unit, standard_package_size, package_type,
                    allergens, allergen_traces, allergen_free_certified,
                    additives, preservatives,
                    energy_kcal, energy_kj, fat, saturated_fat, monounsaturated_fat, polyunsaturated_fat, trans_fat,
                    carbs, sugars, polyols, starch, fiber, protein, salt, sodium,
                    vitamin_a, vitamin_c, vitamin_d, vitamin_e,
                    calcium, iron, potassium, magnesium,
                    processing_loss_percentage, processing_notes,
                    estimated_cost_per_kg, cost_range_min, cost_range_max,
                    origin_country, origin_region, organic_certified, quality_standard,
                    compliant_ordin_201, compliant_reg_1169, haccp_notes,
                    source, source_url, verified_date, last_updated,
                    mandatory_label_info, warning_labels,
                    description, usage_tips,
                    is_active, is_common, is_seasonal, season_months,
                    created_at
                FROM ingredient_catalog
                WHERE id = ?
            `;
            
            db.get(query, [id], (err, row) => {
                if (err) {
                    console.error('❌ Eroare la încărcarea detaliilor:', err.message);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (!row) {
                    return res.status(404).json({ success: false, error: 'Ingredient nu a fost găsit în catalog' });
                }
                
                try {
                    // Helper function pentru JSON parse sigur
                    const safeJSONParse = (value) => {
                        if (!value) return [];
                        if (Array.isArray(value)) return value;
                        if (typeof value === 'string') {
                            try {
                                return JSON.parse(value);
                            } catch (e) {
                                console.warn('⚠️ JSON parse failed for value:', value);
                                return [];
                            }
                        }
                        return [];
                    };
                    
                    // Parse JSON fields
                    const ingredient = {
                        ...row,
                        allergens: safeJSONParse(row.allergens),
                        allergen_traces: safeJSONParse(row.allergen_traces),
                        additives: safeJSONParse(row.additives),
                        preservatives: safeJSONParse(row.preservatives),
                        warning_labels: safeJSONParse(row.warning_labels),
                        season_months: safeJSONParse(row.season_months)
                    };
                    
                    console.log(`✅ Detalii ingredient catalog #${id}: ${ingredient.name}`);
                    res.json({ success: true, ingredient });
                } catch (parseError) {
                    console.error('❌ Eroare la parsarea detaliilor:', parseError.message);
                    return res.status(500).json({ success: false, error: 'Eroare la procesarea datelor' });
                }
            });
        } catch (error) {
            console.error('❌ Eroare la încărcarea detaliilor:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // ============================================================================
    // POST /api/ingredient-catalog/import/:id - Import în ingredients
    // ============================================================================
    router.post('/import/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const {
                current_stock = 0,
                min_stock = 0,
                cost_per_unit,
                supplier = ''
            } = req.body;
            
            // Step 1: Obține ingredient din catalog
            db.get('SELECT * FROM ingredient_catalog WHERE id = ?', [id], (err, catalogIngredient) => {
                if (err) {
                    console.error('❌ Eroare la citire catalog:', err.message);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (!catalogIngredient) {
                    return res.status(404).json({ success: false, error: 'Ingredient nu a fost găsit în catalog' });
                }
                
                // Step 2: Verifică dacă ingredientul există deja în stoc (după name)
                db.get('SELECT id FROM ingredients WHERE name = ?', [catalogIngredient.name], (err, existing) => {
                    if (err) {
                        console.error('❌ Eroare la verificare duplicat:', err.message);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    if (existing) {
                        return res.status(400).json({ 
                            success: false, 
                            error: `Ingredientul "${catalogIngredient.name}" există deja în stoc (ID: ${existing.id})` 
                        });
                    }
                    
                    // Step 3: Creează ingredient nou în tabela ingredients
                    const insertQuery = `
                        INSERT INTO ingredients (
                            name, name_en, category, category_en, unit,
                            current_stock, min_stock, cost_per_unit, supplier,
                            allergens, additives, potential_allergens,
                            energy_kcal, fat, saturated_fat, carbs, sugars, protein, salt, fiber,
                            description,
                            is_available, is_hidden,
                            created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    `;
                    
                    const params = [
                        catalogIngredient.name,
                        catalogIngredient.name_en || '',
                        catalogIngredient.category,
                        catalogIngredient.category || '', // category_en (dacă nu există, folosim category)
                        catalogIngredient.standard_unit,
                        current_stock,
                        min_stock,
                        cost_per_unit || catalogIngredient.estimated_cost_per_kg || 0,
                        supplier,
                        catalogIngredient.allergens || '[]',
                        catalogIngredient.additives || '[]',
                        catalogIngredient.allergen_traces || '[]',
                        catalogIngredient.energy_kcal || 0,
                        catalogIngredient.fat || 0,
                        catalogIngredient.saturated_fat || 0,
                        catalogIngredient.carbs || 0,
                        catalogIngredient.sugars || 0,
                        catalogIngredient.protein || 0,
                        catalogIngredient.salt || 0,
                        catalogIngredient.fiber || 0,
                        catalogIngredient.description || '',
                        1, // is_available
                        0  // is_hidden
                    ];
                    
                    db.run(insertQuery, params, function(err) {
                        if (err) {
                            console.error('❌ Eroare la import ingredient:', err.message);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        const newIngredientId = this.lastID;
                        console.log(`✅ Ingredient importat din catalog: ${catalogIngredient.name} (ID: ${newIngredientId})`);
                        
                        res.json({ 
                            success: true, 
                            message: `Ingredientul "${catalogIngredient.name}" a fost importat cu succes!`,
                            ingredient_id: newIngredientId
                        });
                    });
                });
            });
        } catch (error) {
            console.error('❌ Eroare la import ingredient:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    return router;
};

