/**
 * 📚 RECIPE TEMPLATE ROUTES
 * API endpoints pentru catalog rețete template
 * 
 * Endpoints:
 * - GET /api/recipe-templates - Listă catalog rețete
 * - GET /api/recipe-templates/:id - Detalii rețetă + ingrediente
 * - POST /api/recipe-templates/import/:id - ADAUGĂ ÎN MENIU (copie în menu + recipes)
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // ============================================================================
    // GET /api/recipe-templates - Listă catalog rețete
    // ============================================================================
    router.get('/', async (req, res) => {
        try {
            const {
                category,
                search,
                is_vegetarian,
                is_popular,
                limit = 1000,
                offset = 0
            } = req.query;
            
            let query = `
                SELECT 
                    id, name, name_en, category, category_en,
                    description, description_en,
                    is_vegetarian, is_vegan, is_spicy, spice_level,
                    allergens, allergens_en, additives, additives_en,
                    calories, protein, carbs, fat, fiber, salt,
                    estimated_cost, suggested_price,
                    prep_time, image_url,
                    template_category, difficulty_level, cuisine_type, serving_size,
                    is_popular, is_seasonal,
                    created_at
                FROM recipe_templates
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
            
            if (is_vegetarian === 'true') {
                query += ` AND is_vegetarian = 1`;
            }
            
            if (is_popular === 'true') {
                query += ` AND is_popular = 1`;
            }
            
            query += ` ORDER BY is_popular DESC, category, name LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));
            
            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('❌ Eroare la încărcarea catalogului rețete:', err.message);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                console.log(`✅ Catalog rețete: ${rows.length} rezultate`);
                res.json({ success: true, recipes: rows });
            });
        } catch (error) {
            console.error('❌ Eroare la încărcarea catalogului rețete:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // ============================================================================
    // GET /api/recipe-templates/:id - Detalii rețetă + ingrediente
    // ============================================================================
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            // Step 1: Obține detalii template rețetă
            const template = await new Promise((resolve, reject) => {
                db.get(`SELECT * FROM recipe_templates WHERE id = ?`, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!template) {
                return res.status(404).json({ success: false, error: 'Rețeta nu a fost găsită în catalog' });
            }
            
            // Step 2: Obține ingredientele rețetei
            const ingredients = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        rti.id, rti.recipe_template_id, rti.catalog_ingredient_id,
                        rti.quantity_needed, rti.unit,
                        rti.waste_percentage, rti.variable_consumption, rti.item_type,
                        rti.is_optional, rti.preparation_notes,
                        ic.name as ingredient_name, ic.name_en as ingredient_name_en,
                        ic.category as ingredient_category,
                        ic.allergens, ic.additives,
                        ic.estimated_cost_per_kg
                    FROM recipe_template_ingredients rti
                    LEFT JOIN ingredient_catalog ic ON rti.catalog_ingredient_id = ic.id
                    WHERE rti.recipe_template_id = ?
                    ORDER BY rti.item_type, rti.id
                `, [id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
            
            console.log(`✅ Detalii rețetă template #${id}: ${template.name} cu ${ingredients.length} ingrediente`);
            res.json({ 
                success: true, 
                template,
                ingredients
            });
        } catch (error) {
            console.error('❌ Eroare la încărcarea detaliilor rețetă:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // ============================================================================
    // POST /api/recipe-templates/import/:id - ADAUGĂ ÎN MENIU
    // ============================================================================
    router.post('/import/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const {
                price,              // Preț final (obligatoriu)
                image_url = null,   // URL poză personalizată (opțional)
                description_custom = null // Descriere personalizată (opțional)
            } = req.body;
            
            if (!price || price <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Prețul este obligatoriu și trebuie să fie > 0' 
                });
            }
            
            // Step 1: Obține template rețetă
            const template = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM recipe_templates WHERE id = ?', [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!template) {
                return res.status(404).json({ success: false, error: 'Rețeta nu a fost găsită în catalog' });
            }
            
            // Step 2: Verifică dacă produsul există deja în menu (după name + category)
            const existing = await new Promise((resolve, reject) => {
                db.get('SELECT id, name FROM menu WHERE name = ? AND category = ?', [template.name, template.category], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (existing) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Produsul "${template.name}" există deja în meniu (ID: ${existing.id})`
                });
            }
            
            // Step 3: Creează produs nou în tabela menu
            const newProductId = await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO menu (
                        name, name_en, category, category_en,
                        description, description_en,
                        price,
                        is_vegetarian, is_spicy, spice_level,
                        allergens, allergens_en, additives, additives_en,
                        calories, protein, carbs, fat, fiber, salt,
                        prep_time, image_url,
                        is_sellable
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    template.name,
                    template.name_en,
                    template.category,
                    template.category_en,
                    description_custom || template.description || '',
                    template.description_en || '',
                    price,
                    template.is_vegetarian || 0,
                    template.is_spicy || 0,
                    template.spice_level || 0,
                    template.allergens || '',
                    template.allergens_en || '',
                    template.additives || '',
                    template.additives_en || '',
                    template.calories || null,
                    template.protein || null,
                    template.carbs || null,
                    template.fat || null,
                    template.fiber || null,
                    template.salt || null,
                    template.prep_time || null,
                    image_url || template.image_url || null,
                    1 // is_sellable
                ], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
            });
            
            // Step 4: Copiază ingredientele rețetei în tabela recipes
            const templateIngredients = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        catalog_ingredient_id, quantity_needed, unit,
                        waste_percentage, variable_consumption, item_type
                    FROM recipe_template_ingredients
                    WHERE recipe_template_id = ?
                `, [id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
            
            // Mapează catalog_ingredient_id → ingredient_id (din ingredients)
            let ingredientsCopied = 0;
            let ingredientsCreated = 0;
            
            for (const templateIng of templateIngredients) {
                // Găsește ingredientul în ingredient_catalog
                const catalogIngredient = await new Promise((resolve, reject) => {
                    db.get('SELECT * FROM ingredient_catalog WHERE id = ?', [templateIng.catalog_ingredient_id], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                if (!catalogIngredient) {
                    console.warn(`⚠️  Ingredient catalog #${templateIng.catalog_ingredient_id} nu găsit - SKIP`);
                    continue;
                }
                
                // Găsește sau creează ingredientul în tabela ingredients
                let ingredientId = await new Promise((resolve, reject) => {
                    db.get('SELECT id FROM ingredients WHERE name = ?', [catalogIngredient.name], (err, row) => {
                        if (err) reject(err);
                        else resolve(row ? row.id : null);
                    });
                });
                
                // Dacă ingredientul nu există în stoc, îl creează automat
                if (!ingredientId) {
                    ingredientId = await new Promise((resolve, reject) => {
                        db.run(`
                            INSERT INTO ingredients (
                                name, name_en, category, unit,
                                allergens, additives,
                                energy_kcal, fat, carbs, protein, salt, fiber,
                                current_stock, min_stock, cost_per_unit,
                                is_available, is_hidden
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            catalogIngredient.name,
                            catalogIngredient.name_en || catalogIngredient.name,
                            catalogIngredient.category,
                            catalogIngredient.standard_unit,
                            catalogIngredient.allergens || '[]',
                            catalogIngredient.additives || '[]',
                            catalogIngredient.energy_kcal || 0,
                            catalogIngredient.fat || 0,
                            catalogIngredient.carbs || 0,
                            catalogIngredient.protein || 0,
                            catalogIngredient.salt || 0,
                            catalogIngredient.fiber || 0,
                            0, // current_stock
                            0, // min_stock
                            catalogIngredient.estimated_cost_per_kg || 0,
                            1, // is_available
                            0  // is_hidden
                        ], function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                ingredientsCreated++;
                                resolve(this.lastID);
                            }
                        });
                    });
                }
                
                // Creează rețeta în tabela recipes
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT INTO recipes (
                            product_id, ingredient_id,
                            quantity_needed, unit,
                            waste_percentage, variable_consumption, item_type
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        newProductId,
                        ingredientId,
                        templateIng.quantity_needed,
                        templateIng.unit,
                        templateIng.waste_percentage || 0,
                        templateIng.variable_consumption || null,
                        templateIng.item_type || 'ingredient'
                    ], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            ingredientsCopied++;
                            resolve();
                        }
                    });
                });
            }
            
            console.log(`✅ Rețetă importată: ${template.name} → Produs #${newProductId} (${ingredientsCopied} ingrediente, ${ingredientsCreated} create automat)`);
            
            res.json({ 
                success: true, 
                message: `Rețeta "${template.name}" a fost adăugată în meniu!`,
                product_id: newProductId,
                ingredients_copied: ingredientsCopied,
                ingredients_created: ingredientsCreated
            });
            
        } catch (error) {
            console.error('❌ Eroare la import rețetă:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    return router;
};

