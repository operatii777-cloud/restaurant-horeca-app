const { dbPromise } = require('./database');

async function createDemoRecipes() {
    try {
        const db = await dbPromise;
        console.log('--- CREATING DEMO RECIPES ---');

        // 4. Find valid ingredients
        const ingredients = await db.all("SELECT id, name FROM ingredients LIMIT 1");
        if (ingredients.length === 0) {
            console.log('No ingredients found. Cannot create demo.');
            return;
        }
        const ingredientId = ingredients[0].id;
        console.log(`Using Ingredient ID: ${ingredientId} (${ingredients[0].name})`);

        // 1. Find target products
        const products = await db.all(`
      SELECT id, name FROM menu 
      WHERE name IN ('Antricot de Vită la Grătar', 'Aperol Spritz')
    `);

        if (products.length === 0) {
            console.log('Target products not found in menu. Cannot create demo recipes.');
            return;
        }

        for (const p of products) {
            // Check if recipe exists
            const existing = await db.get('SELECT id FROM recipes WHERE product_id = ?', [p.id]);
            if (existing) {
                console.log(`Recipe already exists for: ${p.name}`);
                continue;
            }

            // Create recipe (Link product to ingredient)
            await db.run(`
        INSERT INTO recipes (product_id, ingredient_id, quantity_needed, unit, created_at)
        VALUES (?, ?, 1, 'buc', datetime('now'))
      `, [p.id, ingredientId]);

            console.log(`✅ Created recipe for: ${p.name}`);
        }

        console.log('--- DONE ---');
    } catch (err) {
        console.error('Error creating recipes:', err);
    }
}

createDemoRecipes();
