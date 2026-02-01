const fs = require('fs');
const path = require('path');
const { dbPromise } = require('./database');

async function migrateRecipes() {
    const db = await dbPromise;
    const RECIPES_DIR = path.join(__dirname, 'retete', 'retete-actuale');

    console.log('--- RECIPE MIGRATION START ---');
    console.log('Source Directory:', RECIPES_DIR);

    try {
        const files = fs.readdirSync(RECIPES_DIR).filter(f => f.endsWith('.json'));
        console.log(`Found ${files.length} recipe files.`);

        let successCount = 0;
        let errorCount = 0;

        for (const file of files) {
            try {
                const filePath = path.join(RECIPES_DIR, file);

                // Read as string directly but handle BOM manually by finding the start of JSON
                const rawContent = fs.readFileSync(filePath, 'utf8');
                const firstBraceIndex = rawContent.indexOf('{');

                if (firstBraceIndex === -1) {
                    console.warn(`⚠️ Skipped ${file}: No JSON object found.`);
                    errorCount++;
                    continue;
                }

                const content = rawContent.substring(firstBraceIndex);
                const recipe = JSON.parse(content);

                const productId = recipe.productId || recipe.id;

                if (!productId) {
                    console.warn(`⚠️ Skipped ${file}: No productId found.`);
                    errorCount++;
                    continue;
                }

                // Check if product exists in menu
                const productExists = await db.get('SELECT id, name FROM menu WHERE id = ?', [productId]);
                if (!productExists) {
                    // Try to map by name if ID mismatch
                    const productByName = await db.get('SELECT id FROM menu WHERE name = ?', [recipe.productName]);
                    if (!productByName) {
                        console.warn(`⚠️ Skipped ${file}: Product ID ${productId} (${recipe.productName}) not found in menu.`);
                        errorCount++;
                        continue;
                    }
                }

                // Delete existing recipes for this product
                await db.run('DELETE FROM recipes WHERE product_id = ?', [productId]);

                // Insert ingredients
                if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                    for (const ing of recipe.ingredients) {
                        // Validate ingredient ID
                        const ingredientExists = await db.get('SELECT id FROM ingredients WHERE id = ?', [ing.ingredientId]);

                        if (!ingredientExists) {
                            console.warn(`   ⚠️ Missing ingredient ID ${ing.ingredientId} (${ing.ingredientName}) for product ${productId}. Skipping.`);
                            continue;
                        }

                        await db.run(`
              INSERT INTO recipes (
                product_id, 
                ingredient_id, 
                quantity_needed, 
                unit, 
                created_at,
                waste_percentage
              ) VALUES (?, ?, ?, ?, datetime('now'), ?)
            `, [
                            productId,
                            ing.ingredientId,
                            parseFloat(ing.quantityNeeded) || 0,
                            ing.unit || 'buc',
                            parseFloat(ing.wastePercentage) || 0
                        ]);
                    }
                    successCount++;
                } else {
                    console.warn(`⚠️ Skipped ${file}: No ingredients array.`);
                }

            } catch (err) {
                console.error(`❌ Error processing ${file}:`, err.message);
                errorCount++;
            }
        }

        console.log('--- MIGRATION COMPLETE ---');
        console.log(`✅ Successfully migrated: ${successCount}`);
        console.log(`❌ Errors/Skipped: ${errorCount}`);

        // Verify final count
        const count = await db.get('SELECT COUNT(*) as c FROM recipes');
        console.log(`Total rows in 'recipes' table: ${count.c}`);

    } catch (err) {
        console.error('Migration Fatal Error:', err);
    }
}

migrateRecipes();
