const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../database');

/**
 * Convertește o cantitate între unități compatibile
 * @param {number} quantity - Cantitatea de convertit
 * @param {string} fromUnit - Unitatea sursă (kg, gr, l, ml, buc)
 * @param {string} toUnit - Unitatea destinație (kg, gr, l, ml, buc)
 * @returns {number} Cantitatea convertită
 */
function convertUnit(quantity, fromUnit, toUnit) {
    if (!quantity || !fromUnit || !toUnit) return quantity;
    if (fromUnit === toUnit) return quantity;

    // Conversii pentru greutăți (kg ↔ gr)
    if ((fromUnit === 'kg' && toUnit === 'gr') || (fromUnit === 'gr' && toUnit === 'kg')) {
        if (fromUnit === 'kg') return quantity * 1000; // kg → gr
        if (fromUnit === 'gr') return quantity / 1000; // gr → kg
    }

    // Conversii pentru volume (l ↔ ml)
    if ((fromUnit === 'l' && toUnit === 'ml') || (fromUnit === 'ml' && toUnit === 'l')) {
        if (fromUnit === 'l') return quantity * 1000; // l → ml
        if (fromUnit === 'ml') return quantity / 1000; // ml → l
    }

    // Pentru buc (bucăți) sau alte unități incompatibile, returnează valoarea originală
    return quantity;
}

/**
 * Detectează unitatea probabilă bazată pe valoarea introdusă
 * Dacă valoarea este >= 1000 și ingredientul are 'kg' sau 'l', probabil e în 'gr' sau 'ml'
 * Dacă valoarea este < 1 și ingredientul are 'gr' sau 'ml', probabil e în 'kg' sau 'l'
 */
function detectInputUnit(quantity, ingredientUnit) {
    // Dacă valoarea este >= 1000 și unitatea ingredientului este 'kg' sau 'l',
    // probabil utilizatorul a introdus valoarea în 'gr' sau 'ml'
    if (quantity >= 1000 && (ingredientUnit === 'kg' || ingredientUnit === 'l')) {
        return ingredientUnit === 'kg' ? 'gr' : 'ml';
    }

    // Dacă valoarea este < 1 și unitatea ingredientului este 'gr' sau 'ml',
    // probabil utilizatorul a introdus valoarea în 'kg' sau 'l'
    if (quantity < 1 && (ingredientUnit === 'gr' || ingredientUnit === 'ml')) {
        return ingredientUnit === 'gr' ? 'kg' : 'l';
    }

    // Altfel, presupunem că valoarea este deja în unitatea corectă
    return ingredientUnit;
}

// GET all ingredients - SIMPLE VERSION using real database structure
router.get('/', async (req, res) => {
    try {
        const hiddenOnly = req.query.hidden_only === 'true';
        console.log(`📦 Fetching ingredients from real database... (hidden_only: ${hiddenOnly})`);

        const db = await dbPromise;
        const ingredients = await new Promise((resolve, reject) => {
            const whereClause = hiddenOnly ? 'WHERE is_hidden = 1' : '';
            db.all(`
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
                cost_per_unit,
                cost_per_unit as avg_price,
                energy_kcal,
                fat,
                carbs,
                protein,
                allergens,
                is_hidden,
                is_available
            FROM ingredients
            ${whereClause}
            ORDER BY name
        `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        const processedIngredients = ingredients.map(i => {
            const current = Number(i.current_stock || 0);
            const min = Number(i.min_stock || 0);
            let status = 'ok';
            if (current <= 0) status = 'out';
            else if (current < min) status = 'low';

            return {
                ...i,
                stock_status: status, // Expected by admin.html
                is_active: i.is_available && !i.is_hidden ? 1 : 0,
                name_en: i.name_en || i.name // Use EN name if available, fallback to RO
            };
        });

        console.log(`✅ Found ${ingredients.length} ingredients`);

        res.json({
            success: true,
            data: processedIngredients,
            ingredients: processedIngredients // Add for legacy admin.html compatibility
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
        const db = await dbPromise;
        const stats = await new Promise((resolve, reject) => {
            db.get(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN current_stock < min_stock * 0.2 THEN 1 ELSE 0 END) as critical_stock_count,
                SUM(CASE WHEN current_stock < min_stock THEN 1 ELSE 0 END) as low_stock_count,
                SUM(CASE WHEN is_hidden = 1 THEN 1 ELSE 0 END) as hidden_count
            FROM ingredients
        `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

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

// POST /:id/update-stock - Ajustare stoc ingredient
router.post('/:id/update-stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation = 'set', reason = 'Ajustare manuală' } = req.body;

        if (!quantity || typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({
                success: false,
                error: 'Cantitatea trebuie să fie un număr pozitiv'
            });
        }

        const validOperations = ['set', 'increase', 'decrease'];
        if (!validOperations.includes(operation)) {
            return res.status(400).json({
                success: false,
                error: `Operația trebuie să fie una dintre: ${validOperations.join(', ')}`
            });
        }

        const db = await dbPromise;

        // Verifică dacă ingredientul există
        const ingredient = await new Promise((resolve, reject) => {
            db.get('SELECT id, name, current_stock, unit FROM ingredients WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!ingredient) {
            return res.status(404).json({
                success: false,
                error: 'Ingredient negăsit'
            });
        }

        // Detectează unitatea introdusă și convertește la unitatea ingredientului
        const ingredientUnit = ingredient.unit || 'buc';
        const inputUnit = req.body.input_unit || detectInputUnit(quantity, ingredientUnit);
        const convertedQuantity = convertUnit(quantity, inputUnit, ingredientUnit);

        console.log(`📊 Unit conversion: ${quantity} ${inputUnit} → ${convertedQuantity} ${ingredientUnit}`);

        // Calculează noul stoc (folosind cantitatea convertită)
        let newStock = 0;
        const oldStock = Number(ingredient.current_stock || 0);

        if (operation === 'set') {
            newStock = convertedQuantity;
        } else if (operation === 'increase') {
            newStock = oldStock + convertedQuantity;
        } else if (operation === 'decrease') {
            newStock = Math.max(0, oldStock - convertedQuantity);
        }

        // Actualizează stocul în baza de date
        await new Promise((resolve, reject) => {
            db.run('UPDATE ingredients SET current_stock = ? WHERE id = ?', [newStock, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Creează stock move pentru istoric
        const stockDiff = newStock - oldStock;
        if (stockDiff !== 0) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO stock_moves (
                        tenant_id, ingredient_id, quantity_in, quantity_out, type,
                        reference_type, reference_id, move_reason, move_source, meta_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    1, // tenant_id
                    id,
                    stockDiff > 0 ? stockDiff : 0,
                    stockDiff < 0 ? Math.abs(stockDiff) : 0,
                    'ADJUST',
                    'MANUAL_ADJUSTMENT',
                    null,
                    reason || 'Ajustare manuală',
                    'ADMIN',
                    JSON.stringify({ operation, old_stock: oldStock, new_stock: newStock })
                ], (err) => {
                    if (err) {
                        console.error('❌ Error creating stock move:', err);
                        // Nu respingem request-ul dacă stock move eșuează, stocul a fost deja actualizat
                    }
                    resolve();
                });
            });
        }

        // Reîncarcă ingredientul actualizat
        const updatedIngredient = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    id, name, name_en, unit, current_stock, min_stock,
                    category, category_en, supplier, cost_per_unit as avg_price,
                    is_hidden, is_available
                FROM ingredients
                WHERE id = ?
            `, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        console.log(`✅ Stock updated for ingredient ${id}: ${oldStock} → ${newStock} ${ingredient.unit} (operation: ${operation}, input: ${quantity} ${inputUnit})`);

        res.json({
            success: true,
            data: {
                ...updatedIngredient,
                is_active: updatedIngredient.is_available && !updatedIngredient.is_hidden ? 1 : 0
            },
            message: `Stocul a fost ajustat cu succes: ${oldStock} ${ingredient.unit} → ${newStock} ${ingredient.unit}`,
            conversion: inputUnit !== ingredientUnit ? {
                input: `${quantity} ${inputUnit}`,
                converted: `${convertedQuantity} ${ingredientUnit}`
            } : null
        });
    } catch (error) {
        console.error('❌ Error updating stock:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Eroare la actualizarea stocului'
        });
    }
});

module.exports = router;

