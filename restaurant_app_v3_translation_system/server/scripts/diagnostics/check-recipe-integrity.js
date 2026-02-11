const { dbPromise } = require('./database');

async function checkIntegrity() {
    const db = await dbPromise;

    console.log("Checking Recipe Integrity...");

    // 1. Check for orphaned recipes (product not found)
    const orphanedProducts = await new Promise((resolve, reject) => {
        db.all(`
            SELECT r.id, r.product_id 
            FROM recipes r 
            LEFT JOIN products p ON r.product_id = p.id 
            WHERE p.id IS NULL
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    if (orphanedProducts.length > 0) {
        console.error(`❌ Found ${orphanedProducts.length} recipes with missing products!`);
        orphanedProducts.forEach(r => console.log(`   - Recipe ID ${r.id} points to missing Product ID ${r.product_id}`));
    } else {
        console.log("✅ All recipes link to valid products.");
    }

    // 2. Check for orphaned recipes (ingredient not found)
    const orphanedIngredients = await new Promise((resolve, reject) => {
        db.all(`
            SELECT r.id, r.ingredient_id 
            FROM recipes r 
            LEFT JOIN ingredients i ON r.ingredient_id = i.id 
            WHERE i.id IS NULL
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    if (orphanedIngredients.length > 0) {
        console.error(`❌ Found ${orphanedIngredients.length} recipes with missing ingredients!`);
        orphanedIngredients.forEach(r => console.log(`   - Recipe ID ${r.id} points to missing Ingredient ID ${r.ingredient_id}`));
    } else {
        console.log("✅ All recipes link to valid ingredients.");
    }

    // 3. Check for products without recipes (optional, just info)
    const productsNoRecipe = await new Promise((resolve, reject) => {
        db.all(`
            SELECT p.id, p.name 
            FROM products p 
            LEFT JOIN recipes r ON p.id = r.product_id 
            WHERE r.id IS NULL AND p.is_active = 1
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    console.log(`ℹ️ ${productsNoRecipe.length} active products have NO recipe defined.`);

    // 4. Check for ingredients with stock but no usage (optional)
    const unusedStock = await new Promise((resolve, reject) => {
        db.all(`
            SELECT i.id, i.name, i.current_stock 
            FROM ingredients i 
            LEFT JOIN recipes r ON i.id = r.ingredient_id 
            WHERE r.id IS NULL AND i.current_stock > 0
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    console.log(`ℹ️ ${unusedStock.length} ingredients with stock are NOT used in any recipe.`);

    console.log("\nIntegrity Check Complete.");
}

checkIntegrity().catch(console.error);
